import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { leadSchema } from "@/lib/validations";
import { canonicalizeLeadStatus, leadHasStandaloneWebsite, pickLeadPatchFields } from "@/lib/crm-lead-schema";
import { normalizeWorkflowLeadStatus } from "@/lib/crm/stage-normalize";
import { recordLeadActivity } from "@/lib/lead-activity";
import { normalizeFacebookUrl, normalizeWebsiteUrl } from "@/lib/leads-dedup";

async function leadIdFromParams(params: Promise<{ id: string }> | { id: string }): Promise<string> {
  const resolved = await Promise.resolve(params);
  return String(resolved?.id || "").trim();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
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
  const leadId = await leadIdFromParams(params);
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
  { params }: { params: Promise<{ id: string }> | { id: string } }
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
  const id = await leadIdFromParams(params);
  if (!id) {
    return NextResponse.json({ error: "Lead id is required." }, { status: 400 });
  }
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
  const rawPayload = { ...parsed.data, last_updated_at: new Date().toISOString() } as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(rawPayload, "status")) {
    rawPayload.status = canonicalizeLeadStatus(rawPayload.status);
  }
  if (Object.prototype.hasOwnProperty.call(rawPayload, "website") || Object.prototype.hasOwnProperty.call(rawPayload, "facebook_url")) {
    if (Object.prototype.hasOwnProperty.call(rawPayload, "website")) {
      const w = String(rawPayload.website || "").trim() || undefined;
      rawPayload.has_website = leadHasStandaloneWebsite(w);
      rawPayload.normalized_website = normalizeWebsiteUrl(w) || null;
    }
    if (Object.prototype.hasOwnProperty.call(rawPayload, "facebook_url")) {
      const f = String(rawPayload.facebook_url || "").trim() || undefined;
      rawPayload.normalized_facebook_url = normalizeFacebookUrl(f) || null;
    }
  }

  const { data: beforeRow } = await supabase.from("leads").select("status").eq("id", id).eq("owner_id", ownerId).maybeSingle();
  const prevStatus = String((beforeRow as { status?: string } | null)?.status || "");
  const prevNorm = normalizeWorkflowLeadStatus(prevStatus);

  if (Object.prototype.hasOwnProperty.call(rawPayload, "status")) {
    const nextSt = String(rawPayload.status || "");
    if (nextSt === "replied" && prevNorm !== "replied") {
      if (!Object.prototype.hasOwnProperty.call(rawPayload, "automation_paused")) {
        rawPayload.automation_paused = true;
      }
      if (!Object.prototype.hasOwnProperty.call(rawPayload, "sequence_active")) {
        rawPayload.sequence_active = false;
      }
      if (!Object.prototype.hasOwnProperty.call(rawPayload, "next_follow_up_at")) {
        rawPayload.next_follow_up_at = null;
      }
      if (!Object.prototype.hasOwnProperty.call(rawPayload, "follow_up_status")) {
        rawPayload.follow_up_status = "completed";
      }
      if (!Object.prototype.hasOwnProperty.call(rawPayload, "last_reply_at")) {
        rawPayload.last_reply_at = new Date().toISOString();
      }
    }
  }

  const payload = pickLeadPatchFields(rawPayload);

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

  if (Object.prototype.hasOwnProperty.call(payload, "status")) {
    const nextStatus = String((data as { status?: string }).status || "");
    if (nextStatus && nextStatus !== prevStatus) {
      void recordLeadActivity(supabase, {
        ownerId,
        leadId: id,
        eventType: nextStatus === "replied" ? "reply_received" : "lead_status_changed",
        message:
          nextStatus === "replied" ? "Lead marked as replied" : `Status: ${prevStatus || "unknown"} → ${nextStatus}`,
        meta: { from: prevStatus, to: nextStatus },
      });
    }
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
  { params }: { params: Promise<{ id: string }> | { id: string } }
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
  const id = await leadIdFromParams(params);
  if (!id) {
    return NextResponse.json({ error: "Lead id is required." }, { status: 400 });
  }
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
