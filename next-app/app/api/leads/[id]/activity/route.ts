import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { isLeadActivitiesUnavailable, recordLeadActivity } from "@/lib/lead-activity";
import { z } from "zod";

const postSchema = z
  .object({
    type: z.string().min(1).max(120).optional(),
    event_type: z.string().min(1).max(120).optional(),
    message: z.string().max(2000).optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .transform((d) => {
    const type = String(d.type || d.event_type || "").trim();
    return {
      type,
      message: d.message,
      metadata: d.metadata ?? d.meta ?? {},
    };
  })
  .pipe(
    z.object({
      type: z.string().min(1).max(120),
      message: z.string().max(2000).optional(),
      metadata: z.record(z.string(), z.unknown()),
    })
  );

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
    .select("id,type,message,metadata,created_at,actor_user_id")
    .eq("lead_id", leadId)
    .eq("actor_user_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    if (isLeadActivitiesUnavailable(error)) {
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

  void recordLeadActivity(supabase, {
    ownerId,
    leadId,
    eventType: parsed.data.type,
    message: parsed.data.message,
    meta: parsed.data.metadata,
  });
  return NextResponse.json({ ok: true });
}
