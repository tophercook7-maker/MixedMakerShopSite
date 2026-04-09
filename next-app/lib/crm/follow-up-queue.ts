import { normalizeWorkflowLeadStatus } from "@/lib/crm/stage-normalize";

export function isTerminalCrmStatus(status: string | null | undefined): boolean {
  const s = normalizeWorkflowLeadStatus(String(status || ""));
  return s === "won" || s === "archived" || s === "no_response" || s === "not_interested";
}

/** Due or overdue (next_follow_up_at in the past), excluding terminal / replied. */
export function isFollowUpOverdue(nextFollowUpAt: string | null | undefined, nowMs: number = Date.now()): boolean {
  const raw = String(nextFollowUpAt || "").trim();
  if (!raw) return false;
  const t = new Date(raw).getTime();
  if (Number.isNaN(t)) return false;
  return t <= nowMs;
}

/**
 * "Needs attention" for daily triage: new leads, or active pipeline with a due/overdue follow-up time.
 */
export function leadNeedsAttention(row: {
  status?: string | null;
  next_follow_up_at?: string | null;
}): boolean {
  if (isTerminalCrmStatus(row.status)) return false;
  const st = normalizeWorkflowLeadStatus(String(row.status || ""));
  if (st === "replied") return false;
  if (st === "new") return true;
  return isFollowUpOverdue(row.next_follow_up_at);
}

export function leadIsNew(row: { status?: string | null }): boolean {
  return normalizeWorkflowLeadStatus(String(row.status || "")) === "new";
}
