import type { SupabaseClient } from "@supabase/supabase-js";
import { processStaleFollowUpGraces } from "@/lib/crm/process-follow-up-automation";

/**
 * Server-side automation pass (safe to call on list loads): closes grace-window `no_response` rows.
 * Does not send email.
 */
export async function refreshDueFollowUps(supabase: SupabaseClient, ownerId: string) {
  await processStaleFollowUpGraces(supabase, ownerId);
}
