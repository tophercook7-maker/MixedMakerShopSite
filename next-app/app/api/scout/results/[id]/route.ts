import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scoutId = String(id || "").trim();
  if (!scoutId) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("scout_results")
    .select(
      "id,business_name,city,state,category,source_type,source_url,source_external_id,website_url,has_website,facebook_url,has_facebook,phone,has_phone,opportunity_reason,opportunity_rank,raw_source_payload,scout_notes,skipped,added_to_leads,linked_lead_id,discovered_at,created_at,updated_at,marked_priority,reviewed_at,pulled_into_crm_at"
    )
    .eq("id", scoutId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({ result: data });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scoutId = String(id || "").trim();
  if (!scoutId) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    skipped?: boolean;
    scout_notes?: string | null;
    marked_priority?: boolean;
    reviewed_at?: string | null;
  };

  const patch: Record<string, unknown> = {};
  if (typeof body.skipped === "boolean") patch.skipped = body.skipped;
  if (body.scout_notes !== undefined) patch.scout_notes = body.scout_notes;
  if (typeof body.marked_priority === "boolean") {
    patch.marked_priority = body.marked_priority;
    if (body.marked_priority) patch.reviewed_at = new Date().toISOString();
  }
  if (body.reviewed_at !== undefined) patch.reviewed_at = body.reviewed_at;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("scout_results")
    .update(patch)
    .eq("id", scoutId)
    .eq("owner_id", ownerId)
    .select("id,skipped,scout_notes,marked_priority,reviewed_at,updated_at")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({ ok: true, result: data });
}
