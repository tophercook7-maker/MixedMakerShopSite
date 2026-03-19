import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
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

  const { data: existing } = await supabase
    .from("leads")
    .select("id,owner_id,workspace_id,business_name")
    .eq("id", leadId)
    .maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: "Lead does not exist." }, { status: 404 });
  }
  if (String(existing.owner_id || "").trim() === ownerId) {
    return NextResponse.json({
      id: existing.id,
      business_name: existing.business_name,
      already_owned: true,
    });
  }

  const { data, error } = await supabase
    .from("leads")
    .update({ owner_id: ownerId, workspace_id: ownerId })
    .eq("id", leadId)
    .select("id,business_name")
    .maybeSingle();
  if (error || !data) {
    console.error("[Lead Claim API] claim failed", { lead_id: leadId, error: error?.message });
    return NextResponse.json(
      { error: error?.message || "Could not claim lead." },
      { status: 500 }
    );
  }
  console.info("[Lead Claim API] lead claimed", { lead_id: leadId, new_owner: ownerId });
  return NextResponse.json({ id: data.id, business_name: data.business_name, claimed: true });
}
