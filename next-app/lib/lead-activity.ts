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

/** PostgREST / Supabase errors when `lead_activities` is missing or not exposed. */
export function isLeadActivitiesUnavailable(error: { message?: string } | null | undefined): boolean {
  const m = String(error?.message || "").toLowerCase();
  return (
    m.includes("schema cache") ||
    m.includes("could not find the table") ||
    m.includes("does not exist") ||
    m.includes("42p01") ||
    (m.includes("lead_activities") && (m.includes("not found") || m.includes("relation")))
  );
}

function defaultMessageForEvent(eventType: string): string {
  return eventType.replace(/_/g, " ");
}

/**
 * Best-effort activity log. Never throws. Does not block callers — use `void recordLeadActivity(...)` on hot paths.
 * Inserts use columns: lead_id, type, message, metadata, actor_user_id.
 */
export async function recordLeadActivity(
  supabase: SupabaseClient,
  input: {
    ownerId: string;
    leadId: string;
    eventType: LeadActivityEventType;
    message?: string | null;
    /** Stored as JSON column `metadata` */
    meta?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    const row = {
      lead_id: input.leadId,
      type: input.eventType,
      message: input.message ?? defaultMessageForEvent(String(input.eventType)),
      metadata: input.meta ?? {},
      actor_user_id: input.ownerId,
    };
    const { error } = await supabase.from("lead_activities").insert(row);
    if (error) {
      if (isLeadActivitiesUnavailable(error)) {
        console.warn("[lead_activities] skipped (table missing or schema cache)", error.message);
        return;
      }
      console.warn("[lead_activities] insert failed", { message: error.message, type: input.eventType });
    }
  } catch (e) {
    console.warn("[lead_activities] insert threw", e);
  }
}
