import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*, clients(*)").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const parsed = projectSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const supabase = await createClient();
  const patch = { ...parsed.data } as Record<string, unknown>;
  const { data: before } = await supabase
    .from("projects")
    .select("amount_paid,status")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  const now = new Date().toISOString();
  if (Object.prototype.hasOwnProperty.call(patch, "amount_paid")) {
    const prev = Number((before as { amount_paid?: unknown } | null)?.amount_paid ?? 0);
    const next = Number(patch.amount_paid ?? 0);
    if (Number.isFinite(next) && next !== prev && !Object.prototype.hasOwnProperty.call(patch, "amount_paid_updated_at")) {
      patch.amount_paid_updated_at = now;
    }
  }
  if (Object.prototype.hasOwnProperty.call(patch, "status")) {
    const prevStatus = String((before as { status?: unknown } | null)?.status || "");
    const nextStatus = String(patch.status || "");
    if (nextStatus === "completed" && prevStatus !== "completed" && !Object.prototype.hasOwnProperty.call(patch, "completed_at")) {
      patch.completed_at = now;
    }
  }
  const { data, error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
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
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
