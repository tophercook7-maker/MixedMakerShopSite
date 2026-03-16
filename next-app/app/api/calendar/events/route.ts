import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCalendarEvent, resolveWorkspaceIdForOwner, type CalendarEventType } from "@/lib/calendar-events";

const VALID_EVENT_TYPES = new Set<CalendarEventType>(["meeting", "followup", "task", "scout"]);

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const start = String(url.searchParams.get("start") || "").trim();
  const end = String(url.searchParams.get("end") || "").trim();

  let query = supabase
    .from("calendar_events")
    .select("id,lead_id,title,event_type,start_time,end_time,notes,workspace_id,created_at")
    .eq("owner_id", ownerId)
    .order("start_time", { ascending: true })
    .limit(1000);

  if (start) query = query.gte("start_time", start);
  if (end) query = query.lte("start_time", end);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const leadIds = Array.from(new Set((data || []).map((row) => String(row.lead_id || "").trim()).filter(Boolean)));
  const { data: leadRows } = leadIds.length
    ? await supabase.from("leads").select("id,business_name").in("id", leadIds).eq("owner_id", ownerId)
    : { data: [] as Array<{ id: string; business_name?: string | null }> };
  const leadMap = new Map((leadRows || []).map((row) => [String(row.id), String(row.business_name || "Lead")]));

  return NextResponse.json(
    (data || []).map((row) => ({
      ...row,
      lead_business_name: row.lead_id ? leadMap.get(String(row.lead_id)) || null : null,
    })),
    { status: 200 }
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const title = String(body.title || "").trim();
  const eventTypeRaw = String(body.event_type || "task").trim().toLowerCase() as CalendarEventType;
  const startTime = String(body.start_time || "").trim();
  const endTime = String(body.end_time || "").trim();
  const notes = String(body.notes || "").trim();
  const leadId = String(body.lead_id || "").trim();

  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  if (!startTime) return NextResponse.json({ error: "start_time is required." }, { status: 400 });
  if (!VALID_EVENT_TYPES.has(eventTypeRaw)) {
    return NextResponse.json({ error: "Invalid event_type." }, { status: 400 });
  }

  const workspaceId = await resolveWorkspaceIdForOwner(ownerId);
  const { data, error } = await createCalendarEvent({
    ownerId,
    workspaceId,
    leadId: leadId || null,
    title,
    eventType: eventTypeRaw,
    startTime,
    endTime: endTime || null,
    notes: notes || null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
