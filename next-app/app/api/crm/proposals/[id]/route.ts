import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

const STATUSES = new Set(["draft", "sent", "viewed", "negotiating", "accepted", "declined"]);

async function proposalIdFromParams(params: Promise<{ id: string }> | { id: string }): Promise<string> {
  const resolved = await Promise.resolve(params);
  return String(resolved?.id || "").trim();
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = await proposalIdFromParams(params);
  if (!id) return NextResponse.json({ error: "Proposal id required" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if ("proposal_link" in body) patch.proposal_link = String(body.proposal_link || "").trim() || null;
  if ("proposal_amount" in body) {
    const v = body.proposal_amount;
    patch.proposal_amount =
      v != null && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : null;
  }
  if ("proposal_status" in body) {
    const s = String(body.proposal_status || "").toLowerCase();
    if (!STATUSES.has(s)) return NextResponse.json({ error: "Invalid proposal_status" }, { status: 400 });
    patch.proposal_status = s;
  }
  if ("proposal_sent_at" in body) {
    patch.proposal_sent_at = body.proposal_sent_at ? String(body.proposal_sent_at).trim() || null : null;
  }
  if ("proposal_follow_up_at" in body) {
    patch.proposal_follow_up_at = body.proposal_follow_up_at
      ? String(body.proposal_follow_up_at).trim() || null
      : null;
  }
  if ("notes" in body) patch.notes = String(body.notes || "").trim() || null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crm_proposals")
    .update(patch)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
