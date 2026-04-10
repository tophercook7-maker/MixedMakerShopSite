import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScoutLead } from "@/lib/scout/types";
import { normalizeScoutLeadToResultRow } from "@/lib/scout/scout-results-normalize";
import { fetchLeadRowsForDedup } from "@/lib/scout/scout-crm-dedup-batch";
import { categoryMatchesTarget, cityMatchesTargetArea, stateMatchesTargetArea } from "@/lib/scout/scout-target-preferences";
import { enrichScoutResultRows } from "@/lib/scout/scout-results-enrich";
import type { EnrichedScoutResultListItem, ScoutResultListItem, ScoutResultsCounts } from "@/lib/scout/scout-results-types";
import {
  isScoutResultsTableMissingError,
  SCOUT_RESULTS_TABLE_MISSING_MESSAGE,
} from "@/lib/scout/scout-results-table-messages";
import { hydrateScoutResultRecord } from "@/lib/scout/scout-results-hydrate";
import { isOutreachReadyScoutRow } from "@/lib/scout/scout-outreach-eligibility";

export {
  isScoutResultsTableMissingError,
  SCOUT_RESULTS_TABLE_MISSING_HINT,
  SCOUT_RESULTS_TABLE_MISSING_MESSAGE,
} from "@/lib/scout/scout-results-table-messages";

type ExistingMerge = {
  id?: string;
  dedupe_key: string;
  skipped: boolean;
  added_to_leads: boolean;
  linked_lead_id: string | null;
  scout_notes: string | null;
  discovered_at: string | null;
  marked_priority?: boolean | null;
  reviewed_at?: string | null;
  pulled_into_crm_at?: string | null;
};

export async function syncOpportunitiesToScoutResults(
  supabase: SupabaseClient,
  ownerId: string,
  leads: ScoutLead[]
): Promise<{ upserted: number; error: string | null; tableMissing?: boolean }> {
  type NormalizedRow = NonNullable<ReturnType<typeof normalizeScoutLeadToResultRow>>;
  const normalized: NormalizedRow[] = leads
    .map((l) => normalizeScoutLeadToResultRow(l, ownerId))
    .filter((n): n is NormalizedRow => n != null);
  if (normalized.length === 0) return { upserted: 0, error: null };

  const keys = Array.from(new Set(normalized.map((n) => n.dedupe_key)));
  const { data: existingRows, error: selErr } = await supabase
    .from("scout_results")
    .select(
      "id,dedupe_key,skipped,added_to_leads,linked_lead_id,scout_notes,discovered_at,marked_priority,reviewed_at,pulled_into_crm_at"
    )
    .eq("owner_id", ownerId)
    .in("dedupe_key", keys);

  if (selErr) {
    if (isScoutResultsTableMissingError(selErr.message)) {
      return { upserted: 0, error: SCOUT_RESULTS_TABLE_MISSING_MESSAGE, tableMissing: true };
    }
    return { upserted: 0, error: selErr.message };
  }

  const existingByKey = new Map<string, ExistingMerge>();
  for (const row of existingRows || []) {
    const k = String((row as ExistingMerge).dedupe_key || "");
    if (k) existingByKey.set(k, row as ExistingMerge);
  }

  const payload = normalized.map((n) => {
    const e = existingByKey.get(n.dedupe_key);
    const row: Record<string, unknown> = {
      ...n,
      skipped: e?.skipped ?? false,
      added_to_leads: e?.added_to_leads ?? false,
      linked_lead_id: e?.linked_lead_id ?? null,
      scout_notes: e?.scout_notes ?? null,
      marked_priority: e?.marked_priority ?? false,
      reviewed_at: e?.reviewed_at ?? null,
      pulled_into_crm_at: e?.pulled_into_crm_at ?? null,
    };
    if (e?.discovered_at) row.discovered_at = e.discovered_at;
    for (const k of Object.keys(row)) {
      if (row[k] === undefined) delete row[k];
    }
    return row;
  });

  const { error: upErr } = await supabase.from("scout_results").upsert(payload, {
    onConflict: "owner_id,dedupe_key",
  });

  if (upErr) {
    if (isScoutResultsTableMissingError(upErr.message)) {
      return { upserted: 0, error: SCOUT_RESULTS_TABLE_MISSING_MESSAGE, tableMissing: true };
    }
    return { upserted: 0, error: upErr.message };
  }
  return { upserted: payload.length, error: null };
}

export async function markScoutResultLinked(
  supabase: SupabaseClient,
  ownerId: string,
  scoutResultId: string | null | undefined,
  leadId: string
): Promise<void> {
  const lid = String(leadId || "").trim();
  if (!lid) return;
  const sid = String(scoutResultId || "").trim();
  if (sid) {
    await supabase
      .from("scout_results")
      .update({ added_to_leads: true, linked_lead_id: lid, pulled_into_crm_at: new Date().toISOString() })
      .eq("id", sid)
      .eq("owner_id", ownerId);
    return;
  }
}

/** When UI only has opportunity id, still link the discovery row after lead creation. */
export async function markScoutResultLinkedByOpportunity(
  supabase: SupabaseClient,
  ownerId: string,
  opportunityId: string | null | undefined,
  leadId: string
): Promise<void> {
  const oid = String(opportunityId || "").trim();
  const lid = String(leadId || "").trim();
  if (!oid || !lid) return;
  await supabase
    .from("scout_results")
    .update({ added_to_leads: true, linked_lead_id: lid, pulled_into_crm_at: new Date().toISOString() })
    .eq("owner_id", ownerId)
    .eq("source_external_id", oid);
}

function emailFromScoutRaw(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const e = o.email ?? o.contact_email ?? o.best_email;
  const s = String(e || "").trim();
  return s || null;
}

function rowToListItem(r: Record<string, unknown>): ScoutResultListItem {
  const h = hydrateScoutResultRecord(r);
  return {
    id: String(r.id || ""),
    business_name: h.business_name,
    city: h.city,
    state: h.state,
    category: h.category,
    source_type: r.source_type as ScoutResultListItem["source_type"],
    website_url: (r.website_url as string) ?? null,
    has_website: (r.has_website as boolean) ?? null,
    facebook_url: h.facebook_url,
    has_facebook: h.has_facebook,
    phone: h.phone,
    has_phone: h.has_phone,
    email: emailFromScoutRaw(r.raw_source_payload),
    opportunity_reason: (r.opportunity_reason as string) ?? null,
    opportunity_rank: Number(r.opportunity_rank ?? 0),
    source_url: (r.source_url as string) ?? null,
    skipped: Boolean(r.skipped),
    added_to_leads: Boolean(r.added_to_leads),
    linked_lead_id: (r.linked_lead_id as string) ?? null,
    source_external_id: (r.source_external_id as string) ?? null,
    scout_notes: (r.scout_notes as string) ?? null,
    discovered_at: (r.discovered_at as string) ?? null,
    marked_priority: Boolean(r.marked_priority),
    reviewed_at: (r.reviewed_at as string) ?? null,
    pulled_into_crm_at: (r.pulled_into_crm_at as string) ?? null,
  };
}

export type ScoutResultsViewFilter =
  | "queue"
  | "unreviewed"
  | "inbox"
  | "pulled"
  | "rejected"
  | "archived"
  | "all";

export async function fetchScoutResultsForOwner(
  supabase: SupabaseClient,
  ownerId: string,
  filters: {
    include_skipped: boolean;
    include_saved: boolean;
    view?: ScoutResultsViewFilter;
    source_type?: string;
    has_website?: "yes" | "no" | "unknown";
    has_phone?: "yes" | "no";
    facebook_only?: boolean;
    city_q?: string;
    category?: string;
    limit?: number;
    fetch_cap?: number;
    /** Post-enrich filters */
    band?: "hot" | "good" | "maybe" | "skip" | "all";
    has_email?: boolean;
    in_target_area?: boolean;
    target_category?: boolean;
    sort?: "score" | "newest" | "location" | "category";
  }
): Promise<{ rows: EnrichedScoutResultListItem[]; error: string | null; tableMissing?: boolean }> {
  const view: ScoutResultsViewFilter = filters.view || "queue";
  const outreachQueueView = view === "queue" || view === "unreviewed";
  const requestedCap = filters.fetch_cap ?? 800;
  const fetchCap = Math.min(outreachQueueView ? Math.max(requestedCap, 1600) : requestedCap, 2000);
  const outLimit = Math.min(filters.limit ?? 500, 500);

  let q = supabase
    .from("scout_results")
    .select(
      "id,business_name,city,state,category,source_type,website_url,has_website,facebook_url,has_facebook,phone,has_phone,raw_source_payload,opportunity_reason,opportunity_rank,source_url,skipped,added_to_leads,linked_lead_id,source_external_id,scout_notes,discovered_at,marked_priority,reviewed_at,pulled_into_crm_at"
    )
    .eq("owner_id", ownerId)
    .order("discovered_at", { ascending: false })
    .limit(fetchCap);

  if (view === "queue" || view === "unreviewed") {
    q = q.eq("skipped", false).eq("added_to_leads", false);
  } else if (view === "inbox") {
    q = q.eq("skipped", false);
  } else if (view === "pulled") {
    q = q.eq("added_to_leads", true);
  } else if (view === "rejected") {
    q = q.eq("skipped", true).ilike("scout_notes", "%not_useful%");
  } else if (view === "archived") {
    q = q.eq("skipped", true).ilike("scout_notes", "%archived%");
  } else if (view === "all") {
    // no skipped/added filter
  } else {
    if (!filters.include_skipped) q = q.eq("skipped", false);
    if (!filters.include_saved) q = q.eq("added_to_leads", false);
  }

  const st = String(filters.source_type || "").toLowerCase();
  if (st && st !== "all") {
    if (st === "google") q = q.in("source_type", ["google", "mixed"]);
    else if (st === "facebook") q = q.in("source_type", ["facebook", "mixed"]);
    else q = q.eq("source_type", st);
  }

  if (filters.has_website === "yes") q = q.eq("has_website", true);
  if (filters.has_website === "no") q = q.eq("has_website", false);
  if (filters.has_website === "unknown") q = q.is("has_website", null);

  if (filters.has_phone === "yes") q = q.eq("has_phone", true);
  if (filters.has_phone === "no") q = q.eq("has_phone", false);

  if (filters.facebook_only) {
    q = q.eq("has_facebook", true).eq("has_website", false);
  }

  const cat = String(filters.category || "").trim();
  if (cat) q = q.eq("category", cat);

  const cityQ = String(filters.city_q || "").trim();
  if (cityQ) q = q.ilike("city", `%${cityQ}%`);

  const { data, error } = await q;
  if (error) {
    if (isScoutResultsTableMissingError(error.message)) {
      return { rows: [], error: SCOUT_RESULTS_TABLE_MISSING_MESSAGE, tableMissing: true };
    }
    const msg = String(error.message || "");
    if (msg.includes("marked_priority") || msg.includes("reviewed_at") || msg.includes("pulled_into_crm_at")) {
      return {
        rows: [],
        error:
          "Scout review columns missing. Apply migration 20260408160000_scout_results_review_fields.sql and retry.",
        tableMissing: false,
      };
    }
    return { rows: [], error: error.message };
  }

  const mapped = (data || []).map((r) => rowToListItem(r as Record<string, unknown>));
  const leadRows = await fetchLeadRowsForDedup(supabase, ownerId);
  let enriched = enrichScoutResultRows(mapped, leadRows);

  if (outreachQueueView) {
    enriched = enriched.filter((r) => isOutreachReadyScoutRow(r));
  }

  const band = String(filters.band || "all").toLowerCase();
  if (band === "hot") enriched = enriched.filter((r) => r.opportunity_label === "hot");
  else if (band === "good") enriched = enriched.filter((r) => r.opportunity_label === "good");
  else if (band === "maybe") enriched = enriched.filter((r) => r.opportunity_label === "maybe");
  else if (band === "skip") enriched = enriched.filter((r) => r.opportunity_label === "skip");

  if (filters.has_email === true) {
    enriched = enriched.filter((r) => String(r.email || "").trim().length > 0);
  }
  if (filters.in_target_area === true) {
    enriched = enriched.filter((r) => cityMatchesTargetArea(r.city) || stateMatchesTargetArea(r.state));
  }
  if (filters.target_category === true) {
    enriched = enriched.filter((r) => categoryMatchesTarget(r.category));
  }

  const sort = String(filters.sort || "score").toLowerCase();
  if (sort === "newest") {
    enriched.sort((a, b) => String(b.discovered_at || "").localeCompare(String(a.discovered_at || "")));
  } else if (sort === "location") {
    enriched.sort((a, b) => {
      const la = `${String(a.state || "")} ${String(a.city || "")}`.toLowerCase();
      const lb = `${String(b.state || "")} ${String(b.city || "")}`.toLowerCase();
      return la.localeCompare(lb);
    });
  } else if (sort === "category") {
    enriched.sort((a, b) =>
      String(a.category || "").toLowerCase().localeCompare(String(b.category || "").toLowerCase())
    );
  } else {
    enriched.sort((a, b) => b.opportunity_score - a.opportunity_score);
  }

  return { rows: enriched.slice(0, outLimit), error: null };
}

export async function fetchScoutResultsCounts(supabase: SupabaseClient, ownerId: string): Promise<ScoutResultsCounts> {
  const base = () => supabase.from("scout_results").select("*", { count: "exact", head: true }).eq("owner_id", ownerId);

  const outreachQueueBase = () =>
    base()
      .eq("skipped", false)
      .eq("added_to_leads", false)
      .not("business_name", "is", null)
      .neq("business_name", "")
      .not("facebook_url", "is", null)
      .neq("facebook_url", "")
      .or("has_website.is.null,has_website.eq.false")
      .or(
        "facebook_url.ilike.%facebook.com%,facebook_url.ilike.%fb.com%,facebook_url.ilike.%fb.me%,facebook_url.ilike.%m.facebook.com%"
      );

  const [
    queueRes,
    savedRes,
    skippedRes,
    noSiteRes,
    fbOnlyRes,
    totalRes,
    rejectedRes,
    archivedRes,
  ] = await Promise.all([
    outreachQueueBase(),
    base().eq("added_to_leads", true),
    base().eq("skipped", true),
    base().eq("skipped", false).eq("added_to_leads", false).or("has_website.eq.false,has_website.is.null"),
    outreachQueueBase(),
    base(),
    base().eq("skipped", true).ilike("scout_notes", "%not_useful%"),
    base().eq("skipped", true).ilike("scout_notes", "%archived%"),
  ]);

  let hot_in_queue = 0;
  let good_in_queue = 0;
  let maybe_in_queue = 0;
  let skip_in_queue = 0;
  const bandRes = await fetchScoutResultsForOwner(supabase, ownerId, {
    include_skipped: false,
    include_saved: false,
    view: "queue",
    fetch_cap: 600,
    limit: 600,
    sort: "score",
  });
  if (!bandRes.error) {
    for (const r of bandRes.rows) {
      if (r.opportunity_label === "hot") hot_in_queue += 1;
      else if (r.opportunity_label === "good") good_in_queue += 1;
      else if (r.opportunity_label === "maybe") maybe_in_queue += 1;
      else skip_in_queue += 1;
    }
  }

  return {
    new_in_queue: Number(queueRes.count || 0),
    saved_to_leads: Number(savedRes.count || 0),
    skipped: Number(skippedRes.count || 0),
    no_website: Number(noSiteRes.count || 0),
    facebook_only: Number(fbOnlyRes.count || 0),
    total_all: Number(totalRes.count || 0),
    hot_in_queue,
    good_in_queue,
    maybe_in_queue,
    skip_in_queue,
    rejected: Number(rejectedRes.count || 0),
    archived: Number(archivedRes.count || 0),
  };
}
