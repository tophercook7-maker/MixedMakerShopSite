import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  estimateAutoReplyLine,
  formatEstimateDetailsForStorage,
  parsePriceEstimateSnapshotJson,
} from "@/components/printing/printing-price-estimate";
import { insertCanonicalInboundLead } from "@/lib/crm/insert-canonical-lead-service";
import {
  sendEmergencyLeadNotificationEmail,
  sendLeadNotificationEmail,
} from "@/lib/crm/send-lead-notification-email";
import { leadHasStandaloneWebsite, pickLeadInsertFields } from "@/lib/crm-lead-schema";
import {
  crmLeadUrl,
  deriveThreeDPrintAutoTags,
  mapPrintPipelineToLeadStatus,
  printRequestTypeFromEstimator,
} from "@/lib/crm/three-d-print-lead";
import { recordLeadActivity } from "@/lib/lead-activity";
import { summarizePrintRequestDescription } from "@/lib/print-lead-crm";

export const maxDuration = 60;

const BUCKET = "print-request-uploads";
const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_EXT = new Set(["stl", "3mf", "png", "jpg", "jpeg", "webp"]);

function extOf(filename: string): string {
  const m = filename.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m?.[1] || "";
}

function safeFileName(name: string): string {
  const base = name
    .replace(/^.*[/\\]/, "")
    .replace(/[^\w.\-()+ ]/g, "_")
    .trim()
    .slice(0, 180);
  return base || "upload.bin";
}

function notifyEmail(): string {
  return (
    process.env.PRINT_REQUEST_NOTIFY_EMAIL?.trim() ||
    process.env.BOOKING_NOTIFY_EMAIL?.trim() ||
    "Topher@mixedmakershop.com"
  );
}

function buildMessageBody(opts: {
  projectTitle: string;
  referenceUrl: string;
  materialPreference: string;
  description: string;
  dimensions: string;
  quantity: string;
  deadline: string;
  fileUrl: string | null;
  fileName: string | null;
  submittedAtIso: string;
  estimateDetailsBlock: string | null;
  pricingEstimateFallback: string | null;
}): string {
  const lines = [
    "3D printing quote request (3d-printing page)",
    `Submitted from: /3d-printing`,
    `Submitted at: ${opts.submittedAtIso}`,
    "",
    `Project / item: ${opts.projectTitle || "(not provided)"}`,
    `Reference link: ${opts.referenceUrl || "(not provided)"}`,
    `Material preference: ${opts.materialPreference || "(not provided)"}`,
    `What they need: ${opts.description}`,
    `Dimensions / size: ${opts.dimensions || "(not provided)"}`,
    `Quantity: ${opts.quantity || "(not provided)"}`,
    `Deadline: ${opts.deadline || "(not provided)"}`,
  ];
  if (opts.estimateDetailsBlock) {
    lines.push("", "Estimate details", opts.estimateDetailsBlock);
  } else if (opts.pricingEstimateFallback) {
    lines.push("", `Quick calculator (ballpark): ${opts.pricingEstimateFallback}`);
  }
  if (opts.fileUrl && opts.fileName) {
    lines.push("", `Attachment: ${opts.fileName}`, `File link: ${opts.fileUrl}`);
  } else {
    lines.push("", "Attachment: (none)");
  }
  return lines.join("\n");
}

/** Plain-text body for the owner notification email (Resend). */
function buildOwnerNotifyEmailText(opts: {
  name: string;
  email: string;
  phone: string;
  projectTitle: string;
  referenceUrl: string;
  materialPreference: string;
  description: string;
  dimensions: string;
  quantity: string;
  deadline: string;
  fileUrl: string | null;
  fileName: string | null;
  submittedAtIso: string;
  estimateDetailsBlock: string | null;
  pricingEstimateFallback: string | null;
  crmLeadUrl: string | null;
  autoTags: string[];
  sourceCanonical: string;
  requestSummary: string;
}): string {
  const fileBlock =
    opts.fileUrl && opts.fileName
      ? [`File name: ${opts.fileName}`, `File / image URL: ${opts.fileUrl}`].join("\n")
      : "Uploaded file: (none)";

  const estimateBlock = opts.estimateDetailsBlock
    ? [
        "Estimate details (ballpark calculator — not a final quote)",
        ...opts.estimateDetailsBlock.split("\n"),
      ]
    : opts.pricingEstimateFallback
      ? [
          "Estimate details (ballpark calculator — not a final quote)",
          `  Summary: ${opts.pricingEstimateFallback}`,
        ]
      : [];

  return [
    "New quote request from the /3d-printing form.",
    "",
    "SUBMITTED",
    `  Page: /3d-printing`,
    `  Timestamp (UTC): ${opts.submittedAtIso}`,
    "",
    "REQUESTER",
    `  Name: ${opts.name}`,
    `  Email: ${opts.email || "(not provided)"}`,
    `  Phone: ${opts.phone || "(not provided)"}`,
    "",
    ...estimateBlock,
    ...(estimateBlock.length ? [""] : []),
    "WHAT DO YOU NEED?",
    opts.description
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n") || "  (empty)",
    "",
    "DETAILS",
    `  Project / item: ${opts.projectTitle || "(not provided)"}`,
    `  Reference link: ${opts.referenceUrl || "(not provided)"}`,
    `  Material preference: ${opts.materialPreference || "(not provided)"}`,
    `  Dimensions / size: ${opts.dimensions || "(not provided)"}`,
    `  Quantity: ${opts.quantity || "(not provided)"}`,
    `  Deadline: ${opts.deadline || "(not provided)"}`,
    "",
    "UPLOAD",
    fileBlock,
    "",
    "CRM",
    `  Open lead: ${opts.crmLeadUrl || "(lead row not created — check CRM or form_submissions)"}`,
    `  Source: ${opts.sourceCanonical}`,
    `  Request summary: ${opts.requestSummary || "(none)"}`,
    `  Auto-tags: ${opts.autoTags.length ? opts.autoTags.join(", ") : "(none)"}`,
  ].join("\n");
}

async function sendOwnerNotifyEmail(opts: {
  to: string;
  name: string;
  replyTo: string | null;
  phone: string;
  email: string;
  projectTitle: string;
  referenceUrl: string;
  materialPreference: string;
  description: string;
  dimensions: string;
  quantity: string;
  deadline: string;
  fileUrl: string | null;
  fileName: string | null;
  submittedAtIso: string;
  estimateDetailsBlock: string | null;
  pricingEstimateFallback: string | null;
  crmLeadUrl: string | null;
  autoTags: string[];
  sourceCanonical: string;
  requestSummary: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const fromEmail = String(
    process.env.RESEND_FROM_EMAIL || process.env.BOOKING_FROM_EMAIL || "",
  ).trim();
  if (!apiKey || !fromEmail) {
    return { ok: false, error: "Missing RESEND_API_KEY or RESEND_FROM_EMAIL." };
  }

  const text = buildOwnerNotifyEmailText({
    name: opts.name,
    email: opts.email,
    phone: opts.phone,
    projectTitle: opts.projectTitle,
    referenceUrl: opts.referenceUrl,
    materialPreference: opts.materialPreference,
    description: opts.description,
    dimensions: opts.dimensions,
    quantity: opts.quantity,
    deadline: opts.deadline,
    fileUrl: opts.fileUrl,
    fileName: opts.fileName,
    submittedAtIso: opts.submittedAtIso,
    estimateDetailsBlock: opts.estimateDetailsBlock,
    pricingEstimateFallback: opts.pricingEstimateFallback,
    crmLeadUrl: opts.crmLeadUrl,
    autoTags: opts.autoTags,
    sourceCanonical: opts.sourceCanonical,
    requestSummary: opts.requestSummary,
  });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "mixedmakershop-print-quote-notify/1.0",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [opts.to],
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      subject: `New 3D Print Quote Request — ${opts.name}`,
      text,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    const detail = body || `HTTP ${res.status}`;
    return { ok: false, error: `Resend notify failed: ${detail}` };
  }
  return { ok: true };
}

async function sendAutoReply(
  toEmail: string,
  name: string,
  estimateCustomerLine: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const fromEmail = String(
    process.env.RESEND_FROM_EMAIL || process.env.BOOKING_FROM_EMAIL || "",
  ).trim();
  if (!apiKey || !fromEmail) {
    return { ok: false, error: "Missing RESEND_API_KEY or RESEND_FROM_EMAIL." };
  }

  const greetingName = name.trim() || "there";
  const estimatePara =
    estimateCustomerLine != null && estimateCustomerLine.trim()
      ? ["", estimateCustomerLine.trim()]
      : [];
  const text = [
    `Hi ${greetingName},`,
    "",
    "I got your 3D print request — thanks for sending it over.",
    ...estimatePara,
    "",
    "I'll take a look at what you sent and get back to you as soon as I can.",
    "",
    "If you included a photo or details, that helps a lot. If I need anything else, I'll reach out.",
    "",
    "If you think of anything else, just reply to this email.",
    "",
    "– Topher",
    "MixedMakerShop",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "mixedmakershop-print-quote-auto/1.0",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: notifyEmail(),
      subject: "Got your 3D print request",
      text,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    const detail = body || `HTTP ${res.status}`;
    return { ok: false, error: `Resend auto-reply failed: ${detail}` };
  }
  return { ok: true };
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const name = String(form.get("name") || "").trim();
  const emailRaw = String(form.get("email") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const projectTitle = String(form.get("project_title") || "").trim();
  const referenceUrl = String(form.get("reference_url") || "").trim();
  const materialPreference = String(form.get("material_preference") || "").trim();
  const description = String(form.get("description") || "").trim();
  const dimensions = String(form.get("dimensions") || "").trim();
  const quantity = String(form.get("quantity") || "").trim();
  const deadline = String(form.get("deadline") || "").trim();
  const pricingEstimateRaw = String(form.get("pricing_estimate") || "").trim();
  const pricingJsonRaw = String(form.get("pricing_estimate_json") || "").trim();
  const parsedEstimate = parsePriceEstimateSnapshotJson(pricingJsonRaw);
  const estimateDetailsBlock = parsedEstimate ? formatEstimateDetailsForStorage(parsedEstimate) : null;
  const pricingEstimateFallback =
    !estimateDetailsBlock && pricingEstimateRaw ? pricingEstimateRaw : null;
  const file = form.get("file");
  const hasProvidedAttachment = file instanceof File && file.size > 0;

  if (!name) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!description && !hasProvidedAttachment) {
    return NextResponse.json(
      { error: "Please add a short description or upload a photo / 3D file." },
      { status: 400 },
    );
  }
  const descriptionForOutbound =
    description || "See uploaded attachment — no written description provided.";
  if (!emailRaw) {
    return NextResponse.json({ error: "Please enter your email so I can reply." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  let fileUrl: string | null = null;
  let fileNameOut: string | null = null;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File is too large. Maximum size is ${Math.round(MAX_BYTES / (1024 * 1024))} MB.` },
        { status: 400 },
      );
    }
    const originalName = safeFileName(file.name);
    const ext = extOf(originalName);
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json(
        { error: "Please upload STL, 3MF, or an image (PNG, JPG, WebP)." },
        { status: 400 },
      );
    }

    const supabase = createClient(url, key);
    const objectPath = `${crypto.randomUUID()}/${originalName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const contentType =
      file.type ||
      (ext === "stl"
        ? "model/stl"
        : ext === "3mf"
          ? "model/3mf"
          : ext === "png"
            ? "image/png"
            : ext === "webp"
              ? "image/webp"
              : "image/jpeg");

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
      contentType,
      upsert: false,
    });

    if (upErr) {
      console.error("[print-quote] storage upload failed:", upErr);
      return NextResponse.json({ error: "Could not upload your file. Try again or email us." }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    fileUrl = String(pub?.publicUrl || "").trim() || null;
    fileNameOut = originalName;
    if (!fileUrl) {
      return NextResponse.json({ error: "Upload succeeded but URL failed." }, { status: 500 });
    }
  }

  const submittedAtIso = new Date().toISOString();

  const messageBody = buildMessageBody({
    projectTitle,
    referenceUrl,
    materialPreference,
    description: descriptionForOutbound,
    dimensions,
    quantity,
    deadline,
    fileUrl,
    fileName: fileNameOut,
    submittedAtIso,
    estimateDetailsBlock,
    pricingEstimateFallback,
  });

  const printEstimateSummary = estimateDetailsBlock
    ? estimateDetailsBlock
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join(" · ")
    : pricingEstimateFallback || null;

  const siteBase = String(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const sourceUrl = siteBase ? `${siteBase}/3d-printing` : "/3d-printing";

  const supabase = createClient(url, key);

  const { data: ownerRow } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
  const ownerId = ownerRow?.id ?? null;

  const { error: subErr } = await supabase.from("form_submissions").insert({
    form_type: "print_quote",
    name,
    email: emailRaw || null,
    phone: phone || null,
    message: messageBody,
    owner_id: ownerId,
  });

  if (subErr) {
    console.error("[print-quote] form_submissions insert failed:", subErr);
    await sendEmergencyLeadNotificationEmail({
      requestId,
      error: `print_quote form_submissions insert failed: ${subErr.message}`,
      payload: {
        source: "print_quote",
        name,
        email: emailRaw,
        phone,
        projectTitle,
        referenceUrl,
        materialPreference,
        description: descriptionForOutbound,
        dimensions,
        quantity,
        deadline,
        fileUrl,
      },
    });
    return NextResponse.json({ error: "Could not save your request. Please try again." }, { status: 500 });
  }

  let newLeadId: string | null = null;
  const autoPrintTags = deriveThreeDPrintAutoTags(descriptionForOutbound);
  const requestSummaryOneLine = summarizePrintRequestDescription(descriptionForOutbound, 280);

  if (ownerId) {
    const ref = referenceUrl.trim() || null;
    const leadPayload = pickLeadInsertFields({
      business_name: projectTitle ? `${projectTitle} — ${name}` : `3D Print Quote — ${name}`,
      contact_name: name,
      email: emailRaw || null,
      phone: phone || null,
      website: ref,
      has_website: ref ? leadHasStandaloneWebsite(ref) : false,
      notes: messageBody,
      source: "3d_printing",
      lead_source: "3d_printing",
      service_type: "3d_printing",
      category: "print_request",
      source_label: "/3d-printing",
      source_url: sourceUrl,
      lead_tags: ["inbound", "3d_printing"],
      status: mapPrintPipelineToLeadStatus("new"),
      print_pipeline_status: "new",
      print_request_type: printRequestTypeFromEstimator(parsedEstimate),
      print_tags: autoPrintTags,
      print_material: materialPreference || null,
      print_dimensions: dimensions || null,
      print_quantity: quantity || null,
      print_deadline: deadline || null,
      print_design_help_requested: parsedEstimate ? parsedEstimate.designHelp : null,
      why_this_lead_is_here: "Quote form on /3d-printing",
      owner_id: ownerId,
      last_updated_at: new Date().toISOString(),
      print_attachment_url: fileUrl || null,
      print_estimate_summary: printEstimateSummary,
      print_request_summary: requestSummaryOneLine,
    });
    const crm = await insertCanonicalInboundLead(supabase, ownerId, leadPayload);
    if (!crm.ok) {
      console.error("[print-quote] CRM lead insert failed:", crm.error);
      await sendEmergencyLeadNotificationEmail({
        requestId,
        error: crm.error,
        payload: {
          source: "print_quote",
          name,
          email: emailRaw,
          phone,
          projectTitle,
          referenceUrl,
          materialPreference,
          description: descriptionForOutbound,
          dimensions,
          quantity,
          deadline,
          fileUrl,
        },
      });
    } else {
      newLeadId = crm.lead_id;
      const notification = await sendLeadNotificationEmail({
        leadId: crm.lead_id,
        duplicateSkipped: crm.duplicate_skipped,
        duplicateReason: "duplicate_reason" in crm ? crm.duplicate_reason : null,
        submission: {
          submission_type: "public_lead",
          source: "print_request",
          name,
          business_name: projectTitle ? `${projectTitle} - ${name}` : `3D Print Quote - ${name}`,
          email: emailRaw || "Topher@mixedmakershop.com",
          phone: phone || undefined,
          website: referenceUrl || undefined,
          category: "print_request",
          service_type: "3d_printing",
          message: messageBody,
          request: descriptionForOutbound,
          source_url: sourceUrl,
          source_label: "/3d-printing",
        },
      });
      if (!notification.ok) {
        console.error("[print-quote] lead notification email failed:", notification.error);
      }
      if (newLeadId) {
        void recordLeadActivity(supabase, {
          ownerId,
          leadId: newLeadId,
          eventType: "print_request_received",
          message: "New 3D print request from /3d-printing",
          meta: {
            source: "3d_printing",
            tags: autoPrintTags,
            estimate_summary: printEstimateSummary,
            attachment_url: fileUrl,
            summary: requestSummaryOneLine,
            crm_path: `/admin/leads/${newLeadId}`,
          },
        });
      }
    }
  }

  const crmOpenUrl = newLeadId ? crmLeadUrl(newLeadId, siteBase) : null;
  const ownerTo = notifyEmail();
  const emailed = await sendOwnerNotifyEmail({
    to: ownerTo,
    name,
    replyTo: emailRaw || null,
    phone,
    email: emailRaw,
    projectTitle,
    referenceUrl,
    materialPreference,
    description: descriptionForOutbound,
    dimensions,
    quantity,
    deadline,
    fileUrl,
    fileName: fileNameOut,
    submittedAtIso,
    estimateDetailsBlock,
    pricingEstimateFallback,
    crmLeadUrl: crmOpenUrl,
    autoTags: autoPrintTags,
    sourceCanonical: "3d_printing",
    requestSummary: requestSummaryOneLine,
  });
  if (!emailed.ok) {
    console.error(
      "[print-quote] OWNER notify email failed (submission was saved OK). To:",
      ownerTo,
      "Error:",
      emailed.error,
    );
  }

  const autoReplyEstimateLine = parsedEstimate
    ? estimateAutoReplyLine(parsedEstimate)
    : pricingEstimateFallback
      ? `Ballpark note from your message: ${pricingEstimateFallback}`
      : null;

  let autoReplyOk = false;
  if (emailRaw) {
    const ar = await sendAutoReply(emailRaw, name, autoReplyEstimateLine);
    autoReplyOk = ar.ok;
    if (!ar.ok) {
      console.error("[print-quote] customer auto-reply failed (submission was saved OK):", ar.error);
    }
  }

  return NextResponse.json({
    ok: true,
    emailed: emailed.ok,
    auto_reply_sent: autoReplyOk,
  });
}
