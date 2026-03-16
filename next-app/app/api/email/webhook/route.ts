import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const DEFAULT_TIMEOUT_MS = 12000;

function scoutBaseUrl() {
  return process.env.SCOUT_BRAIN_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
}

function extractEmailAddress(value: unknown): string {
  if (value && typeof value === "object") {
    const nested = String((value as { email?: unknown }).email || "").trim();
    if (nested) return nested.toLowerCase();
  }
  const raw = String(value || "").trim();
  if (!raw) return "";
  const match = raw.match(/<([^>]+)>/);
  if (match?.[1]) return match[1].trim().toLowerCase();
  return raw.toLowerCase();
}

function splitReferences(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((v) => String(v || "").trim())
      .filter(Boolean);
  }
  const raw = String(value || "").trim();
  if (!raw) return [];
  return raw
    .split(/[,\s]+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function createAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(request: Request) {
  const baseUrl = scoutBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { error: "SCOUT_BRAIN_API_BASE_URL is not configured." },
      { status: 500 }
    );
  }

  const configuredWebhookSecret =
    process.env.EMAIL_WEBHOOK_SECRET?.trim() ||
    process.env.INBOUND_EMAIL_WEBHOOK_SECRET?.trim() ||
    "";
  const incomingWebhookSecret =
    request.headers.get("x-email-webhook-secret")?.trim() ||
    request.headers.get("x-inbound-email-secret")?.trim() ||
    "";
  if (configuredWebhookSecret && incomingWebhookSecret !== configuredWebhookSecret) {
    return NextResponse.json({ error: "Unauthorized webhook request" }, { status: 401 });
  }

  const rawPayload = await request
    .json()
    .catch((): Record<string, unknown> => ({}));
  if (!rawPayload || typeof rawPayload !== "object") {
    return NextResponse.json({ error: "Invalid inbound payload" }, { status: 400 });
  }

  const fromEmail = extractEmailAddress(
    rawPayload.from_email ||
      rawPayload.from ||
      (rawPayload as { sender?: unknown }).sender ||
      (rawPayload as { reply_to?: unknown }).reply_to
  );
  const subject = String(rawPayload.subject || "").trim();
  const messageId = String(
    rawPayload.message_id ||
      rawPayload.provider_message_id ||
      rawPayload.id ||
      (rawPayload as { headers?: Record<string, unknown> }).headers?.["message-id"] ||
      ""
  ).trim();
  const inReplyTo = String(
    rawPayload.in_reply_to ||
      (rawPayload as { headers?: Record<string, unknown> }).headers?.["in-reply-to"] ||
      ""
  ).trim();
  const textBody = String(rawPayload.text || rawPayload.body || rawPayload.plain || "").trim();
  const htmlBody = String(rawPayload.html || "").trim();
  const body = textBody || htmlBody;
  const providerThreadId = String(
    rawPayload.thread_id || rawPayload.provider_thread_id || rawPayload.conversation_id || ""
  ).trim();
  const references = splitReferences(
    rawPayload.references ||
      (rawPayload as { headers?: Record<string, unknown> }).headers?.references
  );
  const workspaceId = String(rawPayload.workspace_id || "").trim();
  const receivedAt = String(rawPayload.received_at || rawPayload.timestamp || "").trim();

  if (!fromEmail || !body) {
    return NextResponse.json(
      { error: "Invalid inbound payload: from_email and body are required" },
      { status: 400 }
    );
  }
  console.info("[Email Webhook] inbound reply received", {
    hasFrom: Boolean(fromEmail),
    hasThread: Boolean(providerThreadId),
    hasMessageId: Boolean(messageId),
    hasInReplyTo: Boolean(inReplyTo),
    referenceCount: references.length,
  });

  const outboundPayload = {
    from_email: fromEmail,
    subject: subject || null,
    body,
    provider_message_id: messageId || null,
    provider_thread_id: providerThreadId || null,
    in_reply_to: inReplyTo || null,
    references,
    workspace_id: workspaceId || null,
    received_at: receivedAt || null,
  };

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const inboundSecret = process.env.INBOUND_EMAIL_WEBHOOK_SECRET?.trim() || "";
  if (inboundSecret) {
    headers["X-Inbound-Email-Secret"] = inboundSecret;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    const response = await fetch(`${baseUrl}/outreach/inbound`, {
      method: "POST",
      headers,
      body: JSON.stringify(outboundPayload),
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);

    const contentType = response.headers.get("content-type") || "";
    const bodyJson = contentType.includes("application/json")
      ? await response.json()
      : { detail: await response.text() };

    if (!response.ok) {
      console.warn("[Email Webhook] inbound processing failed", {
        status: response.status,
      });
      return NextResponse.json(
        {
          error: "Inbound reply processing failed",
          detail: bodyJson,
        },
        { status: response.status }
      );
    }

    const matched = Boolean((bodyJson as { matched?: boolean })?.matched);
    if (!matched) {
      console.warn("[Email Webhook] reply could not be matched");
      return NextResponse.json(
        {
          ok: true,
          matched: false,
          detail: bodyJson,
        },
        { status: 202 }
      );
    }
    console.info("[Email Webhook] reply matched to lead");

    // Best-effort local timeline sync for case-based outreach threads.
    try {
      const adminSb = createAdminSupabase();
      if (adminSb) {
        const { data: threadRows } = await adminSb
          .from("email_threads")
          .select("id,owner_id,provider_thread_id")
          .ilike("contact_email", fromEmail)
          .order("last_message_at", { ascending: false })
          .limit(20);
        const thread = (threadRows || []).find((row) => {
          const key = String((row as { provider_thread_id?: string | null }).provider_thread_id || "").trim();
          return key.startsWith("case:");
        }) || (threadRows || [])[0];
        const threadId = String((thread as { id?: string | null })?.id || "").trim();
        const ownerId = String((thread as { owner_id?: string | null })?.owner_id || "").trim();
        const providerThreadId = String((thread as { provider_thread_id?: string | null })?.provider_thread_id || "").trim();
        const nowIso = new Date().toISOString();
        if (threadId && ownerId) {
          await adminSb.from("email_messages").insert({
            thread_id: threadId,
            lead_id: null,
            direction: "inbound",
            provider_message_id: messageId || null,
            subject: subject || null,
            body,
            delivery_status: "received",
            received_at: nowIso,
            owner_id: ownerId,
          });
          await adminSb
            .from("email_threads")
            .update({ status: "active", last_message_at: nowIso })
            .eq("id", threadId);

          if (providerThreadId.startsWith("case:")) {
            const caseId = providerThreadId.slice(5).trim();
            if (caseId) {
              const { data: caseRows } = await adminSb
                .from("case_files")
                .select("notes")
                .eq("id", caseId)
                .limit(1);
              const prevNotes = String(caseRows?.[0]?.notes || "").trim();
              const mergedNotes = [prevNotes, `Reply received ${nowIso}`].filter(Boolean).join("\n");
              await adminSb
                .from("case_files")
                .update({ status: "replied", notes: mergedNotes })
                .eq("id", caseId);
            }
          }
        }
      }
    } catch (localSyncError) {
      console.warn("[Email Webhook] local case reply sync failed", localSyncError);
    }
    return NextResponse.json(bodyJson, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Inbound webhook relay failed",
      },
      { status: 502 }
    );
  }
}
