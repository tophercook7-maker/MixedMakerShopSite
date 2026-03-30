/**
 * Post-submission thank-you email for /free-mockup (Resend).
 * Best-effort: callers should not fail the HTTP response if this returns ok: false.
 */

function ownerReplyToEmail(): string {
  return (
    process.env.MOCKUP_REPLY_TO_EMAIL?.trim() ||
    process.env.PRINT_REQUEST_NOTIFY_EMAIL?.trim() ||
    process.env.BOOKING_NOTIFY_EMAIL?.trim() ||
    "Topher@mixedmakershop.com"
  );
}

function buildMockupConfirmationBody(contactName: string, businessName: string): string {
  const name = contactName.trim() || "there";
  const biz = businessName.trim() || "your business";
  return [
    `Hey ${name},`,
    "",
    "Got your request — I'm on it.",
    "",
    `I'll be putting together a custom homepage mockup for ${biz} so you can see what your site could look like before committing to anything.`,
    "",
    "If you sent your current site, I'll review it.",
    "If not, I'll build something fresh based on what you told me.",
    "",
    "If there's anything specific you want me to focus on, just reply and let me know.",
    "",
    "I'll be back in touch soon.",
    "",
    "– Topher",
  ].join("\n");
}

export async function sendMockupRequestConfirmationEmail(opts: {
  to: string;
  contactName: string;
  businessName: string;
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

  const text = buildMockupConfirmationBody(opts.contactName, opts.businessName);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "mixedmakershop-mockup-confirm/1.0",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      reply_to: ownerReplyToEmail(),
      subject: "Got your mockup request 👍",
      text,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    const detail = body || `HTTP ${res.status}`;
    return { ok: false, error: `Resend mockup confirmation failed: ${detail}` };
  }
  return { ok: true };
}
