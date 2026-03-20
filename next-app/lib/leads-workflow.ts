/**
 * Legacy hook: follow-ups are driven by `next_follow_up_at` while status stays `contacted`.
 * We no longer flip status to `follow_up_due` (removed from the canonical model).
 */
export async function refreshDueFollowUps() {
  return;
}
