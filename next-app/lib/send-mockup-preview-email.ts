/**
 * Admin “send mockup preview” email to a lead (Resend).
 */

function ownerReplyToEmail(): string {
  return (
    process.env.MOCKUP_REPLY_TO_EMAIL?.trim() ||
    process.env.PRINT_REQUEST_NOTIFY_EMAIL?.trim() ||
    process.env.BOOKING_NOTIFY_EMAIL?.trim() ||
    "Topher@mixedmakershop.com"
  );
}

function buildMockupPreviewBody(contactName: string, businessName: string, previewUrl: string): string {
  const name = contactName.trim() || "there";
  const biz = businessName.trim() || "your business";
  const link = previewUrl.trim();
  return [
    `Hey ${name},`,
    "",
    `I put together a homepage preview for ${biz}.`,
    "",
    `👉 ${link}`,
    "",
    "This direction is built to:",
    "- make your business look more professional",
    "- clearly show what you offer",
    "- help turn visitors into actual leads",
    "",
    "Take a look and let me know what stands out to you — good or bad.",
    "",
    "If you like where this is going, I can build the full site and get it live for you.",
    "",
    "– Topher",
  ].join("\n");
}

export async function sendMockupPreviewEmail(opts: {
  to: string;
  contactName: string;
  businessName: string;
  previewUrl: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const fromEmail = String(
    process.env.RESEND_FROM_EMAIL || process.env.BOOKING_FROM_EMAIL || "",
  ).trim();
  if (!apiKey || !fromEmail) {
    return { ok: false, error: "Missing RESEND_API_KEY or RESEND_FROM_EMAIL." };
  }

  const to = String(opts.to || "").trim();
  if (!to) {
    return { ok: false, error: "Missing recipient email." };
  }

  const previewUrl = String(opts.previewUrl || "").trim();
  if (!previewUrl) {
    return { ok: false, error: "Missing preview URL." };
  }

  const text = buildMockupPreviewBody(opts.contactName, opts.businessName, previewUrl);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "mixedmakershop-mockup-preview/1.0",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      reply_to: ownerReplyToEmail(),
      subject: "Here's your website preview",
      text,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    const detail = body || `HTTP ${res.status}`;
    return { ok: false, error: `Resend mockup preview failed: ${detail}` };
  }
  return { ok: true };
}
