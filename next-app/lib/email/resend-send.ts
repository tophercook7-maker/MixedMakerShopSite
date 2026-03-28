/**
 * Minimal Resend send helper (HTML + optional plain text).
 * Aligns with existing api routes that POST to api.resend.com/emails.
 */
export async function sendResendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  fromEmail: string;
  apiKey: string;
  replyTo?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const body: Record<string, unknown> = {
    from: opts.fromEmail,
    to: [opts.to],
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  };
  if (opts.replyTo) body.reply_to = opts.replyTo;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };
  if (!res.ok) {
    const detail = json?.message || json?.name || res.statusText;
    return { ok: false, error: `Resend: ${detail}` };
  }
  return { ok: true, id: String(json.id || "") };
}
