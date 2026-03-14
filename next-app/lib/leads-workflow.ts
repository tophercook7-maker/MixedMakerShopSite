import { createClient } from "@/lib/supabase/server";

/**
 * Promote contacted/replied leads to follow_up_due when next follow-up date has arrived.
 * This keeps follow-up queues fresh without requiring a separate cron.
 */
export async function refreshDueFollowUps() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  await supabase
    .from("leads")
    .update({ status: "follow_up_due" })
    .in("status", ["contacted", "replied"])
    .lte("next_follow_up_at", nowIso);
}
