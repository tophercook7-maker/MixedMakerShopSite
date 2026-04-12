import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  isMockupLeadStatus,
  legacySubmissionStatusFromPipeline,
  parseMockupLeadStatus,
  type MockupLeadStatus,
} from "@/lib/lead-status";
import { createClient } from "@/lib/supabase/server";

const LEGACY_STATUS_BODY = new Set(["new", "reviewed", "contacted", "closed"]);

function resolveLeadStatusFromBody(json: unknown): MockupLeadStatus | null {
  if (typeof json !== "object" || json === null) return null;
  const o = json as Record<string, unknown>;

  const leadRaw = typeof o.leadStatus === "string" ? o.leadStatus.trim() : "";
  if (leadRaw) {
    if (!isMockupLeadStatus(leadRaw)) return null;
    return leadRaw;
  }

  const legacyRaw = typeof o.status === "string" ? o.status.trim() : "";
  if (legacyRaw && LEGACY_STATUS_BODY.has(legacyRaw)) {
    return parseMockupLeadStatus(legacyRaw);
  }

  return null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const submissionId = String(id || "").trim();
  if (!submissionId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const nextLead = resolveLeadStatusFromBody(json);
  if (!nextLead) {
    return NextResponse.json(
      {
        error:
          "Invalid pipeline status. Send { leadStatus } using new, draft_created, contacted, replied, follow_up_needed, closed_won, closed_lost, or archived.",
      },
      { status: 400 }
    );
  }

  const legacyStatus = legacySubmissionStatusFromPipeline(nextLead);
  const statusUpdatedAt = new Date().toISOString();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mockup_submissions")
    .update({
      lead_status: nextLead,
      status: legacyStatus,
      status_updated_at: statusUpdatedAt,
    })
    .eq("id", submissionId)
    .select("id, lead_status, status, status_updated_at, updated_at")
    .maybeSingle();

  if (error) {
    console.error("[admin mockup-submissions] status update failed", error.message);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, submission: data });
}
