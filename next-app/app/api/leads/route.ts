import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { leadSchema } from "@/lib/validations";
import { refreshDueFollowUps } from "@/lib/leads-workflow";
import { isManualOnlyMode } from "@/lib/manual-mode";
import { findLeadDuplicate, normalizeBusinessName, normalizeEmail, normalizePhone } from "@/lib/leads-dedup";

const ALLOWED_LEAD_INSERT_FIELDS = [
  "business_name",
  "status",
  "email",
  "phone",
  "notes",
  "owner_id",
] as const;

const OPTIONAL_FINGERPRINT_FIELDS = [
  "normalized_business_name",
  "normalized_email",
  "normalized_phone",
] as const;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isManualOnlyMode()) {
    await refreshDueFollowUps();
  }
  const supabase = await createClient();
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
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
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
  const normalizedInput = {
    business_name: String(parsed.data.business_name || "").trim(),
    status:
      String(parsed.data.status || "new").trim().toLowerCase() === "follow_up_due"
        ? "follow_up"
        : String(parsed.data.status || "new").trim().toLowerCase() === "closed_won"
          ? "won"
          : String(parsed.data.status || "new").trim().toLowerCase() === "do_not_contact"
            ? "not_interested"
            : String(parsed.data.status || "new").trim().toLowerCase() === "research_later"
              ? "archived"
              : parsed.data.status || "new",
    email: String(parsed.data.email || "").trim() || undefined,
    phone: String(parsed.data.phone || "").trim() || undefined,
    notes: parsed.data.notes,
  } as const;
  const candidatePayload = {
    ...normalizedInput,
    normalized_business_name: normalizeBusinessName(normalizedInput.business_name),
    normalized_email: normalizeEmail(normalizedInput.email || ""),
    normalized_phone: normalizePhone(normalizedInput.phone || ""),
    owner_id: user.id,
  };
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
  });
  console.info("[Leads API] dedup check", {
    request_id: requestId,
    duplicate: dedup.duplicate,
    reason: dedup.reason,
    matched_lead_id: dedup.matchedLeadId,
    normalized_business_name: dedup.normalized_business_name,
    normalized_email: dedup.normalized_email,
    normalized_phone: dedup.normalized_phone,
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
    .select("normalized_business_name,normalized_email,normalized_phone")
    .limit(1);
  const fingerprintFieldsAvailable = !fingerprintProbe.error;
  const allowedInsertFields = [
    ...ALLOWED_LEAD_INSERT_FIELDS,
    ...(fingerprintFieldsAvailable ? OPTIONAL_FINGERPRINT_FIELDS : []),
  ] as readonly string[];
  const safeInsertPayload = Object.fromEntries(
    Object.entries(candidatePayload).filter(
      ([key, value]) =>
        allowedInsertFields.includes(key) &&
        value !== undefined
    )
  );
  const droppedFields = Object.keys(candidatePayload).filter(
    (key) =>
      !Object.prototype.hasOwnProperty.call(
        safeInsertPayload,
        key
      )
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
