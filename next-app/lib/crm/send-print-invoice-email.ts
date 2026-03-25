export async function sendPrintInvoiceEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
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
      "User-Agent": "mixedmakershop-print-invoice/1.0",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [opts.to],
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    const detail = body || `HTTP ${res.status}`;
    return { ok: false, error: `Resend failed: ${detail}` };
  }
  return { ok: true };
}
