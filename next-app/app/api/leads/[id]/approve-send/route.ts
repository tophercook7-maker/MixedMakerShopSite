import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/leads/[id]/approve-send  — one-tap approve for the outbound send queue.
 * Body: { approve?: boolean } (default true). Adds/removes the `approved-to-send` tag;
 * the send-queue worker (atlas-bridge/send_queue.py) picks approved leads up and emails
 * their preview. Refuses if the lead was already sent. Sending itself stays gated by the
 * worker's .QUEUE_HOLD arm switch — this only marks intent.
 */
async function leadIdFromParams(params: Promise<{ id: string }> | { id: string }): Promise<string> {
  const resolved = await Promise.resolve(params);
  return String(resolved?.id || "").trim();
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leadId = await leadIdFromParams(params);
  if (!leadId) return NextResponse.json({ error: "Lead id required" }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as { approve?: boolean; sent?: boolean };
  const markSent = body?.sent === true;
  const approve = body?.approve !== false;

  const ownerId = String(user.id || "").trim();
  const supabase = await createClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .select("id,lead_tags")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error || !lead) {
    return NextResponse.json({ error: error?.message || "Lead not found" }, { status: 404 });
  }

  const tags: string[] = Array.isArray((lead as { lead_tags?: unknown[] }).lead_tags)
    ? (lead as { lead_tags: unknown[] }).lead_tags.map((t) => String(t))
    : [];

  const nowIso = new Date().toISOString();

  // Mark a lead as sent-by-hand (after composing in the mail app).
  if (markSent) {
    const next = [...tags.filter((t) => t !== "approved-to-send"), "sent-by-queue"];
    const { error: upErr } = await supabase
      .from("leads")
      .update({ lead_tags: Array.from(new Set(next)), status: "contacted", last_updated_at: nowIso })
      .eq("id", leadId)
      .eq("owner_id", ownerId);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    // Raw activity insert (bypasses the typed helper's event-type union).
    await supabase.from("lead_activities").insert({
      lead_id: leadId,
      type: "outbound_composed_sent",
      message: "Marked sent from send-queue (composed in mail app)",
    });
    return NextResponse.json({ ok: true, state: "sent" });
  }

  if (tags.includes("sent-by-queue")) {
    return NextResponse.json({ ok: false, error: "Already sent", state: "sent" });
  }

  const next = approve
    ? (tags.includes("approved-to-send") ? tags : [...tags, "approved-to-send"])
    : tags.filter((t) => t !== "approved-to-send");

  const { error: upErr } = await supabase
    .from("leads")
    .update({ lead_tags: next, last_updated_at: nowIso })
    .eq("id", leadId)
    .eq("owner_id", ownerId);

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, state: approve ? "approved" : "pending" });
}
