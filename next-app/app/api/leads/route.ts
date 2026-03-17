import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { leadSchema } from "@/lib/validations";
import { refreshDueFollowUps } from "@/lib/leads-workflow";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await refreshDueFollowUps();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const supabase = await createClient();
  const email = String(parsed.data.email || "").trim();
  const phone = String(parsed.data.phone || "").trim();
  const manual = Boolean(parsed.data.is_manual);
  const forceDoor = String(parsed.data.lead_bucket || "").trim().toLowerCase() === "door_to_door";
  const shouldDoor = manual || forceDoor || !email || !phone;
  const row = {
    ...parsed.data,
    owner_id: user.id,
    lead_bucket: shouldDoor ? "door_to_door" : parsed.data.lead_bucket,
    door_status: shouldDoor ? parsed.data.door_status || "not_visited" : parsed.data.door_status || null,
    last_updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("leads")
    .insert(row)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
