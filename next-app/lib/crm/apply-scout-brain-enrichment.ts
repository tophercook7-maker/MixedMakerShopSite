/**
 * Applies Brain enrichment to `leads` via map-brain-enrichment-to-lead-patch + pickLeadPatchFields.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { pickLeadPatchFields } from "@/lib/crm-lead-schema";
import { buildBrainEnrichmentLeadPatch } from "@/lib/crm/map-brain-enrichment-to-lead-patch";
import type { ScoutBrainEnrichedLead } from "@/lib/crm/scout-brain-enrichment";

export type LeadRowForBrainMerge = Record<string, unknown>;

export { buildBrainEnrichmentLeadPatch, buildPatchFromScoutBrainEnrichment } from "@/lib/crm/map-brain-enrichment-to-lead-patch";

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

  if (Object.keys(patch).length === 0) {
    return {
      enriched: false,
      updatedFields: [],
      message: "No new contact info found",
      hadBrainData: true,
    };
  }

  const { error: upErr } = await supabase.from("leads").update(patch).eq("id", leadId).eq("owner_id", ownerId);
  if (upErr) {
    console.warn("[apply-scout-brain-enrichment] update failed", upErr.message);
    return {
      enriched: false,
      updatedFields: [],
      message: "Could not save enrichment",
      hadBrainData: true,
    };
  }

  return {
    enriched: true,
    updatedFields,
    message: "Lead enriched",
    hadBrainData: true,
  };
}
