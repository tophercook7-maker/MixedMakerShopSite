import type { SupabaseClient } from "@supabase/supabase-js";

type CountFilter =
  | { op: "eq"; column: string; value: string }
  | { op: "gte"; column: string; value: string };

async function countLeads(
  supabase: SupabaseClient,
  ownerId: string,
  filters: CountFilter[],
): Promise<number> {
  let query = supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId);
  for (const filter of filters) {
    if (filter.op === "eq") query = query.eq(filter.column, filter.value);
    if (filter.op === "gte") query = query.gte(filter.column, filter.value);
  }
  const { count, error } = await query;
  if (error) {
    console.error("[lead count] query failed", error);
    return 0;
  }
  return Number(count || 0);
}

export async function getNewLeadCount(supabase: SupabaseClient, ownerId: string): Promise<number> {
  const scopedOwnerId = ownerId.trim();
  if (!scopedOwnerId) return 0;

  return countLeads(supabase, scopedOwnerId, [{ op: "eq", column: "status", value: "new" }]);
}

export type DailyCrmCheckStats = {
  newLeads: number;
  contactedToday: number;
  estimatesSentThisWeek: number;
  archivedThisWeek: number;
};

function startOfTodayIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

function startOfWeekIso(): string {
  const now = new Date();
  const day = now.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday).toISOString();
}

export async function getDailyCrmCheckStats(
  supabase: SupabaseClient,
  ownerId: string,
): Promise<DailyCrmCheckStats> {
  const scopedOwnerId = ownerId.trim();
  if (!scopedOwnerId) {
    return { newLeads: 0, contactedToday: 0, estimatesSentThisWeek: 0, archivedThisWeek: 0 };
  }

  const todayStart = startOfTodayIso();
  const weekStart = startOfWeekIso();
  const [newLeads, contactedToday, estimatesSentThisWeek, archivedThisWeek] = await Promise.all([
    getNewLeadCount(supabase, scopedOwnerId),
    countLeads(supabase, scopedOwnerId, [
      { op: "eq", column: "status", value: "contacted" },
      { op: "gte", column: "last_contacted_at", value: todayStart },
    ]),
    countLeads(supabase, scopedOwnerId, [
      { op: "eq", column: "deal_status", value: "proposal_sent" },
      { op: "gte", column: "last_updated_at", value: weekStart },
    ]),
    countLeads(supabase, scopedOwnerId, [
      { op: "eq", column: "status", value: "archived" },
      { op: "gte", column: "last_updated_at", value: weekStart },
    ]),
  ]);

  return { newLeads, contactedToday, estimatesSentThisWeek, archivedThisWeek };
}
