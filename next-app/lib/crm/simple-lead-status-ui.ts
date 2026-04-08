import { normalizeWorkflowLeadStatus } from "@/lib/crm/stage-normalize";

function utcDateKey(iso: string | null | undefined): string | null {
  if (!iso || !String(iso).trim()) return null;
  const d = new Date(String(iso));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/** True when next_follow_up_at falls on today's UTC calendar day. */
export function isFollowUpDueTodayUtc(nextFollowUpAt: string | null | undefined): boolean {
  const key = utcDateKey(nextFollowUpAt);
  if (!key) return false;
  const today = new Date().toISOString().slice(0, 10);
  return key === today;
}

function isTerminalSimpleStatus(st: string): boolean {
  return st === "won" || st === "archived" || st === "no_response" || st === "not_interested";
}

/**
 * Friendly CRM labels for daily workflow — maps existing `status` + timestamps.
 * Follow-up timing uses `next_follow_up_at`, not a status value.
 */
export function simpleLeadStatusLabel(opts: {
  status: string | null | undefined;
  next_follow_up_at?: string | null;
  first_outreach_sent_at?: string | null;
}): string {
  const st = normalizeWorkflowLeadStatus(String(opts.status || ""));
  const fuToday =
    isFollowUpDueTodayUtc(opts.next_follow_up_at) &&
    !isTerminalSimpleStatus(st) &&
    st !== "replied";
  if (fuToday) return "Follow Up Today";

  if (st === "won") return "Won";
  if (st === "archived") return "Archived";
  if (st === "no_response") return "No response";
  if (st === "not_interested") return "Not interested";
  if (st === "replied") return "Replied";

  if (st === "contacted") {
    const sent = opts.first_outreach_sent_at && String(opts.first_outreach_sent_at).trim();
    if (sent) {
      const sentDay = utcDateKey(opts.first_outreach_sent_at);
      const today = new Date().toISOString().slice(0, 10);
      if (sentDay && sentDay === today) return "First Message Sent";
      return "Waiting on Reply";
    }
    return "Ready to Contact";
  }

  return "New";
}
