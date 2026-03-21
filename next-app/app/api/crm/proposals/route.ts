import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

const STATUSES = new Set(["draft", "sent", "viewed", "negotiating", "accepted", "declined"]);

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crm_proposals")
    .select("*, leads(business_name)")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const lead_id = String(body.lead_id || "").trim();
  if (!lead_id) return NextResponse.json({ error: "lead_id is required" }, { status: 400 });
  const proposal_status = String(body.proposal_status || "draft").toLowerCase();
  if (!STATUSES.has(proposal_status)) {
    return NextResponse.json({ error: "Invalid proposal_status" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: own } = await supabase.from("leads").select("id").eq("id", lead_id).eq("owner_id", user.id).maybeSingle();
  if (!own) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const amountRaw = body.proposal_amount;
  const proposal_amount =
    amountRaw != null && amountRaw !== "" && !Number.isNaN(Number(amountRaw)) ? Number(amountRaw) : null;

  const insert = {
    lead_id,
    owner_id: user.id,
    proposal_link: String(body.proposal_link || "").trim() || null,
    proposal_amount,
    proposal_status,
    proposal_sent_at: body.proposal_sent_at ? String(body.proposal_sent_at).trim() || null : null,
    proposal_follow_up_at: body.proposal_follow_up_at ? String(body.proposal_follow_up_at).trim() || null : null,
    notes: String(body.notes || "").trim() || null,
  };

  const { data, error } = await supabase.from("crm_proposals").insert(insert).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
