import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeLeadSourceValue } from "@/lib/crm/lead-source";
import { normalizeWorkflowLeadStatus } from "@/lib/crm/stage-normalize";

/** Normalized bucket key for reporting (lowercase snake_case). Never mutates DB. */
export function reportingBucketKey(lead: { lead_source?: string | null; source?: string | null }): string {
  const a = String(lead.lead_source || "").trim();
  const b = String(lead.source || "").trim();
  const raw = a || b;
  const n = normalizeLeadSourceValue(raw);
  return n || "unknown";
}

/**
 * Display labels for known intake / capture tokens. Unknown keys fall back to Title Case.
 * Raw `lead_source` / `source` values in the DB are unchanged.
 */
const REPORTING_LABEL_OVERRIDES: Record<string, string> = {
  unknown: "Unknown",
  free_mockup: "Free Mockup",
  contact_form: "Contact Form",
  website_check: "Website Check",
  quote: "Quote Request",
  public_booking: "Booking",
  book: "Booking",
  print_request: "3D Print Request",
  print_quote: "3D Print Quote",
  "3d_printing": "3D Print",
  extension: "Extension",
  quick_add: "Quick Add",
  manual: "Manual",
  manual_pick: "Top Picks",
  scout: "Scout",
  scout_google: "Scout (Google)",
  scout_facebook: "Scout (Facebook)",
  scout_mixed: "Scout",
  connect: "Connect Form",
  growth_offer: "Growth Offer",
};

export function displayLabelForReportingKey(key: string): string {
  const k = String(key || "").trim().toLowerCase();
  if (REPORTING_LABEL_OVERRIDES[k]) return REPORTING_LABEL_OVERRIDES[k];
  const human = k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return human || "Unknown";
}

/** Dropdown / filter on leads list (values = normalized keys). */
export const REPORTING_SOURCE_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All sources" },
  { value: "free_mockup", label: "Free Mockup" },
  { value: "contact_form", label: "Contact Form" },
  { value: "website_check", label: "Website Check" },
  { value: "quote", label: "Quote Request" },
  { value: "public_booking", label: "Booking" },
  { value: "print_request", label: "3D Print Request" },
  { value: "print_quote", label: "3D Print Quote" },
  { value: "3d_printing", label: "3D Print" },
  { value: "scout_mixed", label: "Scout" },
  { value: "scout_google", label: "Scout (Google)" },
  { value: "scout_facebook", label: "Scout (Facebook)" },
  { value: "extension", label: "Extension" },
  { value: "quick_add", label: "Quick Add" },
  { value: "manual", label: "Manual" },
  { value: "manual_pick", label: "Top Picks" },
  { value: "connect", label: "Connect Form" },
  { value: "unknown", label: "Unknown" },
];

export type LeadSourceRange = "7d" | "30d" | "month" | "all";

export function startIsoForRange(range: LeadSourceRange, now: Date = new Date()): string | null {
  if (range === "all") return null;
  if (range === "7d") {
    const d = new Date(now.getTime());
    d.setUTCDate(d.getUTCDate() - 7);
    return d.toISOString();
  }
  if (range === "30d") {
    const d = new Date(now.getTime());
    d.setUTCDate(d.getUTCDate() - 30);
    return d.toISOString();
  }
  if (range === "month") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)).toISOString();
  }
  return null;
}

export function startOfCurrentMonthUtc(now: Date = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)).toISOString();
}

export type LeadReportingRow = {
  lead_source?: string | null;
  source?: string | null;
  status?: string | null;
  created_at?: string | null;
};

export type SourceAggRow = {
  key: string;
  label: string;
  total: number;
  new: number;
  contacted: number;
  replied: number;
  active: number;
  won: number;
  no_response: number;
  not_interested: number;
  archived: number;
  dead: number;
  winRate: number | null;
  activeRate: number | null;
};

const ACTIVE_STATUSES = new Set(["new", "contacted", "replied"]);
const DEAD_STATUSES = new Set(["no_response", "not_interested", "archived"]);

type MutableAgg = Omit<SourceAggRow, "key" | "label" | "winRate" | "activeRate">;

function incStatus(counts: MutableAgg, status: string): void {
  const s = normalizeWorkflowLeadStatus(status);
  if (s === "new") counts.new += 1;
  if (s === "contacted") counts.contacted += 1;
  if (s === "replied") counts.replied += 1;
  if (ACTIVE_STATUSES.has(s)) counts.active += 1;
  if (s === "won") counts.won += 1;
  if (s === "no_response") counts.no_response += 1;
  if (s === "not_interested") counts.not_interested += 1;
  if (s === "archived") counts.archived += 1;
  if (DEAD_STATUSES.has(s)) counts.dead += 1;
}

function finalizeRow(key: string, partial: MutableAgg): SourceAggRow {
  const label = displayLabelForReportingKey(key);
  const winRate = partial.total > 0 ? partial.won / partial.total : null;
  const activeRate = partial.total > 0 ? partial.active / partial.total : null;
  return {
    key,
    label,
    ...partial,
    winRate,
    activeRate,
  };
}

export function filterRowsByCreatedAt(rows: LeadReportingRow[], startIso: string | null): LeadReportingRow[] {
  if (!startIso) return rows;
  const t = new Date(startIso).getTime();
  return rows.filter((r) => {
    const c = r.created_at ? new Date(String(r.created_at)).getTime() : NaN;
    return Number.isFinite(c) && c >= t;
  });
}

export function aggregateBySource(rows: LeadReportingRow[]): SourceAggRow[] {
  const map = new Map<string, MutableAgg>();

  for (const r of rows) {
    const key = reportingBucketKey(r);
    if (!map.has(key)) {
      map.set(key, {
        total: 0,
        new: 0,
        contacted: 0,
        replied: 0,
        active: 0,
        won: 0,
        no_response: 0,
        not_interested: 0,
        archived: 0,
        dead: 0,
      });
    }
    const bucket = map.get(key)!;
    bucket.total += 1;
    incStatus(bucket, String(r.status || ""));
  }

  const out = Array.from(map.entries()).map(([key, partial]) => finalizeRow(key, partial));
  out.sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  return out;
}

export type ReportHighlights = {
  bestVolumeKey: string | null;
  bestVolumeLabel: string | null;
  bestVolumeCount: number;
  bestWinsKey: string | null;
  bestWinsLabel: string | null;
  bestWinsCount: number;
  bestWinRateKey: string | null;
  bestWinRateLabel: string | null;
  bestWinRatePct: number | null;
  monthTotalLeads: number;
  monthWins: number;
};

const MIN_FOR_WIN_RATE = 3;

export function computeHighlights(
  /** For month cards — independent of table range */
  monthRows: LeadReportingRow[],
  agg: SourceAggRow[]
): ReportHighlights {
  let bestVolumeKey: string | null = null;
  let bestVolumeCount = 0;
  let bestWinsKey: string | null = null;
  let bestWinsCount = 0;
  let bestWinRateKey: string | null = null;
  let bestWinRatePct: number | null = null;

  for (const row of agg) {
    if (row.total > bestVolumeCount) {
      bestVolumeCount = row.total;
      bestVolumeKey = row.key;
    }
    if (row.won > bestWinsCount) {
      bestWinsCount = row.won;
      bestWinsKey = row.key;
    }
    if (row.total >= MIN_FOR_WIN_RATE && row.winRate != null) {
      const pct = row.winRate;
      if (bestWinRatePct == null || pct > bestWinRatePct) {
        bestWinRatePct = pct;
        bestWinRateKey = row.key;
      }
    }
  }

  let monthWins = 0;
  for (const r of monthRows) {
    if (normalizeWorkflowLeadStatus(String(r.status || "")) === "won") monthWins += 1;
  }

  return {
    bestVolumeKey,
    bestVolumeLabel: bestVolumeKey ? displayLabelForReportingKey(bestVolumeKey) : null,
    bestVolumeCount,
    bestWinsKey,
    bestWinsLabel: bestWinsKey ? displayLabelForReportingKey(bestWinsKey) : null,
    bestWinsCount,
    bestWinRateKey,
    bestWinRateLabel: bestWinRateKey ? displayLabelForReportingKey(bestWinRateKey) : null,
    bestWinRatePct,
    monthTotalLeads: monthRows.length,
    monthWins,
  };
}

/** Match URL filter param to a lead (normalized key equality). */
export function leadMatchesReportingSourceFilter(
  lead: { lead_source?: string | null; source?: string | null },
  param: string | null | undefined
): boolean {
  const raw = String(param || "").trim().toLowerCase();
  if (!raw) return true;
  const want = normalizeLeadSourceValue(raw.replace(/-/g, "_"));
  const got = reportingBucketKey(lead);
  return got === want || got === raw || normalizeLeadSourceValue(lead.lead_source) === want;
}

export async function fetchAllLeadReportingRows(supabase: SupabaseClient, ownerId: string): Promise<LeadReportingRow[]> {
  const pageSize = 1000;
  let from = 0;
  const out: LeadReportingRow[] = [];
  for (;;) {
    const { data, error } = await supabase
      .from("leads")
      .select("lead_source, source, status, created_at")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) {
      console.error("[lead-source-reporting] fetch failed", error.message);
      break;
    }
    const chunk = (data || []) as LeadReportingRow[];
    if (!chunk.length) break;
    out.push(...chunk);
    if (chunk.length < pageSize) break;
    from += pageSize;
    if (from > 200000) break;
  }
  return out;
}

export function parseLeadSourceRangeParam(raw: string | null | undefined): LeadSourceRange {
  const v = String(raw || "").trim().toLowerCase();
  if (v === "7d" || v === "7") return "7d";
  if (v === "30d" || v === "30") return "30d";
  if (v === "month" || v === "this_month") return "month";
  return "all";
}
