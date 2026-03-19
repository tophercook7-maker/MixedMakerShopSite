import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { leadSchema } from "@/lib/validations";

function normalizeLeadStatus(status: unknown): string {
  const normalized = String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (!normalized) return "new";
  if (normalized === "follow_up_due") return "follow_up";
  if (normalized === "closed_won") return "won";
  if (normalized === "closed_lost") return "no_response";
  if (normalized === "do_not_contact") return "not_interested";
  if (normalized === "research_later") return "archived";
  return normalized;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();
  console.info("[Lead API] request received", { request_id: requestId, method: "GET" });
  const user = await getCurrentUser();
  if (!user) {
    console.info("[Lead API] response sent", {
      request_id: requestId,
      status: 401,
      body: { error: "Unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const leadId = String(id || "").trim();
  if (!leadId) {
    console.info("[Lead API] response sent", {
      request_id: requestId,
      status: 400,
      body: { error: "Lead id is required." },
    });
    return NextResponse.json({ error: "Lead id is required." }, { status: 400 });
  }
  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();
  console.info("[Lead API] query inputs", { request_id: requestId, lead_id: leadId, owner_id: ownerId });

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("id", leadId)
    .maybeSingle();
  console.info("[Lead API] query result", {
    request_id: requestId,
    query: "scoped lead by owner_id + id",
    row_count: data ? 1 : 0,
    error: error?.message || null,
  });
  if (!error && data) {
    console.info("[Lead API] response sent", {
      request_id: requestId,
      status: 200,
      body: { id: (data as { id?: string }).id || leadId, ok: true },
    });
    return NextResponse.json(data);
  }

  const { data: unscopedRow } = await supabase
    .from("leads")
    .select("id,owner_id,workspace_id,linked_opportunity_id,business_name")
    .eq("id", leadId)
    .maybeSingle();
  console.info("[Lead API] query result", {
    request_id: requestId,
    query: "unscoped lead by id",
    row_count: unscopedRow ? 1 : 0,
  });
  const leadExistsById = Boolean(unscopedRow);
  const diagnostics = {
    lead_exists_by_id: leadExistsById,
    owner_id_on_row: String((unscopedRow as { owner_id?: string | null } | null)?.owner_id || "").trim() || null,
    workspace_id_on_row: String((unscopedRow as { workspace_id?: string | null } | null)?.workspace_id || "").trim() || null,
    current_user_id: ownerId,
  };
  if (leadExistsById) {
    const responseBody = {
      error: "Lead exists but is not in your workspace.",
      reason: "owner_workspace_mismatch",
      diagnostics,
    };
    console.info("[Lead API] response sent", {
      request_id: requestId,
      status: 403,
      body: responseBody,
    });
    return NextResponse.json(
      responseBody,
      { status: 403 }
    );
  }
  const responseBody = {
    error: "Lead does not exist.",
    reason: "not_found",
    diagnostics,
  };
  console.info("[Lead API] response sent", {
    request_id: requestId,
    status: 404,
    body: responseBody,
  });
  return NextResponse.json(
    responseBody,
    { status: 404 }
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();
  console.info("[Lead API] request received", { request_id: requestId, method: "PATCH" });
  const user = await getCurrentUser();
  if (!user) {
    console.info("[Lead API] response sent", {
      request_id: requestId,
      status: 401,
      body: { error: "Unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  console.info("[Lead API] payload", { request_id: requestId, lead_id: id, payload: body });
  const parsed = leadSchema.partial().safeParse(body);
  if (!parsed.success) {
    const responseBody = { error: parsed.error.flatten() };
    console.info("[Lead API] response sent", {
      request_id: requestId,
      status: 400,
      body: responseBody,
    });
    return NextResponse.json(responseBody, { status: 400 });
  }
  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();
  const payload = { ...parsed.data, last_updated_at: new Date().toISOString() } as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(payload, "status")) {
    payload.status = normalizeLeadStatus(payload.status);
  }
  const { data, error } = await supabase
    .from("leads")
    .update(payload)
    .eq("owner_id", ownerId)
    .eq("id", id)
    .select()
    .maybeSingle();
  console.info("[Lead API] query result", {
    request_id: requestId,
    query: "update lead by owner_id + id",
    row_count: data ? 1 : 0,
    error: error?.message || null,
  });
  if (error) {
    const responseBody = { error: error.message };
    console.info("[Lead API] response sent", {
      request_id: requestId,
      status: 500,
      body: responseBody,
    });
    return NextResponse.json(responseBody, { status: 500 });
  }
  if (!data) {
    const responseBody = { error: "Lead not found in your workspace." };
    console.info("[Lead API] response sent", {
      request_id: requestId,
      status: 404,
      body: responseBody,
    });
    return NextResponse.json(responseBody, { status: 404 });
  }
  console.info("[Lead API] response sent", {
    request_id: requestId,
    status: 200,
    body: { id: (data as { id?: string }).id || id, ok: true },
  });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();
  console.info("[Lead API] request received", { request_id: requestId, method: "DELETE" });
  const user = await getCurrentUser();
  if (!user) {
    console.info("[Lead API] response sent", {
      request_id: requestId,
      status: 401,
      body: { error: "Unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();
  const { data, error } = await supabase
    .from("leads")
    .delete()
    .eq("owner_id", ownerId)
    .eq("id", id)
    .select("id")
    .limit(1);
  console.info("[Lead API] query result", {
    request_id: requestId,
    query: "delete lead by owner_id + id",
    row_count: Array.isArray(data) ? data.length : 0,
    error: error?.message || null,
  });
  if (error) {
    const responseBody = { error: error.message };
    console.info("[Lead API] response sent", {
      request_id: requestId,
      status: 500,
      body: responseBody,
    });
    return NextResponse.json(responseBody, { status: 500 });
  }
  if (!data || data.length === 0) {
    const responseBody = { error: "Lead not found in your workspace." };
    console.info("[Lead API] response sent", {
      request_id: requestId,
      status: 404,
      body: responseBody,
    });
    return NextResponse.json(responseBody, { status: 404 });
  }
  console.info("[Lead API] response sent", {
    request_id: requestId,
    status: 200,
    body: { ok: true, id: data[0]?.id || id },
  });
  return NextResponse.json({ ok: true });
}
