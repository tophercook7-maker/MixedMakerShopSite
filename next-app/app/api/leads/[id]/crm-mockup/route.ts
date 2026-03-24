import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import {
  buildMockupContentFromLead,
  generateMockupSlug,
  getMockupTemplateForLead,
  type LeadRowForMockup,
} from "@/lib/crm-mockup";
import { recordLeadActivity } from "@/lib/lead-activity";

const TABLE = "crm_mockups";

function requestOrigin(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return String(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
}

function mockupAbsoluteUrl(origin: string, slug: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/mockup/${encodeURIComponent(slug)}`;
}

async function leadIdFromParams(params: Promise<{ id: string }> | { id: string }): Promise<string> {
  const resolved = await Promise.resolve(params);
  return String(resolved?.id || "").trim();
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const leadId = await leadIdFromParams(params);
  if (!leadId) return NextResponse.json({ error: "Lead id required" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("owner_id", user.id)
    .eq("lead_id", leadId)
    .maybeSingle();

  if (error) {
    console.error("[crm-mockup GET]", error.message);
    return NextResponse.json({ error: error.message, reason: "query_failed" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ mockup: null });

  const origin = requestOrigin(req);
  const slug = String((data as { mockup_slug?: string }).mockup_slug || "").trim();
  const mockup_url_resolved = slug ? mockupAbsoluteUrl(origin, slug) : null;
  return NextResponse.json({ mockup: { ...(data as Record<string, unknown>), mockup_url_resolved } });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const leadId = await leadIdFromParams(params);
  if (!leadId) return NextResponse.json({ error: "Lead id required" }, { status: 400 });

  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();

  const { data: leadRow, error: leadErr } = await supabase
    .from("leads")
    .select("id,business_name,category,industry,city,state,phone,email,facebook_url,website")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (leadErr || !leadRow) {
    return NextResponse.json({ error: leadErr?.message || "Lead not found" }, { status: leadErr ? 500 : 404 });
  }

  const lead = leadRow as LeadRowForMockup;
  const tpl = getMockupTemplateForLead(lead);
  const content = buildMockupContentFromLead(lead, tpl);
  const rawPayload = {
    services: content.services,
    style_preset: tpl.stylePreset,
    color_preset: tpl.colorPreset,
  };

  const { data: existing, error: exErr } = await supabase
    .from(TABLE)
    .select("id,mockup_slug")
    .eq("owner_id", ownerId)
    .eq("lead_id", leadId)
    .maybeSingle();

  if (exErr) {
    console.error("[crm-mockup POST] existing", exErr.message);
    return NextResponse.json({ error: exErr.message, reason: "query_failed" }, { status: 500 });
  }

  const origin = requestOrigin(req);
  const slug =
    String((existing as { mockup_slug?: string } | null)?.mockup_slug || "").trim() || generateMockupSlug();
  const now = new Date().toISOString();

  const baseRow = {
    lead_id: leadId,
    owner_id: ownerId,
    template_key: tpl.template_key,
    business_name: content.business_name,
    city: content.city,
    category: content.category,
    phone: content.phone,
    email: content.email,
    facebook_url: content.facebook_url,
    headline: content.headline,
    subheadline: content.subheadline,
    cta_text: content.cta_text,
    mockup_slug: slug,
    mockup_url: mockupAbsoluteUrl(origin, slug),
    raw_payload: rawPayload,
    updated_at: now,
  };

  const existingId = String((existing as { id?: string } | null)?.id || "").trim();

  if (existingId) {
    const { data, error } = await supabase.from(TABLE).update(baseRow).eq("id", existingId).select().single();
    if (error || !data) {
      console.error("[crm-mockup POST] update", error?.message);
      return NextResponse.json({ error: error?.message || "Update failed" }, { status: 500 });
    }
    void recordLeadActivity(supabase, {
      ownerId,
      leadId,
      eventType: "crm_mockup_updated",
      message: "Shareable website mockup updated",
      meta: { mockup_slug: slug, template_key: tpl.template_key },
    });
    const resolved = mockupAbsoluteUrl(origin, slug);
    return NextResponse.json({ mockup: { ...(data as Record<string, unknown>), mockup_url_resolved: resolved } });
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...baseRow, created_at: now })
    .select()
    .single();

  if (error || !data) {
    console.error("[crm-mockup POST] insert", error?.message);
    return NextResponse.json({ error: error?.message || "Insert failed" }, { status: 500 });
  }

  void recordLeadActivity(supabase, {
    ownerId,
    leadId,
    eventType: "crm_mockup_generated",
    message: "Shareable website mockup generated",
    meta: { mockup_slug: slug, template_key: tpl.template_key },
  });

  const resolved = mockupAbsoluteUrl(origin, slug);
  return NextResponse.json({ mockup: { ...(data as Record<string, unknown>), mockup_url_resolved: resolved } });
}
