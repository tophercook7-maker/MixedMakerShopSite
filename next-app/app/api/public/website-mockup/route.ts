import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildFunnelPublicMockupRow,
  generateMockupSlug,
  type FunnelFormSnapshot,
} from "@/lib/crm-mockup";
import { pickLeadInsertFields } from "@/lib/crm-lead-schema";
import { getServiceRoleSupabase } from "@/lib/supabase/service-role";

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
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

const snapshotSchema = z
  .object({
    business_name: z.string().min(1, "Business name is required"),
    category: z.string().min(1, "Category is required"),
    city: z.string().min(1, "City is required"),
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
  })
  .passthrough();

const mockupDataSchema = z
  .object({
    contactName: z.string().min(1, "Name is required"),
    snapshot: snapshotSchema,
  })
  .passthrough();

function normalizeSnapshot(
  s: z.infer<typeof snapshotSchema>,
  submitEmail: string,
  submitPhone: string
): FunnelFormSnapshot {
  const businessPhone = String(s.phone || "").trim();
  const businessEmail = String(s.email || "").trim();
  return {
    business_name: s.business_name.trim(),
    category: s.category.trim(),
    city: s.city.trim(),
    state: String(s.state || "").trim(),
    phone: businessPhone || String(submitPhone || "").trim(),
    email: businessEmail || submitEmail,
    website_url: String(s.website_url || "").trim(),
    facebook_url: String(s.facebook_url || "").trim(),
    services_text: String(s.services_text || ""),
    template_mode: String(s.template_mode || "auto").trim() || "auto",
    headline_override: String(s.headline_override || ""),
    subheadline_override: String(s.subheadline_override || ""),
    cta_override: String(s.cta_override || ""),
    style_preset: String(s.style_preset || ""),
    color_preset: String(s.color_preset || ""),
    hero_preset: String(s.hero_preset || ""),
  };
}

export async function POST(request: Request) {
  const supabaseConfig = getServiceRoleSupabase();
  if (!supabaseConfig.ok) {
    console.error("Mockup submit config error: missing env", supabaseConfig.missing);
    return NextResponse.json(
      {
        error: "Server configuration error.",
        missing_env: supabaseConfig.missing,
        hint:
          supabaseConfig.missing === "SUPABASE_SERVICE_ROLE_KEY"
            ? "Add SUPABASE_SERVICE_ROLE_KEY to your server environment (Supabase Dashboard → Project Settings → API → service_role secret). Never expose it to the client."
            : "Set NEXT_PUBLIC_SUPABASE_URL to your Supabase project URL.",
      },
      { status: 500 }
    );
  }
  const supabase = supabaseConfig.supabase;

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
  const email = String(raw.email ?? "").trim();
  const visitorNotes =
    typeof raw.notes === "string" && raw.notes.trim().length > 0 ? raw.notes.trim() : null;
  const mockupDataRaw = raw.mockupData ?? null;

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  if (!mockupDataRaw || typeof mockupDataRaw !== "object" || Array.isArray(mockupDataRaw)) {
    return NextResponse.json({ error: "Mockup data is required." }, { status: 400 });
  }

  const parsed = mockupDataSchema.safeParse(mockupDataRaw);
  if (!parsed.success) {
    const msg =
      parsed.error.flatten().formErrors[0] ||
      parsed.error.errors[0]?.message ||
      "Invalid mockup data";
    return NextResponse.json({ error: msg, details: parsed.error.flatten() }, { status: 400 });
  }

  const mockupDataIn = parsed.data as z.infer<typeof mockupDataSchema> & Record<string, unknown>;
  const submitPhone = String((mockupDataIn as { submitPhone?: unknown }).submitPhone ?? "").trim();
  const snapshotIn = parsed.data.snapshot;
  const businessPhoneForNotes = String(snapshotIn.phone || "").trim();
  const businessEmailForNotes = String(snapshotIn.email || "").trim();
  const snapshot = normalizeSnapshot(snapshotIn, email, submitPhone);
  const contactName = String(parsed.data.contactName || "").trim();

  const mockRow = buildFunnelPublicMockupRow(snapshot);
  const slug = generateMockupSlug();
  const origin = requestOrigin(request);
  const previewUrl = `${origin.replace(/\/$/, "")}/mockup/${encodeURIComponent(slug)}`;

  const { data: ownerProfile, error: ownerErr } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
  if (ownerErr || !ownerProfile?.id) {
    console.error("[website-mockup] owner profile missing", ownerErr?.message);
    return NextResponse.json({ error: "CRM is not configured (no owner profile)." }, { status: 503 });
  }
  const ownerId = String(ownerProfile.id);

  let notes = [
    "Inbound: website mockup funnel (/free-mockup)",
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
    visitorNotes ? `Visitor note: ${visitorNotes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const leadPayload = pickLeadInsertFields({
    business_name: mockRow.business_name,
    primary_contact_name: contactName,
    contact_name: contactName,
    email: email || null,
    phone: submitPhone || null,
    website: normalizeWebsiteUrl(snapshot.website_url),
    category: mockRow.category,
    city: snapshot.city,
    state: snapshot.state || null,
    facebook_url: mockRow.facebook_url,
    service_type: "web_design",
    source: "mockup_request",
    lead_source: "mockup_request",
    lead_tags: ["inbound", "mockup_request"],
    notes,
    preview_url: previewUrl,
    why_this_lead_is_here: "Submitted free website preview on the MixedMakerShop funnel",
    status: "new",
    owner_id: ownerId,
    conversion_score: 78,
    opportunity_score: 78,
    last_updated_at: new Date().toISOString(),
  });

  const { data: leadRow, error: leadErr } = await supabase.from("leads").insert(leadPayload).select("id").single();
  if (leadErr || !leadRow?.id) {
    console.error("[website-mockup] lead insert failed", leadErr?.message);
    return NextResponse.json({ error: "Could not save your request. Try again or contact us directly." }, { status: 500 });
  }

  const leadId = String(leadRow.id);
  const now = new Date().toISOString();
  const rawPayload = {
    ...(typeof mockRow.raw_payload === "object" && mockRow.raw_payload ? mockRow.raw_payload : {}),
    funnel_contact_name: contactName,
    source: "mockup_request",
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
    console.error("[website-mockup] crm_mockups insert failed", mockErr.message);
    await supabase.from("leads").delete().eq("id", leadId);
    return NextResponse.json(
      { error: "Could not create your preview link. Please try again." },
      { status: 500 }
    );
  }

  const mockup_data: Record<string, unknown> = {
    ...mockupDataIn,
    contact_name: contactName,
    submitter: {
      email,
      phone: submitPhone || null,
      business_email: businessEmailForNotes || null,
      business_phone: businessPhoneForNotes || null,
    },
    snapshot,
    mock_row: {
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
      raw_payload: mockRow.raw_payload ?? {},
    },
    mockup_slug: slug,
    preview_url: previewUrl,
    lead_id: leadId,
  };

  const { data: submissionRow, error: submissionErr } = await supabase
    .from("mockup_submissions")
    .insert({
      email,
      mockup_data,
      notes: visitorNotes,
      status: "new",
      source: "free-mockup",
    })
    .select("id")
    .single();

  if (submissionErr || !submissionRow?.id) {
    console.error("Mockup submit insert failed:", submissionErr);
    await supabase.from("crm_mockups").delete().eq("lead_id", leadId);
    await supabase.from("leads").delete().eq("id", leadId);
    return NextResponse.json({ error: "Failed to save mockup." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    id: submissionRow.id,
    message: "Got it — your mockup is saved and sent.",
    detail:
      "I've got your mockup saved on my end, and I can review it when it's time to move forward.",
    previewUrl,
    mockup_slug: slug,
    lead_id: leadId,
    submission_id: String(submissionRow.id),
  });
}
