/**
 * Post-save CRM enrichment: Scout Brain when configured, else local HTML enrich fallback.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { logCrmAutomationEvent } from "@/lib/crm/automation-log";
import { applyScoutBrainEnrichmentToLead } from "@/lib/crm/apply-scout-brain-enrichment";
import { enrichLeadForOwner } from "@/lib/crm/lead-enrich";
import {
  fetchScoutBrainEnrichLead,
  getScoutBrainEnrichBaseUrl,
  logScoutBrainEnrichConfigMissing,
  type ScoutBrainEnrichInput,
} from "@/lib/crm/scout-brain-enrichment";

export type CrmEnrichmentRunResult = {
  enriched: boolean;
  updatedFields: string[];
  message: string;
  source: "scout_brain" | "local" | "skipped";
};

const LEAD_SELECT_FOR_INPUT =
  "business_name,city,state,source_url,facebook_url,source,lead_source,source_label";

/**
 * Maps CRM capture channel → Scout Brain `source_type` (Brain contract).
 */
export function mapCrmLeadRowToBrainSourceType(row: Record<string, unknown>): ScoutBrainEnrichInput["source_type"] {
  const src = String(row.source || "").trim().toLowerCase();
  const leadSrc = String(row.lead_source || "").trim().toLowerCase();
  const label = String(row.source_label || "").trim().toLowerCase();
  const fb = String(row.facebook_url || "").trim().toLowerCase();
  const primary = src || leadSrc;

  if (primary === "scout_google") return "google";
  if (primary === "scout_facebook") return "facebook";
  if (primary === "scout_mixed") return "mixed";

  if (primary === "extension") {
    const fbSignal =
      fb.includes("facebook.") ||
      fb.includes("fb.com") ||
      label.includes("facebook") ||
      (label.includes("fb") && label.length <= 24);
    if (fbSignal) return "facebook";
    return "extension";
  }

  if (primary === "quick_add" || primary === "manual") return "unknown";

  if (primary.includes("facebook")) return "facebook";
  if (primary.includes("google")) return "google";

  return "unknown";
}

async function loadLeadEnrichInput(
  supabase: SupabaseClient,
  ownerId: string,
  leadId: string
): Promise<ScoutBrainEnrichInput | null> {
  const variants = [
    LEAD_SELECT_FOR_INPUT,
    "business_name,source_url,facebook_url,source,lead_source,source_label",
    "business_name,source_url,facebook_url,source,lead_source",
  ];
  for (const sel of variants) {
    const { data, error } = await supabase
      .from("leads")
      .select(sel)
      .eq("id", leadId)
      .eq("owner_id", ownerId)
      .maybeSingle();
    if (!error && data) {
      const row = data as unknown as Record<string, unknown>;
      return {
        business_name: String(row.business_name || "").trim() || "Unknown business",
        city: String(row.city || "").trim() || "",
        state: String(row.state || "").trim() || "",
        source_url: String(row.source_url || "").trim() || "",
        facebook_url: String(row.facebook_url || "").trim() || "",
        source_type: mapCrmLeadRowToBrainSourceType(row),
      };
    }
  }
  return null;
}

/**
 * After a lead exists in DB, run enrichment (Brain preferred).
 */
export async function runCrmLeadEnrichmentAfterSave(
  supabase: SupabaseClient,
  ownerId: string,
  leadId: string
): Promise<CrmEnrichmentRunResult> {
  const brainConfigured = Boolean(getScoutBrainEnrichBaseUrl());

  await logCrmAutomationEvent(supabase, {
    owner_id: ownerId,
    lead_id: leadId,
    event_type: "lead_enrichment_requested",
    payload: {
      source: brainConfigured ? "scout_brain" : "local_html",
    },
  });

  const input = await loadLeadEnrichInput(supabase, ownerId, leadId);
  if (!input) {
    await logCrmAutomationEvent(supabase, {
      owner_id: ownerId,
      lead_id: leadId,
      event_type: "lead_enrichment_failed",
      payload: { reason: "no_lead_row", source: "scout_brain" },
    });
    return {
      enriched: false,
      updatedFields: [],
      message: "Enrichment skipped (lead not loaded)",
      source: "skipped",
    };
  }

  if (brainConfigured) {
    const fetched = await fetchScoutBrainEnrichLead(input);
    if (!fetched.ok) {
      console.warn("[crm-enrichment] Scout Brain failed:", fetched.error);
      await logCrmAutomationEvent(supabase, {
        owner_id: ownerId,
        lead_id: leadId,
        event_type: "lead_enrichment_failed",
        payload: {
          source: "scout_brain",
          error: fetched.error,
        },
      });
      return {
        enriched: false,
        updatedFields: [],
        message: "Enrichment unavailable right now.",
        source: "scout_brain",
      };
    }

    const el = fetched.data.enriched_lead;
    const applied = await applyScoutBrainEnrichmentToLead(supabase, ownerId, leadId, el || undefined);

    await logCrmAutomationEvent(supabase, {
      owner_id: ownerId,
      lead_id: leadId,
      event_type: applied.enriched ? "lead_enrichment_completed" : "lead_enrichment_no_change",
      payload: {
        source: "scout_brain",
        found_email: Boolean(el?.email),
        found_phone: Boolean(el?.phone),
        found_website: Boolean(el?.website),
        found_contact_page: Boolean(el?.contact_page),
        updated_fields: applied.updatedFields,
      },
    });

    return {
      enriched: applied.enriched,
      updatedFields: applied.updatedFields,
      message: applied.message,
      source: "scout_brain",
    };
  }

  logScoutBrainEnrichConfigMissing("runCrmLeadEnrichmentAfterSave");

  try {
    const local = await enrichLeadForOwner(supabase, ownerId, leadId, { silent: true });
    await logCrmAutomationEvent(supabase, {
      owner_id: ownerId,
      lead_id: leadId,
      event_type: local.enriched ? "lead_enrichment_completed" : "lead_enrichment_no_change",
      payload: {
        source: "local_html",
        updated_fields: local.updatedFields,
      },
    });
    return {
      enriched: local.enriched,
      updatedFields: local.updatedFields,
      message: local.message,
      source: "local",
    };
  } catch (e) {
    console.warn("[crm-enrichment] local enrich failed", e);
    await logCrmAutomationEvent(supabase, {
      owner_id: ownerId,
      lead_id: leadId,
      event_type: "lead_enrichment_failed",
      payload: { source: "local_html", error: String(e) },
    });
    return {
      enriched: false,
      updatedFields: [],
      message: "Enrichment unavailable right now.",
      source: "local",
    };
  }
}
