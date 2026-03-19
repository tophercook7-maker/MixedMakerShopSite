import type { SupabaseClient } from "@supabase/supabase-js";

export type LeadActivityEventType =
  | "lead_created"
  | "preview_generated"
  | "preview_updated"
  | "email_drafted"
  | "email_sent"
  | "email_failed"
  | "preview_email_sent"
  | "facebook_prepared"
  | "text_sent"
  | "follow_up_scheduled"
  | "reply_received"
  | "no_response"
  | "archived"
  | string;

export async function recordLeadActivity(
  supabase: SupabaseClient,
  input: {
    ownerId: string;
    leadId: string;
    eventType: LeadActivityEventType;
    meta?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const { error } = await supabase.from("lead_activities").insert({
      owner_id: input.ownerId,
      lead_id: input.leadId,
      event_type: input.eventType,
      meta: input.meta ?? {},
    });
    if (error) {
      console.warn("[lead_activities] insert failed", { message: error.message, event_type: input.eventType });
    }
  } catch (e) {
    console.warn("[lead_activities] insert threw", e);
  }
}
