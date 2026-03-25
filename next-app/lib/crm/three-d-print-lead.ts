/**
 * 3D printing workflow — lives in main `leads` table (source / print_* columns).
 * Do not use a separate CRM.
 */

import type { PriceEstimateSnapshot, RequestTypeKey } from "@/components/printing/printing-price-estimate";

/** Canonical inbound channels for rows that use `print_*` columns (single `leads` table). */
export const THREE_D_PRINT_LEAD_SOURCES = ["3d_printing", "print_quote", "print_request"] as const;

/** Canonical order for pipeline UI (stepper / filters). */
export const THREE_D_PRINT_PIPELINE_ORDER = [
  "new",
  "need_info",
  "quoted",
  "approved",
  "printing",
  "ready",
  "delivered",
  "closed",
] as const;

export type ThreeDPrintPipelineStatus = (typeof THREE_D_PRINT_PIPELINE_ORDER)[number];

const PIPELINE_ORDER_SET = new Set<string>(THREE_D_PRINT_PIPELINE_ORDER);

export const THREE_D_PRINT_PIPELINE_LABELS: Record<ThreeDPrintPipelineStatus, string> = {
  new: "New",
  need_info: "Need Info",
  quoted: "Quoted",
  approved: "Approved",
  printing: "Printing",
  ready: "Ready",
  delivered: "Delivered",
  closed: "Closed",
};

export const THREE_D_PRINT_PIPELINE_OPTIONS: { value: ThreeDPrintPipelineStatus; label: string }[] =
  THREE_D_PRINT_PIPELINE_ORDER.map((value) => ({
    value,
    label: THREE_D_PRINT_PIPELINE_LABELS[value],
  }));

/** Filter tabs: All + each pipeline step */
export const THREE_D_PRINT_PIPELINE_FILTER_TABS: { id: "all" | ThreeDPrintPipelineStatus; label: string }[] = [
  { id: "all", label: "All" },
  ...THREE_D_PRINT_PIPELINE_OPTIONS.map((o) => ({ id: o.value, label: o.label })),
];

/** Quick actions in CRM (excludes New / Closed). */
export const PRINT_PIPELINE_QUICK_ACTIONS: { pipeline: ThreeDPrintPipelineStatus; label: string }[] = [
  { pipeline: "need_info", label: "Mark as Need Info" },
  { pipeline: "quoted", label: "Mark as Quoted" },
  { pipeline: "approved", label: "Mark as Approved" },
  { pipeline: "printing", label: "Mark as Printing" },
  { pipeline: "ready", label: "Mark as Ready" },
  { pipeline: "delivered", label: "Mark as Delivered" },
];

export function normalizePrintPipelineStatus(raw: string | null | undefined): ThreeDPrintPipelineStatus {
  const k = String(raw || "new").toLowerCase();
  if (PIPELINE_ORDER_SET.has(k)) return k as ThreeDPrintPipelineStatus;
  return "new";
}

export function printLastActivityMs(lead: {
  created_at?: string | null;
  last_contacted_at?: string | null;
  last_reply_at?: string | null;
  last_response_at?: string | null;
}): number {
  const dates = [lead.last_reply_at, lead.last_contacted_at, lead.last_response_at, lead.created_at]
    .filter(Boolean)
    .map((d) => new Date(String(d)).getTime())
    .filter((t) => Number.isFinite(t));
  return dates.length ? Math.max(...dates) : 0;
}

/** Inbound 3D print request (form / text / CRM). */
export function isThreeDPrintLead(row: {
  lead_source?: string | null;
  source?: string | null;
  category?: string | null;
  lead_tags?: string[] | null;
}): boolean {
  const src = String(row.lead_source || "").toLowerCase();
  const s = String(row.source || "").toLowerCase();
  if (THREE_D_PRINT_LEAD_SOURCES.some((x) => x === src || x === s)) return true;
  if (String(row.category || "").toLowerCase() === "print_request") return true;
  const tags = row.lead_tags || [];
  if (
    tags
      .map((t) => String(t).toLowerCase())
      .some((t) => t === "3d_printing" || t === "print_quote" || t === "print_request")
  ) {
    return true;
  }
  return false;
}

/** Maps print pipeline → main CRM `leads.status` (web-design vocabulary). */
export function mapPrintPipelineToLeadStatus(
  p: string | null | undefined,
): "new" | "contacted" | "qualified" | "proposal_sent" | "won" | "lost" {
  const x = normalizePrintPipelineStatus(p);
  switch (x) {
    case "need_info":
      return "contacted";
    case "quoted":
      return "proposal_sent";
    case "approved":
    case "printing":
    case "ready":
      return "qualified";
    case "delivered":
      return "won";
    case "closed":
      return "lost";
    default:
      return "new";
  }
}

const REQUEST_TYPE_LABELS: Record<RequestTypeKey, string> = {
  small_replacement: "Small replacement part",
  mount_holder: "Mount / holder",
  organizer: "Organizer",
  one_off: "One-off custom fix",
  not_sure: "Not sure",
};

export function printRequestTypeFromEstimator(snapshot: PriceEstimateSnapshot | null): string | null {
  if (!snapshot) return null;
  return REQUEST_TYPE_LABELS[snapshot.requestType] ?? snapshot.requestType;
}

/**
 * Keyword-based tags on submission: mount, replacement_part, organizer, custom_fix, else unknown.
 */
export function deriveThreeDPrintAutoTags(description: string): string[] {
  const text = String(description || "").toLowerCase();
  const tags = new Set<string>();

  if (/\bmount\b/.test(text)) tags.add("mount");
  if (/\b(broken|replace)\b/.test(text)) tags.add("replacement_part");
  if (/\b(holder|storage|organizer)\b/.test(text)) tags.add("organizer");
  if (/\b(custom|one-off|one off)\b/.test(text)) tags.add("custom_fix");

  if (tags.size === 0) tags.add("unknown");
  return Array.from(tags);
}

/** Pull customer-facing description from stored notes (print quote body) or fall back to summary. */
export function extractPrintRequestDescription(
  notes: string | null | undefined,
  summary: string | null | undefined,
): string {
  const n = String(notes || "");
  const marker = "WHAT DO YOU NEED?";
  const idx = n.indexOf(marker);
  if (idx >= 0) {
    let rest = n.slice(idx + marker.length).trim();
    const lines = rest.split("\n");
    const out: string[] = [];
    for (const line of lines) {
      const t = line.trim();
      if (/^(DETAILS|UPLOAD|SUBMITTED|REQUESTER|CRM|ESTIMATE)/i.test(t)) break;
      out.push(line);
    }
    const joined = out.join("\n").trim();
    if (joined) return joined;
  }
  const s = String(summary || "").trim();
  if (s) return s;
  return n.trim() || "—";
}

export function isPrintAttachmentImageUrl(url: string | null | undefined): boolean {
  const u = String(url || "")
    .trim()
    .split("?")[0]
    .toLowerCase();
  return /\.(png|jpe?g|webp|gif)$/.test(u);
}

/** Round-trip USD for filament line items (2 dp). */
export function roundFilamentUsd(n: number): number {
  return Math.round(Number(n) * 100) / 100;
}

/**
 * filament_cost = (grams / 1000) * cost_per_kg, rounded to 2 decimal places.
 * Returns NaN if inputs are not finite or negative.
 */
export function computeFilamentCostUsd(gramsUsed: number, costPerKgUsd: number): number {
  const g = Number(gramsUsed);
  const k = Number(costPerKgUsd);
  if (!Number.isFinite(g) || !Number.isFinite(k) || g < 0 || k < 0) return Number.NaN;
  return roundFilamentUsd((g / 1000) * k);
}

/** Job-specific $/kg if set; otherwise shop default (from env / app). */
export function resolveFilamentCostPerKg(jobPerKg: number | null | undefined, defaultPerKg: number): number {
  const j = jobPerKg == null || Number.isNaN(Number(jobPerKg)) ? null : Number(jobPerKg);
  if (j != null && j >= 0) return j;
  const d = Number(defaultPerKg);
  return Number.isFinite(d) && d >= 0 ? d : 22;
}

/**
 * total_cost = sum of known line items (filament + labor); null only when neither line is set.
 * profit = price_charged − total_cost when both price and at least one cost line exist.
 */
export function computePrintJobFinancials(
  priceCharged: number | null | undefined,
  filamentCost: number | null | undefined,
  laborCost?: number | null | undefined,
): { totalCost: number | null; profit: number | null } {
  const hasMat = filamentCost != null && Number.isFinite(Number(filamentCost));
  const hasLab = laborCost != null && Number.isFinite(Number(laborCost));
  const mat = hasMat ? Math.max(0, Number(filamentCost)) : 0;
  const lab = hasLab ? Math.max(0, Number(laborCost)) : 0;
  const totalCostRounded = Math.round((mat + lab) * 100) / 100;
  const totalCost = hasMat || hasLab ? totalCostRounded : null;

  const pc =
    priceCharged == null || Number.isNaN(Number(priceCharged)) ? null : Number(priceCharged);

  if (pc == null && totalCost == null) return { totalCost: null, profit: null };
  if (pc != null && totalCost != null) return { totalCost, profit: pc - totalCost };
  return { totalCost, profit: null };
}

export function formatPrintUsd(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n));
}

export function crmLeadUrl(leadId: string, siteBase?: string | null): string {
  const base = String(siteBase || "").replace(/\/$/, "");
  const path = `/admin/leads/${leadId}`;
  return base ? `${base}${path}` : path;
}
