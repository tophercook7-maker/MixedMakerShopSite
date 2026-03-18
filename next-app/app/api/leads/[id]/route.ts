import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { leadSchema } from "@/lib/validations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const leadId = String(id || "").trim();
  if (!leadId) return NextResponse.json({ error: "Lead id is required." }, { status: 400 });
  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("id", leadId)
    .maybeSingle();
  if (!error && data) return NextResponse.json(data);

  const { data: unscopedRow } = await supabase
    .from("leads")
    .select("id,owner_id,workspace_id,linked_opportunity_id,business_name")
    .eq("id", leadId)
    .maybeSingle();
  const leadExistsById = Boolean(unscopedRow);
  const diagnostics = {
    lead_exists_by_id: leadExistsById,
    owner_id_on_row: String((unscopedRow as { owner_id?: string | null } | null)?.owner_id || "").trim() || null,
    workspace_id_on_row: String((unscopedRow as { workspace_id?: string | null } | null)?.workspace_id || "").trim() || null,
    current_user_id: ownerId,
  };
  if (leadExistsById) {
    return NextResponse.json(
      { error: "Lead exists but is not in your workspace.", reason: "owner_workspace_mismatch", diagnostics },
      { status: 403 }
    );
  }
  return NextResponse.json(
    { error: "Lead does not exist.", reason: "not_found", diagnostics },
    { status: 404 }
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const parsed = leadSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();
  const payload = { ...parsed.data, last_updated_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from("leads")
    .update(payload)
    .eq("owner_id", ownerId)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Lead not found in your workspace." }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();
  const { data, error } = await supabase
    .from("leads")
    .delete()
    .eq("owner_id", ownerId)
    .eq("id", id)
    .select("id")
    .limit(1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Lead not found in your workspace." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
