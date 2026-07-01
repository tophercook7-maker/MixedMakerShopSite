/**
 * Shared Resend configuration — single place for API key / from-address fallbacks
 * so public funnels (mockup, leads, print) behave consistently in production.
 */

export function trimEnv(value: unknown): string {
  return String(value || "").trim();
}

/** Supports historical RESEND_AQPI_KEY typo in Vercel env. */
export function resendApiKey(): string {
  return trimEnv(process.env.RESEND_API_KEY || process.env.RESEND_AQPI_KEY);
}

export function resendFromEmail(): string {
  return trimEnv(
    process.env.RESEND_FROM_EMAIL ||
      process.env.BOOKING_FROM_EMAIL ||
      "Mixed Maker Shop <onboarding@resend.dev>",
  );
}

export function leadNotifyEmail(): string {
  return trimEnv(process.env.LEAD_NOTIFY_EMAIL) || "Topher@mixedmakershop.com";
}

export function mockupReplyToEmail(): string {
  return (
    trimEnv(process.env.MOCKUP_REPLY_TO_EMAIL) ||
    trimEnv(process.env.PRINT_REQUEST_NOTIFY_EMAIL) ||
    trimEnv(process.env.BOOKING_NOTIFY_EMAIL) ||
    "Topher@mixedmakershop.com"
  );
}

export type ResendSendResult = { ok: true } | { ok: false; error: string };

export async function sendResendEmail(opts: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  userAgent: string;
}): Promise<ResendSendResult> {
  const apiKey = resendApiKey();
  const from = resendFromEmail();
  if (!apiKey) return { ok: false, error: "Missing RESEND_API_KEY." };
  if (!from) return { ok: false, error: "Missing RESEND_FROM_EMAIL or BOOKING_FROM_EMAIL." };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": opts.userAgent,
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      subject: opts.subject,
      text: opts.text,
      ...(opts.html ? { html: opts.html } : {}),
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, error: `Resend failed: ${body || `HTTP ${res.status}`}` };
  }
  return { ok: true };
}

export function resendConfigStatus(): Record<string, boolean> {
  return {
    RESEND_API_KEY: Boolean(trimEnv(process.env.RESEND_API_KEY)),
    RESEND_AQPI_KEY_FALLBACK: Boolean(trimEnv(process.env.RESEND_AQPI_KEY)),
    RESEND_FROM_EMAIL: Boolean(trimEnv(process.env.RESEND_FROM_EMAIL)),
    BOOKING_FROM_EMAIL: Boolean(trimEnv(process.env.BOOKING_FROM_EMAIL)),
    LEAD_NOTIFY_EMAIL: Boolean(trimEnv(process.env.LEAD_NOTIFY_EMAIL)),
  };
}
