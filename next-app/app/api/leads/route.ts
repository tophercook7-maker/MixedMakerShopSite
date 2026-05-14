import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { leadSchema } from "@/lib/validations";
import { refreshDueFollowUps } from "@/lib/leads-workflow";
import { isManualOnlyMode } from "@/lib/manual-mode";
import {
  handleInboundLeadSubmission,
  isInboundLeadSubmission,
} from "@/lib/crm/inbound-lead-submission";
import { LEAD_CONFIRMATION_MESSAGE } from "@/lib/lead-confirmation-message";
import {
  canonicalizeLeadStatus,
  leadHasStandaloneWebsite,
  LEAD_FINGERPRINT_OPTIONAL_COLUMNS,
  pickLeadInsertFields,
} from "@/lib/crm-lead-schema";
import { findLeadDuplicate, normalizeBusinessName, normalizeEmail, normalizeFacebookUrl, normalizePhone, normalizeWebsiteUrl } from "@/lib/leads-dedup";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createClient();
  if (!isManualOnlyMode()) {
    await refreshDueFollowUps(supabase, user.id);
  }
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const body = await request.json().catch((error) => {
    console.error("[Leads API] request JSON parse failed", {
      request_id: requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  });
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (isInboundLeadSubmission(body)) {
    console.info("[Leads API] inbound create request", {
      request_id: requestId,
      payload: body,
      env_present: {
        NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
        SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
        RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY?.trim()),
        RESEND_AQPI_KEY_FALLBACK: Boolean(process.env.RESEND_AQPI_KEY?.trim()),
        RESEND_FROM_EMAIL: Boolean(process.env.RESEND_FROM_EMAIL?.trim()),
        BOOKING_FROM_EMAIL: Boolean(process.env.BOOKING_FROM_EMAIL?.trim()),
        LEAD_NOTIFY_EMAIL: Boolean(process.env.LEAD_NOTIFY_EMAIL?.trim()),
      },
    });
    const inbound = await handleInboundLeadSubmission(body, { requestId });
    if (!inbound.ok) {
      console.error("[Leads API] inbound create failed", {
        request_id: requestId,
        error: inbound.error,
        details: inbound.details,
        final_response_status: inbound.status,
      });
      return NextResponse.json(
        { error: inbound.error, details: inbound.details },
        { status: inbound.status }
      );
    }
    console.info("[Leads API] inbound create succeeded", {
      request_id: requestId,
      lead_id: inbound.lead_id,
      form_submission_id: inbound.form_submission_id,
      duplicate_skipped: inbound.duplicate_skipped,
      notification_sent: inbound.notification_sent,
      final_response_status: 200,
    });
    return NextResponse.json({
      ok: true,
      id: inbound.lead_id,
      form_submission_id: inbound.form_submission_id,
      source: "server",
      isLocalOnly: false,
      duplicate_skipped: inbound.duplicate_skipped,
      notification_sent: inbound.notification_sent,
      ...(body.debug_notifications === true && inbound.notification_error
        ? { notification_error: inbound.notification_error }
        : {}),
      message: LEAD_CONFIRMATION_MESSAGE,
    });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  console.info("[Leads API] create request", { request_id: requestId, payload: body });
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    console.info("[Leads API] create validation failed", {
      request_id: requestId,
      error: parsed.error.flatten(),
    });
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const supabase = await createClient();
  const business_name = String(parsed.data.business_name || "").trim();
  const website = String(parsed.data.website || "").trim() || undefined;
  const category = String(parsed.data.category || "").trim() || undefined;
  const industry = String(parsed.data.industry || "").trim() || undefined;
  const facebook_url = String(parsed.data.facebook_url || "").trim() || undefined;

  const captureChannel = String(parsed.data.source || parsed.data.lead_source || "").trim() || "manual";
  const normalizedInput = {
    business_name,
    status: canonicalizeLeadStatus(parsed.data.status || "new"),
    email: String(parsed.data.email || "").trim() || undefined,
    phone: String(parsed.data.phone || "").trim() || undefined,
    website,
    facebook_url,
    industry: industry || category || undefined,
    category: category || industry || undefined,
    source: captureChannel,
    lead_source: captureChannel,
    source_url: parsed.data.source_url,
    source_label: parsed.data.source_label,
    notes: parsed.data.notes,
    has_website: leadHasStandaloneWebsite(website),
    normalized_website: normalizeWebsiteUrl(website) || undefined,
    normalized_facebook_url: normalizeFacebookUrl(facebook_url) || undefined,
  } as const;

  const candidatePayload = pickLeadInsertFields({
    ...parsed.data,
    ...normalizedInput,
    owner_id: user.id,
    normalized_business_name: normalizeBusinessName(normalizedInput.business_name),
    normalized_email: normalizeEmail(normalizedInput.email || ""),
    normalized_phone: normalizePhone(normalizedInput.phone || ""),
  });

  console.info("[Leads API] sanitized create payload", {
    request_id: requestId,
    payload: candidatePayload,
  });

  const dedup = await findLeadDuplicate({
    supabase,
    ownerId: user.id,
    businessName: normalizedInput.business_name,
    email: normalizedInput.email || null,
    phone: normalizedInput.phone || null,
    website: normalizedInput.website || null,
    facebookUrl: normalizedInput.facebook_url || null,
  });
  console.info("[Leads API] dedup check", {
    request_id: requestId,
    duplicate: dedup.duplicate,
    reason: dedup.reason,
    matched_lead_id: dedup.matchedLeadId,
  });
  if (dedup.duplicate && dedup.matchedLeadId) {
    const { data: existing } = await supabase
      .from("leads")
      .select("id,business_name,status")
      .eq("owner_id", user.id)
      .eq("id", dedup.matchedLeadId)
      .maybeSingle();
    return NextResponse.json({
      id: String(existing?.id || dedup.matchedLeadId),
      business_name: String(existing?.business_name || normalizedInput.business_name),
      status: String(existing?.status || "new"),
      source: "server",
      isLocalOnly: false,
      duplicate_skipped: true,
      duplicate_reason: dedup.reason,
    });
  }

  const fingerprintProbe = await supabase
    .from("leads")
    .select("normalized_business_name")
    .limit(1);
  const fingerprintFieldsAvailable = !fingerprintProbe.error;
  const fingerprintEntries: Record<string, unknown> = {};
  if (fingerprintFieldsAvailable) {
    for (const col of LEAD_FINGERPRINT_OPTIONAL_COLUMNS) {
      const v = candidatePayload[col as keyof typeof candidatePayload];
      if (v !== undefined) fingerprintEntries[col] = v;
    }
  }

  const nowIso = new Date().toISOString();
  const safeInsertPayload = pickLeadInsertFields({
    ...candidatePayload,
    ...fingerprintEntries,
    next_follow_up_at: (candidatePayload as Record<string, unknown>).next_follow_up_at ?? nowIso,
    follow_up_count: (candidatePayload as Record<string, unknown>).follow_up_count ?? 0,
    follow_up_status: (candidatePayload as Record<string, unknown>).follow_up_status ?? "pending",
    last_updated_at: (candidatePayload as Record<string, unknown>).last_updated_at ?? nowIso,
  });

  const droppedFields = Object.keys(candidatePayload).filter(
    (key) => !Object.prototype.hasOwnProperty.call(safeInsertPayload, key)
  );
  console.info("[Leads API] safe insert payload", {
    request_id: requestId,
    payload: safeInsertPayload,
  });
  console.info("[Leads API] dropped fields", {
    request_id: requestId,
    dropped_fields: droppedFields,
  });

  if (!safeInsertPayload.business_name) {
    return NextResponse.json({ error: "business_name is required" }, { status: 400 });
  }
  if (!safeInsertPayload.status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  console.info("[Leads API] insert attempt", {
    request_id: requestId,
    payload_keys: Object.keys(safeInsertPayload),
  });
  const { data, error } = await supabase
    .from("leads")
    .insert(safeInsertPayload)
    .select()
    .single();

  if (error || !data) {
    const dbErrorMessage = String(error?.message || "Lead insert failed.");
    console.error("[Leads API] insert error", {
      request_id: requestId,
      error: dbErrorMessage,
      payload: safeInsertPayload,
    });
    return NextResponse.json(
      {
        error: dbErrorMessage,
        reason: "insert_failed",
        details: "Lead could not be persisted to backend.",
      },
      { status: 500 }
    );
  }

  console.info("[Leads API] create succeeded", {
    request_id: requestId,
    lead_id: String(data.id || ""),
  });
  const responseBody = {
    id: String(data.id || ""),
    business_name: String(data.business_name || ""),
    status: String(data.status || "new"),
    source: "server",
    isLocalOnly: false,
  };
  console.info("[Leads API] create response sent", {
    request_id: requestId,
    status: 200,
    lead_id: responseBody.id,
    source: responseBody.source,
  });
  return NextResponse.json(responseBody);
}
