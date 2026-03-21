import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { logCrmAutomationEvent } from "@/lib/crm/automation-log";

/** Lets the browser log operator events after PATCH (session + RLS). */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const event_type = String(body.event_type || "").trim();
  if (!event_type) return NextResponse.json({ error: "event_type required" }, { status: 400 });
  const lead_id = body.lead_id ? String(body.lead_id).trim() : null;
  const payload =
    body.payload && typeof body.payload === "object" && !Array.isArray(body.payload)
      ? (body.payload as Record<string, unknown>)
      : {};

  const supabase = await createClient();
  if (lead_id) {
    const { data: row } = await supabase.from("leads").select("id").eq("id", lead_id).eq("owner_id", user.id).maybeSingle();
    if (!row) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  await logCrmAutomationEvent(supabase, {
    owner_id: String(user.id),
    lead_id: lead_id || null,
    event_type,
    payload,
  });
  return NextResponse.json({ ok: true });
}
