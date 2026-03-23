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
  /** Scout Brain path: Supabase update failed — show `message` to user */
  saveFailed?: boolean;
};

const LEAD_SELECT_FOR_INPUT =
  "business_name,city,state,source_url,facebook_url,google_business_url,source,lead_source,source_label,email,phone,website,contact_page,conversion_score,opportunity_score,why_this_lead_is_here,notes,category,best_contact_method,best_contact_value,advertising_page_url,advertising_page_label,suggested_template_key,suggested_response";

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
    "business_name,source_url,facebook_url,source,lead_source,source_label,email,phone,website,contact_page,conversion_score,opportunity_score",
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
      const conv = row.conversion_score;
      const opp = row.opportunity_score;
      return {
        business_name: String(row.business_name || "").trim() || "Unknown business",
        city: String(row.city || "").trim() || "",
        state: String(row.state || "").trim() || "",
        source_url: String(row.source_url || "").trim() || "",
        facebook_url: String(row.facebook_url || "").trim() || "",
        google_business_url: String(row.google_business_url || "").trim() || null,
        source_type: mapCrmLeadRowToBrainSourceType(row),
        email: String(row.email || "").trim() || null,
        phone: String(row.phone || "").trim() || null,
        website: String(row.website || "").trim() || null,
        contact_page: String(row.contact_page || "").trim() || null,
        conversion_score: conv != null && Number.isFinite(Number(conv)) ? Number(conv) : null,
        opportunity_score: opp != null && Number.isFinite(Number(opp)) ? Number(opp) : null,
        why_this_lead_is_here: String(row.why_this_lead_is_here || "").trim() || null,
        category: String(row.category || "").trim() || null,
        source: String(row.source || "").trim() || null,
        source_label: String(row.source_label || "").trim() || null,
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
      const rejected =
        typeof fetched.error === "string" && fetched.error.startsWith("rejected:");
      await logCrmAutomationEvent(supabase, {
        owner_id: ownerId,
        lead_id: leadId,
        event_type: "lead_enrichment_failed",
        payload: {
          source: "scout_brain",
          error: fetched.error,
          quality_rejected: rejected,
        },
      });
      return {
        enriched: false,
        updatedFields: [],
        message: rejected ? fetched.error : "Enrichment unavailable right now.",
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
      saveFailed: applied.saveFailed,
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
