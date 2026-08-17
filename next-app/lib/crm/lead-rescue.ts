/**
 * LEAD RESCUE — the floor under every public form.
 *
 * Rule: a customer who fills out a form must NEVER see an error, and Topher must
 * ALWAYS learn about it. The Supabase CRM is the nice-to-have; this is the floor.
 *
 * Two independent channels, both free, neither depending on Supabase:
 *   1. EMAIL (durable record, carries the full details) -> Brevo SMTP -> Gmail
 *   2. NTFY  (instant phone buzz, deliberately carries NO contact details)
 *
 * Nothing in this file is allowed to throw. If both channels fail we still let the
 * customer through with a success message and leave a loud line in the Vercel log,
 * because a lead in a log beats a lead that bounced.
 */

import nodemailer from "nodemailer";

export type RescueOutcome = {
  emailed: boolean;
  buzzed: boolean;
  ref: string;
  errors: string[];
};

const NTFY_BASE = process.env.NTFY_BASE_URL?.trim() || "https://ntfy.sh";

function notifyEmail(): string {
  return (
    process.env.LEAD_NOTIFY_EMAIL?.trim() ||
    process.env.BOOKING_NOTIFY_EMAIL?.trim() ||
    "topher.cook7@gmail.com"
  );
}

/** Short human-quotable reference so a lead can be traced across email/phone/CRM. */
export function leadRef(payload: Record<string, unknown>): string {
  const seed = `${payload.email ?? ""}|${payload.business_name ?? payload.name ?? ""}`;
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const stamp = new Date().toISOString().slice(5, 10).replace("-", "");
  return `L${stamp}-${h.toString(36).toUpperCase().slice(0, 4)}`;
}

function pick(payload: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = payload[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

/** What we show on the phone: enough to decide, not enough to leak a customer. */
function buzzTitle(payload: Record<string, unknown>): string {
  const who = pick(payload, "business_name", "name", "contact_name") || "Someone";
  return `NEW LEAD - ${who}`;
}

function buildEmail(payload: Record<string, unknown>, ref: string, context: string) {
  const name = pick(payload, "contact_name", "name") || "(no name given)";
  const business = pick(payload, "business_name") || "(not given)";
  const email = pick(payload, "email");
  const phone = pick(payload, "phone") || "(not given)";
  const website = pick(payload, "website") || "(not given)";
  const source = pick(payload, "source", "lead_source", "form_type") || "website";
  const message = pick(payload, "message", "details", "notes") || "(no message)";

  const lines = [
    `NEW LEAD  ${ref}`,
    "",
    `Name:      ${name}`,
    `Business:  ${business}`,
    `Email:     ${email}`,
    `Phone:     ${phone}`,
    `Website:   ${website}`,
    `Source:    ${source}`,
    "",
    "What they said:",
    message,
    "",
    "----",
    "Reply to this person within the hour if you can - speed is the whole game.",
    `Captured by lead-rescue (${context}). Reply-to is set to the customer,`,
    "so hitting Reply in Gmail goes straight to them.",
  ];

  const text = lines.join("\n");
  const html = `<pre style="font:14px/1.5 ui-monospace,Menlo,monospace;white-space:pre-wrap">${text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")}</pre>`;

  return { text, html, email, name, business, source };
}

type MailRoute = {
  label: string;
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

/**
 * Delivery routes, best-first.
 *
 * GMAIL FIRST, and this ordering is load-bearing. Brevo authenticates perfectly
 * (SPF+DKIM+DMARC all pass) but it is a *bulk marketing* relay: it stamps
 * list-unsubscribe / feedback-id headers, and after this domain sent 203 cold
 * emails with zero engagement, Gmail files anything arriving on that rail as
 * spam. Verified on 2026-08-16: 7 of 7 lead alerts landed in Spam.
 *
 * Mail sent from Topher's own Gmail account to Topher's own Gmail account has
 * no such problem. Brevo stays as the fallback for when Gmail creds are absent.
 */
function mailRoutes(): MailRoute[] {
  const routes: MailRoute[] = [];

  const gUser = process.env.GMAIL_USER?.trim();
  const gPass = process.env.GMAIL_APP_PASSWORD?.trim();
  if (gUser && gPass) {
    routes.push({
      label: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      user: gUser,
      pass: gPass,
      from: gUser,
    });
  }

  const bHost = process.env.BREVO_HOST?.trim();
  const bUser = process.env.BREVO_LOGIN?.trim();
  const bPass = process.env.BREVO_KEY?.trim();
  const bFrom = process.env.BREVO_FROM?.trim();
  if (bHost && bUser && bPass && bFrom) {
    routes.push({
      label: "brevo",
      host: bHost,
      port: Number(process.env.BREVO_PORT?.trim() || "587"),
      user: bUser,
      pass: bPass,
      from: bFrom,
    });
  }

  return routes;
}

async function sendMail(
  payload: Record<string, unknown>,
  ref: string,
  context: string,
): Promise<{ ok: boolean; via?: string; error?: string }> {
  const routes = mailRoutes();
  if (!routes.length) return { ok: false, error: "no mail route configured" };

  const built = buildEmail(payload, ref, context);
  const subject = `NEW LEAD ${ref} - ${
    built.business !== "(not given)" ? built.business : built.name
  } (${built.source})`;
  const failures: string[] = [];

  for (const route of routes) {
    try {
      const transport = nodemailer.createTransport({
        host: route.host,
        port: route.port,
        secure: route.port === 465,
        auth: { user: route.user, pass: route.pass },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 8000,
      });
      await transport.sendMail({
        from: route.from,
        to: notifyEmail(),
        // Hitting Reply in Gmail goes to the customer, not to himself.
        replyTo: built.email || undefined,
        subject,
        text: built.text,
        html: built.html,
      });
      return { ok: true, via: route.label };
    } catch (error) {
      failures.push(`${route.label}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return { ok: false, error: failures.join("; ") };
}

async function sendViaNtfy(
  payload: Record<string, unknown>,
  ref: string,
): Promise<{ ok: boolean; error?: string }> {
  const topic = process.env.NTFY_TOPIC?.trim();
  if (!topic) return { ok: false, error: "ntfy topic missing" };

  const source = pick(payload, "source", "lead_source", "form_type") || "website";
  try {
    const res = await fetch(`${NTFY_BASE}/${encodeURIComponent(topic)}`, {
      method: "POST",
      headers: {
        Title: buzzTitle(payload),
        Priority: "high",
        Tags: "moneybag",
      },
      // Deliberately no email/phone here - ntfy topics are guessable URLs.
      body: `${ref} via ${source}. Full details are in your email - reply fast.`,
      signal: AbortSignal.timeout(6000),
    });
    return res.ok ? { ok: true } : { ok: false, error: `ntfy http ${res.status}` };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Deliver a lead by every channel we have. Never throws, never rejects.
 * `context` describes why rescue ran (which backend was missing) for the logs.
 */
export async function rescueLead(
  payload: unknown,
  context: string,
): Promise<RescueOutcome> {
  const body = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
  const ref = leadRef(body);
  const errors: string[] = [];

  const [mail, buzz] = await Promise.all([
    sendMail(body, ref, context).catch((e) => ({ ok: false, error: String(e) })),
    sendViaNtfy(body, ref).catch((e) => ({ ok: false, error: String(e) })),
  ]);

  if (!mail.ok && mail.error) errors.push(`email: ${mail.error}`);
  if (!buzz.ok && buzz.error) errors.push(`ntfy: ${buzz.error}`);

  // Structured, greppable, and it contains the whole lead. Even in total failure
  // the lead is recoverable from `vercel logs`.
  const level = mail.ok || buzz.ok ? "info" : "error";
  const line = {
    tag: "LEAD_RESCUE",
    ref,
    context,
    emailed: mail.ok,
    via: (mail as { via?: string }).via,
    buzzed: buzz.ok,
    errors,
    lead: body,
  };
  if (level === "error") console.error("[lead-rescue] LEAD NOT DELIVERED", line);
  else console.info("[lead-rescue] delivered", line);

  return { emailed: mail.ok, buzzed: buzz.ok, ref, errors };
}
