/**
 * Shared SMTP fallback sender for lead notifications.
 *
 * The CRM-path notifier (send-lead-notification-email.ts) was hard-wired to
 * Resend, but RESEND_API_KEY is not set in production, so every notify silently
 * failed. This module reuses the SAME proven transport as lib/crm/lead-rescue.ts
 * — Gmail-first, Brevo-fallback — so notifications go out even without Resend.
 *
 * Gmail-to-self lands in the inbox; Brevo (a bulk relay) files as spam for this
 * domain, so it is fallback-only. Full rationale lives in lead-rescue.ts.
 */
import nodemailer from "nodemailer";

type SmtpRoute = {
  label: string;
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

function trim(value: unknown): string {
  return String(value || "").trim();
}

export function smtpRoutes(): SmtpRoute[] {
  const routes: SmtpRoute[] = [];

  const gUser = trim(process.env.GMAIL_USER);
  const gPass = trim(process.env.GMAIL_APP_PASSWORD);
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

  const bHost = trim(process.env.BREVO_HOST);
  const bUser = trim(process.env.BREVO_LOGIN);
  const bPass = trim(process.env.BREVO_KEY);
  const bFrom = trim(process.env.BREVO_FROM);
  if (bHost && bUser && bPass && bFrom) {
    routes.push({
      label: "brevo",
      host: bHost,
      port: Number(trim(process.env.BREVO_PORT) || "587"),
      user: bUser,
      pass: bPass,
      from: bFrom,
    });
  }

  return routes;
}

export type SmtpSendResult = { ok: true; via: string } | { ok: false; error: string };

export async function sendViaSmtp(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<SmtpSendResult> {
  const routes = smtpRoutes();
  if (!routes.length) {
    return { ok: false, error: "no SMTP route configured (GMAIL_USER/GMAIL_APP_PASSWORD or BREVO_*)" };
  }

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
        to: opts.to,
        // Reply in Gmail goes to the customer, not back to Topher.
        replyTo: opts.replyTo || undefined,
        subject: opts.subject,
        text: opts.text,
        ...(opts.html ? { html: opts.html } : {}),
      });
      return { ok: true, via: route.label };
    } catch (error) {
      failures.push(`${route.label}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return { ok: false, error: failures.join("; ") };
}
