import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildFunnelPublicMockupRow,
  generateMockupSlug,
  type FunnelFormSnapshot,
} from "@/lib/crm-mockup";
import { pickLeadInsertFields } from "@/lib/crm-lead-schema";

function requestOrigin(request: Request): string {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return String(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
}

const bodySchema = z
  .object({
    contact_name: z.string().min(1, "Name is required"),
    email: z.string().optional(),
    phone: z.string().optional(),
    business_name: z.string().min(1, "Business name is required"),
    category: z.string().min(1, "Category is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
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
  .superRefine((v, ctx) => {
    const em = String(v.email || "").trim();
    const ph = String(v.phone || "").trim();
    if (!em && !ph) {
      ctx.addIssue({ code: "custom", message: "Add an email or phone so we can send your preview.", path: ["email"] });
    }
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid email.", path: ["email"] });
    }
  });

function toSnapshot(parsed: z.infer<typeof bodySchema>): FunnelFormSnapshot {
  return {
    business_name: parsed.business_name.trim(),
    category: parsed.category.trim(),
    city: parsed.city.trim(),
    state: String(parsed.state || "").trim(),
    phone: String(parsed.phone || "").trim(),
    email: String(parsed.email || "").trim(),
    facebook_url: String(parsed.facebook_url || "").trim(),
    services_text: String(parsed.services_text || ""),
    template_mode: String(parsed.template_mode || "auto").trim() || "auto",
    headline_override: String(parsed.headline_override || ""),
    subheadline_override: String(parsed.subheadline_override || ""),
    cta_override: String(parsed.cta_override || ""),
    style_preset: String(parsed.style_preset || ""),
    color_preset: String(parsed.color_preset || ""),
    hero_preset: String(parsed.hero_preset || ""),
  };
}

async function sendPreviewEmail(opts: { to: string; name: string; previewUrl: string }): Promise<void> {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const fromEmail = String(
    process.env.RESEND_FROM_EMAIL || process.env.BOOKING_FROM_EMAIL || ""
  ).trim();
  if (!apiKey || !fromEmail) return;

  const text = [
    `Hi ${opts.name},`,
    "",
    "Thanks for trying the website preview.",
    "",
    `Your sample page (save or share this link):`,
    opts.previewUrl,
    "",
    "— Topher, MixedMakerShop",
  ].join("\n");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "mixedmakershop-website-mockup/1.0",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [opts.to],
      subject: "Your website preview link",
      text,
    }),
    cache: "no-store",
  });
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] || parsed.error.errors[0]?.message || "Invalid input";
    return NextResponse.json({ error: msg, details: parsed.error.flatten() }, { status: 400 });
  }

  const snapshot = toSnapshot(parsed.data);
  const mockRow = buildFunnelPublicMockupRow(snapshot);
  const slug = generateMockupSlug();
  const origin = requestOrigin(request);
  const previewUrl = `${origin.replace(/\/$/, "")}/mockup/${encodeURIComponent(slug)}`;

  const supabase = createClient(url, key);

  const { data: ownerProfile, error: ownerErr } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
  if (ownerErr || !ownerProfile?.id) {
    console.error("[website-mockup] owner profile missing", ownerErr?.message);
    return NextResponse.json({ error: "CRM is not configured (no owner profile)." }, { status: 503 });
  }
  const ownerId = String(ownerProfile.id);

  const notes = [
    "Inbound: website mockup funnel (/free-mockup)",
    `Shareable preview: ${previewUrl}`,
    `Contact: ${parsed.data.contact_name.trim()}`,
    `Template: ${mockRow.template_key}`,
    `Headline: ${mockRow.headline}`,
    `Subheadline: ${mockRow.subheadline}`,
    `CTA: ${mockRow.cta_text}`,
    mockRow.raw_payload && Array.isArray((mockRow.raw_payload as { services?: unknown }).services)
      ? `Services: ${JSON.stringify((mockRow.raw_payload as { services: string[] }).services)}`
      : "",
    `Style / color: ${String((mockRow.raw_payload as { style_preset?: string }).style_preset)} / ${String((mockRow.raw_payload as { color_preset?: string }).color_preset)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const leadPayload = pickLeadInsertFields({
    business_name: mockRow.business_name,
    primary_contact_name: parsed.data.contact_name.trim(),
    contact_name: parsed.data.contact_name.trim(),
    email: snapshot.email || null,
    phone: snapshot.phone || null,
    category: mockRow.category,
    city: snapshot.city,
    state: snapshot.state || null,
    facebook_url: mockRow.facebook_url,
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
    funnel_contact_name: parsed.data.contact_name.trim(),
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

  if (snapshot.email) {
    void sendPreviewEmail({
      to: snapshot.email,
      name: parsed.data.contact_name.trim(),
      previewUrl,
    });
  }

  return NextResponse.json({
    ok: true,
    previewUrl,
    mockup_slug: slug,
    lead_id: leadId,
  });
}
