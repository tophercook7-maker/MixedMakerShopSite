/**
 * Applies Brain enrichment to `leads` via map-brain-enrichment-to-lead-patch + pickLeadPatchFields.
 * Final update uses a strict allowlist so PostgREST never receives columns missing on older DBs.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { pickLeadPatchFields } from "@/lib/crm-lead-schema";
import { buildBrainEnrichmentLeadPatch } from "@/lib/crm/map-brain-enrichment-to-lead-patch";
import type { ScoutBrainEnrichedLead } from "@/lib/crm/scout-brain-enrichment";

export type LeadRowForBrainMerge = Record<string, unknown>;

export { buildBrainEnrichmentLeadPatch, buildPatchFromScoutBrainEnrichment } from "@/lib/crm/map-brain-enrichment-to-lead-patch";

/**
 * Keys allowed on Supabase `update()` after enrichment.
 * Excludes newer outreach columns until migration `20260320150000_leads_outreach_targets` is applied everywhere.
 */
export const SCOUT_BRAIN_ENRICHMENT_SAFE_PATCH_KEYS = [
  "email",
  "phone",
  "website",
  "normalized_website",
  "has_website",
  "facebook_url",
  "normalized_facebook_url",
  "contact_page",
  "city",
  "state",
  "category",
  "why_this_lead_is_here",
  "conversion_score",
  "opportunity_score",
  "recommended_next_action",
  "place_id",
  "email_source",
  "lead_tags",
  "best_contact_method",
] as const;

const SAFE_SET = new Set<string>(SCOUT_BRAIN_ENRICHMENT_SAFE_PATCH_KEYS);

export type ApplyScoutBrainResult = {
  enriched: boolean;
  updatedFields: string[];
  message: string;
  hadBrainData: boolean;
};

export async function applyScoutBrainEnrichmentToLead(
  supabase: SupabaseClient,
  ownerId: string,
  leadId: string,
  brain: ScoutBrainEnrichedLead | null | undefined
): Promise<ApplyScoutBrainResult> {
  if (!brain || typeof brain !== "object") {
    return {
      enriched: false,
      updatedFields: [],
      message: "No enrichment payload from Scout Brain",
      hadBrainData: false,
    };
  }

  const selectVariants = [
    "id,email,phone,website,facebook_url,contact_page,city,state,category,why_this_lead_is_here,conversion_score,opportunity_score,lead_tags,recommended_next_action,place_id",
    "id,email,phone,website,facebook_url,why_this_lead_is_here,conversion_score,opportunity_score,lead_tags",
  ];

  let current: LeadRowForBrainMerge | null = null;
  for (const sel of selectVariants) {
    const { data, error } = await supabase
      .from("leads")
      .select(sel)
      .eq("id", leadId)
      .eq("owner_id", ownerId)
      .maybeSingle();
    if (!error && data) {
      current = data as unknown as LeadRowForBrainMerge;
      break;
    }
  }

  if (!current) {
    return {
      enriched: false,
      updatedFields: [],
      message: "Lead not found",
      hadBrainData: true,
    };
  }

  const { patchRaw, updatedFields } = buildBrainEnrichmentLeadPatch(current, brain);
  const patch = pickLeadPatchFields(patchRaw);

  const droppedKeys = Object.keys(patch).filter((k) => !SAFE_SET.has(k));
  const safePatch = Object.fromEntries(Object.entries(patch).filter(([key]) => SAFE_SET.has(key)));

  if (droppedKeys.length > 0) {
    console.info("[apply-scout-brain-enrichment] omitted keys not in safe allowlist (often newer columns)", {
      lead_id: leadId,
      owner_id: ownerId,
      dropped_keys: droppedKeys,
    });
  }

  if (Object.keys(safePatch).length === 0) {
    return {
      enriched: false,
      updatedFields: [],
      message: droppedKeys.length > 0 ? "No safe fields to save (run DB migration for outreach columns)" : "No new contact info found",
      hadBrainData: true,
    };
  }

  const safeUpdatedFields = updatedFields.filter((k) => SAFE_SET.has(k));

  const { error: upErr } = await supabase
    .from("leads")
    .update(safePatch)
    .eq("id", leadId)
    .eq("owner_id", ownerId);

  if (upErr) {
    console.error("[apply-scout-brain-enrichment] Supabase update failed", {
      lead_id: leadId,
      owner_id: ownerId,
      safe_patch_keys: Object.keys(safePatch),
      safe_patch_sample: Object.fromEntries(
        Object.entries(safePatch).map(([k, v]) => [k, typeof v === "string" ? `${String(v).slice(0, 80)}…` : v])
      ),
      error_message: upErr.message,
      error_code: upErr.code,
      error_details: upErr.details,
      error_hint: upErr.hint,
      full_error: upErr,
    });
    return {
      enriched: false,
      updatedFields: [],
      message: "Could not save enrichment",
      hadBrainData: true,
    };
  }

  return {
    enriched: true,
    updatedFields: safeUpdatedFields,
    message: "Lead enriched",
    hadBrainData: true,
  };
}
