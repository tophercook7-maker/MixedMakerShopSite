import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

async function leadIdFromParams(params: Promise<{ id: string }> | { id: string }): Promise<string> {
  const resolved = await Promise.resolve(params);
  return String(resolved?.id || "").trim();
}

/** Owner-scoped delete — same rules as `DELETE /api/leads/[id]`. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = await leadIdFromParams(params);
  if (!id) {
    return NextResponse.json({ error: "Lead id is required." }, { status: 400 });
  }
  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();
  const { data, error } = await supabase
    .from("leads")
    .delete()
    .eq("owner_id", ownerId)
    .eq("id", id)
    .select("id")
    .limit(1);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Lead not found in your workspace." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
