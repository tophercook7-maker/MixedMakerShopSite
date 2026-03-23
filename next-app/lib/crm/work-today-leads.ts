import { normalizeWorkflowLeadStatus } from "@/lib/crm/stage-normalize";
import type { LeadRowForWorkflow } from "@/lib/crm/workflow-lead-mapper";

export type WorkTodayLeadRow = Pick<
  LeadRowForWorkflow,
  | "id"
  | "business_name"
  | "status"
  | "created_at"
  | "next_follow_up_at"
  | "last_reply_at"
  | "conversion_score"
  | "opportunity_score"
  | "unread_reply_count"
  | "lead_tags"
>;

export type WorkTodayItem = WorkTodayLeadRow & {
  priorityScore: number;
  reasonLine: string;
};

/** Default list size (stay between 5–10 for focus). */
const DEFAULT_WORK_TODAY_CAP = 10;

function followUpIsDue(row: WorkTodayLeadRow, nowMs: number): boolean {
  const raw = String(row.next_follow_up_at || "").trim();
  if (!raw) return false;
  const t = new Date(raw).getTime();
  if (Number.isNaN(t)) return false;
  return t <= nowMs;
}

function unreadCount(row: WorkTodayLeadRow): number {
  const n = row.unread_reply_count;
  if (n == null || Number.isNaN(Number(n))) return 0;
  return Math.max(0, Number(n));
}

function conversionScore(row: WorkTodayLeadRow): number {
  if (row.conversion_score != null && !Number.isNaN(Number(row.conversion_score))) {
    return Number(row.conversion_score);
  }
  if (row.opportunity_score != null && !Number.isNaN(Number(row.opportunity_score))) {
    return Number(row.opportunity_score);
  }
  return 0;
}

function hasNoWebsiteOpportunityTag(row: WorkTodayLeadRow): boolean {
  const tags = row.lead_tags;
  if (!Array.isArray(tags)) return false;
  return tags.some((t) => String(t || "").trim() === "no_website_opportunity");
}

function terminalStatus(status: ReturnType<typeof normalizeWorkflowLeadStatus>): boolean {
  return status === "won" || status === "lost";
}

/** Eligible for Work Today: not terminal, and (replied | follow-up due | new | unread). */
export function isWorkTodayEligible(row: WorkTodayLeadRow, now: Date = new Date()): boolean {
  const status = normalizeWorkflowLeadStatus(row.status);
  if (terminalStatus(status)) return false;
  const nowMs = now.getTime();
  const unread = unreadCount(row) > 0;
  const fu = followUpIsDue(row, nowMs);
  const isNew = status === "new";
  const isReplied = status === "replied";
  return isReplied || fu || isNew || unread;
}

export function workTodayPriorityScore(row: WorkTodayLeadRow, now: Date = new Date()): number {
  const nowMs = now.getTime();
  let priority = 0;
  if (normalizeWorkflowLeadStatus(row.status) === "replied") priority += 130;
  if (unreadCount(row) > 0) priority += 100;
  if (followUpIsDue(row, nowMs)) priority += 80;
  if (normalizeWorkflowLeadStatus(row.status) === "new") priority += 60;
  if (conversionScore(row) >= 85) priority += 40;
  if (hasNoWebsiteOpportunityTag(row)) priority += 20;
  return priority;
}

export function workTodayReasonLine(row: WorkTodayLeadRow, now: Date = new Date()): string {
  const nowMs = now.getTime();
  if (normalizeWorkflowLeadStatus(row.status) === "replied") return "Replied — follow up";
  if (unreadCount(row) > 0) return "Replied — respond now";
  if (followUpIsDue(row, nowMs)) return "Follow-up due";
  if (normalizeWorkflowLeadStatus(row.status) === "new") {
    return hasNoWebsiteOpportunityTag(row) ? "No website — strong opportunity" : "New lead";
  }
  return hasNoWebsiteOpportunityTag(row) ? "No website — strong opportunity" : "Ready to reach out";
}

/**
 * Live-computed queue: filter → score → sort (priority, conversion, created_at) → cap.
 */
export function computeWorkTodayLeads(
  rows: WorkTodayLeadRow[],
  now: Date = new Date(),
  maxItems: number = DEFAULT_WORK_TODAY_CAP
): WorkTodayItem[] {
  const cap = Math.min(10, Math.max(1, maxItems));
  const eligible = rows.filter((r) => isWorkTodayEligible(r, now));
  const scored = eligible.map((row) => ({
    ...row,
    priorityScore: workTodayPriorityScore(row, now),
    reasonLine: workTodayReasonLine(row, now),
  }));
  scored.sort((a, b) => {
    const pd = b.priorityScore - a.priorityScore;
    if (pd !== 0) return pd;
    const cs = conversionScore(b) - conversionScore(a);
    if (cs !== 0) return cs;
    const repA = normalizeWorkflowLeadStatus(a.status) === "replied";
    const repB = normalizeWorkflowLeadStatus(b.status) === "replied";
    if (repA && repB) {
      const lrA = a.last_reply_at ? new Date(a.last_reply_at).getTime() : 0;
      const lrB = b.last_reply_at ? new Date(b.last_reply_at).getTime() : 0;
      if (lrB !== lrA) return lrB - lrA;
    }
    const at = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bt - at;
  });
  return scored.slice(0, cap);
}
