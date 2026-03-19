import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { leadSchema } from "@/lib/validations";
import { refreshDueFollowUps } from "@/lib/leads-workflow";
import { isManualOnlyMode } from "@/lib/manual-mode";

const ALLOWED_LEAD_INSERT_FIELDS = [
  "business_name",
  "contact_name",
  "email",
  "phone",
  "website",
  "industry",
  "category",
  "address",
  "lead_source",
  "status",
  "notes",
  "follow_up_date",
  "is_manual",
  "known_owner_name",
  "known_context",
  "lead_bucket",
  "door_status",
  "owner_id",
  "last_updated_at",
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
    contact_name: parsed.data.contact_name,
    email: String(parsed.data.email || "").trim() || undefined,
    phone: String(parsed.data.phone || "").trim() || undefined,
    website: String(parsed.data.website || "").trim() || undefined,
    industry: parsed.data.industry,
    category: parsed.data.category,
    address: parsed.data.address,
    lead_source: parsed.data.lead_source,
    status: parsed.data.status || "new",
    notes: parsed.data.notes,
    follow_up_date: parsed.data.follow_up_date,
    is_manual: parsed.data.is_manual,
    known_owner_name: parsed.data.known_owner_name,
    known_context: parsed.data.known_context,
    lead_bucket: parsed.data.lead_bucket,
    door_status: parsed.data.door_status,
  } as const;
  const row = {
    ...normalizedInput,
    owner_id: user.id,
    last_updated_at: new Date().toISOString(),
  };
  console.info("[Leads API] sanitized create payload", {
    request_id: requestId,
    payload: row,
  });

  const safePayload = Object.fromEntries(
    Object.entries(row).filter(([key]) =>
      ALLOWED_LEAD_INSERT_FIELDS.includes(key as (typeof ALLOWED_LEAD_INSERT_FIELDS)[number])
    )
  );
  const removedFields = Object.keys(row).filter(
    (key) => !ALLOWED_LEAD_INSERT_FIELDS.includes(key as (typeof ALLOWED_LEAD_INSERT_FIELDS)[number])
  );
  console.info("[Leads API] filtered payload", {
    request_id: requestId,
    payload: safePayload,
    removed_fields: removedFields,
  });

  console.info("[Leads API] insert attempt", {
    request_id: requestId,
    payload_keys: Object.keys(safePayload),
  });
  const { data, error } = await supabase
    .from("leads")
    .insert(safePayload)
    .select()
    .single();

  if (error || !data) {
    const dbErrorMessage = String(error?.message || "Lead insert failed.");
    console.error("[Leads API] create failed", {
      request_id: requestId,
      error: dbErrorMessage,
      payload: safePayload,
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
    ...data,
    id: String(data.id || ""),
    business_name: String(data.business_name || normalizedInput.business_name || ""),
    status: String(data.status || normalizedInput.status || "new"),
    source: "server",
    isLocalOnly: false,
    _create_debug: {
      request_id: requestId,
      removed_fields: removedFields,
      filtered_payload_keys: Object.keys(safePayload),
    },
  };
  console.info("[Leads API] create response sent", {
    request_id: requestId,
    status: 200,
    lead_id: responseBody.id,
    source: responseBody.source,
  });
  return NextResponse.json(responseBody);
}
