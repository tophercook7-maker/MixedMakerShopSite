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

  console.info("[Lead Claim API] claim started", { lead_id: leadId, user_id: ownerId });

  const { data: existing } = await supabase
    .from("leads")
    .select("id,owner_id,workspace_id,business_name")
    .eq("id", leadId)
    .maybeSingle();
  if (!existing) {
    console.info("[Lead Claim API] lead not found", { lead_id: leadId });
    return NextResponse.json({ error: "Lead does not exist." }, { status: 404 });
  }

  const existingOwnerId = String(existing.owner_id || "").trim();
  const alreadyOwned = existingOwnerId === ownerId;
  console.info("[Lead Claim API] pre-update state", {
    lead_id: leadId,
    existing_owner_id: existingOwnerId,
    existing_workspace_id: String(existing.workspace_id || "").trim() || null,
    user_id: ownerId,
    already_owned: alreadyOwned,
  });

  if (!alreadyOwned) {
    const { data, error } = await supabase
      .from("leads")
      .update({ owner_id: ownerId, workspace_id: ownerId })
      .eq("id", leadId)
      .select("id,owner_id,workspace_id,business_name")
      .maybeSingle();
    if (error || !data) {
      console.error("[Lead Claim API] update failed", { lead_id: leadId, error: error?.message });
      return NextResponse.json(
        { error: error?.message || "Could not claim lead — update returned no rows. RLS may be blocking the update." },
        { status: 500 }
      );
    }
    console.info("[Lead Claim API] update applied", {
      lead_id: leadId,
      new_owner_id: String(data.owner_id || "").trim(),
      new_workspace_id: String(data.workspace_id || "").trim(),
    });
  }

  const { data: verified, error: verifyError } = await supabase
    .from("leads")
    .select("id,owner_id,workspace_id,business_name")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (verifyError || !verified) {
    console.error("[Lead Claim API] post-claim verification failed", {
      lead_id: leadId,
      verify_error: verifyError?.message || null,
      verify_row: verified || null,
    });
    return NextResponse.json(
      {
        error: "Claim appeared to succeed but the lead is still not accessible to your user. Check RLS policies or column constraints.",
        diagnostics: {
          lead_id: leadId,
          user_id: ownerId,
          already_owned: alreadyOwned,
          verify_error: verifyError?.message || null,
        },
      },
      { status: 500 }
    );
  }

  console.info("[Lead Claim API] claim verified", {
    lead_id: verified.id,
    owner_id: String(verified.owner_id || "").trim(),
    workspace_id: String(verified.workspace_id || "").trim(),
    business_name: verified.business_name,
  });
  return NextResponse.json({
    id: verified.id,
    business_name: verified.business_name,
    claimed: !alreadyOwned,
    already_owned: alreadyOwned,
  });
}
