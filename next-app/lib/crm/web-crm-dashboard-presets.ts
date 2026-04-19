import type { WebCrmLane } from "@/lib/crm/web-lead-lane";
import { WEB_CRM_LANES } from "@/lib/crm/web-lead-lane";
import { parseLeadPoolTab } from "@/lib/crm/manual-pick-leads";

const LANE_SET = new Set<string>(WEB_CRM_LANES);

export type WebCrmDashboardPreset = {
  /** Active lane tab */
  lane: WebCrmLane | "all";
  /** `pool=top_picks` — only manual-pick rows */
  topPicksOnly: boolean;
  /** `follow_up_today=1` — next_follow_up_at is due today (UTC) */
  followUpTodayOnly: boolean;
  /** `needs_reply=1` — unread replies / needs attention */
  needsReplyOnly: boolean;
};

const DEFAULT_PRESET: WebCrmDashboardPreset = {
  lane: "inbox",
  topPicksOnly: false,
  followUpTodayOnly: false,
  needsReplyOnly: false,
};

function firstParam(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const v = sp[key];
  if (Array.isArray(v)) return v[0];
  return v;
}

function truthyOne(sp: Record<string, string | string[] | undefined>, key: string): boolean {
  return String(firstParam(sp, key) || "").trim() === "1";
}

/** Map legacy `/admin/leads` query strings onto the new web CRM dashboard state. */
export function parseWebCrmDashboardPreset(
  sp: Record<string, string | string[] | undefined>
): WebCrmDashboardPreset {
  const out = { ...DEFAULT_PRESET };

  const pool = parseLeadPoolTab(firstParam(sp, "pool"));
  out.topPicksOnly = pool === "top_picks";

  out.followUpTodayOnly = truthyOne(sp, "follow_up_today");
  out.needsReplyOnly = truthyOne(sp, "needs_reply");

  const laneRaw = String(firstParam(sp, "lane") || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");

  if (laneRaw === "all") {
    out.lane = "all";
  } else if (LANE_SET.has(laneRaw)) {
    out.lane = laneRaw as WebCrmLane;
  } else {
    const legacyLaneKeys: [string, WebCrmLane][] = [
      ["ready_now", "ready_now"],
      ["responded", "responded"],
      ["sample_active", "sample_active"],
      ["qualified_deal", "qualified_deal"],
      ["parked", "parked"],
      ["waiting", "waiting"],
      ["inbox", "inbox"],
      ["won", "won"],
    ];
    for (const [key, lane] of legacyLaneKeys) {
      if (truthyOne(sp, key)) {
        out.lane = lane;
        break;
      }
    }
  }

  if (out.topPicksOnly && !laneRaw && out.lane === "inbox") {
    out.lane = "all";
  }

  if (out.followUpTodayOnly && out.lane === "inbox" && !laneRaw) {
    out.lane = "waiting";
  }

  if (out.needsReplyOnly && out.lane === "inbox" && !laneRaw) {
    out.lane = "responded";
  }

  return out;
}
