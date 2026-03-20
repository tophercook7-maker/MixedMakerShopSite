import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { canonicalizeLeadStatus, pickLeadPatchFields } from "@/lib/crm-lead-schema";
import { recordLeadActivity } from "@/lib/lead-activity";

const bodySchema = z.object({
  channel: z.enum(["facebook", "email", "text"]),
  note: z.string().max(2000).optional(),
  /** ISO timestamp; defaults to now */
  sent_at: z.string().optional(),
});

function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/**
 * Manual "I sent a message" logging — stable fields on `leads` + best-effort activity row.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const leadId = String(id || "").trim();
  if (!leadId) return NextResponse.json({ error: "Lead id required" }, { status: 400 });

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();
  const sentAt = parsed.data.sent_at?.trim() || new Date().toISOString();
  const ch = parsed.data.channel;

  const { data: existing, error: loadErr } = await supabase
    .from("leads")
    .select("id,status")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (loadErr || !existing) {
    return NextResponse.json({ error: loadErr?.message || "Lead not found" }, { status: 404 });
  }

  const patchRaw: Record<string, unknown> = {
    last_outreach_channel: ch,
    last_outreach_status: "sent",
    last_outreach_sent_at: sentAt,
    last_contacted_at: sentAt,
    status: canonicalizeLeadStatus("contacted"),
    next_follow_up_at: addDaysIso(2),
    follow_up_status: "pending",
  };
  if (ch === "email") patchRaw.email_sent = true;
  if (ch === "facebook") patchRaw.facebook_sent = true;
  if (ch === "text") patchRaw.text_sent = true;

  const patch = pickLeadPatchFields({
    ...patchRaw,
    last_updated_at: new Date().toISOString(),
  });

  const { data: updated, error: upErr } = await supabase
    .from("leads")
    .update(patch)
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .select()
    .maybeSingle();

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  void recordLeadActivity(supabase, {
    ownerId,
    leadId,
    eventType: "message_sent",
    message: parsed.data.note?.trim() || `Logged send via ${ch}`,
    meta: { channel: ch, sent_at: sentAt },
  });

  return NextResponse.json({ ok: true, lead: updated });
}
