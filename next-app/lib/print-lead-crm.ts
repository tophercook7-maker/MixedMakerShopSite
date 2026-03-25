/**
 * 3D printing inbound leads (/3d-printing) — list labels and attention helpers.
 * Status values are canonical `leads.status` (DB); labels match the print CRM vocabulary.
 */

import { isThreeDPrintLead } from "@/lib/crm/three-d-print-lead";

export const PRINT_LEAD_STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Waiting on customer" },
  { value: "proposal_sent", label: "Quoted" },
  { value: "replied", label: "Customer replied" },
  { value: "won", label: "Closed (won)" },
  { value: "lost", label: "Closed (lost)" },
] as const;

export type PrintLeadStatusValue = (typeof PRINT_LEAD_STATUS_OPTIONS)[number]["value"];

export function printLeadListStatusLabel(status: string | null | undefined): string {
  const s = String(status || "new").toLowerCase();
  const hit = PRINT_LEAD_STATUS_OPTIONS.find((o) => o.value === s);
  return hit?.label ?? printLeadListStatusLabel("new");
}

export function isPrintQuoteLeadRow(row: {
  source?: string | null;
  lead_source?: string | null;
  lead_tags?: string[] | null;
  category?: string | null;
}): boolean {
  return isThreeDPrintLead(row);
}

export type PrintLeadAttention = { kind: "stale_new" | "waiting_customer"; label: string };

export function printLeadAttentionFlags(row: {
  status?: string | null;
  created_at?: string | null;
  last_contacted_at?: string | null;
}): PrintLeadAttention[] {
  const out: PrintLeadAttention[] = [];
  const st = String(row.status || "").toLowerCase();
  const created = row.created_at ? new Date(row.created_at).getTime() : NaN;
  const dayMs = 86400000;
  if (st === "new" && Number.isFinite(created) && !row.last_contacted_at && Date.now() - created >= dayMs) {
    out.push({ kind: "stale_new", label: "No contact 24h+" });
  }
  if (st === "qualified") {
    out.push({ kind: "waiting_customer", label: "Waiting on customer" });
  }
  return out;
}

export function summarizePrintRequestDescription(description: string, maxLen = 200): string {
  const oneLine = String(description || "")
    .replace(/\s+/g, " ")
    .trim();
  if (oneLine.length <= maxLen) return oneLine;
  return `${oneLine.slice(0, maxLen - 1)}…`;
}
