import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScoutLead } from "@/lib/scout/types";
import { normalizeScoutLeadToResultRow } from "@/lib/scout/scout-results-normalize";
import type { ScoutResultListItem, ScoutResultsCounts } from "@/lib/scout/scout-results-types";

type ExistingMerge = {
  id?: string;
  dedupe_key: string;
  skipped: boolean;
  added_to_leads: boolean;
  linked_lead_id: string | null;
  scout_notes: string | null;
  discovered_at: string | null;
};

export async function syncOpportunitiesToScoutResults(
  supabase: SupabaseClient,
  ownerId: string,
  leads: ScoutLead[]
): Promise<{ upserted: number; error: string | null }> {
  const normalized = leads.map((l) => normalizeScoutLeadToResultRow(l, ownerId)).filter(Boolean) as ReturnType<
    typeof normalizeScoutLeadToResultRow
  >[];
  if (normalized.length === 0) return { upserted: 0, error: null };

  const keys = [...new Set(normalized.map((n) => n.dedupe_key))];
  const { data: existingRows, error: selErr } = await supabase
    .from("scout_results")
    .select("id,dedupe_key,skipped,added_to_leads,linked_lead_id,scout_notes,discovered_at")
    .eq("owner_id", ownerId)
    .in("dedupe_key", keys);

  if (selErr) return { upserted: 0, error: selErr.message };

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

  if (upErr) return { upserted: 0, error: upErr.message };
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
      .update({ added_to_leads: true, linked_lead_id: lid })
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
    .update({ added_to_leads: true, linked_lead_id: lid })
    .eq("owner_id", ownerId)
    .eq("source_external_id", oid);
}

function rowToListItem(r: Record<string, unknown>): ScoutResultListItem {
  return {
    id: String(r.id || ""),
    business_name: String(r.business_name || ""),
    city: (r.city as string) ?? null,
    state: (r.state as string) ?? null,
    category: (r.category as string) ?? null,
    source_type: r.source_type as ScoutResultListItem["source_type"],
    website_url: (r.website_url as string) ?? null,
    has_website: (r.has_website as boolean) ?? null,
    facebook_url: (r.facebook_url as string) ?? null,
    has_facebook: (r.has_facebook as boolean) ?? null,
    phone: (r.phone as string) ?? null,
    has_phone: (r.has_phone as boolean) ?? null,
    opportunity_reason: (r.opportunity_reason as string) ?? null,
    opportunity_rank: Number(r.opportunity_rank ?? 0),
    source_url: (r.source_url as string) ?? null,
    skipped: Boolean(r.skipped),
    added_to_leads: Boolean(r.added_to_leads),
    linked_lead_id: (r.linked_lead_id as string) ?? null,
    source_external_id: (r.source_external_id as string) ?? null,
  };
}

export async function fetchScoutResultsForOwner(
  supabase: SupabaseClient,
  ownerId: string,
  filters: {
    include_skipped: boolean;
    include_saved: boolean;
    source_type?: string;
    has_website?: "yes" | "no" | "unknown";
    has_phone?: "yes" | "no";
    city_q?: string;
    category?: string;
    limit?: number;
  }
): Promise<{ rows: ScoutResultListItem[]; error: string | null }> {
  let q = supabase
    .from("scout_results")
    .select(
      "id,business_name,city,state,category,source_type,website_url,has_website,facebook_url,has_facebook,phone,has_phone,opportunity_reason,opportunity_rank,source_url,skipped,added_to_leads,linked_lead_id,source_external_id"
    )
    .eq("owner_id", ownerId)
    .order("opportunity_rank", { ascending: false })
    .limit(Math.min(filters.limit ?? 400, 500));

  if (!filters.include_skipped) q = q.eq("skipped", false);
  if (!filters.include_saved) q = q.eq("added_to_leads", false);

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

  const cat = String(filters.category || "").trim();
  if (cat) q = q.eq("category", cat);

  const cityQ = String(filters.city_q || "").trim();
  if (cityQ) q = q.ilike("city", `%${cityQ}%`);

  const { data, error } = await q;
  if (error) return { rows: [], error: error.message };
  const rows = (data || []).map((r) => rowToListItem(r as Record<string, unknown>));
  return { rows, error: null };
}

export async function fetchScoutResultsCounts(supabase: SupabaseClient, ownerId: string): Promise<ScoutResultsCounts> {
  const base = () => supabase.from("scout_results").select("*", { count: "exact", head: true }).eq("owner_id", ownerId);

  const [
    queueRes,
    savedRes,
    skippedRes,
    noSiteRes,
    fbOnlyRes,
  ] = await Promise.all([
    base().eq("skipped", false).eq("added_to_leads", false),
    base().eq("added_to_leads", true),
    base().eq("skipped", true),
    base().eq("skipped", false).eq("added_to_leads", false).or("has_website.eq.false,has_website.is.null"),
    base().eq("skipped", false).eq("added_to_leads", false).eq("has_facebook", true).eq("has_website", false),
  ]);

  return {
    new_in_queue: Number(queueRes.count || 0),
    saved_to_leads: Number(savedRes.count || 0),
    skipped: Number(skippedRes.count || 0),
    no_website: Number(noSiteRes.count || 0),
    facebook_only: Number(fbOnlyRes.count || 0),
  };
}
