import { createClient } from "@/lib/supabase/server";

export type CalendarEventType =
  | "appointment"
  | "client_call"
  | "followup"
  | "task"
  | "scout"
  | "meeting"
  | "follow_up_reminder"
  | "scout_run";

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
  const workspaceId = String(input.workspaceId || "").trim() || (await resolveWorkspaceIdForOwner(input.ownerId));
  if (!workspaceId) {
    return {
      data: null,
      error: { message: "Workspace is required to create calendar events." },
    };
  }
  const normalizedType = normalizeCalendarEventType(input.eventType);
  const payload = {
    owner_id: input.ownerId,
    workspace_id: workspaceId,
    lead_id: input.leadId || null,
    title: input.title,
    event_type: normalizedType,
    is_blocking: isHardBlockEventType(normalizedType),
    source: "crm",
    start_time: input.startTime,
    end_time: input.endTime || null,
    notes: input.notes || null,
  };
  const { data, error } = await supabase.from("calendar_events").insert(payload).select("*").single();
  return { data, error };
}

export function normalizeCalendarEventType(raw: string | null | undefined): CalendarEventType {
  const value = String(raw || "").trim().toLowerCase();
  if (value === "meeting") return "appointment";
  if (value === "follow-up reminder" || value === "follow_up_reminder") return "followup";
  if (value === "scout run" || value === "scout_run") return "scout";
  if (value === "client call") return "client_call";
  if (value === "appointment") return "appointment";
  if (value === "client_call") return "client_call";
  if (value === "followup") return "followup";
  if (value === "task") return "task";
  if (value === "scout") return "scout";
  return "task";
}

export function isHardBlockEventType(raw: string | null | undefined): boolean {
  const type = normalizeCalendarEventType(raw);
  return type === "appointment" || type === "client_call";
}

export function isSoftEventType(raw: string | null | undefined): boolean {
  return !isHardBlockEventType(raw);
}
