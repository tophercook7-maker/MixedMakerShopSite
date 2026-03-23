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
 * Only these keys are sent to Supabase on enrichment update (everything else is dropped).
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

/** @deprecated Alias — use SCOUT_BRAIN_ENRICHMENT_SAFE_PATCH_KEYS */
export const SAFE_KEYS = SCOUT_BRAIN_ENRICHMENT_SAFE_PATCH_KEYS;

const SAFE_SET = new Set<string>(SCOUT_BRAIN_ENRICHMENT_SAFE_PATCH_KEYS);

export type ApplyScoutBrainResult = {
  enriched: boolean;
  updatedFields: string[];
  message: string;
  hadBrainData: boolean;
  /** Set when Supabase update failed (client should show `message`). */
  saveFailed?: boolean;
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

  const droppedBySchemaWhitelist = Object.keys(patchRaw).filter((k) => !Object.prototype.hasOwnProperty.call(patch, k));
  const droppedUnsafe = Object.keys(patch).filter((k) => !SAFE_SET.has(k));
  const dropped_keys = Array.from(new Set([...droppedBySchemaWhitelist, ...droppedUnsafe]));

  const safePatch = Object.fromEntries(
    Object.entries(patch).filter(([key]) => SAFE_SET.has(key))
  ) as Record<string, unknown>;

  if (dropped_keys.length > 0) {
    console.info("[apply-scout-brain-enrichment] dropped keys (not written to DB)", {
      lead_id: leadId,
      owner_id: ownerId,
      dropped_keys,
      dropped_by_schema_whitelist: droppedBySchemaWhitelist,
      dropped_not_in_safe_keys: droppedUnsafe,
    });
  }

  if (Object.keys(safePatch).length === 0) {
    return {
      enriched: false,
      updatedFields: [],
      message:
        dropped_keys.length > 0
          ? "No safe fields to save after filtering — check dropped_keys in server logs"
          : "No new contact info found",
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
    const errMsg = String(upErr.message || "Unknown database error");
    console.error("[ENRICHMENT ERROR]", {
      payload: safePatch,
      error: errMsg,
      dropped_keys,
      lead_id: leadId,
      owner_id: ownerId,
      code: upErr.code,
      details: upErr.details,
      hint: upErr.hint,
    });
    return {
      enriched: false,
      updatedFields: [],
      message: `Could not save enrichment: ${errMsg}`,
      hadBrainData: true,
      saveFailed: true,
    };
  }

  return {
    enriched: true,
    updatedFields: safeUpdatedFields,
    message: "Lead enriched",
    hadBrainData: true,
  };
}
