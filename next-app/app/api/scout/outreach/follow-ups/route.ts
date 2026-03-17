import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

type LeadRow = {
  id: string;
  owner_id: string;
  workspace_id?: string | null;
  linked_opportunity_id?: string | null;
  business_name?: string | null;
  email?: string | null;
  industry?: string | null;
  status?: string | null;
  preview_url?: string | null;
  follow_up_1?: string | null;
  follow_up_2?: string | null;
  follow_up_3?: string | null;
  follow_up_1_sent?: boolean | null;
  follow_up_2_sent?: boolean | null;
  follow_up_3_sent?: boolean | null;
  follow_up_count?: number | null;
};

type FollowUpStage = 1 | 2 | 3;

function getSupabaseAdmin() {
  const url = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) return null;
  return createServiceClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isStoppedStatus(status: string) {
  const s = status.toLowerCase().trim();
  return s === "replied" || s === "closed" || s === "closed_won" || s === "closed_lost" || s === "do_not_contact";
}

function isDue(ts: string | null | undefined, now: Date) {
  const raw = String(ts || "").trim();
  if (!raw) return false;
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return false;
  return dt.getTime() <= now.getTime();
}

function pickDueStage(lead: LeadRow, now: Date): FollowUpStage | null {
  const sent1 = Boolean(lead.follow_up_1_sent);
  const sent2 = Boolean(lead.follow_up_2_sent);
  const sent3 = Boolean(lead.follow_up_3_sent);

  if (isDue(lead.follow_up_3, now) && !sent3) return 3;
  if (isDue(lead.follow_up_2, now) && !sent2) return 2;
  if (isDue(lead.follow_up_1, now) && !sent1) return 1;
  return null;
}

function followUpCopy(stage: FollowUpStage) {
  if (stage === 1) {
    return "Just wanted to follow up in case you missed my last message";
  }
  if (stage === 2) {
    return "Quick question - is improving your site something you've thought about?";
  }
  return "I'll make this my last message - feel free to reach out anytime";
}

function buildFollowUpEmail(lead: LeadRow, stage: FollowUpStage) {
  const business = String(lead.business_name || "there").trim();
  const previewUrl = String(lead.preview_url || "").trim();
  const subject = `Quick idea for ${business}`;
  const lines = [
    `Hi ${business},`,
    "",
    followUpCopy(stage),
    "",
  ];
  if (previewUrl) {
    lines.push("Here is the preview again:", "");
    lines.push(previewUrl, "");
  }
  lines.push(" - Topher", "Topher's Web Design");
  return {
    subject,
    body: lines.join("\n"),
  };
}

async function sendViaResend(toEmail: string, subject: string, body: string) {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const fromEmail = String(process.env.RESEND_FROM_EMAIL || process.env.BOOKING_FROM_EMAIL || "").trim();
  if (!apiKey || !fromEmail) {
    return { ok: false, error: "Missing RESEND_API_KEY or RESEND_FROM_EMAIL." };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "mixedmakershop-followups/1.0",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject,
      text: body,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: text || "Resend send failed." };
  }
  const bodyJson = (await res.json().catch(() => ({}))) as { id?: string };
  return { ok: true, provider_message_id: String(bodyJson.id || "").trim() || null };
}

function authorized(request: Request) {
  const configured = String(process.env.FOLLOW_UP_CRON_SECRET || "").trim();
  if (!configured) return true;
  const provided =
    String(request.headers.get("x-cron-secret") || "").trim() ||
    String(request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  return configured === provided;
}

async function runFollowUps() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Server config missing for Supabase admin." }, { status: 500 });
  }
  const now = new Date();

  const { data, error } = await supabase
    .from("leads")
    .select(
      "id,owner_id,workspace_id,linked_opportunity_id,business_name,email,industry,status,preview_url,follow_up_1,follow_up_2,follow_up_3,follow_up_1_sent,follow_up_2_sent,follow_up_3_sent,follow_up_count"
    )
    .eq("outreach_sent", true)
    .not("email", "is", null)
    .order("created_at", { ascending: true })
    .limit(5000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []) as LeadRow[];
  let eligible = 0;
  let processed = 0;
  let sent = 0;
  let stopped = 0;
  let skippedNoDue = 0;
  let failed = 0;
  const sentByStage = { follow_up_1: 0, follow_up_2: 0, follow_up_3: 0 };

  for (const lead of rows) {
    const status = String(lead.status || "").trim();
    const to = String(lead.email || "").trim();
    if (!to) continue;
    if (isStoppedStatus(status)) {
      stopped += 1;
      continue;
    }
    eligible += 1;

    const stage = pickDueStage(lead, now);
    if (!stage) {
      skippedNoDue += 1;
      continue;
    }
    processed += 1;

    const email = buildFollowUpEmail(lead, stage);
    const sendResult = await sendViaResend(to, email.subject, email.body);
    if (!sendResult.ok) {
      failed += 1;
      continue;
    }

    const patch: Record<string, unknown> = {
      last_contacted_at: now.toISOString(),
      status: "follow_up_due",
      follow_up_count: Number(lead.follow_up_count || 0) + 1,
    };
    if (stage === 1) {
      patch.follow_up_1_sent = true;
      patch.next_follow_up_at = lead.follow_up_2 || null;
      sentByStage.follow_up_1 += 1;
    } else if (stage === 2) {
      patch.follow_up_2_sent = true;
      patch.next_follow_up_at = lead.follow_up_3 || null;
      sentByStage.follow_up_2 += 1;
    } else {
      patch.follow_up_3_sent = true;
      patch.next_follow_up_at = null;
      sentByStage.follow_up_3 += 1;
    }

    const { error: updateError } = await supabase
      .from("leads")
      .update(patch)
      .eq("id", lead.id)
      .eq("owner_id", lead.owner_id);

    if (updateError) {
      failed += 1;
      continue;
    }
    sent += 1;
  }

  return NextResponse.json({
    ok: true,
    ran_at: now.toISOString(),
    leads_scanned: rows.length,
    eligible_not_closed_with_email: eligible,
    stopped_due_to_status: stopped,
    due_for_send: processed,
    sent,
    failed,
    skipped_no_due_followup: skippedNoDue,
    sent_breakdown: sentByStage,
  });
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runFollowUps();
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runFollowUps();
}
