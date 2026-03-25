import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { recordLeadActivity } from "@/lib/lead-activity";
import { sendPrintInvoiceEmail } from "@/lib/crm/send-print-invoice-email";
import { isThreeDPrintLead } from "@/lib/crm/three-d-print-lead";

async function leadIdFromParams(params: Promise<{ id: string }> | { id: string }): Promise<string> {
  const resolved = await Promise.resolve(params);
  return String(resolved?.id || "").trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const postSchema = z.object({
  text: z.string().min(1).max(20000),
  subject: z.string().min(1).max(200).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const leadId = await leadIdFromParams(params);
  if (!leadId) return NextResponse.json({ error: "Lead id is required." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();

  const { data: row, error: loadErr } = await supabase
    .from("leads")
    .select("id,email,source,lead_source,category,lead_tags")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (loadErr) return NextResponse.json({ error: loadErr.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: "Lead not found in your workspace." }, { status: 404 });
  if (!isThreeDPrintLead(row as Record<string, unknown>)) {
    return NextResponse.json({ error: "This action is only for 3D printing jobs." }, { status: 400 });
  }

  const email = String((row as { email?: string | null }).email || "").trim();
  if (!email) {
    return NextResponse.json({ error: "Lead has no email address." }, { status: 400 });
  }

  const textBody = parsed.data.text;
  const subject =
    parsed.data.subject?.trim() ||
    "MixedMakerShop — your 3D print quote and payment";
  const html = `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.5;color:#111">${escapeHtml(textBody).replace(/\n/g, "<br/>")}</div>`;

  const replyTo =
    process.env.PRINT_REQUEST_NOTIFY_EMAIL?.trim() ||
    process.env.BOOKING_NOTIFY_EMAIL?.trim() ||
    null;

  const sent = await sendPrintInvoiceEmail({
    to: email,
    subject,
    html,
    text: textBody,
    replyTo,
  });
  if (!sent.ok) {
    return NextResponse.json({ error: sent.error }, { status: 502 });
  }

  const nowIso = new Date().toISOString();
  const { error: upErr } = await supabase
    .from("leads")
    .update({ last_contacted_at: nowIso, last_updated_at: nowIso })
    .eq("id", leadId)
    .eq("owner_id", ownerId);
  if (upErr) {
    return NextResponse.json(
      { error: `Email sent but could not update lead: ${upErr.message}` },
      { status: 207 },
    );
  }

  void recordLeadActivity(supabase, {
    ownerId,
    leadId,
    eventType: "payment_request_sent",
    message: "Quoted payment request emailed",
    meta: { channel: "email", subject },
  });

  return NextResponse.json({ ok: true });
}
