/**
 * Post-submission thank-you email for /free-mockup (Resend).
 * Best-effort: callers should not fail the HTTP response if this returns ok: false.
 */

import { mockupReplyToEmail, sendResendEmail } from "@/lib/resend-config";

function buildMockupConfirmationBody(contactName: string): string {
  const name = contactName.trim() || "there";
  return [
    `Hey ${name} —`,
    "",
    "I got your request and I'm already looking it over.",
    "",
    "I'll start putting together your homepage preview and reach out if I need anything.",
    "",
    "You should hear from me within a day.",
    "",
    "– Topher",
  ].join("\n");
}

export async function sendMockupRequestConfirmationEmail(opts: {
  to: string;
  contactName: string;
  businessName: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const to = String(opts.to || "").trim();
  if (!to) {
    return { ok: false, error: "Missing recipient email." };
  }

  return sendResendEmail({
    to,
    replyTo: mockupReplyToEmail(),
    subject: "Got your request — working on your preview",
    text: buildMockupConfirmationBody(opts.contactName),
    userAgent: "mixedmakershop-mockup-confirm/1.0",
  });
}
