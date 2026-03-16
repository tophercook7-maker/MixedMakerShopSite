import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("calendar_settings")
    .select("owner_id,show_soft_events_on_main_calendar")
    .eq("owner_id", ownerId)
    .limit(1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    {
      show_soft_events_on_main_calendar: Boolean(data?.[0]?.show_soft_events_on_main_calendar),
    },
    { status: 200 }
  );
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const showSoft = Boolean(body.show_soft_events_on_main_calendar);

  const { data, error } = await supabase
    .from("calendar_settings")
    .upsert(
      {
        owner_id: ownerId,
        show_soft_events_on_main_calendar: showSoft,
      },
      { onConflict: "owner_id" }
    )
    .select("owner_id,show_soft_events_on_main_calendar")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}

