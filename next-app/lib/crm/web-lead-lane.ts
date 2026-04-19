/**
 * Web-design CRM lanes — deterministic resolver from stored lead fields.
 * `crm_lane_web` may be persisted for convenience; this function is the source of truth on read.
 */
import { canonicalizeLeadStatus, leadHasStandaloneWebsite, type CanonicalLeadStatus } from "@/lib/crm-lead-schema";
import { leadHasContactPath, type LeadLaneInput } from "@/lib/crm/lead-lane";

export const WEB_CRM_LANES = [
  "inbox",
  "ready_now",
  "waiting",
  "responded",
  "sample_active",
  "qualified_deal",
  "won",
  "parked",
] as const;

export type WebCrmLane = (typeof WEB_CRM_LANES)[number];

const LANE_SET = new Set<string>(WEB_CRM_LANES);

export type WebLeadLaneInput = LeadLaneInput & {
  status?: string | null;
  unread_reply_count?: number | null;
  mockup_deal_status?: string | null;
  preview_sent?: boolean | null;
  preview_url?: string | null;
  deal_status?: string | null;
  deal_stage?: string | null;
  follow_up_status?: string | null;
  next_follow_up_at?: string | null;
  crm_lane_web?: string | null;
  lead_tags?: string[] | null;
  opportunity_score?: number | null;
  conversion_score?: number | null;
  is_hot_lead?: boolean | null;
};

const WEB_PARKED_TAG = "web_parked";

function hasWebParkedTag(tags: string[] | null | undefined): boolean {
  if (!Array.isArray(tags)) return false;
  return tags.some((t) => String(t || "").trim().toLowerCase() === WEB_PARKED_TAG);
}

function inSampleActiveFlow(row: WebLeadLaneInput): boolean {
  if (row.preview_sent) return true;
  const m = String(row.mockup_deal_status || "").toLowerCase();
  if (["mockup_sent", "replied", "interested"].includes(m)) return true;
  if (m === "new" && String(row.preview_url || "").trim()) return true;
  return false;
}

function isQualifiedDeal(row: WebLeadLaneInput): boolean {
  const ds = String(row.deal_status || "").toLowerCase();
  const dst = String(row.deal_stage || "").toLowerCase();
  if (["interested", "proposal_sent"].includes(ds)) return true;
  if (["interested", "pricing", "closing"].includes(dst)) return true;
  return false;
}

function scoreValue(row: WebLeadLaneInput): number {
  const c = row.conversion_score;
  if (c != null && Number.isFinite(Number(c))) return Number(c);
  const o = row.opportunity_score;
  if (o != null && Number.isFinite(Number(o))) return Number(o);
  return 0;
}

function isReadyNowCandidate(row: WebLeadLaneInput): boolean {
  if (!leadHasContactPath(row)) return false;
  if (row.is_hot_lead) return true;
  return scoreValue(row) >= 35;
}

/**
 * Resolve exclusive web CRM lane for a non–3D-print lead row.
 * 3D print leads should be routed to the print CRM before calling this.
 */
export function resolveWebCrmLane(row: WebLeadLaneInput): WebCrmLane {
  const status = canonicalizeLeadStatus(row.status);
  const unread = Math.max(0, Number(row.unread_reply_count || 0));
  const explicitPark =
    String(row.crm_lane_web || "").trim().toLowerCase() === "parked" || hasWebParkedTag(row.lead_tags);

  if (status === "won") return "won";

  if (unread > 0 || status === "replied") return "responded";

  if (inSampleActiveFlow(row)) return "sample_active";

  if (isQualifiedDeal(row)) return "qualified_deal";

  const fuPending = String(row.follow_up_status || "").toLowerCase() === "pending";
  const hasNextFu = Boolean(String(row.next_follow_up_at || "").trim());
  if (status === "contacted" || fuPending || hasNextFu) return "waiting";

  if (explicitPark) return "parked";

  if (isReadyNowCandidate(row)) return "ready_now";

  return "inbox";
}

/** Merge persisted lane hint when it matches resolver output (for display only). */
export function persistedLaneOrComputed(row: WebLeadLaneInput): WebCrmLane {
  const computed = resolveWebCrmLane(row);
  const stored = String(row.crm_lane_web || "").trim().toLowerCase();
  if (stored && LANE_SET.has(stored) && stored === computed) return stored as WebCrmLane;
  return computed;
}

export function laneLabel(lane: WebCrmLane): string {
  const labels: Record<WebCrmLane, string> = {
    inbox: "Inbox",
    ready_now: "Ready now",
    waiting: "Waiting",
    responded: "Responded",
    sample_active: "Sample active",
    qualified_deal: "Qualified deal",
    won: "Won",
    parked: "Parked",
  };
  return labels[lane] ?? lane;
}

export { leadHasStandaloneWebsite };
