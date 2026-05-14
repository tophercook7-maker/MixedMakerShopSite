import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildFunnelPublicMockupRow,
  parseServicesLines,
  type FunnelFormSnapshot,
} from "@/lib/crm-mockup";
import { absolutePreviewUrl, allocateUniqueBrandedMockupSlug } from "@/lib/mockup-branded-slug";
import { FUNNEL_DESIRED_OUTCOME_LABELS, normalizeDesiredOutcomeIds } from "@/lib/funnel-desired-outcomes";
import { insertCanonicalInboundLead } from "@/lib/crm/insert-canonical-lead-service";
import { leadHasStandaloneWebsite, pickLeadInsertFields } from "@/lib/crm-lead-schema";
import { normalizeFacebookUrl, normalizeWebsiteUrl as fingerprintWebsite } from "@/lib/leads-dedup";
import {
  sendEmergencyLeadNotificationEmail,
  sendLeadNotificationEmail,
} from "@/lib/crm/send-lead-notification-email";
import { sendMockupRequestConfirmationEmail } from "@/lib/send-mockup-request-confirmation";
import { buildPreviewSnapshotFromFunnelSnapshot } from "@/lib/free-mockup-preview-snapshot";

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}

/** Ensures payload is JSON-serializable for PostgREST / jsonb (drops undefined, cycles throw). */
function jsonSafeForJsonb<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeWebsiteUrl(raw: string): string | null {
  const t = String(raw || "").trim();
  if (!t) return null;
  try {
    return new URL(t.startsWith("http") ? t : `https://${t}`).toString();
  } catch {
    return t;
  }
}

function requestOrigin(request: Request): string {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return String(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
}

const funnelDirectionEnum = z.enum([
  "clean-professional",
  "bold-modern",
  "local-trust",
  "premium-polished",
  "simple-direct",
]);

const snapshotSchema = z
  .object({
    business_name: z.string().min(1, "Business name is required"),
    category: z.string().min(1, "Business type / industry is required"),
    city: z.string().min(1, "City or service area is required"),
    state: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    website_url: z.string().optional(),
    facebook_url: z.string().optional(),
    services_text: z.string().optional(),
    template_mode: z.string().optional(),
    headline_override: z.string().optional(),
    subheadline_override: z.string().optional(),
    cta_override: z.string().optional(),
    style_preset: z.string().optional(),
    color_preset: z.string().optional(),
    hero_preset: z.string().optional(),
    selected_template_key: funnelDirectionEnum.optional().default("clean-professional"),
    desired_outcomes: z.array(z.string()).max(12).optional().default([]),
    top_services_to_feature: z.string().optional(),
    what_makes_you_different: z.string().optional(),
    special_offer_or_guarantee: z.string().optional(),
    anything_to_avoid: z.string().optional(),
    anything_else_i_should_know: z.string().optional(),
  })
  .passthrough()
  .superRefine((snap, ctx) => {
    const top = parseServicesLines(String(snap.top_services_to_feature || ""));
    const leg = parseServicesLines(String(snap.services_text || ""));
    if (!top.length && !leg.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one service to feature (or legacy services text).",
        path: ["top_services_to_feature"],
      });
    }
  });

const mockupDataSchema = z
  .object({
    contactName: z.string().min(1, "Name is required"),
    snapshot: snapshotSchema,
    /** URL/query attribution e.g. freshcut from ?source=freshcut */
    funnel_source: z.string().max(64).optional(),
  })
  .passthrough();

function normalizeSnapshot(
  s: z.infer<typeof snapshotSchema>,
  submitEmail: string,
  submitPhone: string
): FunnelFormSnapshot {
  const businessPhone = String(s.phone || "").trim();
  const businessEmail = String(s.email || "").trim();
  const topSvc = String(s.top_services_to_feature || "").trim();
  const legacySvc = String(s.services_text || "").trim();
  return {
    business_name: s.business_name.trim(),
    category: s.category.trim(),
    city: s.city.trim(),
    state: String(s.state || "").trim(),
    phone: businessPhone || String(submitPhone || "").trim(),
    email: businessEmail || submitEmail,
    website_url: String(s.website_url || "").trim(),
    facebook_url: String(s.facebook_url || "").trim(),
    services_text: legacySvc || topSvc,
    template_mode: String(s.template_mode || "auto").trim() || "auto",
    headline_override: String(s.headline_override || ""),
    subheadline_override: String(s.subheadline_override || ""),
    cta_override: String(s.cta_override || ""),
    style_preset: String(s.style_preset || ""),
    color_preset: String(s.color_preset || ""),
    hero_preset: String(s.hero_preset || ""),
    selected_template_key: String(s.selected_template_key || "clean-professional").trim(),
    desired_outcomes: normalizeDesiredOutcomeIds(s.desired_outcomes),
    top_services_to_feature: topSvc,
    what_makes_you_different: String(s.what_makes_you_different || "").trim(),
    special_offer_or_guarantee: String(s.special_offer_or_guarantee || "").trim(),
    anything_to_avoid: String(s.anything_to_avoid || "").trim(),
    anything_else_i_should_know: String(s.anything_else_i_should_know || "").trim(),
  };
}

async function findRecentMockupDuplicate(
  supabase: SupabaseClient,
  emailNorm: string,
  businessName: string
): Promise<"email_cooldown" | "business_cooldown" | null> {
  const bnNorm = businessName.trim().toLowerCase();
  const since = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const { data: rows, error } = await supabase
    .from("mockup_submissions")
    .select("created_at, mockup_data")
    .eq("email", emailNorm)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error || !rows?.length) return null;

  const now = Date.now();
  const sixH = 6 * 3600 * 1000;
  for (const r of rows) {
    const t = new Date(r.created_at).getTime();
    if (now - t < sixH) return "email_cooldown";
  }

  for (const r of rows) {
    const t = new Date(r.created_at).getTime();
    if (t < now - 48 * 3600 * 1000) continue;
    if (!bnNorm) continue;
    const md = r.mockup_data as Record<string, unknown> | null;
    const snap = md && typeof md.snapshot === "object" && md.snapshot && !Array.isArray(md.snapshot) ? (md.snapshot as Record<string, unknown>) : null;
    const prev = String(snap?.business_name || "").trim().toLowerCase();
    if (prev && prev === bnNorm) return "business_cooldown";
  }

  return null;
}

const DUPLICATE_RESPONSE: Record<"email_cooldown" | "business_cooldown", string> = {
  email_cooldown:
    "We already received a request from this email in the last few hours. If you need to add details, reply to your confirmation email or reach out directly — one solid submission is enough for me to build your strongest direction.",
  business_cooldown:
    "It looks like you recently requested a preview for this business. I focus on one strong direction first, then we refine if needed — please wait for my follow-up rather than submitting again.",
};

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  let emergencyPayload: unknown = null;
  try {
    const supabaseUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
    const supabaseServiceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Mockup submit config error:", {
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasServiceRoleKey: Boolean(supabaseServiceRoleKey),
      });

      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const raw = body as Record<string, unknown>;
    emergencyPayload = raw;
    const email = String(raw.email || "").trim().toLowerCase();
    const notes =
      typeof raw.notes === "string" && raw.notes.trim().length > 0 ? raw.notes.trim() : null;
    const mockupData = raw.mockupData ?? null;

    console.log("Mockup submit payload received", {
      emailPresent: Boolean(email),
      notesPresent: Boolean(notes),
      mockupDataType: typeof mockupData,
      mockupDataIsArray: Array.isArray(mockupData),
      mockupDataKeys:
        mockupData && typeof mockupData === "object" && !Array.isArray(mockupData)
          ? Object.keys(mockupData).slice(0, 20)
          : [],
    });

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    if (!mockupData || typeof mockupData !== "object" || Array.isArray(mockupData)) {
      return NextResponse.json({ error: "Mockup data is required." }, { status: 400 });
    }

    const parsed = mockupDataSchema.safeParse(mockupData);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const msg =
        flat.formErrors[0] || parsed.error.errors[0]?.message || "Invalid mockup data";
      console.error("[website-mockup] mockupData validation failed", {
        message: msg,
        formErrors: flat.fieldErrors,
        issues: parsed.error.issues.slice(0, 15),
      });
      return NextResponse.json({ error: msg, details: flat }, { status: 400 });
    }

    const validatedMockupData = parsed.data as z.infer<typeof mockupDataSchema> &
      Record<string, unknown>;
    const funnelSourceAttr = String(
      (validatedMockupData as { funnel_source?: unknown }).funnel_source ?? "",
    ).trim();
    const submitPhone = String(
      (validatedMockupData as { submitPhone?: unknown }).submitPhone ?? "",
    ).trim();
    const snapshotIn = parsed.data.snapshot;
    const businessPhoneForNotes = String(snapshotIn.phone || "").trim();
    const businessEmailForNotes = String(snapshotIn.email || "").trim();
    const snapshot = normalizeSnapshot(snapshotIn, email, submitPhone);
    const contactName = String(parsed.data.contactName || "").trim();

    const preview_snapshot = buildPreviewSnapshotFromFunnelSnapshot(snapshot, funnelSourceAttr || null);

    const mockRow = buildFunnelPublicMockupRow(snapshot);
    const origin = requestOrigin(request);

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const slug = await allocateUniqueBrandedMockupSlug(
      supabase as SupabaseClient,
      snapshot.business_name,
      snapshot.city
    );
    const previewUrl = absolutePreviewUrl(origin, slug);

    const duplicateKind = await findRecentMockupDuplicate(supabase, email, snapshot.business_name);
    if (duplicateKind) {
      return NextResponse.json(
        {
          error: DUPLICATE_RESPONSE[duplicateKind],
          code: duplicateKind,
          ok: false,
        },
        { status: 409 },
      );
    }

    const { data: ownerProfile, error: ownerErr } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
    if (ownerErr || !ownerProfile?.id) {
      console.error("[website-mockup] owner profile missing", {
        message: ownerErr?.message,
        code: ownerErr?.code,
        details: ownerErr?.details,
        hint: ownerErr?.hint,
      });
      await sendEmergencyLeadNotificationEmail({
        requestId,
        error: ownerErr?.message || "CRM is not configured (no owner profile).",
        payload: raw,
      });
      return NextResponse.json({ error: "CRM is not configured (no owner profile)." }, { status: 503 });
    }
    const ownerId = String(ownerProfile.id);

    const leadNotes = [
      "Inbound: website mockup funnel (/free-mockup)",
      funnelSourceAttr ? `Funnel attribution (source): ${funnelSourceAttr}` : "",
      `Shareable preview: ${previewUrl}`,
      `Contact: ${contactName}`,
      submitPhone && businessPhoneForNotes && submitPhone !== businessPhoneForNotes
        ? `Submitter phone: ${submitPhone}`
        : "",
      submitPhone && businessPhoneForNotes && submitPhone !== businessPhoneForNotes
        ? `Business line (preview): ${businessPhoneForNotes}`
        : "",
      businessEmailForNotes && businessEmailForNotes.toLowerCase() !== email.toLowerCase()
        ? `Preview contact email (on sample): ${businessEmailForNotes}`
        : "",
      `Template: ${mockRow.template_key}`,
      `Headline: ${mockRow.headline}`,
      `Subheadline: ${mockRow.subheadline}`,
      `CTA: ${mockRow.cta_text}`,
      mockRow.raw_payload && Array.isArray((mockRow.raw_payload as { services?: unknown }).services)
        ? `Services: ${JSON.stringify((mockRow.raw_payload as { services: string[] }).services)}`
        : "",
      `Style / color: ${String((mockRow.raw_payload as { style_preset?: string }).style_preset)} / ${String((mockRow.raw_payload as { color_preset?: string }).color_preset)}`,
      `Design direction (visitor): ${snapshot.selected_template_key}`,
      snapshot.desired_outcomes?.length
        ? `Desired outcomes: ${normalizeDesiredOutcomeIds(snapshot.desired_outcomes)
            .map((id) => FUNNEL_DESIRED_OUTCOME_LABELS[id])
            .join("; ")}`
        : "",
      snapshot.top_services_to_feature?.trim()
        ? `Top services to feature: ${snapshot.top_services_to_feature.trim()}`
        : "",
      snapshot.what_makes_you_different ? `Differentiator: ${snapshot.what_makes_you_different}` : "",
      snapshot.special_offer_or_guarantee ? `Offer / guarantee: ${snapshot.special_offer_or_guarantee}` : "",
      snapshot.anything_to_avoid ? `Please avoid: ${snapshot.anything_to_avoid}` : "",
      snapshot.anything_else_i_should_know ? `Other notes: ${snapshot.anything_else_i_should_know}` : "",
      preview_snapshot.previewSummary
        ? `Live preview (what they saw): ${preview_snapshot.previewSummary}`
        : "",
      notes ? `Visitor note: ${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    // Do not write preview_url to leads until the production schema includes that column.
    // Preview link is still stored on crm_mockups.mockup_url and in mockup_submissions.mockup_data.
    const websiteFull = normalizeWebsiteUrl(snapshot.website_url);
    const leadPayload = pickLeadInsertFields({
      business_name: mockRow.business_name,
      primary_contact_name: contactName,
      contact_name: contactName,
      email: email || null,
      phone: submitPhone || null,
      website: websiteFull,
      has_website: leadHasStandaloneWebsite(snapshot.website_url),
      normalized_website: fingerprintWebsite(snapshot.website_url) || undefined,
      normalized_facebook_url: normalizeFacebookUrl(mockRow.facebook_url) || undefined,
      category: mockRow.category,
      city: snapshot.city,
      state: snapshot.state || null,
      facebook_url: mockRow.facebook_url,
      service_type: "web_design",
      source: "mockup_request",
      lead_source: "mockup_request",
      lead_tags: ["inbound", "mockup_request"],
      notes: leadNotes,
      why_this_lead_is_here: "Submitted free website preview on the MixedMakerShop funnel",
      status: "new",
      owner_id: ownerId,
      conversion_score: 78,
      opportunity_score: 78,
      last_updated_at: new Date().toISOString(),
    });

    // Production `leads` may omit these columns; restore only after matching migrations are applied.
    delete leadPayload.preview_url;
    delete leadPayload.automation_paused;

    const inbound = await insertCanonicalInboundLead(supabase, ownerId, leadPayload);
    if (!inbound.ok) {
      console.error("[website-mockup] lead insert failed", inbound.error);
      await sendEmergencyLeadNotificationEmail({
        requestId,
        error: inbound.error,
        payload: raw,
      });
      return NextResponse.json(
        { error: "Could not save your request. Try again or contact us directly." },
        { status: 500 }
      );
    }

    const leadId = inbound.lead_id;
    const now = new Date().toISOString();
    const rawPayload = {
      ...(typeof mockRow.raw_payload === "object" && mockRow.raw_payload ? mockRow.raw_payload : {}),
      funnel_contact_name: contactName,
      source: "mockup_request",
      ...(funnelSourceAttr ? { funnel_source: funnelSourceAttr } : {}),
    };

    const crmInsert = {
      lead_id: leadId,
      owner_id: ownerId,
      template_key: mockRow.template_key,
      business_name: mockRow.business_name,
      city: mockRow.city,
      category: mockRow.category,
      phone: mockRow.phone,
      email: mockRow.email,
      facebook_url: mockRow.facebook_url,
      headline: mockRow.headline,
      subheadline: mockRow.subheadline,
      cta_text: mockRow.cta_text,
      mockup_slug: slug,
      mockup_url: previewUrl,
      raw_payload: rawPayload,
      created_at: now,
      updated_at: now,
    };

    const { error: mockErr } = await supabase.from("crm_mockups").insert(crmInsert);
    if (mockErr) {
      console.error("[website-mockup] crm_mockups insert failed", {
        message: mockErr.message,
        details: mockErr.details,
        hint: mockErr.hint,
        code: mockErr.code,
      });
      await sendEmergencyLeadNotificationEmail({
        requestId,
        error: `crm_mockups insert failed: ${mockErr.message}`,
        payload: raw,
      });
      await supabase.from("leads").delete().eq("id", leadId);
      return NextResponse.json(
        { error: "Could not create your preview link. Please try again." },
        { status: 500 }
      );
    }

    const mockup_data: Record<string, unknown> = {
      ...validatedMockupData,
      contact_name: contactName,
      submitter: {
        email,
        phone: submitPhone || null,
        business_email: businessEmailForNotes || null,
        business_phone: businessPhoneForNotes || null,
      },
      snapshot,
      preview_snapshot,
      mock_row: {
        template_key: mockRow.template_key,
        business_name: mockRow.business_name,
        city: mockRow.city,
        category: mockRow.category || undefined,
        phone: mockRow.phone,
        email: mockRow.email,
        facebook_url: mockRow.facebook_url,
        headline: mockRow.headline,
        subheadline: mockRow.subheadline,
        cta_text: mockRow.cta_text,
        raw_payload: mockRow.raw_payload ?? {},
      },
      mockup_slug: slug,
      preview_url: previewUrl,
      lead_id: leadId,
    };

    let mockupDataForDb: Record<string, unknown>;
    try {
      mockupDataForDb = jsonSafeForJsonb(mockup_data);
    } catch (serializeErr) {
      console.error("[website-mockup] mockup_data JSON serialization failed", serializeErr);
      await supabase.from("crm_mockups").delete().eq("lead_id", leadId);
      await supabase.from("leads").delete().eq("id", leadId);
      return NextResponse.json({ error: "Failed to save mockup." }, { status: 500 });
    }

    const desiredOutcomesJson = normalizeDesiredOutcomeIds(snapshot.desired_outcomes);

    const statusStamp = new Date().toISOString();
    const baseSubmissionInsert = {
      email,
      mockup_data: mockupDataForDb,
      notes,
      status: "new",
      source: "free-mockup",
    };
    let { data: submissionRow, error: submissionErr } = await supabase
      .from("mockup_submissions")
      .insert({
        ...baseSubmissionInsert,
        lead_status: "new",
        status_updated_at: statusStamp,
        funnel_source: funnelSourceAttr || null,
        selected_template_key: snapshot.selected_template_key,
        desired_outcomes: desiredOutcomesJson,
        top_services_to_feature: snapshot.top_services_to_feature?.trim() || null,
        what_makes_you_different: snapshot.what_makes_you_different?.trim() || null,
        special_offer_or_guarantee: snapshot.special_offer_or_guarantee?.trim() || null,
        anything_to_avoid: snapshot.anything_to_avoid?.trim() || null,
        anything_else_i_should_know: snapshot.anything_else_i_should_know?.trim() || null,
      })
      .select("id")
      .single();

    if (submissionErr?.code === "PGRST204") {
      console.warn("[website-mockup] retrying mockup_submissions insert with legacy column set", {
        message: submissionErr.message,
      });
      const retry = await supabase.from("mockup_submissions").insert(baseSubmissionInsert).select("id").single();
      submissionRow = retry.data;
      submissionErr = retry.error;
    }

    if (submissionErr || !submissionRow?.id) {
      console.error("Mockup submit insert failed:", {
        message: submissionErr?.message,
        details: submissionErr?.details,
        hint: submissionErr?.hint,
        code: submissionErr?.code,
      });
      await sendEmergencyLeadNotificationEmail({
        requestId,
        error: `mockup_submissions insert failed: ${submissionErr?.message || "missing submission id"}`,
        payload: raw,
      });
      await supabase.from("crm_mockups").delete().eq("lead_id", leadId);
      await supabase.from("leads").delete().eq("id", leadId);
      return NextResponse.json({ error: "Failed to save mockup." }, { status: 500 });
    }

    const confirmation = await sendMockupRequestConfirmationEmail({
      to: email,
      contactName,
      businessName: mockRow.business_name,
    });
    if (!confirmation.ok) {
      console.error(
        "[website-mockup] confirmation email failed (submission was saved OK):",
        confirmation.error,
      );
    }

    const notification = await sendLeadNotificationEmail({
      leadId,
      formSubmissionId: String(submissionRow.id),
      duplicateSkipped: inbound.duplicate_skipped,
      duplicateReason: "duplicate_reason" in inbound ? inbound.duplicate_reason : null,
      submission: {
        submission_type: "public_lead",
        source: "mockup_request",
        name: contactName,
        business_name: mockRow.business_name,
        email,
        phone: submitPhone || undefined,
        website: websiteFull || undefined,
        category: mockRow.category || undefined,
        service_type: "web_design",
        message: leadNotes,
        request: "Free website preview request",
        source_url: previewUrl,
        source_label: "Free website preview",
      },
    });
    if (!notification.ok) {
      console.error("[website-mockup] lead notification email failed", notification.error);
    }

    return NextResponse.json({
      ok: true,
      id: submissionRow.id,
      message: "You're in — I've got your request.",
      detail:
        "I'm going to start putting together your custom homepage mockup. You'll hear from me soon.",
      previewUrl,
      mockup_slug: slug,
      lead_id: leadId,
      submission_id: String(submissionRow.id),
      confirmation_email_sent: confirmation.ok,
      notification_sent: notification.ok,
    });
  } catch (error) {
    console.error("Mockup submit failed:", error);
    await sendEmergencyLeadNotificationEmail({
      requestId,
      error: error instanceof Error ? error.message : String(error),
      payload: emergencyPayload,
    });

    return NextResponse.json({ error: "Failed to save mockup." }, { status: 500 });
  }
}
