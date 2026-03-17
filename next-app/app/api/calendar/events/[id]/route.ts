import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isHardBlockEventType, normalizeCalendarEventType } from "@/lib/calendar-events";

async function hasHardBlockConflict(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerId: string,
  startIso: string,
  endIso: string,
  excludeId: string
) {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("id,event_type,is_blocking,start_time,end_time")
    .eq("owner_id", ownerId)
    .neq("id", excludeId)
    .lt("start_time", endIso)
    .or(`end_time.is.null,end_time.gt.${startIso}`)
    .limit(50);
  if (error) return { conflict: false, error: error.message };
  const conflict = (data || []).some((row) => {
    const explicitBlocking = typeof row.is_blocking === "boolean" ? row.is_blocking : null;
    return explicitBlocking !== null
      ? explicitBlocking
      : isHardBlockEventType(String(row.event_type || ""));
  });
  return { conflict, error: null };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const eventId = String(id || "").trim();
  if (!eventId) return NextResponse.json({ error: "Event id required." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("calendar_events")
    .select("id,workspace_id,owner_id,lead_id,title,event_type,start_time,end_time,notes,is_blocking,created_at,updated_at")
    .eq("id", eventId)
    .eq("owner_id", ownerId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  return NextResponse.json(data, { status: 200 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const eventId = String(id || "").trim();
  if (!eventId) return NextResponse.json({ error: "Event id required." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = String(body.title || "").trim();
  if (body.start_time !== undefined) updates.start_time = String(body.start_time || "").trim();
  if (body.end_time !== undefined) updates.end_time = String(body.end_time || "").trim() || null;
  if (body.notes !== undefined) updates.notes = String(body.notes || "").trim() || null;
  if (body.lead_id !== undefined) updates.lead_id = String(body.lead_id || "").trim() || null;
  if (body.is_blocking !== undefined) updates.is_blocking = Boolean(body.is_blocking);
  if (body.event_type !== undefined) {
    updates.event_type = normalizeCalendarEventType(String(body.event_type || ""));
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("calendar_events")
    .select("id,event_type,start_time,end_time,is_blocking")
    .eq("id", eventId)
    .eq("owner_id", ownerId)
    .limit(1);
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
  const existing = (existingRows || [])[0];
  if (!existing) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const nextType = normalizeCalendarEventType(
    String(updates.event_type || existing.event_type || "")
  );
  const nextIsBlocking =
    typeof updates.is_blocking === "boolean"
      ? Boolean(updates.is_blocking)
      : Boolean(existing.is_blocking ?? isHardBlockEventType(nextType));
  const nextStart = new Date(String(updates.start_time || existing.start_time || ""));
  const nextEnd = new Date(
    String(
      updates.end_time !== undefined
        ? updates.end_time || ""
        : existing.end_time || new Date(nextStart.getTime() + 30 * 60 * 1000).toISOString()
    )
  );
  if (Number.isNaN(nextStart.getTime())) {
    return NextResponse.json({ error: "Invalid start_time." }, { status: 400 });
  }
  if (Number.isNaN(nextEnd.getTime()) || nextEnd.getTime() <= nextStart.getTime()) {
    return NextResponse.json({ error: "end_time must be after start_time." }, { status: 400 });
  }
  if (nextIsBlocking) {
    const conflict = await hasHardBlockConflict(
      supabase,
      ownerId,
      nextStart.toISOString(),
      nextEnd.toISOString(),
      eventId
    );
    if (conflict.error) return NextResponse.json({ error: conflict.error }, { status: 500 });
    if (conflict.conflict) {
      return NextResponse.json(
        { error: "This time conflicts with another blocking appointment." },
        { status: 409 }
      );
    }
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .update(updates)
    .eq("id", eventId)
    .eq("owner_id", ownerId)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const eventId = String(id || "").trim();
  if (!eventId) return NextResponse.json({ error: "Event id required." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", eventId)
    .eq("owner_id", ownerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 200 });
}
