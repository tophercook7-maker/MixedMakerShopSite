import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildMockupContentFromLead,
  getMockupTemplateForLead,
  isWiseBodyMindSoulLead,
  PREFERRED_WISE_BODY_MIND_SOUL_MOCKUP_SLUG,
  wiseBodyMindSoulShareRawFields,
  type LeadRowForMockup,
} from "@/lib/crm-mockup";
import { absolutePreviewUrl, allocateUniqueBrandedMockupSlug } from "@/lib/mockup-branded-slug";
import { recordLeadActivity } from "@/lib/lead-activity";

const TABLE = "crm_mockups";

async function resolveMockupSlug(
  supabase: SupabaseClient,
  existingSlug: string | null | undefined,
  lead: LeadRowForMockup
): Promise<string> {
  const kept = String(existingSlug || "").trim();
  if (kept) return kept;
  if (isWiseBodyMindSoulLead(lead)) {
    const preferred = PREFERRED_WISE_BODY_MIND_SOUL_MOCKUP_SLUG;
    const { data, error } = await supabase.from(TABLE).select("id").eq("mockup_slug", preferred).maybeSingle();
    if (!error && !data) return preferred;
  }
  return allocateUniqueBrandedMockupSlug(
    supabase,
    String(lead.business_name || "business"),
    lead.city ?? null
  );
}

export type CrmMockupUpsertOk = {
  mockup: Record<string, unknown>;
  previewUrl: string;
  slug: string;
};

/**
 * Create or update `crm_mockups` for a lead (same behavior as POST /api/leads/[id]/crm-mockup).
 */
export async function upsertCrmMockupForLead(
  supabase: SupabaseClient,
  ownerId: string,
  leadId: string,
  origin: string
): Promise<CrmMockupUpsertOk | { error: string; reason?: string }> {
  const { data: leadRow, error: leadErr } = await supabase
    .from("leads")
    .select("id,business_name,category,industry,city,state,phone,email,facebook_url,website")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (leadErr) {
    return { error: leadErr.message, reason: "lead_query_failed" };
  }
  if (!leadRow) {
    return { error: "Lead not found", reason: "not_found" };
  }

  const lead = leadRow as LeadRowForMockup;
  const tpl = getMockupTemplateForLead(lead);
  const content = buildMockupContentFromLead(lead, tpl);
  const wiseExtras = isWiseBodyMindSoulLead(lead) ? wiseBodyMindSoulShareRawFields() : {};
  const rawPayload = {
    services: content.services,
    style_preset: tpl.stylePreset,
    color_preset: tpl.colorPreset,
    ...wiseExtras,
  };

  const { data: existing, error: exErr } = await supabase
    .from(TABLE)
    .select("id,mockup_slug")
    .eq("owner_id", ownerId)
    .eq("lead_id", leadId)
    .maybeSingle();

  if (exErr) {
    return { error: exErr.message, reason: "mockup_query_failed" };
  }

  const slug = await resolveMockupSlug(supabase, (existing as { mockup_slug?: string } | null)?.mockup_slug, lead);
  const now = new Date().toISOString();
  const publicPreviewUrl = absolutePreviewUrl(origin, slug);

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
    mockup_url: publicPreviewUrl,
    raw_payload: rawPayload,
    updated_at: now,
  };

  const existingId = String((existing as { id?: string } | null)?.id || "").trim();

  if (existingId) {
    const { data, error } = await supabase.from(TABLE).update(baseRow).eq("id", existingId).select().single();
    if (error || !data) {
      return { error: error?.message || "Update failed", reason: "update_failed" };
    }
    void recordLeadActivity(supabase, {
      ownerId,
      leadId,
      eventType: "crm_mockup_updated",
      message: "Shareable website mockup updated",
      meta: { mockup_slug: slug, template_key: tpl.template_key },
    });
    const resolved = absolutePreviewUrl(origin, slug);
    return {
      mockup: { ...(data as Record<string, unknown>), mockup_url_resolved: resolved },
      previewUrl: resolved,
      slug,
    };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...baseRow, created_at: now })
    .select()
    .single();

  if (error || !data) {
    return { error: error?.message || "Insert failed", reason: "insert_failed" };
  }

  void recordLeadActivity(supabase, {
    ownerId,
    leadId,
    eventType: "crm_mockup_generated",
    message: "Shareable website mockup generated",
    meta: { mockup_slug: slug, template_key: tpl.template_key },
  });

  const resolved = absolutePreviewUrl(origin, slug);
  return {
    mockup: { ...(data as Record<string, unknown>), mockup_url_resolved: resolved },
    previewUrl: resolved,
    slug,
  };
}
