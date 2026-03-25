import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  PRINT_QUOTE_FOLLOWUP_1,
  PRINT_QUOTE_FOLLOWUP_2,
  printQuoteFollowupSubject,
} from "@/lib/print-quote-followup";
import { isManualOnlyMode, isManualTriggerRequest } from "@/lib/manual-mode";

export const maxDuration = 120;

function printFollowupsAutoEnabled(): boolean {
  const v = String(process.env.PRINT_QUOTE_FOLLOWUPS_AUTO || "").trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(v);
}

type FormRow = {
  id: string;
  email: string | null;
  name: string | null;
  created_at: string;
  print_quote_followup_1_sent_at: string | null;
  print_quote_followup_2_sent_at: string | null;
  print_quote_followup_disabled: boolean | null;
};

type LeadRow = {
  status: string | null;
  last_reply_at: string | null;
  last_contacted_at: string | null;
  updated_at: string | null;
  created_at: string | null;
  source: string | null;
  lead_source: string | null;
};

const MS_HOUR = 3600_000;
const MS_DAY = 24 * MS_HOUR;
/** Between follow-up 1 and 2 (within 48–72h window). */
const F2_AFTER_F1_MS = 60 * MS_HOUR;

function notifyReplyTo(): string {
  return (
    process.env.PRINT_REQUEST_NOTIFY_EMAIL?.trim() ||
    process.env.BOOKING_NOTIFY_EMAIL?.trim() ||
    "Topher@mixedmakershop.com"
  );
}

function cronAuthorized(request: Request): boolean {
  const configured =
    String(process.env.PRINT_QUOTE_FOLLOWUP_CRON_SECRET || "").trim() ||
    String(process.env.FOLLOW_UP_CRON_SECRET || "").trim();
  if (!configured) return true;
  const provided =
    String(request.headers.get("x-cron-secret") || "").trim() ||
    String(request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  return configured === provided;
}

function terminalLeadStatus(status: string): boolean {
  const s = status.toLowerCase().trim();
  return s === "won" || s === "lost";
}

function shouldSuppressForLead(lead: LeadRow | null, submissionCreatedAt: string): boolean {
  if (!lead) return false;
  const st = String(lead.status || "").toLowerCase().trim();
  if (terminalLeadStatus(st)) return true;
  if (st === "replied") return true;
  const subMs = new Date(submissionCreatedAt).getTime();
  const lr = lead.last_reply_at ? new Date(lead.last_reply_at).getTime() : 0;
  if (lr > subMs) return true;
  return false;
}

/**
 * True if CRM shows the business engaged after this submission (status moves past new,
 * or last_contacted_at / updates land after submit).
 */
function businessEngagedAfterSubmit(lead: LeadRow | null, submissionCreatedAt: string): boolean {
  if (!lead) return false;
  const t0 = new Date(submissionCreatedAt).getTime();
  const lc = lead.last_contacted_at ? new Date(lead.last_contacted_at).getTime() : 0;
  if (lc > t0) return true;
  const st = String(lead.status || "").toLowerCase().trim();
  if (st && st !== "new") {
    const updated = new Date(lead.updated_at || lead.created_at || 0).getTime();
    if (updated > t0 + 120_000) return true;
  }
  return false;
}

/** First follow-up due: 24h after request if no business touch; else 48h after last business touch signal. */
function firstFollowUpDueAt(lead: LeadRow | null, submissionCreatedAt: string): number {
  const t0 = new Date(submissionCreatedAt).getTime();
  if (!businessEngagedAfterSubmit(lead, submissionCreatedAt)) {
    return t0 + MS_DAY;
  }
  const touchMs = Math.max(
    lead?.last_contacted_at ? new Date(lead.last_contacted_at).getTime() : 0,
    new Date(lead?.updated_at || lead?.created_at || 0).getTime(),
  );
  return touchMs + 48 * MS_HOUR;
}

async function loadPrintQuoteLead(
  supabase: SupabaseClient,
  emailRaw: string,
  submittedAt: string,
): Promise<LeadRow | null> {
  const email = emailRaw.trim();
  if (!email) return null;
  const subMs = new Date(submittedAt).getTime();
  const lo = new Date(subMs - 7 * MS_DAY).toISOString();
  const hi = new Date(subMs + 7 * MS_DAY).toISOString();
  const { data, error } = await supabase
    .from("leads")
    .select("status,last_reply_at,last_contacted_at,updated_at,created_at,source,lead_source")
    .ilike("email", email)
    .gte("created_at", lo)
    .lte("created_at", hi)
    .order("created_at", { ascending: false })
    .limit(25);

  if (error || !data?.length) return null;
  const printQuote = data.find((r) => {
    const row = r as LeadRow;
    const s = String(row.source || "").toLowerCase();
    const l = String(row.lead_source || "").toLowerCase();
    return (
      s === "print_quote" ||
      l === "print_quote" ||
      s === "3d_printing" ||
      l === "3d_printing"
    );
  });
  return (printQuote || data[0]) as LeadRow;
}

async function sendViaResend(toEmail: string, subject: string, body: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const fromEmail = String(process.env.RESEND_FROM_EMAIL || process.env.BOOKING_FROM_EMAIL || "").trim();
  if (!apiKey || !fromEmail) {
    return { ok: false, error: "Missing RESEND_API_KEY or RESEND_FROM_EMAIL." };
  }
  const replyTo = notifyReplyTo();
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "mixedmakershop-print-quote-followup/1.0",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: replyTo,
      subject,
      text: body,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    return { ok: false, error: t || `HTTP ${res.status}` };
  }
  return { ok: true };
}

async function runPrintQuoteFollowups() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const supabase = createClient(url, key);
  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  const { data, error } = await supabase
    .from("form_submissions")
    .select(
      "id,email,name,created_at,print_quote_followup_1_sent_at,print_quote_followup_2_sent_at,print_quote_followup_disabled",
    )
    .eq("form_type", "print_quote")
    .not("email", "is", null)
    .eq("print_quote_followup_disabled", false)
    .is("print_quote_followup_2_sent_at", null)
    .lte("created_at", new Date(now - MS_DAY).toISOString())
    .order("created_at", { ascending: true })
    .limit(80);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []) as FormRow[];
  let scanned = 0;
  let sent1 = 0;
  let sent2 = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    scanned += 1;
    const email = String(row.email || "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      skipped += 1;
      continue;
    }
    const lead = await loadPrintQuoteLead(supabase, email, row.created_at);
    if (shouldSuppressForLead(lead, row.created_at)) {
      skipped += 1;
      continue;
    }

    const f1Due = firstFollowUpDueAt(lead, row.created_at);

    if (!row.print_quote_followup_1_sent_at) {
      if (now < f1Due) {
        skipped += 1;
        continue;
      }
      const sent = await sendViaResend(email, printQuoteFollowupSubject(1), PRINT_QUOTE_FOLLOWUP_1);
      if (!sent.ok) {
        failed += 1;
        console.error("[print-quote-followup] F1 send failed", row.id, sent.error);
        continue;
      }
      const { error: upErr } = await supabase
        .from("form_submissions")
        .update({ print_quote_followup_1_sent_at: nowIso })
        .eq("id", row.id)
        .is("print_quote_followup_1_sent_at", null);

      if (upErr) {
        failed += 1;
        console.error("[print-quote-followup] F1 DB update failed", row.id, upErr);
        continue;
      }
      sent1 += 1;
      continue;
    }

    const f1Ms = new Date(row.print_quote_followup_1_sent_at).getTime();
    if (Number.isNaN(f1Ms)) {
      skipped += 1;
      continue;
    }
    if (now < f1Ms + F2_AFTER_F1_MS) {
      skipped += 1;
      continue;
    }

    const leadForF2 = await loadPrintQuoteLead(supabase, email, row.created_at);
    if (shouldSuppressForLead(leadForF2, row.created_at)) {
      skipped += 1;
      continue;
    }

    const sent2res = await sendViaResend(email, printQuoteFollowupSubject(2), PRINT_QUOTE_FOLLOWUP_2);
    if (!sent2res.ok) {
      failed += 1;
      console.error("[print-quote-followup] F2 send failed", row.id, sent2res.error);
      continue;
    }
    const { error: up2 } = await supabase
      .from("form_submissions")
      .update({ print_quote_followup_2_sent_at: nowIso })
      .eq("id", row.id)
      .is("print_quote_followup_2_sent_at", null);

    if (up2) {
      failed += 1;
      console.error("[print-quote-followup] F2 DB update failed", row.id, up2);
      continue;
    }
    sent2 += 1;
  }

  return NextResponse.json({
    ok: true,
    ran_at: nowIso,
    scanned,
    follow_up_1_sent: sent1,
    follow_up_2_sent: sent2,
    skipped,
    failed,
  });
}

export async function GET(request: Request) {
  const bypassManual = printFollowupsAutoEnabled();
  if (!bypassManual && isManualOnlyMode() && !isManualTriggerRequest(request)) {
    return NextResponse.json(
      {
        ok: false,
        manual_only_mode: true,
        message:
          "Set PRINT_QUOTE_FOLLOWUPS_AUTO=true for Vercel cron, or MANUAL_ONLY_MODE=false, or pass manual_trigger=1.",
      },
      { status: 403 },
    );
  }
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runPrintQuoteFollowups();
}

export async function POST(request: Request) {
  return GET(request);
}
