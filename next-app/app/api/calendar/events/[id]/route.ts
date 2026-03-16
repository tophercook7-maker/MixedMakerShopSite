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
    .select("id,event_type,start_time,end_time")
    .eq("owner_id", ownerId)
    .neq("id", excludeId)
    .lt("start_time", endIso)
    .or(`end_time.is.null,end_time.gt.${startIso}`)
    .limit(50);
  if (error) return { conflict: false, error: error.message };
  const conflict = (data || []).some((row) => isHardBlockEventType(String(row.event_type || "")));
  return { conflict, error: null };
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
  if (body.event_type !== undefined) {
    updates.event_type = normalizeCalendarEventType(String(body.event_type || ""));
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("calendar_events")
    .select("id,event_type,start_time,end_time")
    .eq("id", eventId)
    .eq("owner_id", ownerId)
    .limit(1);
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
  const existing = (existingRows || [])[0];
  if (!existing) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const nextType = normalizeCalendarEventType(
    String(updates.event_type || existing.event_type || "")
  );
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
  if (isHardBlockEventType(nextType)) {
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
        { error: "This time conflicts with an existing hard-block appointment or client call." },
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
