import { buildGmailComposeUrl } from "@/lib/gmail/build-gmail-compose-url";

export type CreateLeadFollowUpGmailDraftResult =
  | {
      ok: true;
      mode: "gmail_api";
      openUrl: string;
      draftId?: string;
      message: string;
    }
  | {
      ok: true;
      mode: "compose_url";
      openUrl: string;
      message: string;
    }
  | { ok: false; error: string; fallbackComposeUrl?: string };

function encodeRfc2822ForGmailApi(to: string, subject: string, body: string): string {
  const normalizedBody = body.replace(/\r?\n/g, "\r\n");
  const message =
    `To: ${to}\r\n` +
    `Subject: ${subject}\r\n` +
    `MIME-Version: 1.0\r\n` +
    `Content-Type: text/plain; charset=UTF-8\r\n` +
    `Content-Transfer-Encoding: 7bit\r\n` +
    `\r\n` +
    `${normalizedBody}\r\n`;
  return Buffer.from(message, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function gmailOAuthConfigured(): boolean {
  return Boolean(
    process.env.GMAIL_OAUTH_CLIENT_ID?.trim() &&
      process.env.GMAIL_OAUTH_CLIENT_SECRET?.trim() &&
      process.env.GMAIL_OAUTH_REFRESH_TOKEN?.trim(),
  );
}

/**
 * Creates a Gmail **draft** via API when OAuth env vars are set; otherwise returns a **compose deeplink**
 * (prefilled To/Subject/Body — user stays in control, no auto-send).
 */
export async function createLeadFollowUpGmailDraft(params: {
  to: string;
  subject: string;
  body: string;
}): Promise<CreateLeadFollowUpGmailDraftResult> {
  const to = String(params.to || "").trim();
  const subject = String(params.subject || "").trim();
  const body = String(params.body || "");
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { ok: false, error: "Invalid or missing recipient email." };
  }

  const fallbackComposeUrl = buildGmailComposeUrl({ to, subject, body });

  if (!gmailOAuthConfigured()) {
    return {
      ok: true,
      mode: "compose_url",
      openUrl: fallbackComposeUrl,
      message:
        "Gmail API credentials are not configured — use the link to open prefilled Gmail compose (save as draft or send when ready).",
    };
  }

  try {
    const { google } = await import("googleapis");
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_OAUTH_CLIENT_ID!.trim(),
      process.env.GMAIL_OAUTH_CLIENT_SECRET!.trim(),
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_OAUTH_REFRESH_TOKEN!.trim(),
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const raw = encodeRfc2822ForGmailApi(to, subject, body);
    const res = await gmail.users.drafts.create({
      userId: "me",
      requestBody: { message: { raw } },
    });

    const draftId = typeof res.data.id === "string" ? res.data.id : undefined;
    return {
      ok: true,
      mode: "gmail_api",
      draftId,
      openUrl: "https://mail.google.com/mail/u/0/#drafts",
      message: "Gmail draft created in your Drafts folder.",
    };
  } catch (err) {
    console.error("[gmail] createLeadFollowUpGmailDraft failed", err);
    return {
      ok: false,
      error: "Couldn’t create Gmail draft automatically. You can still copy the draft below.",
      fallbackComposeUrl,
    };
  }
}
