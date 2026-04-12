/**
 * Opens Gmail’s **compose** UI with To / Subject / Body prefilled (no OAuth).
 * The recipient still controls send vs. saving a draft in Gmail.
 */
export function buildGmailComposeUrl(params: { to: string; subject: string; body: string }): string {
  const to = String(params.to || "").trim();
  const subject = String(params.subject || "").trim();
  const body = String(params.body || "");
  const u = new URL("https://mail.google.com/mail/u/0/");
  u.searchParams.set("view", "cm");
  u.searchParams.set("fs", "1");
  if (to) u.searchParams.set("to", to);
  if (subject) u.searchParams.set("su", subject);
  if (body) u.searchParams.set("body", body);
  return u.toString();
}
