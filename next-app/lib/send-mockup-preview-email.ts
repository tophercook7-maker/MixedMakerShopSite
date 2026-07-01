/**
 * Admin “send mockup preview” email to a lead (Resend).
 */

import { buildPreviewShareEmailBodyWithGreeting, previewShareEmailSubject } from "@/lib/preview-share-copy";
import { mockupReplyToEmail, sendResendEmail } from "@/lib/resend-config";

export async function sendMockupPreviewEmail(opts: {
  to: string;
  contactName: string;
  businessName: string;
  previewUrl: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const to = String(opts.to || "").trim();
  if (!to) {
    return { ok: false, error: "Missing recipient email." };
  }

  const previewUrl = String(opts.previewUrl || "").trim();
  if (!previewUrl) {
    return { ok: false, error: "Missing preview URL." };
  }

  return sendResendEmail({
    to,
    replyTo: mockupReplyToEmail(),
    subject: previewShareEmailSubject(opts.businessName),
    text: buildPreviewShareEmailBodyWithGreeting(previewUrl, opts.contactName),
    userAgent: "mixedmakershop-mockup-preview/1.0",
  });
}
