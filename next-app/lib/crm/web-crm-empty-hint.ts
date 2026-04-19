import type { WebCrmLane } from "@/lib/crm/web-lead-lane";
import type { WebCrmDashboardPreset } from "@/lib/crm/web-crm-dashboard-presets";

/** Short empty copy for the web CRM list (no backend changes). */
export function webCrmEmptyHint(opts: {
  lane: WebCrmLane | "all";
  preset: WebCrmDashboardPreset;
  hasSearch: boolean;
  topPicksOnlyEffective: boolean;
}): string {
  if (opts.hasSearch) {
    return "No leads match your search. Try different keywords.";
  }
  if (opts.preset.needsReplyOnly) {
    return "No unread replies right now.";
  }
  if (opts.preset.followUpTodayOnly) {
    return "Nothing due for follow-up today.";
  }
  if (opts.topPicksOnlyEffective && opts.lane === "all") {
    return "No top picks in your workspace yet.";
  }
  const l = opts.lane;
  if (l === "all") {
    return "No web leads in this view.";
  }
  const byLane: Partial<Record<WebCrmLane, string>> = {
    inbox: "Inbox is empty — new captures will show up here.",
    ready_now: "No strong contact-ready leads in this view.",
    waiting: "No leads in Waiting for this slice.",
    responded: "No leads in Responded right now.",
    sample_active: "No active mockups or samples in this view.",
    qualified_deal: "No deals in pricing or closing here.",
    won: "No wins in this lane.",
    parked: "No parked leads here.",
  };
  return byLane[l] ?? "No leads in this view.";
}
