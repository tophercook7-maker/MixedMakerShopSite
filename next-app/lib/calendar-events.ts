import { createClient } from "@/lib/supabase/server";

export type CalendarEventType = "meeting" | "followup" | "task" | "scout";

type CreateCalendarEventInput = {
  ownerId: string;
  workspaceId?: string | null;
  leadId?: string | null;
  title: string;
  eventType: CalendarEventType;
  startTime: string;
  endTime?: string | null;
  notes?: string | null;
};

export async function resolveWorkspaceIdForOwner(ownerId: string): Promise<string | null> {
  const fromEnv = String(process.env.SCOUT_BRAIN_WORKSPACE_ID || "").trim();
  if (fromEnv) return fromEnv;
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("workspace_id")
    .eq("owner_id", ownerId)
    .not("workspace_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1);
  return String((data || [])[0]?.workspace_id || "").trim() || null;
}

export async function createCalendarEvent(input: CreateCalendarEventInput) {
  const supabase = await createClient();
  const payload = {
    owner_id: input.ownerId,
    workspace_id: input.workspaceId || null,
    lead_id: input.leadId || null,
    title: input.title,
    event_type: input.eventType,
    start_time: input.startTime,
    end_time: input.endTime || null,
    notes: input.notes || null,
  };
  const { data, error } = await supabase.from("calendar_events").insert(payload).select("*").single();
  return { data, error };
}
