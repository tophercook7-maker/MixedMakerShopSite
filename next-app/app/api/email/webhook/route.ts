import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { logCrmAutomationEvent } from "@/lib/crm/automation-log";

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

function normalizeSubject(subject: string): string {
  return String(subject || "")
    .toLowerCase()
    .replace(/^(re|fw|fwd)\s*:\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildReplyPreview(body: string, max = 220): string {
  return String(body || "").replace(/\s+/g, " ").trim().slice(0, max);
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
  const toEmail = extractEmailAddress(
    rawPayload.to ||
      rawPayload.recipient ||
      (rawPayload as { delivered_to?: unknown }).delivered_to
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

    // Local reply detection + matching + pipeline status update.
    try {
      const adminSb = createAdminSupabase();
      const counters = {
        inbound_messages_received: 1,
        replies_matched: 0,
        replies_unmatched: 0,
        duplicate_replies_skipped: 0,
      };
      if (adminSb) {
        const nowIso = new Date().toISOString();

        // De-dup by provider message id if we already processed this inbound.
        if (messageId) {
          const duplicateCheck = await adminSb
            .from("email_messages")
            .select("id")
            .eq("provider_message_id", messageId)
            .limit(1);
          if ((duplicateCheck.data || [])[0]?.id) {
            counters.duplicate_replies_skipped += 1;
            return NextResponse.json({ ...(bodyJson as object), counters }, { status: 200 });
          }
        }

        let matchedThreadId = "";
        let matchedLeadId = "";
        let matchedOwnerId = "";
        let matchStrategy = "unmatched";

        // 1) provider thread id linkage.
        if (providerThreadId) {
          const byThread = await adminSb
            .from("email_threads")
            .select("id,lead_id,owner_id")
            .eq("provider_thread_id", providerThreadId)
            .order("last_message_at", { ascending: false, nullsFirst: false })
            .limit(1);
          const row = (byThread.data || [])[0] as
            | { id?: string | null; lead_id?: string | null; owner_id?: string | null }
            | undefined;
          matchedThreadId = String(row?.id || "").trim();
          matchedLeadId = String(row?.lead_id || "").trim();
          matchedOwnerId = String(row?.owner_id || "").trim();
          if (matchedThreadId && matchedOwnerId) matchStrategy = "provider_thread_id";
        }

        // 2) in_reply_to / references headers.
        if (!matchedThreadId || !matchedOwnerId) {
          const headerIds = [inReplyTo, ...references].map((v) => String(v || "").trim()).filter(Boolean);
          if (headerIds.length) {
            const byHeaders = await adminSb
              .from("email_messages")
              .select("thread_id,lead_id,owner_id,provider_message_id,created_at,direction")
              .in("provider_message_id", headerIds)
              .order("created_at", { ascending: false })
              .limit(50);
            const row = ((byHeaders.data || []) as Array<Record<string, unknown>>).find(
              (item) => String(item.direction || "") === "outbound"
            );
            if (row) {
              matchedThreadId = String(row.thread_id || "").trim();
              matchedLeadId = String(row.lead_id || "").trim();
              matchedOwnerId = String(row.owner_id || "").trim();
              if (matchedThreadId && matchedOwnerId) matchStrategy = "in_reply_to_or_references";
            }
          }
        }

        // 3) recipient_email + normalized subject.
        if (!matchedThreadId || !matchedOwnerId) {
          const recipientMatchEmail = fromEmail || toEmail;
          if (recipientMatchEmail) {
            const outboundByRecipient = await adminSb
              .from("email_messages")
              .select("thread_id,lead_id,owner_id,subject,created_at,direction,recipient_email")
              .eq("direction", "outbound")
              .ilike("recipient_email", recipientMatchEmail)
              .order("created_at", { ascending: false })
              .limit(150);
            const normalizedInboundSubject = normalizeSubject(subject);
            const candidates = (outboundByRecipient.data || []) as Array<Record<string, unknown>>;
            const exact = candidates.find(
              (row) =>
                normalizedInboundSubject &&
                normalizeSubject(String(row.subject || "")) === normalizedInboundSubject
            );
            const row = exact || candidates[0];
            if (row) {
              matchedThreadId = String(row.thread_id || "").trim();
              matchedLeadId = String(row.lead_id || "").trim();
              matchedOwnerId = String(row.owner_id || "").trim();
              if (matchedThreadId && matchedOwnerId) matchStrategy = "recipient_email_subject";
            }
          }
        }

        // 4) sender email + recent outbound thread fallback.
        if (!matchedThreadId || !matchedOwnerId) {
          const byContact = await adminSb
            .from("email_threads")
            .select("id,lead_id,owner_id")
            .ilike("contact_email", fromEmail)
            .order("last_message_at", { ascending: false, nullsFirst: false })
            .limit(1);
          const row = (byContact.data || [])[0] as
            | { id?: string | null; lead_id?: string | null; owner_id?: string | null }
            | undefined;
          matchedThreadId = String(row?.id || "").trim();
          matchedLeadId = String(row?.lead_id || "").trim();
          matchedOwnerId = String(row?.owner_id || "").trim();
          if (matchedThreadId && matchedOwnerId) matchStrategy = "sender_email_recent_thread";
        }

        // Last fallback: try lead by sender email so reply still lands in CRM.
        if (!matchedOwnerId) {
          const byLeadEmail = await adminSb
            .from("leads")
            .select("id,owner_id")
            .ilike("email", fromEmail)
            .order("created_at", { ascending: false })
            .limit(1);
          const row = (byLeadEmail.data || [])[0] as { id?: string | null; owner_id?: string | null } | undefined;
          matchedLeadId = matchedLeadId || String(row?.id || "").trim();
          matchedOwnerId = String(row?.owner_id || "").trim();
          if (matchedLeadId && matchedOwnerId) matchStrategy = "lead_email_fallback";
        }

        if (!matchedOwnerId) {
          counters.replies_unmatched += 1;
          return NextResponse.json(
            { ...(bodyJson as object), counters, match_strategy: "unmatched" },
            { status: 202 }
          );
        }

        // Create a thread if none matched.
        if (!matchedThreadId) {
          const insertedThread = await adminSb
            .from("email_threads")
            .insert({
              workspace_id: workspaceId || null,
              lead_id: matchedLeadId || null,
              contact_email: fromEmail,
              subject: subject || null,
              provider_thread_id: providerThreadId || null,
              status: "active",
              last_message_at: nowIso,
              owner_id: matchedOwnerId,
            })
            .select("id")
            .limit(1);
          matchedThreadId = String((insertedThread.data || [])[0]?.id || "").trim();
          if (matchedThreadId) matchStrategy = `${matchStrategy}+new_thread`;
        }

        // Additional dedupe for webhook retries without provider id.
        if (!messageId && matchedThreadId) {
          const dupFallback = await adminSb
            .from("email_messages")
            .select("id,subject,body")
            .eq("thread_id", matchedThreadId)
            .eq("direction", "inbound")
            .order("created_at", { ascending: false })
            .limit(25);
          const duplicateFallback = ((dupFallback.data || []) as Array<Record<string, unknown>>).some(
            (row) =>
              String(row.subject || "").trim() === subject &&
              String(row.body || "").trim() === body
          );
          if (duplicateFallback) {
            counters.duplicate_replies_skipped += 1;
            return NextResponse.json({ ...(bodyJson as object), counters, match_strategy: matchStrategy }, { status: 200 });
          }
        }

        await adminSb.from("email_messages").insert({
          thread_id: matchedThreadId || null,
          lead_id: matchedLeadId || null,
          direction: "inbound",
          provider_message_id: messageId || null,
          in_reply_to: inReplyTo || null,
          references: references.length ? references : null,
          subject: subject || null,
          body,
          delivery_status: "received",
          received_at: receivedAt || nowIso,
          owner_id: matchedOwnerId,
          recipient_email: toEmail || null,
          message_kind: "reply",
        });

        await adminSb
          .from("email_threads")
          .update({
            lead_id: matchedLeadId || undefined,
            provider_thread_id: providerThreadId || undefined,
            status: "active",
            subject: subject || undefined,
            last_message_at: receivedAt || nowIso,
          })
          .eq("id", matchedThreadId)
          .eq("owner_id", matchedOwnerId);

        const replyPreview = buildReplyPreview(body);
        if (matchedLeadId) {
          let nextUnread = 1;
          const { data: unreadRow } = await adminSb
            .from("leads")
            .select("unread_reply_count")
            .eq("id", matchedLeadId)
            .eq("owner_id", matchedOwnerId)
            .maybeSingle();
          nextUnread = (Number((unreadRow as { unread_reply_count?: number } | null)?.unread_reply_count) || 0) + 1;

          const fullPatch = {
            status: "replied",
            is_hot_lead: true,
            recommended_next_action: "Reply to Lead",
            replied_at: receivedAt || nowIso,
            last_reply_at: receivedAt || nowIso,
            last_reply_preview: replyPreview,
            last_contacted_at: receivedAt || nowIso,
            next_follow_up_at: null,
            follow_up_1_sent: true,
            follow_up_2_sent: true,
            follow_up_3_sent: true,
            follow_up_1: null,
            follow_up_2: null,
            follow_up_3: null,
            sequence_active: false,
            automation_paused: true,
            follow_up_status: "completed",
            unread_reply_count: nextUnread,
          };
          const updateFull = await adminSb
            .from("leads")
            .update(fullPatch)
            .eq("id", matchedLeadId)
            .eq("owner_id", matchedOwnerId);
          if (updateFull.error) {
            await adminSb
              .from("leads")
              .update({
                status: "replied",
                last_contacted_at: receivedAt || nowIso,
                next_follow_up_at: null,
                unread_reply_count: nextUnread,
                automation_paused: true,
                sequence_active: false,
              })
              .eq("id", matchedLeadId)
              .eq("owner_id", matchedOwnerId);
          }
          await logCrmAutomationEvent(adminSb, {
            owner_id: matchedOwnerId,
            lead_id: matchedLeadId,
            event_type: "inbound_reply_matched",
            payload: {
              match_strategy: matchStrategy,
              provider_message_id: messageId || null,
              preview: replyPreview.slice(0, 160),
            },
          });
        }

        counters.replies_matched += 1;
        return NextResponse.json(
          { ...(bodyJson as object), counters, match_strategy: matchStrategy, lead_id: matchedLeadId || null },
          { status: 200 }
        );
      }
    } catch (localSyncError) {
      console.warn("[Email Webhook] local reply sync failed", localSyncError);
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
