import { NextResponse } from "next/server";
import { buildMockupFollowUpDraftInputFromSubmissionRow } from "@/lib/admin-mockup-submission-follow-up-context";
import { getCurrentUser } from "@/lib/auth";
import { createLeadFollowUpGmailDraft } from "@/lib/gmail/create-lead-follow-up-draft";
import {
  GMAIL_DRAFT_AUTO_ADVANCE_FROM,
  legacySubmissionStatusFromPipeline,
  parseMockupLeadStatus,
} from "@/lib/lead-status";
import { buildMockupFollowUpDraft } from "@/lib/mockup-follow-up-draft";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const submissionId = String(id || "").trim();
  if (!submissionId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let variantIndex = 0;
  try {
    const json = await request.json().catch(() => ({}));
    if (json && typeof json === "object" && "variantIndex" in json) {
      const v = Number((json as { variantIndex?: unknown }).variantIndex);
      if (Number.isFinite(v)) variantIndex = Math.max(0, Math.floor(v));
    }
  } catch {
    // ignore
  }

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("mockup_submissions")
    .select("email, mockup_data, desired_outcomes, top_services_to_feature, what_makes_you_different")
    .eq("id", submissionId)
    .maybeSingle();

  if (error) {
    console.error("[create-gmail-draft] load failed", error.message);
    return NextResponse.json({ error: "Could not load submission." }, { status: 500 });
  }

  if (!row) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { input, recipientEmail } = buildMockupFollowUpDraftInputFromSubmissionRow(row);
  if (!recipientEmail) {
    return NextResponse.json({ error: "No email available for this submission." }, { status: 400 });
  }

  const draft = buildMockupFollowUpDraft(input, { variantIndex });
  const subject = String(draft.subject || "").trim() || "Quick follow-up";
  const body = draft.emailBody.trim();

  const result = await createLeadFollowUpGmailDraft({
    to: recipientEmail,
    subject,
    body,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        fallbackComposeUrl: result.fallbackComposeUrl,
      },
      { status: 502 },
    );
  }

  let pipelineAuto: { from: string; to: string } | null = null;
  try {
    const { data: meta, error: metaErr } = await supabase
      .from("mockup_submissions")
      .select("lead_status")
      .eq("id", submissionId)
      .maybeSingle();

    if (!metaErr && meta) {
      const row = meta as { lead_status?: string | null };
      const current = parseMockupLeadStatus(row.lead_status ?? undefined);
      if (GMAIL_DRAFT_AUTO_ADVANCE_FROM.includes(current)) {
        const next = "draft_created" as const;
        const legacy = legacySubmissionStatusFromPipeline(next);
        const statusUpdatedAt = new Date().toISOString();
        const { error: upErr } = await supabase
          .from("mockup_submissions")
          .update({
            lead_status: next,
            status: legacy,
            status_updated_at: statusUpdatedAt,
          })
          .eq("id", submissionId);

        if (!upErr) {
          pipelineAuto = { from: current, to: next };
        } else {
          console.warn("[create-gmail-draft] pipeline auto-update skipped", upErr.message);
        }
      }
    }
  } catch (e) {
    console.warn("[create-gmail-draft] pipeline auto-update failed", e);
  }

  return NextResponse.json({
    ok: true,
    mode: result.mode,
    openUrl: result.openUrl,
    message: result.message,
    draftId: result.mode === "gmail_api" ? result.draftId : undefined,
    recipientEmail,
    subject,
    pipelineAuto,
  });
}
