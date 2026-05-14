import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { handleInboundLeadSubmission } from "@/lib/crm/inbound-lead-submission";
import { sendEmergencyLeadNotificationEmail } from "@/lib/crm/send-lead-notification-email";

export const maxDuration = 60;

const BUCKET = "print-request-uploads";
const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_EXT = new Set(["stl", "3mf", "png", "jpg", "jpeg", "webp"]);

const VALIDATION_MESSAGE = "Please upload STL, 3MF, or an image file.";

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

function buildPrintRequestLeadNotes(opts: {
  description: string;
  quantity: string;
  colorPreference: string;
  fileUrl: string;
  fileName: string;
  fileKind: "model" | "image";
}): string {
  const lines = [
    "Inbound print request",
    "",
    `Description: ${opts.description || "(none)"}`,
    `Quantity: ${opts.quantity || "(none)"}`,
    `Color preference: ${opts.colorPreference || "(none)"}`,
    `File: ${opts.fileName} (${opts.fileKind === "image" ? "image / custom" : "STL or 3MF"})`,
    `File URL: ${opts.fileUrl}`,
  ];
  return lines.join("\n");
}

function notifyEmail(): string {
  return (
    process.env.PRINT_REQUEST_NOTIFY_EMAIL?.trim() ||
    process.env.BOOKING_NOTIFY_EMAIL?.trim() ||
    "Topher@mixedmakershop.com"
  );
}

async function sendNotifyEmail(opts: {
  to: string;
  customerName: string;
  customerEmail: string;
  description: string;
  quantity: string;
  colorPreference: string;
  fileUrl: string;
  fileName: string;
  fileKind: "model" | "image";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const fromEmail = String(
    process.env.RESEND_FROM_EMAIL || process.env.BOOKING_FROM_EMAIL || ""
  ).trim();
  if (!apiKey || !fromEmail) {
    return { ok: false, error: "Missing RESEND_API_KEY or RESEND_FROM_EMAIL." };
  }

  const kindLine =
    opts.fileKind === "image"
      ? "Upload type: image (custom / higher-touch — may need modeling)"
      : "Upload type: 3D model file";

  const text = [
    "New 3D print request (upload-print)",
    "",
    `Name: ${opts.customerName}`,
    `Email: ${opts.customerEmail}`,
    kindLine,
    `File name: ${opts.fileName}`,
    `File link: ${opts.fileUrl}`,
    "",
    `Description: ${opts.description || "(none)"}`,
    `Quantity: ${opts.quantity || "(none)"}`,
    `Color preference: ${opts.colorPreference || "(none)"}`,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "mixedmakershop-print-request/1.0",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [opts.to],
      reply_to: opts.customerEmail,
      subject: `3D print request — ${opts.customerName}`,
      text,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: body || "Resend send failed." };
  }
  return { ok: true };
}

async function sendPrintRequestAutoReply(opts: {
  toEmail: string;
  name: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const fromEmail = String(
    process.env.RESEND_FROM_EMAIL || process.env.BOOKING_FROM_EMAIL || ""
  ).trim();
  if (!apiKey || !fromEmail) {
    return { ok: false, error: "Missing RESEND_API_KEY or RESEND_FROM_EMAIL." };
  }

  const greetingName = opts.name.trim() || "there";
  const text = [
    `Hi ${greetingName},`,
    "",
    "Got your request — thanks for sending that over.",
    "",
    "I'll take a look at your file / idea and get back to you shortly with details and pricing.",
    "",
    "If you have anything else to add, just reply to this email.",
    "",
    "– MixedMakerShop",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "mixedmakershop-print-request-auto-reply/1.0",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [opts.toEmail],
      reply_to: notifyEmail(),
      subject: "Got your 3D print request 👌",
      text,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: body || "Resend auto-reply failed." };
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
  const email = String(form.get("email") || "").trim();
  const description = String(form.get("description") || "").trim();
  const quantity = String(form.get("quantity") || "").trim();
  const colorPreference = String(form.get("color_preference") || "").trim();
  const file = form.get("file");
  const emergencyPayload = {
    source: "print_request",
    name,
    email,
    description,
    quantity,
    color_preference: colorPreference,
    file_name: file instanceof File ? file.name : null,
  };

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Please choose a file to upload." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File is too large. Maximum size is ${Math.round(MAX_BYTES / (1024 * 1024))} MB.` },
      { status: 400 }
    );
  }

  const originalName = safeFileName(file.name);
  const ext = extOf(originalName);
  if (!ALLOWED_EXT.has(ext)) {
    return NextResponse.json({ error: VALIDATION_MESSAGE }, { status: 400 });
  }

  const fileKind: "model" | "image" = ["png", "jpg", "jpeg", "webp"].includes(ext)
    ? "image"
    : "model";

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
    console.error("[print-request] storage upload failed:", upErr);
    await sendEmergencyLeadNotificationEmail({
      requestId,
      error: `print request storage upload failed: ${upErr.message}`,
      payload: emergencyPayload,
    });
    return NextResponse.json(
      { error: "Could not store your file. Please try again or email us directly." },
      { status: 500 }
    );
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  const fileUrl = String(pub?.publicUrl || "").trim();
  if (!fileUrl) {
    return NextResponse.json({ error: "Upload succeeded but URL failed." }, { status: 500 });
  }

  const { error: insErr } = await supabase.from("print_requests").insert({
    name,
    email,
    description: description || null,
    quantity: quantity || null,
    color_preference: colorPreference || null,
    file_url: fileUrl,
    file_name: originalName,
    file_kind: fileKind,
  });

  if (insErr) {
    console.error("[print-request] db insert failed:", insErr);
    await sendEmergencyLeadNotificationEmail({
      requestId,
      error: `print_requests insert failed: ${insErr.message}`,
      payload: { ...emergencyPayload, file_url: fileUrl },
    });
    return NextResponse.json({ error: "Could not save your request." }, { status: 500 });
  }

  const leadNotes = buildPrintRequestLeadNotes({
    description,
    quantity,
    colorPreference,
    fileUrl,
    fileName: originalName,
    fileKind,
  });
  const inbound = await handleInboundLeadSubmission(
    {
      submission_type: "public_lead",
      source: "print_request",
      name,
      business_name: `3D Print Request - ${name}`,
      email,
      category: "print_request",
      service_type: "3d_printing",
      message: leadNotes,
      request: description || `Uploaded ${originalName}`,
      source_url: fileUrl,
      source_label: originalName,
    },
    { requestId },
  );
  if (!inbound.ok) {
    return NextResponse.json({ ok: false, error: inbound.error, details: inbound.details }, { status: inbound.status });
  }

  const autoReply = await sendPrintRequestAutoReply({ toEmail: email, name });
  if (!autoReply.ok) {
    console.error("[print-request] customer auto-reply failed (request still ok):", autoReply.error);
  }

  return NextResponse.json({
    ok: true,
    id: inbound.lead_id,
    form_submission_id: inbound.form_submission_id,
    notification_sent: inbound.notification_sent,
    auto_reply_sent: autoReply.ok,
  });
}
