import type { SupabaseClient } from "@supabase/supabase-js";
import { appendLeadNoteLine } from "@/lib/crm/append-lead-note";
import { pickLeadPatchFields } from "@/lib/crm-lead-schema";
import { recordLeadActivity } from "@/lib/lead-activity";

/**
 * After the 4th manual send, `next_follow_up_at` is a short grace window.
 * When that passes with no reply, auto-close as `no_response`.
 */
export async function processStaleFollowUpGraces(
  supabase: SupabaseClient,
  ownerId: string
): Promise<{ closed: number }> {
  const nowIso = new Date().toISOString();
  const { data: rows, error } = await supabase
    .from("leads")
    .select("id,notes,status,follow_up_count,unread_reply_count,next_follow_up_at")
    .eq("owner_id", ownerId)
    .eq("status", "contacted")
    .gte("follow_up_count", 4)
    .not("next_follow_up_at", "is", null)
    .lt("next_follow_up_at", nowIso)
    .limit(200);

  if (error || !rows?.length) {
    if (error) console.warn("[processStaleFollowUpGraces] query failed", error.message);
    return { closed: 0 };
  }

  let closed = 0;
  for (const row of rows) {
    const unread = Number((row as { unread_reply_count?: number | null }).unread_reply_count || 0);
    if (unread > 0) continue;

    const id = String((row as { id?: string }).id || "").trim();
    if (!id) continue;

    const existingNotes = String((row as { notes?: string | null }).notes || "");
    const notes = appendLeadNoteLine(existingNotes, "Auto: closed as no_response after final follow-up window.");
    const patch = pickLeadPatchFields({
      status: "no_response",
      next_follow_up_at: null,
      follow_up_status: "completed",
      automation_paused: true,
      sequence_active: false,
      last_updated_at: nowIso,
      notes,
    });

    const { error: upErr } = await supabase.from("leads").update(patch).eq("id", id).eq("owner_id", ownerId);
    if (!upErr) {
      closed += 1;
      void recordLeadActivity(supabase, {
        ownerId,
        leadId: id,
        eventType: "no_response",
        message: "Lead closed as no_response (automation after final follow-up window)",
        meta: { source: "follow_up_grace" },
      });
    }
  }

  return { closed };
}
