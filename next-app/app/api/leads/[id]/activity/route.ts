import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { recordLeadActivity } from "@/lib/lead-activity";
import { z } from "zod";

const postSchema = z.object({
  event_type: z.string().min(1).max(120),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const leadId = String(id || "").trim();
  if (!leadId) return NextResponse.json({ error: "Lead id required" }, { status: 400 });
  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();

  const { data: leadOk } = await supabase
    .from("leads")
    .select("id")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (!leadOk) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("lead_activities")
    .select("id,event_type,meta,created_at")
    .eq("lead_id", leadId)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    if (String(error.message || "").toLowerCase().includes("does not exist")) {
      return NextResponse.json({ items: [], reason: "table_missing" });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ items: data || [] });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const leadId = String(id || "").trim();
  if (!leadId) return NextResponse.json({ error: "Lead id required" }, { status: 400 });
  const body = (await request.json().catch(() => ({}))) as unknown;
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();

  const { data: leadOk } = await supabase
    .from("leads")
    .select("id")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (!leadOk) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  await recordLeadActivity(supabase, {
    ownerId,
    leadId,
    eventType: parsed.data.event_type,
    meta: parsed.data.meta,
  });
  return NextResponse.json({ ok: true });
}
