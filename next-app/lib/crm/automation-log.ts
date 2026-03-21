import type { SupabaseClient } from "@supabase/supabase-js";

/** Best-effort log — ignores failures so webhooks/API stay resilient if table missing. */
export async function logCrmAutomationEvent(
  admin: SupabaseClient,
  input: {
    owner_id: string;
    lead_id?: string | null;
    event_type: string;
    payload?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const { error } = await admin.from("crm_automation_events").insert({
      owner_id: input.owner_id,
      lead_id: input.lead_id || null,
      event_type: input.event_type,
      payload: input.payload ?? {},
    });
    if (error) {
      console.warn("[CRM automation] log skipped", error.message);
    }
  } catch (e) {
    console.warn("[CRM automation] log failed", e);
  }
}
