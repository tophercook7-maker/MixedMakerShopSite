import type { InboundLeadSubmissionInput } from "@/lib/crm/inbound-lead-submission";

export type LeadNotificationInput = {
  leadId?: string | null;
  formSubmissionId?: string | null;
  duplicateSkipped?: boolean;
  duplicateReason?: string | null;
  submission: InboundLeadSubmissionInput;
};

export type LeadNotificationResult = { ok: true } | { ok: false; error: string };

type EmergencyLeadNotificationInput = {
  requestId?: string;
  error: string;
  payload: unknown;
};

function trim(value: unknown): string {
  return String(value || "").trim();
}

function notifyEmail(): string {
  return trim(process.env.LEAD_NOTIFY_EMAIL) || "Topher@mixedmakershop.com";
}

function resendApiKey(): string {
  // RESEND_AQPI_KEY is a historical Vercel typo; keep it as a fallback so lead capture does not silently lose email.
  return trim(process.env.RESEND_API_KEY || process.env.RESEND_AQPI_KEY);
}

function fromEmail(): string {
  return trim(process.env.RESEND_FROM_EMAIL || process.env.BOOKING_FROM_EMAIL || "Topher@mixedmakershop.com");
}

function sourceLabel(submission: InboundLeadSubmissionInput): string {
  return trim(submission.source || submission.lead_source || submission.form_type || "public_lead");
}

function displayName(submission: InboundLeadSubmissionInput): string {
  return trim(submission.name || submission.contact_name || submission.business_name) || "Unknown lead";
}

function businessName(submission: InboundLeadSubmissionInput): string {
  return trim(submission.business_name) || trim(submission.name) || "Mixed Maker Shop lead";
}

function firstPresent(...values: Array<string | undefined>): string {
  return values.map(trim).find(Boolean) || "(not provided)";
}

function buildText(input: LeadNotificationInput): string {
  const { submission } = input;
  const lines = [
    "New MixedMakerShop lead",
    "",
    `Lead ID: ${input.leadId || "(not available)"}`,
    `Form submission ID: ${input.formSubmissionId || "(not available)"}`,
    `Duplicate skipped: ${input.duplicateSkipped ? "yes" : "no"}`,
    input.duplicateReason ? `Duplicate reason: ${input.duplicateReason}` : "",
    "",
    `Source / form type: ${sourceLabel(submission)}`,
    `Name: ${firstPresent(submission.name, submission.contact_name)}`,
    `Business name: ${firstPresent(submission.business_name)}`,
    `Email: ${firstPresent(submission.email)}`,
    `Phone: ${firstPresent(submission.phone)}`,
    `Website: ${firstPresent(submission.website)}`,
    `Service type: ${firstPresent(submission.service_type)}`,
    `Category: ${firstPresent(submission.category, submission.industry)}`,
    "",
    "Full message / request:",
    firstPresent(submission.message, submission.request, submission.notes),
    "",
    submission.transcript ? "Captain Maker transcript:" : "",
    submission.transcript || "",
  ].filter((line) => line !== "");

  return lines.join("\n");
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildHtml(text: string): string {
  return `<div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
<h1 style="font-size:20px;margin:0 0 16px">New MixedMakerShop lead</h1>
<pre style="white-space:pre-wrap;font-family:Arial,sans-serif;background:#f6f6f6;border:1px solid #ddd;border-radius:12px;padding:16px">${escapeHtml(text)}</pre>
</div>`;
}

export function buildLeadNotificationSubject(submission: InboundLeadSubmissionInput): string {
  return `New MixedMakerShop lead: ${sourceLabel(submission)} - ${displayName(submission) || businessName(submission)}`;
}

export async function sendLeadNotificationEmail(input: LeadNotificationInput): Promise<LeadNotificationResult> {
  const apiKey = resendApiKey();
  const from = fromEmail();
  const to = notifyEmail();

  if (!apiKey) return { ok: false, error: "Missing RESEND_API_KEY." };
  if (!from) return { ok: false, error: "Missing RESEND_FROM_EMAIL or BOOKING_FROM_EMAIL." };

  const text = buildText(input);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "mixedmakershop-lead-notify/1.0",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: input.submission.email,
      subject: buildLeadNotificationSubject(input.submission),
      html: buildHtml(text),
      text,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, error: `Resend failed: ${body || `HTTP ${res.status}`}` };
  }

  return { ok: true };
}

export async function sendEmergencyLeadNotificationEmail(
  input: EmergencyLeadNotificationInput,
): Promise<LeadNotificationResult> {
  const apiKey = resendApiKey();
  const from = fromEmail();
  const to = notifyEmail();

  if (!apiKey) return { ok: false, error: "Missing RESEND_API_KEY." };
  if (!from) return { ok: false, error: "Missing RESEND_FROM_EMAIL or BOOKING_FROM_EMAIL." };

  const text = [
    "EMERGENCY MixedMakerShop lead capture failure",
    "",
    `Request ID: ${input.requestId || "(not provided)"}`,
    `Error: ${input.error}`,
    "",
    "Full public lead payload:",
    safeJson(input.payload),
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "mixedmakershop-lead-emergency/1.0",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `EMERGENCY MixedMakerShop lead save failed - ${input.requestId || "public lead"}`,
      html: buildHtml(text),
      text,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, error: `Resend failed: ${body || `HTTP ${res.status}`}` };
  }

  return { ok: true };
}

export async function sendTestLeadNotificationEmail(): Promise<LeadNotificationResult> {
  return sendLeadNotificationEmail({
    leadId: "test-notification",
    formSubmissionId: "test-form-submission",
    duplicateSkipped: false,
    submission: {
      submission_type: "public_lead",
      source: "notification_test",
      name: "Notification Test",
      business_name: "Mixed Maker Shop Test",
      email: "Topher@mixedmakershop.com",
      phone: "(501) 000-0000",
      website: "https://mixedmakershop.com",
      category: "Notification test",
      service_type: "lead_notification",
      message: "This is a test lead notification from the MixedMakerShop admin endpoint.",
      transcript: "Captain Maker: This is only a delivery test.",
    },
  });
}
