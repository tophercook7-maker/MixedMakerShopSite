import { NextResponse } from "next/server";
import { sendResendEmail } from "@/lib/email/resend-send";
import { isManualOnlyMode, isManualTriggerRequest } from "@/lib/manual-mode";
import { listActiveMemberRecipients } from "@/lib/membership/active-subscribers";
import { chicagoYmd, isChicagoSundayMorningSendWindow } from "@/lib/worldWatch/chicago-week";
import { buildDeepWellWeeklyEmail } from "@/lib/worldWatch/email-pipeline";
import { getServiceRoleSupabase } from "@/lib/supabase/service-role";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

function weeklyAutoEnabled(): boolean {
  return ["1", "true", "yes", "on"].includes(String(process.env.DEEP_WELL_WEEKLY_AUTO || "").trim().toLowerCase());
}

function cronAuthorized(request: Request): boolean {
  const configured =
    String(process.env.DEEP_WELL_WEEKLY_CRON_SECRET || "").trim() ||
    String(process.env.CRON_SECRET || "").trim();
  if (!configured) return true;
  const provided =
    String(request.headers.get("x-cron-secret") || "").trim() ||
    String(request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  return configured === provided;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dry_run") === "1";
  const manual = isManualTriggerRequest(request) || url.searchParams.get("manual") === "1";

  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!weeklyAutoEnabled() && isManualOnlyMode() && !manual) {
    return NextResponse.json(
      {
        ok: false,
        manual_only_mode: true,
        message:
          "Set DEEP_WELL_WEEKLY_AUTO=true for Vercel cron, or MANUAL_ONLY_MODE=false, or pass manual_trigger=1 / ?manual=1.",
      },
      { status: 403 }
    );
  }

  if (!manual && !dryRun && !isChicagoSundayMorningSendWindow(new Date())) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "outside_sunday_morning_chicago_window",
    });
  }

  const now = new Date();
  const weekKey = chicagoYmd(now);

  const svc = getServiceRoleSupabase();
  if (!svc.ok) {
    return NextResponse.json({ error: "Service configuration error." }, { status: 503 });
  }
  const supabase = svc.supabase;

  if (dryRun) {
    const built = await buildDeepWellWeeklyEmail(now);
    return NextResponse.json({
      ok: true,
      dry_run: true,
      week_key: weekKey,
      subject: built.draft.subject,
      preview_text: built.draft.previewText,
      html: built.html,
      text: built.text,
    });
  }

  const { data: existing } = await supabase
    .from("deep_well_weekly_campaigns")
    .select("id,status")
    .eq("week_key", weekKey)
    .maybeSingle();

  if (existing && String(existing.status) === "sent") {
    return NextResponse.json({ ok: true, skipped: true, reason: "already_sent", week_key: weekKey });
  }

  const built = await buildDeepWellWeeklyEmail(now);
  const recipients = await listActiveMemberRecipients(supabase);
  if (recipients.length === 0) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "no_active_recipients",
      week_key: weekKey,
    });
  }

  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const fromEmail = String(process.env.RESEND_FROM_EMAIL || process.env.BOOKING_FROM_EMAIL || "").trim();
  if (!apiKey || !fromEmail) {
    return NextResponse.json({ error: "Missing RESEND_API_KEY or RESEND_FROM_EMAIL." }, { status: 503 });
  }

  const replyTo =
    String(process.env.DEEP_WELL_WEEKLY_REPLY_TO || process.env.BOOKING_NOTIFY_EMAIL || "").trim() || undefined;

  const ts = new Date().toISOString();
  const baseCampaign = {
    week_key: weekKey,
    week_start: built.weekStart.toISOString(),
    week_end: built.weekEnd.toISOString(),
    subject: built.draft.subject,
    preview_text: built.draft.previewText,
    html_body: built.html,
    text_body: built.text,
    status: "sending" as const,
    recipient_count: recipients.length,
    updated_at: ts,
  };

  let campaignId: string;

  if (existing?.id) {
    await supabase.from("deep_well_weekly_sends").delete().eq("campaign_id", existing.id);
    const { error: upErr } = await supabase.from("deep_well_weekly_campaigns").update(baseCampaign).eq("id", existing.id);
    if (upErr) {
      console.error("[deep-well-weekly] campaign update failed", upErr.message);
      return NextResponse.json({ error: "Campaign save failed." }, { status: 500 });
    }
    campaignId = existing.id as string;
  } else {
    const { data: ins, error: insErr } = await supabase
      .from("deep_well_weekly_campaigns")
      .insert({ ...baseCampaign, created_at: ts })
      .select("id")
      .single();
    if (insErr || !ins?.id) {
      console.error("[deep-well-weekly] campaign insert failed", insErr);
      return NextResponse.json({ error: "Campaign save failed." }, { status: 500 });
    }
    campaignId = ins.id as string;
  }
  let sent = 0;
  let failed = 0;

  for (const r of recipients) {
    const sendResult = await sendResendEmail({
      to: r.email,
      subject: built.draft.subject,
      html: built.html,
      text: built.text,
      apiKey,
      fromEmail,
      replyTo,
    });

    const sendRow = {
      campaign_id: campaignId,
      user_id: r.user_id,
      email: r.email,
      delivery_status: sendResult.ok ? "sent" : "failed",
      provider_message_id: sendResult.ok ? sendResult.id : null,
      error_message: sendResult.ok ? null : sendResult.error,
      sent_at: sendResult.ok ? new Date().toISOString() : null,
    };

    const { error: insErr } = await supabase.from("deep_well_weekly_sends").insert(sendRow);
    if (insErr) {
      console.error("[deep-well-weekly] send row insert failed", insErr.message);
    }
    if (sendResult.ok) sent += 1;
    else failed += 1;
  }

  const finalStatus = failed === 0 ? "sent" : failed === recipients.length ? "failed" : "sent";
  const { error: finErr } = await supabase
    .from("deep_well_weekly_campaigns")
    .update({
      status: finalStatus,
      sent_at: finalStatus === "sent" ? new Date().toISOString() : null,
      error_message: failed > 0 ? `${failed} recipient(s) failed` : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId);

  if (finErr) {
    console.error("[deep-well-weekly] campaign finalize failed", finErr.message);
  }

  return NextResponse.json({
    ok: true,
    week_key: weekKey,
    campaign_id: campaignId,
    recipients: recipients.length,
    sent,
    failed,
    status: finalStatus,
  });
}

export async function POST(request: Request) {
  return GET(request);
}
