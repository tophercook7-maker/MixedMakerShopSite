import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCalendarEvent, resolveWorkspaceIdForOwner } from "@/lib/calendar-events";

const DEFAULT_TIMEOUT_MS = 45000;

function scoutBaseUrl() {
  return process.env.SCOUT_BRAIN_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
}

function addDaysIso(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function buildPreviewPath(leadId: string, businessName: string, category: string) {
  const params = new URLSearchParams();
  params.set("business", businessName || "Business");
  params.set("category", category || "service");
  return `/preview/${encodeURIComponent(leadId)}?${params.toString()}`;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    const next = String(value || "").trim();
    if (next) return next;
  }
  return "";
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

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ownerId = String(session.user.id || "").trim();

  const payload = await request
    .json()
    .catch((): Record<string, unknown> => ({}));

  const leadId = String(payload.lead_id || "").trim();
  if (!leadId) {
    return NextResponse.json({ error: "lead_id is required" }, { status: 400 });
  }

  const { data: leadRow, error: leadError } = await supabase
    .from("leads")
    .select("id,business_name,email,industry,workspace_id")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .limit(1)
    .maybeSingle();

  if (leadError || !leadRow) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  const businessName = String(payload.business_name || leadRow.business_name || "").trim() || "Business";
  const category = String(payload.category || leadRow.industry || "").trim() || "service";
  const recipientEmail = String(payload.email || leadRow.email || "").trim();
  const linkedOpportunityId = String(payload.linked_opportunity_id || "").trim() || null;

  if (!recipientEmail) {
    return NextResponse.json(
      { error: "Lead has no email address for preview outreach." },
      { status: 400 }
    );
  }

  const previewPath = buildPreviewPath(leadId, businessName, category);
  const requestOrigin = String(request.headers.get("origin") || "").trim();
  const siteUrl = String(process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
  const baseOrigin = requestOrigin || siteUrl;
  const previewUrl = baseOrigin ? `${baseOrigin}${previewPath}` : previewPath;

  const subject = `Quick idea for ${businessName}`;
  const body = [
    `Hi ${businessName},`,
    "",
    "I put together a quick example of what your website could look like:",
    "",
    previewUrl,
    "",
    "This is just to show what's possible - something simple, clean, and built to bring in more customers.",
    "",
    "If you'd like something like this, I can set it up for you pretty quickly.",
    "",
    "- Topher",
    "Topher's Web Design",
  ].join("\n");

  const accessToken = String(session.access_token || "").trim();
  if (!accessToken) {
    return NextResponse.json({ error: "No authenticated session token found." }, { status: 401 });
  }

  const workspaceId =
    String(payload.workspace_id || "").trim() ||
    String(leadRow.workspace_id || "").trim() ||
    process.env.SCOUT_BRAIN_WORKSPACE_ID?.trim() ||
    "";

  const headers: HeadersInit = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
  if (workspaceId) headers["X-Workspace-Id"] = workspaceId;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    const sendRes = await fetch(`${baseUrl}/outreach/send`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        lead_id: leadId,
        linked_opportunity_id: linkedOpportunityId,
        subject,
        body,
        message_type: "preview",
      }),
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(timer));

    const contentType = sendRes.headers.get("content-type") || "";
    const sendBody = contentType.includes("application/json")
      ? await sendRes.json()
      : { error: await sendRes.text() };

    if (!sendRes.ok) {
      return NextResponse.json(
        { error: "Could not send preview email.", detail: sendBody },
        { status: sendRes.status }
      );
    }

    const nowIso = new Date().toISOString();
    const followUp1 = addDaysIso(2);
    const followUp2 = addDaysIso(5);
    const followUp3 = addDaysIso(8);
    const providerMessageId = pickString(
      (sendBody as Record<string, unknown>)?.provider_message_id,
      (sendBody as Record<string, unknown>)?.message_id,
      (sendBody as Record<string, unknown>)?.id
    ) || null;
    const providerThreadId = pickString(
      (sendBody as Record<string, unknown>)?.provider_thread_id,
      (sendBody as Record<string, unknown>)?.thread_id,
      (sendBody as Record<string, unknown>)?.conversation_id
    ) || null;

    // Persist outbound identifiers for reply matching.
    try {
      let threadId: string | null = null;
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
        const byLeadContact = await supabase
          .from("email_threads")
          .select("id")
          .eq("owner_id", ownerId)
          .eq("lead_id", leadId)
          .ilike("contact_email", recipientEmail.toLowerCase())
          .order("last_message_at", { ascending: false, nullsFirst: false })
          .limit(1);
        threadId = String((byLeadContact.data || [])[0]?.id || "").trim() || null;
      }
      if (!threadId) {
        const inserted = await supabase
          .from("email_threads")
          .insert({
            workspace_id: workspaceId || null,
            lead_id: leadId,
            contact_email: recipientEmail.toLowerCase(),
            subject,
            provider_thread_id: providerThreadId,
            status: "active",
            last_message_at: nowIso,
            owner_id: ownerId,
          })
          .select("id")
          .limit(1);
        threadId = String((inserted.data || [])[0]?.id || "").trim() || null;
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
          body,
          delivery_status: "sent",
          sent_at: nowIso,
          owner_id: ownerId,
          recipient_email: recipientEmail.toLowerCase(),
          preview_url: previewUrl,
          message_kind: "preview",
        });
      }
      if (threadId) {
        await supabase
          .from("email_threads")
          .update({
            provider_thread_id: providerThreadId || undefined,
            subject,
            status: "active",
            last_message_at: nowIso,
          })
          .eq("id", threadId)
          .eq("owner_id", ownerId);
      }
    } catch (persistError) {
      console.warn("[Preview Outreach] outbound identifier persistence failed", {
        leadId,
        error: persistError,
      });
    }

    const { error: updateError } = await supabase
      .from("leads")
      .update({
        outreach_sent: true,
        outreach_sent_at: nowIso,
        preview_url: previewUrl,
        follow_up_1: followUp1,
        follow_up_2: followUp2,
        follow_up_3: followUp3,
        follow_up_1_sent: false,
        follow_up_2_sent: false,
        follow_up_3_sent: false,
        last_contacted_at: nowIso,
        next_follow_up_at: followUp1,
        status: "contacted",
      })
      .eq("id", leadId)
      .eq("owner_id", ownerId);

    if (updateError) {
      return NextResponse.json(
        { error: `Preview email sent, but lead update failed: ${updateError.message}` },
        { status: 500 }
      );
    }

    const workspaceForEvents = await resolveWorkspaceIdForOwner(ownerId);
    const followUpDates = [followUp1, followUp2, followUp3];
    await Promise.all(
      followUpDates.map(async (startAt, index) => {
        const start = new Date(startAt);
        const end = new Date(start.getTime() + 30 * 60 * 1000);
        try {
          await createCalendarEvent({
            ownerId,
            workspaceId: workspaceForEvents,
            leadId,
            title: `Follow-up ${index + 1}: ${businessName}`,
            eventType: "followup",
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            notes: `Auto-scheduled after preview outreach email. (${previewUrl})`,
          });
        } catch (eventError) {
          console.warn("[Preview Outreach] follow-up event creation failed", {
            leadId,
            follow_up_index: index + 1,
            error: eventError,
          });
        }
      })
    );

    return NextResponse.json({
      ok: true,
      preview_url: previewUrl,
      outreach_sent: true,
      outreach_sent_at: nowIso,
      follow_up_1: followUp1,
      follow_up_2: followUp2,
      follow_up_3: followUp3,
      message: "Preview sent and follow-ups scheduled",
      email_service_result: sendBody,
      outbound_tracking: {
        lead_id: leadId,
        provider_message_id: providerMessageId,
        provider_thread_id: providerThreadId,
        recipient_email: recipientEmail.toLowerCase(),
        sent_at: nowIso,
        preview_url: previewUrl,
      },
    });
  } catch (error) {
    const aborted =
      (error instanceof Error && error.name === "AbortError") ||
      (error instanceof Error && /aborted/i.test(error.message));
    if (aborted) {
      return NextResponse.json(
        {
          error: "Preview send request timed out before confirmation.",
          layer: "next-proxy",
          aborted: true,
          timeout_ms: DEFAULT_TIMEOUT_MS,
        },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Preview outreach failed." },
      { status: 502 }
    );
  }
}
