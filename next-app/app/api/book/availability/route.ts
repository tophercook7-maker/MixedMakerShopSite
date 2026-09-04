import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isHardBlockEventType } from "@/lib/calendar-events";
import { BOOKING_TZ, buildDaySlots, dayBoundsUtc, isValidDay } from "@/lib/booking-slots";

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

  if (!isValidDay(day)) {
    return NextResponse.json({ error: "Invalid day." }, { status: 400 });
  }
  const { dayStart, dayEnd } = dayBoundsUtc(day);

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

  const slots = buildDaySlots(day, hardBlocks);

  return NextResponse.json(
    {
      owner_id: ownerId,
      day,
      time_zone: BOOKING_TZ,
      slots,
      hard_block_count: hardBlocks.length,
    },
    { status: 200 }
  );
}

