import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isHardBlockEventType } from "@/lib/calendar-events";

function resolveOwnerId(
  profileRows: Array<{ id: string }> | null,
  fromQuery: string | null,
  fromEnv: string
): string {
  return String(fromQuery || fromEnv || profileRows?.[0]?.id || "").trim();
}

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const supabase = createServiceClient(url, key);

  const reqUrl = new URL(request.url);
  const day = String(reqUrl.searchParams.get("day") || "").trim(); // YYYY-MM-DD
  const ownerQuery = String(reqUrl.searchParams.get("owner_id") || "").trim() || null;
  if (!day) return NextResponse.json({ error: "day is required (YYYY-MM-DD)." }, { status: 400 });

  const [profileRes] = await Promise.all([
    supabase.from("profiles").select("id").order("created_at", { ascending: true }).limit(1),
  ]);
  const ownerId = resolveOwnerId(
    (profileRes.data as Array<{ id: string }> | null) || [],
    ownerQuery,
    String(process.env.DEFAULT_BOOKING_OWNER_ID || "").trim()
  );
  if (!ownerId) return NextResponse.json({ error: "No owner profile found." }, { status: 500 });

  const openHour = Number(process.env.BOOKING_OPEN_HOUR || 9);
  const closeHour = Number(process.env.BOOKING_CLOSE_HOUR || 17);
  const slotMinutes = Number(process.env.BOOKING_SLOT_MINUTES || 30);

  const dayStart = new Date(`${day}T00:00:00.000Z`);
  const dayEnd = new Date(`${day}T23:59:59.999Z`);
  if (Number.isNaN(dayStart.getTime())) {
    return NextResponse.json({ error: "Invalid day." }, { status: 400 });
  }

  const { data: rows, error } = await supabase
    .from("calendar_events")
    .select("id,event_type,start_time,end_time,title")
    .eq("owner_id", ownerId)
    .lt("start_time", dayEnd.toISOString())
    .or(`end_time.is.null,end_time.gt.${dayStart.toISOString()}`)
    .order("start_time", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const hardBlocks = (rows || [])
    .filter((row) => isHardBlockEventType(String(row.event_type || "")))
    .map((row) => ({
      start: new Date(String(row.start_time || "")),
      end: new Date(String(row.end_time || row.start_time || "")),
      title: String(row.title || ""),
    }))
    .filter((b) => !Number.isNaN(b.start.getTime()) && !Number.isNaN(b.end.getTime()) && b.end > b.start);

  const slots: Array<{ start_time: string; end_time: string }> = [];
  for (let hour = openHour; hour < closeHour; hour += 1) {
    for (let min = 0; min < 60; min += slotMinutes) {
      const slotStart = new Date(`${day}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00.000Z`);
      const slotEnd = new Date(slotStart.getTime() + 15 * 60 * 1000);
      if (slotEnd.getUTCHours() > closeHour || (slotEnd.getUTCHours() === closeHour && slotEnd.getUTCMinutes() > 0)) continue;
      const conflict = hardBlocks.some((block) => slotStart < block.end && slotEnd > block.start);
      if (!conflict) {
        slots.push({ start_time: slotStart.toISOString(), end_time: slotEnd.toISOString() });
      }
    }
  }

  return NextResponse.json(
    {
      owner_id: ownerId,
      day,
      slots,
      hard_block_count: hardBlocks.length,
    },
    { status: 200 }
  );
}

