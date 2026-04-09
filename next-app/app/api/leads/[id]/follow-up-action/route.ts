import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { appendLeadNoteLine } from "@/lib/crm/append-lead-note";
import { buildSnoozePatch, buildRecordOutreachPatch } from "@/lib/crm/follow-up-cadence";
import { buildMarkLeadRepliedPatch } from "@/lib/crm/mark-lead-replied";
import { canonicalizeLeadStatus, pickLeadPatchFields } from "@/lib/crm-lead-schema";
import { recordLeadActivity } from "@/lib/lead-activity";

const bodySchema = z.object({
  action: z.enum([
    "record_outreach",
    "mark_replied",
    "mark_won",
    "mark_not_interested",
    "archive",
    "snooze_1d",
    "snooze_3d",
    "close_no_response",
    "resume_cadence",
  ]),
  /** For mark_replied */
  reply_preview: z.string().max(600).optional(),
  /** Passed to record_outreach for log-outreach parity */
  channel: z.enum(["facebook", "email", "text"]).optional(),
  note: z.string().max(2000).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: rawId } = await params;
  const leadId = String(rawId || "").trim();
  if (!leadId) return NextResponse.json({ error: "Lead id required" }, { status: 400 });

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();

  const { data: existing, error: loadErr } = await supabase
    .from("leads")
    .select(
      "id,status,notes,follow_up_count,next_follow_up_at,unread_reply_count,last_reply_preview,last_outreach_channel"
    )
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (loadErr || !existing) {
    return NextResponse.json({ error: loadErr?.message || "Lead not found" }, { status: 404 });
  }

  const prevStatus = canonicalizeLeadStatus((existing as { status?: string }).status);
  const notesRaw = String((existing as { notes?: string | null }).notes || "");
  const prevCount = Math.max(0, Math.floor(Number((existing as { follow_up_count?: number | null }).follow_up_count) || 0));
  const nowIso = new Date().toISOString();

  try {
    if (parsed.data.action === "record_outreach") {
      if (prevStatus === "replied") {
        return NextResponse.json(
          {
            error:
              "Lead is Replied — resume the cadence from the follow-up panel (or change status) before logging new outreach.",
          },
          { status: 400 }
        );
      }
      const built = buildRecordOutreachPatch({
        previousCount: prevCount,
        existingNotes: notesRaw,
        extraNote: parsed.data.note?.trim() || null,
      });
      const patchRaw: Record<string, unknown> = { ...built.patch, last_updated_at: nowIso };
      if (parsed.data.channel === "email") patchRaw.email_sent = true;
      if (parsed.data.channel === "facebook") patchRaw.facebook_sent = true;
      if (parsed.data.channel === "text") patchRaw.text_sent = true;
      if (parsed.data.channel) {
        patchRaw.last_outreach_channel = parsed.data.channel;
        patchRaw.last_outreach_status = "sent";
        patchRaw.last_outreach_sent_at = nowIso;
      }
      const patch = pickLeadPatchFields(patchRaw);
      const { data: updated, error: upErr } = await supabase
        .from("leads")
        .update(patch)
        .eq("id", leadId)
        .eq("owner_id", ownerId)
        .select()
        .maybeSingle();
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
      void recordLeadActivity(supabase, {
        ownerId,
        leadId,
        eventType: "message_sent",
        message: built.newCount === 1 ? "Initial outreach logged" : `Follow-up ${built.newCount - 1} logged`,
        meta: { template: built.templateKey, follow_up_count: built.newCount },
      });
      return NextResponse.json({ ok: true, lead: updated });
    }

    if (parsed.data.action === "mark_replied") {
      const unread = (existing as { unread_reply_count?: number | null }).unread_reply_count;
      const patch = pickLeadPatchFields({
        ...buildMarkLeadRepliedPatch({
          replyPreview: parsed.data.reply_preview ?? null,
          currentUnread: unread,
        }),
        lead_status: "replied",
        last_contacted_at: nowIso,
        notes: appendLeadNoteLine(notesRaw, "Lead marked replied."),
        last_updated_at: nowIso,
      });
      const { data: updated, error: upErr } = await supabase
        .from("leads")
        .update(patch)
        .eq("id", leadId)
        .eq("owner_id", ownerId)
        .select()
        .maybeSingle();
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
      void recordLeadActivity(supabase, {
        ownerId,
        leadId,
        eventType: "reply_received",
        message: "Lead marked replied",
      });
      return NextResponse.json({ ok: true, lead: updated });
    }

    if (parsed.data.action === "mark_won") {
      const patch = pickLeadPatchFields({
        status: "won",
        lead_status: "closed_won",
        last_contacted_at: nowIso,
        next_follow_up_at: null,
        follow_up_status: "completed",
        automation_paused: true,
        sequence_active: false,
        notes: appendLeadNoteLine(notesRaw, "Lead marked won."),
        last_updated_at: nowIso,
      });
      const { data: updated, error: upErr } = await supabase
        .from("leads")
        .update(patch)
        .eq("id", leadId)
        .eq("owner_id", ownerId)
        .select()
        .maybeSingle();
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
      void recordLeadActivity(supabase, {
        ownerId,
        leadId,
        eventType: "lead_status_changed",
        message: `Status: ${prevStatus} → won`,
        meta: { from: prevStatus, to: "won" },
      });
      return NextResponse.json({ ok: true, lead: updated });
    }

    if (parsed.data.action === "mark_not_interested") {
      const patch = pickLeadPatchFields({
        status: "not_interested",
        lead_status: "closed_lost",
        last_contacted_at: nowIso,
        next_follow_up_at: null,
        follow_up_status: "completed",
        automation_paused: true,
        sequence_active: false,
        notes: appendLeadNoteLine(notesRaw, "Lead marked not interested."),
        last_updated_at: nowIso,
      });
      const { data: updated, error: upErr } = await supabase
        .from("leads")
        .update(patch)
        .eq("id", leadId)
        .eq("owner_id", ownerId)
        .select()
        .maybeSingle();
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
      void recordLeadActivity(supabase, {
        ownerId,
        leadId,
        eventType: "lead_status_changed",
        message: `Status: ${prevStatus} → not_interested`,
      });
      return NextResponse.json({ ok: true, lead: updated });
    }

    if (parsed.data.action === "archive") {
      const patch = pickLeadPatchFields({
        status: "archived",
        next_follow_up_at: null,
        follow_up_status: "completed",
        automation_paused: true,
        sequence_active: false,
        notes: appendLeadNoteLine(notesRaw, "Lead archived."),
        last_updated_at: nowIso,
      });
      const { data: updated, error: upErr } = await supabase
        .from("leads")
        .update(patch)
        .eq("id", leadId)
        .eq("owner_id", ownerId)
        .select()
        .maybeSingle();
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
      void recordLeadActivity(supabase, {
        ownerId,
        leadId,
        eventType: "archived",
        message: "Lead archived",
      });
      return NextResponse.json({ ok: true, lead: updated });
    }

    if (parsed.data.action === "snooze_1d" || parsed.data.action === "snooze_3d") {
      const days = parsed.data.action === "snooze_1d" ? 1 : 3;
      const nextRaw = (existing as { next_follow_up_at?: string | null }).next_follow_up_at;
      const snooze = buildSnoozePatch(days, nextRaw, new Date());
      const patch = pickLeadPatchFields({
        next_follow_up_at: snooze.next_follow_up_at,
        follow_up_status: snooze.follow_up_status,
        notes: appendLeadNoteLine(
          notesRaw,
          `Snoozed ${days} day(s) — next follow-up ${String(snooze.next_follow_up_at).slice(0, 10)}.`,
        ),
        last_updated_at: nowIso,
      });
      const { data: updated, error: upErr } = await supabase
        .from("leads")
        .update(patch)
        .eq("id", leadId)
        .eq("owner_id", ownerId)
        .select()
        .maybeSingle();
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
      void recordLeadActivity(supabase, {
        ownerId,
        leadId,
        eventType: "follow_up_scheduled",
        message: `Snoozed ${days} day(s)`,
        meta: { next_follow_up_at: snooze.next_follow_up_at },
      });
      return NextResponse.json({ ok: true, lead: updated });
    }

    if (parsed.data.action === "close_no_response") {
      const patch = pickLeadPatchFields({
        status: "no_response",
        lead_status: "closed_lost",
        last_contacted_at: nowIso,
        next_follow_up_at: null,
        follow_up_status: "completed",
        automation_paused: true,
        sequence_active: false,
        notes: appendLeadNoteLine(notesRaw, "Lead closed as no_response."),
        last_updated_at: nowIso,
      });
      const { data: updated, error: upErr } = await supabase
        .from("leads")
        .update(patch)
        .eq("id", leadId)
        .eq("owner_id", ownerId)
        .select()
        .maybeSingle();
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
      void recordLeadActivity(supabase, {
        ownerId,
        leadId,
        eventType: "no_response",
        message: "Lead closed as no_response",
      });
      return NextResponse.json({ ok: true, lead: updated });
    }

    if (parsed.data.action === "resume_cadence") {
      const patch = pickLeadPatchFields({
        status: "contacted",
        automation_paused: false,
        follow_up_count: 0,
        last_follow_up_template_key: null,
        next_follow_up_at: nowIso,
        follow_up_status: "pending",
        notes: appendLeadNoteLine(notesRaw, "Follow-up cadence resumed manually."),
        last_updated_at: nowIso,
      });
      const { data: updated, error: upErr } = await supabase
        .from("leads")
        .update(patch)
        .eq("id", leadId)
        .eq("owner_id", ownerId)
        .select()
        .maybeSingle();
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
      void recordLeadActivity(supabase, {
        ownerId,
        leadId,
        eventType: "follow_up_scheduled",
        message: "Follow-up cadence resumed",
      });
      return NextResponse.json({ ok: true, lead: updated });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Action failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
