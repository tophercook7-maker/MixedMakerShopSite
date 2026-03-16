import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
