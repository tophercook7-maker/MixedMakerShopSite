import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { leadSchema } from "@/lib/validations";
import { refreshDueFollowUps } from "@/lib/leads-workflow";
import { isManualOnlyMode } from "@/lib/manual-mode";

function parseMissingColumnFromError(message: string): string | null {
  const text = String(message || "");
  const quoted = text.match(/column ["']?([a-zA-Z0-9_]+)["']? .* does not exist/i);
  if (quoted?.[1]) return quoted[1];
  const unquoted = text.match(/column ([a-zA-Z0-9_]+) does not exist/i);
  if (unquoted?.[1]) return unquoted[1];
  return null;
}

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
  const email = String(parsed.data.email || "").trim();
  const phone = String(parsed.data.phone || "").trim();
  const manual = Boolean(parsed.data.is_manual);
  const forceDoor = String(parsed.data.lead_bucket || "").trim().toLowerCase() === "door_to_door";
  const shouldDoor = manual || forceDoor || !email || !phone;
  const row = {
    ...parsed.data,
    owner_id: user.id,
    lead_bucket: shouldDoor ? "door_to_door" : parsed.data.lead_bucket,
    door_status: shouldDoor ? parsed.data.door_status || "not_visited" : parsed.data.door_status || null,
    last_updated_at: new Date().toISOString(),
  };
  const droppedColumns: string[] = [];
  let insertPayload: Record<string, unknown> = { ...row };
  let data: Record<string, unknown> | null = null;
  let errorMessage: string | null = null;

  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const { data: insertData, error } = await supabase
      .from("leads")
      .insert(insertPayload)
      .select()
      .single();

    if (!error) {
      data = (insertData || null) as Record<string, unknown> | null;
      errorMessage = null;
      break;
    }

    const message = String(error.message || "unknown insert error");
    errorMessage = message;
    const missingColumn = parseMissingColumnFromError(message);
    if (!missingColumn || !(missingColumn in insertPayload)) {
      console.error("[Leads API] create failed", {
        request_id: requestId,
        attempt,
        error: message,
      });
      break;
    }

    droppedColumns.push(missingColumn);
    const { [missingColumn]: _removed, ...nextPayload } = insertPayload;
    insertPayload = nextPayload;
    console.warn("[Leads API] create retrying without missing column", {
      request_id: requestId,
      attempt,
      dropped_column: missingColumn,
    });
  }

  if (!data) {
    console.error("[Leads API] create final failure", {
      request_id: requestId,
      error: errorMessage,
      dropped_columns: droppedColumns,
    });
    return NextResponse.json(
      {
        error: errorMessage || "Lead insert failed.",
        reason: "insert_failed",
        dropped_columns: droppedColumns,
      },
      { status: 500 }
    );
  }

  console.info("[Leads API] create succeeded", {
    request_id: requestId,
    lead_id: String(data.id || ""),
    dropped_columns: droppedColumns,
  });
  return NextResponse.json({
    ...data,
    _create_debug: {
      request_id: requestId,
      dropped_columns: droppedColumns,
      persisted_with_column_fallback: droppedColumns.length > 0,
    },
  });
}
