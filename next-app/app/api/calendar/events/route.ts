import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createCalendarEvent,
  isHardBlockEventType,
  isSoftEventType,
  normalizeCalendarEventType,
  resolveWorkspaceIdForOwner,
  type CalendarEventType,
} from "@/lib/calendar-events";

const VALID_EVENT_TYPES = new Set<CalendarEventType>([
  "appointment",
  "client_call",
  "personal",
  "follow_up_reminder",
  "task",
  "scout_run",
  "meeting",
  "followup",
  "scout",
]);

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "").trim()
  );
}

async function hasHardBlockConflict(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerId: string,
  startIso: string,
  endIso: string,
  excludeId?: string | null
) {
  let query = supabase
    .from("calendar_events")
    .select("id,title,event_type,is_blocking,start_time,end_time")
    .eq("owner_id", ownerId)
    .lt("start_time", endIso)
    .or(`end_time.is.null,end_time.gt.${startIso}`)
    .limit(50);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query;
  if (error) return { conflict: false, error: error.message, row: null };
  const hardBlock = (data || []).find((row) => {
    const explicitBlocking = typeof row.is_blocking === "boolean" ? row.is_blocking : null;
    return explicitBlocking !== null
      ? explicitBlocking
      : isHardBlockEventType(String(row.event_type || ""));
  });
  return { conflict: Boolean(hardBlock), error: null, row: hardBlock || null };
}

export async function GET(request: Request) {
  const supabaseProjectUrl =
    String(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim() || "unset";
  console.info("[Calendar API] load start", {
    supabase_project_url: supabaseProjectUrl,
  });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const start = String(url.searchParams.get("start") || "").trim();
  const end = String(url.searchParams.get("end") || "").trim();
  const view = String(url.searchParams.get("view") || "crm").trim().toLowerCase();
  const forMainCalendar = view === "main";

  let query = supabase
    .from("calendar_events")
    .select("id,lead_id,title,event_type,start_time,end_time,notes,workspace_id,owner_id,is_blocking,created_at")
    .eq("owner_id", ownerId)
    .order("start_time", { ascending: true })
    .limit(1000);

  if (start) query = query.gte("start_time", start);
  if (end) query = query.lte("start_time", end);

  const { data, error } = await query;
  if (error) {
    console.error("[Calendar API] calendar_events query failed", {
      supabase_project_url: supabaseProjectUrl,
      error_message: error.message,
      error_payload: error,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  console.info("[Calendar API] calendar_events query success", {
    supabase_project_url: supabaseProjectUrl,
    row_count: Array.isArray(data) ? data.length : 0,
  });
  const { data: settingsRows } = await supabase
    .from("calendar_settings")
    .select("show_soft_events_on_main_calendar")
    .eq("owner_id", ownerId)
    .limit(1);
  const showSoftOnMain = Boolean(settingsRows?.[0]?.show_soft_events_on_main_calendar);
  const filteredRows = (data || []).filter((row) => {
    const type = String(row.event_type || "");
    if (!forMainCalendar) return true;
    if (!isSoftEventType(type)) return true;
    return showSoftOnMain;
  });

  const leadIds = Array.from(new Set(filteredRows.map((row) => String(row.lead_id || "").trim()).filter(Boolean)));
  const { data: leadRows } = leadIds.length
    ? await supabase.from("leads").select("id,business_name").in("id", leadIds).eq("owner_id", ownerId)
    : { data: [] as Array<{ id: string; business_name?: string | null }> };
  const leadMap = new Map((leadRows || []).map((row) => [String(row.id), String(row.business_name || "Lead")]));

  return NextResponse.json(
    filteredRows.map((row) => ({
      ...row,
      event_type: normalizeCalendarEventType(String(row.event_type || "")),
      hard_block: isHardBlockEventType(String(row.event_type || "")),
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
  const eventTypeInput = String(body.event_type || "task").trim().toLowerCase() as CalendarEventType;
  const startTime = String(body.start_time || "").trim();
  const endTime = String(body.end_time || "").trim();
  const notes = String(body.notes || "").trim();
  const leadId = String(body.lead_id || "").trim();
  const eventTypeRaw = normalizeCalendarEventType(eventTypeInput);
  const requestedIsBlocking =
    typeof body.is_blocking === "boolean" ? Boolean(body.is_blocking) : null;
  const effectiveIsBlocking =
    requestedIsBlocking !== null ? requestedIsBlocking : isHardBlockEventType(eventTypeRaw);
  const debugPayload = {
    title,
    event_type: eventTypeRaw,
    start_time: startTime,
    end_time: endTime || null,
    notes: notes || null,
    is_blocking: effectiveIsBlocking,
    lead_id: leadId || null,
  };

  if (!title) return NextResponse.json({ error: "Title is required.", save_succeeded: false, debug: { payload: debugPayload, owner_id: ownerId, workspace_id: null } }, { status: 400 });
  if (!startTime) return NextResponse.json({ error: "start_time is required.", save_succeeded: false, debug: { payload: debugPayload, owner_id: ownerId, workspace_id: null } }, { status: 400 });
  if (!VALID_EVENT_TYPES.has(eventTypeRaw)) {
    return NextResponse.json({ error: "Invalid event_type.", save_succeeded: false, debug: { payload: debugPayload, owner_id: ownerId, workspace_id: null } }, { status: 400 });
  }
  const start = new Date(startTime);
  if (Number.isNaN(start.getTime())) return NextResponse.json({ error: "Invalid start_time.", save_succeeded: false, debug: { payload: debugPayload, owner_id: ownerId, workspace_id: null } }, { status: 400 });
  const end = endTime ? new Date(endTime) : new Date(start.getTime() + 30 * 60 * 1000);
  if (Number.isNaN(end.getTime()) || end.getTime() <= start.getTime()) {
    return NextResponse.json({ error: "end_time must be after start_time.", save_succeeded: false, debug: { payload: debugPayload, owner_id: ownerId, workspace_id: null } }, { status: 400 });
  }
  if (effectiveIsBlocking) {
    const conflict = await hasHardBlockConflict(
      supabase,
      ownerId,
      start.toISOString(),
      end.toISOString(),
      null
    );
    if (conflict.error) return NextResponse.json({ error: conflict.error, save_succeeded: false, debug: { payload: debugPayload, owner_id: ownerId, workspace_id: null } }, { status: 500 });
    if (conflict.conflict) {
      return NextResponse.json(
        { error: "This time conflicts with another blocking appointment.", save_succeeded: false, debug: { payload: debugPayload, owner_id: ownerId, workspace_id: null } },
        { status: 409 }
      );
    }
  }

  const workspaceId = await resolveWorkspaceIdForOwner(ownerId);
  if (!workspaceId) {
    return NextResponse.json(
      {
        error: "workspace_id could not be resolved from DB/env/owner fallback.",
        save_succeeded: false,
        debug: { payload: debugPayload, owner_id: ownerId, workspace_id: null },
      },
      { status: 400 }
    );
  }
  if (!isUuid(workspaceId)) {
    return NextResponse.json(
      {
        error: `workspace_id must be a UUID. Received: ${workspaceId}`,
        save_succeeded: false,
        debug: { payload: debugPayload, owner_id: ownerId, workspace_id: workspaceId },
      },
      { status: 400 }
    );
  }
  const { data, error } = await createCalendarEvent({
    ownerId,
    workspaceId,
    leadId: leadId || null,
    title,
    eventType: eventTypeRaw,
    startTime,
    endTime: endTime || null,
    notes: notes || null,
    isBlocking: effectiveIsBlocking,
  });
  if (error) {
    console.error("[Calendar API] create event failed", {
      owner_id: ownerId,
      workspace_id: workspaceId,
      payload: debugPayload,
      error,
    });
    return NextResponse.json(
      {
        error: error.message,
        save_succeeded: false,
        debug: { payload: debugPayload, owner_id: ownerId, workspace_id: workspaceId },
      },
      { status: 500 }
    );
  }
  return NextResponse.json(
    {
      save_succeeded: true,
      owner_id: ownerId,
      workspace_id: workspaceId,
      ...data,
      debug: { payload: debugPayload, owner_id: ownerId, workspace_id: workspaceId },
    },
    { status: 201 }
  );
}
