import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCalendarEvent, resolveWorkspaceIdForOwner } from "@/lib/calendar-events";
import { recordLeadActivity } from "@/lib/lead-activity";

const DEFAULT_TIMEOUT_MS = 45000;

function scoutBaseUrl() {
  return process.env.SCOUT_BRAIN_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    const next = String(value || "").trim();
    if (next) return next;
  }
  return "";
}

function normalizeEmail(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

function addDaysIso(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function POST(request: Request) {
  const baseUrl = scoutBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { error: "SCOUT_BRAIN_API_BASE_URL is not configured." },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const requestAuth = request.headers.get("authorization") || "";
  const requestBearerToken =
    requestAuth.startsWith("Bearer ") ? requestAuth.slice(7).trim() : "";
  const accessToken = session?.access_token || requestBearerToken;
  const tokenSource = session?.access_token
    ? "session"
    : requestBearerToken
      ? "request-header"
      : "none";
  const hasSession = Boolean(session);
  const hasAccessToken = Boolean(accessToken);
  console.info("[Scout Proxy] session found for outreach send:", hasSession);
  console.info("[Scout Proxy] token found for outreach send:", hasAccessToken);
  console.info("[Scout Proxy] token source for outreach send:", tokenSource);
  if (!accessToken) {
    return NextResponse.json(
      { error: "No authenticated session found in admin proxy" },
      { status: 401 }
    );
  }

  const payload = await request
    .json()
    .catch((): Record<string, unknown> => ({}));

  const workspaceId =
    request.headers.get("x-workspace-id")?.trim() ||
    process.env.SCOUT_BRAIN_WORKSPACE_ID?.trim() ||
    "";

  const headers: HeadersInit = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
  console.info("[Scout Proxy] forwarding Authorization header for outreach send");
  if (workspaceId) headers["X-Workspace-Id"] = workspaceId;

  const ownerIdEarly = String(session?.user?.id || "").trim();
  const leadIdEarly = String(payload?.lead_id || "").trim();

  async function markEmailSendFailed(meta: Record<string, unknown>) {
    if (!ownerIdEarly || !leadIdEarly) return;
    const nowIso = new Date().toISOString();
    await supabase
      .from("leads")
      .update({
        last_outreach_status: "failed",
        last_outreach_channel: "email",
        last_updated_at: nowIso,
      })
      .eq("id", leadIdEarly)
      .eq("owner_id", ownerIdEarly);
    void recordLeadActivity(supabase, {
      ownerId: ownerIdEarly,
      leadId: leadIdEarly,
      eventType: "email_failed",
      meta,
    });
  }

  try {
    console.info("[Scout Proxy] next proxy request started");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    const response = await fetch(`${baseUrl}/outreach/send`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(timer));

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : { error: await response.text() };

    if (!response.ok) {
      await markEmailSendFailed({
        http_status: response.status,
        scout_error: body,
      });
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Scout authentication failed", detail: body },
          { status: 401 }
        );
      }
      return NextResponse.json(body, { status: response.status });
    }

    const ownerId = String(session?.user?.id || "").trim();
    const leadId = String(payload?.lead_id || "").trim();
    const subject = String(payload?.subject || "Follow up outreach").trim();
    const sentAtIso = new Date().toISOString();
    const recipientEmail = normalizeEmail(payload?.to || payload?.recipient_email || payload?.email);
    const previewUrl = String(payload?.preview_url || "").trim() || null;
    const providerMessageId = pickString(
      (body as Record<string, unknown>)?.provider_message_id,
      (body as Record<string, unknown>)?.message_id,
      (body as Record<string, unknown>)?.id
    ) || null;
    const providerThreadId = pickString(
      (body as Record<string, unknown>)?.provider_thread_id,
      (body as Record<string, unknown>)?.thread_id,
      (body as Record<string, unknown>)?.conversation_id
    ) || null;
    let leadUpdates: Record<string, unknown> | null = null;
    if (ownerId && leadId) {
      const nowIso = new Date().toISOString();
      const { data: leadRows } = await supabase
        .from("leads")
        .select("id,status,email,industry,category,best_contact_method,contact_method")
        .eq("id", leadId)
        .eq("owner_id", ownerId)
        .limit(1);
      const existing = (leadRows || [])[0] as {
        status?: string | null;
        email?: string | null;
        industry?: string | null;
        category?: string | null;
        best_contact_method?: string | null;
        contact_method?: string | null;
      } | undefined;
      const currentStatus = String(existing?.status || "").trim().toLowerCase();
      const hasEmail = Boolean(String(existing?.email || "").trim());
      const nextStatus = hasEmail
        ? (["replied", "closed", "closed_won", "closed_lost", "do_not_contact"].includes(currentStatus)
            ? currentStatus
            : "contacted")
        : "research_later";
      const followUp1 = addDaysIso(2);
      const followUp2 = addDaysIso(5);
      const followUp3 = addDaysIso(8);
      const updatePayload: Record<string, unknown> = {
        status: nextStatus,
        last_contacted_at: nowIso,
        category:
          String(payload?.category || existing?.category || existing?.industry || "").trim() || null,
        contact_method:
          String(payload?.contact_method || existing?.best_contact_method || existing?.contact_method || "email").trim() ||
          "email",
      };
      if (hasEmail) {
        Object.assign(updatePayload, {
          last_outreach_channel: "email",
          last_outreach_status: "sent",
          last_outreach_sent_at: nowIso,
          email_sent: true,
          outreach_sent: true,
          outreach_sent_at: nowIso,
        });
        if (previewUrl) {
          updatePayload.preview_url = previewUrl;
          updatePayload.preview_sent = true;
        }
      }
      if (nextStatus === "contacted") {
        Object.assign(updatePayload, {
          follow_up_1: followUp1,
          follow_up_2: followUp2,
          follow_up_3: followUp3,
          follow_up_1_sent: false,
          follow_up_2_sent: false,
          follow_up_3_sent: false,
          sequence_active: true,
          next_follow_up_at: followUp1,
        });
      } else if (nextStatus !== "research_later") {
        updatePayload.next_follow_up_at = addDaysIso(2);
      } else {
        Object.assign(updatePayload, {
          sequence_active: false,
          next_follow_up_at: null,
        });
      }
      const { error: leadUpdateError } = await supabase
        .from("leads")
        .update(updatePayload)
        .eq("id", leadId)
        .eq("owner_id", ownerId);
      if (!leadUpdateError) {
        leadUpdates = updatePayload;
        if (hasEmail) {
          void recordLeadActivity(supabase, {
            ownerId,
            leadId,
            eventType: "email_sent",
            message: subject ? `Sent: ${subject}` : undefined,
            meta: {
              subject,
              preview_url: previewUrl,
              recipient_email: recipientEmail || null,
            },
          });
        }
      }
    }

    // Persist outbound identifiers so inbound replies can be matched reliably.
    if (ownerId && leadId && recipientEmail) {
      let threadId: string | null = null;
      try {
        if (providerThreadId) {
          const byProvider = await supabase
            .from("email_threads")
            .select("id")
            .eq("owner_id", ownerId)
            .eq("provider_thread_id", providerThreadId)
            .order("created_at", { ascending: false })
            .limit(1);
          threadId = String((byProvider.data || [])[0]?.id || "").trim() || null;
        }
        if (!threadId) {
          const byLeadAndContact = await supabase
            .from("email_threads")
            .select("id")
            .eq("owner_id", ownerId)
            .eq("lead_id", leadId)
            .ilike("contact_email", recipientEmail)
            .order("last_message_at", { ascending: false, nullsFirst: false })
            .limit(1);
          threadId = String((byLeadAndContact.data || [])[0]?.id || "").trim() || null;
        }
        if (!threadId) {
          const inserted = await supabase
            .from("email_threads")
            .insert({
              workspace_id: workspaceId || null,
              lead_id: leadId,
              contact_email: recipientEmail,
              subject,
              provider_thread_id: providerThreadId,
              status: "active",
              last_message_at: sentAtIso,
              owner_id: ownerId,
            })
            .select("id")
            .limit(1);
          threadId = String((inserted.data || [])[0]?.id || "").trim() || null;
        } else {
          await supabase
            .from("email_threads")
            .update({
              provider_thread_id: providerThreadId || undefined,
              subject,
              status: "active",
              last_message_at: sentAtIso,
            })
            .eq("id", threadId)
            .eq("owner_id", ownerId);
        }

        let duplicateOutbound = false;
        if (providerMessageId) {
          const existing = await supabase
            .from("email_messages")
            .select("id")
            .eq("owner_id", ownerId)
            .eq("provider_message_id", providerMessageId)
            .limit(1);
          duplicateOutbound = Boolean((existing.data || [])[0]?.id);
        }
        if (!duplicateOutbound) {
          await supabase.from("email_messages").insert({
            thread_id: threadId,
            lead_id: leadId,
            direction: "outbound",
            provider_message_id: providerMessageId,
            subject,
            body: String(payload?.body || "").trim(),
            delivery_status: "sent",
            sent_at: sentAtIso,
            owner_id: ownerId,
            recipient_email: recipientEmail,
            preview_url: previewUrl,
            message_kind: String(payload?.message_type || "").trim() || "outreach",
          });
        }
      } catch (persistError) {
        console.warn("[Scout Proxy] outbound identifier persistence failed", {
          lead_id: leadId,
          owner_id: ownerId,
          error: persistError,
        });
      }
    }
    if (ownerId && leadId && leadUpdates?.status === "contacted") {
      try {
        const workspaceForEvent = await resolveWorkspaceIdForOwner(ownerId);
        const followUpStarts = [addDaysIso(2), addDaysIso(5), addDaysIso(8)];
        await Promise.all(
          followUpStarts.map(async (startAt, index) => {
            const start = new Date(startAt);
            const end = new Date(start.getTime() + 30 * 60 * 1000);
            await createCalendarEvent({
              ownerId,
              workspaceId: workspaceForEvent,
              leadId: leadId || null,
              title: `Follow-up ${index + 1}: ${subject}`,
              eventType: "followup",
              startTime: start.toISOString(),
              endTime: end.toISOString(),
              notes: "Auto-created after outreach send.",
              isBlocking: false,
            });
          })
        );
      } catch (calendarError) {
        console.warn("[Scout Proxy] calendar follow-up event creation failed", calendarError);
      }
    }

    return NextResponse.json(
      {
        ...(body as object),
        lead_updates: leadUpdates,
        outbound_tracking: {
          lead_id: leadId || null,
          provider_message_id: providerMessageId,
          provider_thread_id: providerThreadId,
          recipient_email: recipientEmail || null,
          sent_at: sentAtIso,
          preview_url: previewUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const aborted =
      (error instanceof Error && error.name === "AbortError") ||
      (error instanceof Error && /aborted/i.test(error.message));
    if (aborted) {
      console.error("[Scout Proxy] proxy request aborted");
      await markEmailSendFailed({
        aborted: true,
        timeout_ms: DEFAULT_TIMEOUT_MS,
        note: "proxy_aborted",
      });
      return NextResponse.json(
        {
          error:
            "Proxy request aborted while waiting for Scout-Brain/Resend. Email may have been sent; client request ended before confirmation.",
          layer: "next-proxy",
          aborted: true,
          timeout_ms: DEFAULT_TIMEOUT_MS,
        },
        { status: 504 }
      );
    }
    await markEmailSendFailed({
      layer: "next-proxy",
      message: error instanceof Error ? error.message : "Outreach send request failed.",
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Outreach send request failed.",
      },
      { status: 502 }
    );
  }
}
