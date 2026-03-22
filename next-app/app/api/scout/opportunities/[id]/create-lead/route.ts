import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildLeadAssessment } from "@/lib/lead-assessment";
import { findLeadDuplicate, normalizeFacebookUrl, normalizeWebsiteUrl } from "@/lib/leads-dedup";
import { evaluateScoutIntakeTarget, scoreScoutLead } from "@/lib/scout-conversion";
import { leadHasStandaloneWebsite, pickLeadInsertFields } from "@/lib/crm-lead-schema";
import { markScoutResultLinked, markScoutResultLinkedByOpportunity } from "@/lib/scout/scout-results-service";
import { mapScoutSourceTypeToLeadSource } from "@/lib/crm/lead-source";

type OpportunityRow = {
  id: string;
  owner_id?: string | null;
  user_id?: string | null;
  workspace_id?: string | null;
  business_name?: string | null;
  category?: string | null;
  city?: string | null;
  address?: string | null;
  website?: string | null;
  opportunity_score?: number | null;
  opportunity_reason?: string | null;
  opportunity_signals?: string[] | null;
};

type CaseRow = {
  id?: string | null;
  email?: string | null;
  phone_from_site?: string | null;
  contact_page?: string | null;
  contact_form_url?: string | null;
  facebook_url?: string | null;
  facebook?: string | null;
  audit_issues?: string[] | null;
  strongest_problems?: string[] | null;
  google_review_count?: number | null;
};

function missingOpportunityReasonColumn(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return text.includes("opportunities.opportunity_reason") || text.includes("column opportunity_reason");
}

function missingOpportunitySignalsColumn(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return text.includes("opportunities.opportunity_signals") || text.includes("column opportunity_signals");
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const opportunityId = String(params.id || "").trim();
  const requestId = crypto.randomUUID();
  const requestPayload = await request
    .json()
    .catch((): Record<string, unknown> => ({}));
  const scoutResultId = String(requestPayload.scout_result_id || "").trim() || null;

  const linkScoutRow = async (leadId: string) => {
    await markScoutResultLinked(supabase, ownerId, scoutResultId, leadId);
    if (!scoutResultId) await markScoutResultLinkedByOpportunity(supabase, ownerId, opportunityId, leadId);
  };
  console.info("[Action Debug] create-lead API request received", {
    request_id: requestId,
    method: "POST",
    opportunityId,
    payload: requestPayload,
  });
  if (!opportunityId) {
    return NextResponse.json({ error: "Opportunity id is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fail = (status: number, reason: string, error: string, extra?: Record<string, unknown>) => {
    console.error("[Action Debug] create-lead failed", {
      request_id: requestId,
      opportunityId,
      ownerId,
      status,
      reason,
      error,
      ...extra,
    });
    console.info("[Action Debug] create-lead response sent", {
      request_id: requestId,
      status,
      body: { error, reason, ...extra },
    });
    return NextResponse.json({ error, reason, ...extra }, { status });
  };

  const { data: existingRows } = await supabase
    .from("leads")
    .select("id,business_name")
    .eq("owner_id", ownerId)
    .eq("linked_opportunity_id", opportunityId)
    .limit(1);
  const existingLead = (existingRows || [])[0] as { id?: string | null; business_name?: string | null } | undefined;
  const { data: existingCaseRows } = await supabase
    .from("case_files")
    .select("id,created_at")
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false })
    .limit(1);
  const existingCaseId = String((existingCaseRows || [])[0]?.id || "").trim() || null;
  if (existingLead?.id) {
    console.info("[Action Debug] create-lead lookup result", {
      opportunityId,
      existingLeadId: String(existingLead.id || ""),
    });
    await linkScoutRow(String(existingLead.id));
    console.info("[Action Debug] create-lead response sent", {
      request_id: requestId,
      status: 200,
      body: {
        ok: true,
        created: false,
        reason: "duplicate_existing_lead",
        lead_id: String(existingLead.id),
      },
    });
    return NextResponse.json({
      ok: true,
      created: false,
      reason: "duplicate_existing_lead",
      lead_id: String(existingLead.id),
      case_id: existingCaseId,
      business_name: String(existingLead.business_name || ""),
      message: "Lead already exists for this opportunity.",
    });
  }

  let oppRows: OpportunityRow[] | null = null;
  let oppError: { message?: string } | null = null;
  let requestedOpportunityId = opportunityId;
  let opportunityExistsById = false;
  let opportunityOwnerOnRow: string | null = null;
  let opportunityWorkspaceOnRow: string | null = null;
  let opportunityScopeBlocked = false;

  const { data: oppExistsRows, error: oppExistsError } = await supabase
    .from("opportunities")
    .select("id,owner_id,user_id,workspace_id")
    .eq("id", requestedOpportunityId)
    .limit(1);
  if (oppExistsError?.message) {
    console.error("[Action Debug] create-lead opportunity existence lookup failed", {
      requested_opportunity_id: requestedOpportunityId,
      error: oppExistsError.message,
    });
  }
  const oppExistsRow = ((oppExistsRows || [])[0] as OpportunityRow | undefined) || null;
  console.info("[Action Debug] create-lead DB query result", {
    request_id: requestId,
    query: "opportunities by id existence",
    row_count: Number((oppExistsRows || []).length),
  });
  opportunityExistsById = Boolean(oppExistsRow);
  opportunityOwnerOnRow =
    String(oppExistsRow?.owner_id || oppExistsRow?.user_id || "").trim() || null;
  opportunityWorkspaceOnRow = String(oppExistsRow?.workspace_id || "").trim() || null;

  const withReason = await supabase
    .from("opportunities")
    .select(
      "id,owner_id,user_id,workspace_id,business_name,category,city,address,website,opportunity_score,opportunity_reason,opportunity_signals"
    )
    .eq("id", requestedOpportunityId)
    .or(`owner_id.eq.${ownerId},user_id.eq.${ownerId}`)
    .limit(1);
  oppRows = (withReason.data || []) as OpportunityRow[];
  console.info("[Action Debug] create-lead DB query result", {
    request_id: requestId,
    query: "opportunities scoped select",
    row_count: Number((withReason.data || []).length),
  });
  oppError = withReason.error as { message?: string } | null;
  if (
    oppError?.message &&
    (missingOpportunityReasonColumn(oppError.message) ||
      missingOpportunitySignalsColumn(oppError.message))
  ) {
    console.warn("[Action Debug] create-lead fallback without opportunity_reason", { opportunityId });
    const fallback = await supabase
      .from("opportunities")
      .select("id,owner_id,user_id,workspace_id,business_name,category,city,address,website,opportunity_score")
      .eq("id", requestedOpportunityId)
      .or(`owner_id.eq.${ownerId},user_id.eq.${ownerId}`)
      .limit(1);
    oppRows = ((fallback.data || []) as OpportunityRow[]).map((row) => ({
      ...row,
      opportunity_reason: null,
      opportunity_signals: null,
    }));
    oppError = fallback.error as { message?: string } | null;
  }
  if (oppError?.message) {
    console.error("[Action Debug] create-lead lookup failed", { opportunityId: requestedOpportunityId, error: oppError.message });
    return NextResponse.json({ error: oppError.message }, { status: 500 });
  }
  const opp = ((oppRows || [])[0] as OpportunityRow | undefined) || null;
  opportunityScopeBlocked = Boolean(opportunityExistsById && !opp);
  console.info("[Action Debug] create-lead opportunity diagnostics", {
    requested_opportunity_id: requestedOpportunityId,
    opportunity_exists_by_id: opportunityExistsById,
    opportunity_owner_id: opportunityOwnerOnRow,
    current_user_id: ownerId,
    opportunity_workspace_id: opportunityWorkspaceOnRow,
    owner_workspace_filter_blocked_row: opportunityScopeBlocked,
  });
  if (!opp) {
    return NextResponse.json(
      {
        error: opportunityScopeBlocked
          ? "Opportunity exists but is outside the current owner/workspace scope."
          : "Opportunity not found.",
        reason: opportunityScopeBlocked ? "owner_workspace_mismatch" : "opportunity_not_found",
      },
      { status: opportunityScopeBlocked ? 403 : 404 }
    );
  }
  const workspaceId = String(opp.workspace_id || "").trim();
  if (!workspaceId) {
    return fail(422, "missing_workspace_id", "Opportunity has no workspace_id, so lead creation was blocked.");
  }
  const oppOwner = String(opp.owner_id || opp.user_id || "").trim();
  if (oppOwner && oppOwner !== ownerId) {
    return fail(403, "owner_mismatch", "Opportunity owner does not match current user.", {
      opportunity_owner_id: oppOwner,
      current_user_id: ownerId,
    });
  }

  const { data: caseRows } = await supabase
    .from("case_files")
    .select(
      "id,email,phone_from_site,contact_page,contact_form_url,facebook_url,facebook,audit_issues,strongest_problems,google_review_count,created_at"
    )
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false })
    .limit(1);
  const caseRow = ((caseRows || [])[0] as CaseRow | undefined) || null;
  console.info("[Action Debug] create-lead DB query result", {
    request_id: requestId,
    query: "case_files latest by opportunity",
    row_count: Number((caseRows || []).length),
  });

  const issueList = [
    ...(Array.isArray(opp.opportunity_signals) ? opp.opportunity_signals : []),
    ...(Array.isArray(caseRow?.audit_issues) ? caseRow?.audit_issues || [] : []),
    ...(Array.isArray(caseRow?.strongest_problems) ? caseRow?.strongest_problems || [] : []),
  ]
    .map((v) => String(v || "").trim())
    .filter(Boolean);
  const websiteRaw = String(opp.website || "").trim() || null;
  const facebookRaw = String(caseRow?.facebook_url || caseRow?.facebook || "").trim() || null;
  const phoneRaw = String(caseRow?.phone_from_site || "").trim() || null;
  const emailRaw = String(caseRow?.email || "").trim() || null;

  const intake = evaluateScoutIntakeTarget({
    category: opp.category,
    website: websiteRaw,
    facebookUrl: facebookRaw,
    phone: phoneRaw,
    email: emailRaw,
  });
  if (!intake.ok) {
    return NextResponse.json({
      ok: true,
      created: false,
      reason: intake.skipReason || "skipped",
      message:
        intake.skipReason === "non_priority_category"
          ? "Lead skipped: category not in priority list (pressure washing, detailing, landscaping, plumbing, HVAC, roofing)."
          : intake.skipReason === "has_standalone_website"
            ? "Lead skipped: already has a standalone website."
            : intake.skipReason === "missing_contact"
              ? "Lead skipped: needs phone or email."
              : "Lead skipped by scout intake rules.",
    });
  }

  const conversion = scoreScoutLead({
    business_name: opp.business_name,
    category: opp.category,
    website: opp.website,
    phone: caseRow?.phone_from_site || null,
    email: caseRow?.email || null,
    review_count: Number(caseRow?.google_review_count || 0),
    issue_texts: issueList,
    website_status: null,
  });
  if (conversion.excluded) {
    return NextResponse.json({
      ok: true,
      created: false,
      reason: "excluded",
      excluded_reason: conversion.excluded_reason,
      lead_score: conversion.lead_score,
      message: "Lead excluded by high-conversion filters.",
    });
  }
  if (!conversion.has_phone && !conversion.has_email) {
    return NextResponse.json({
      ok: true,
      created: false,
      reason: "missing_contactability",
      lead_score: conversion.lead_score,
      message: "Lead skipped: requires phone or email.",
    });
  }
  const reason = String(opp.opportunity_reason || "").trim();
  const assessment = buildLeadAssessment({
    website: String(opp.website || "").trim() || null,
    opportunity_score: opp.opportunity_score ?? null,
    category: String(opp.category || "").trim() || null,
    issue_summary: reason || null,
    issue_list: issueList,
    email: String(caseRow?.email || "").trim() || null,
    phone: String(caseRow?.phone_from_site || "").trim() || null,
    contact_page: String(caseRow?.contact_page || caseRow?.contact_form_url || "").trim() || null,
    facebook_url: String(caseRow?.facebook_url || caseRow?.facebook || "").trim() || null,
    lead_status: "new",
  });

  const businessName = String(opp.business_name || "").trim() || "Unknown business";
  const website = websiteRaw;
  const facebook_url = facebookRaw || undefined;

  let resolvedScoutLeadSource = "scout_mixed";
  let resolvedSourceUrl: string | null = null;
  let resolvedSourceLabel = "Added from Scout";
  if (scoutResultId) {
    const { data: srRow, error: srErr } = await supabase
      .from("scout_results")
      .select("source_type,source_url")
      .eq("id", scoutResultId)
      .eq("owner_id", ownerId)
      .maybeSingle();
    const row = !srErr ? (srRow as { source_type?: string | null; source_url?: string | null } | null) : null;
    if (row) {
      resolvedScoutLeadSource = mapScoutSourceTypeToLeadSource(row.source_type);
      resolvedSourceUrl = String(row.source_url || "").trim() || null;
      if (resolvedScoutLeadSource === "scout_google") resolvedSourceLabel = "Added from Scout (Google)";
      else if (resolvedScoutLeadSource === "scout_facebook") resolvedSourceLabel = "Added from Scout (Facebook)";
      else resolvedSourceLabel = "Added from Scout";
    }
  }

  const insertPayload = pickLeadInsertFields({
    owner_id: ownerId,
    workspace_id: workspaceId,
    linked_opportunity_id: opp.id,
    business_name: businessName,
    contact_name: null,
    email: emailRaw || null,
    phone: phoneRaw || null,
    website,
    facebook_url: facebook_url || null,
    has_website: leadHasStandaloneWebsite(website || undefined),
    normalized_website: normalizeWebsiteUrl(website) || null,
    normalized_facebook_url: normalizeFacebookUrl(facebook_url) || null,
    category: String(opp.category || "").trim() || null,
    industry: String(opp.category || "").trim() || null,
    source: resolvedScoutLeadSource,
    lead_source: resolvedScoutLeadSource,
    source_url: resolvedSourceUrl,
    source_label: resolvedSourceLabel,
    scout_intake_reason: intake.intakeReason,
    address: String(opp.address || "").trim() || null,
    best_contact_method: assessment.best_contact_method || "none",
    opportunity_score: conversion.lead_score,
    conversion_score: conversion.lead_score,
    why_this_lead_is_here: conversion.why_this_lead,
    visual_business: conversion.visual_business,
    auto_intake: true,
    status: "new",
    notes: `Scout: ${intake.intakeReason || "Target"}. ${conversion.why_this_lead}. Problem: ${assessment.primary_problem}. Opportunity reason: ${
      reason || assessment.primary_problem
    }.`,
  });

  const dedup = await findLeadDuplicate({
    supabase,
    ownerId,
    businessName,
    email: emailRaw || null,
    phone: phoneRaw || null,
    website,
    facebookUrl: facebook_url || null,
  });
  if (dedup.duplicate && dedup.matchedLeadId) {
    await linkScoutRow(dedup.matchedLeadId);
    return NextResponse.json({
      ok: true,
      created: false,
      reason: "duplicate_existing_lead",
      lead_id: dedup.matchedLeadId,
      case_id: existingCaseId,
      business_name: businessName,
      message: "Lead already exists.",
      duplicate_reason: dedup.reason,
    });
  }

  console.info("[Action Debug] lead insert attempted", {
    opportunityId,
    businessName,
    workspaceId,
  });
  const { data: insertedRows, error: insertError } = await supabase
    .from("leads")
    .insert(insertPayload)
    .select("id,business_name")
    .limit(1);
  if (insertError) {
    const lowered = String(insertError.message || "").toLowerCase();
    if (lowered.includes("duplicate") || lowered.includes("unique")) {
      const { data: conflictRows } = await supabase
        .from("leads")
        .select("id,business_name")
        .eq("owner_id", ownerId)
        .eq("linked_opportunity_id", opportunityId)
        .limit(1);
      const conflict = (conflictRows || [])[0] as { id?: string | null; business_name?: string | null } | undefined;
      if (conflict?.id) {
        console.info("[Action Debug] create-lead response sent", {
          request_id: requestId,
          status: 200,
          body: {
            ok: true,
            created: false,
            reason: "duplicate_conflict",
            lead_id: String(conflict.id || ""),
          },
        });
        await linkScoutRow(String(conflict.id || ""));
        return NextResponse.json(
          {
            ok: true,
            created: false,
            reason: "duplicate_conflict",
            lead_id: String(conflict.id || ""),
            case_id: String(caseRow?.id || "").trim() || null,
            business_name: String(conflict.business_name || businessName || ""),
            message: "Lead already exists.",
          },
          { status: 200 }
        );
      }
    }
    return fail(500, "insert_failed", insertError.message);
  }
  const inserted = (insertedRows || [])[0] as { id?: string | null; business_name?: string | null } | undefined;
  if (!inserted?.id) {
    return fail(500, "insert_missing_id", "Lead insert succeeded but no id returned.");
  }
  const { data: verifyRow, error: verifyError } = await supabase
    .from("leads")
    .select("id,owner_id,workspace_id")
    .eq("id", String(inserted.id || ""))
    .eq("owner_id", ownerId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (verifyError || !verifyRow) {
    return fail(
      500,
      "post_insert_verification_failed",
      "Lead insert was not visible after insert verification.",
      {
        inserted_lead_id: String(inserted.id || ""),
        verify_error: verifyError?.message || null,
      }
    );
  }
  console.info("[Action Debug] lead insert succeeded", {
    request_id: requestId,
    opportunityId,
    leadId: String(inserted.id || ""),
  });

  await linkScoutRow(String(inserted.id || ""));

  const responseBody = {
    ok: true,
    created: true,
    reason: "created",
    lead_id: String(inserted.id),
    case_id: String(caseRow?.id || "").trim() || null,
    business_name: String(inserted.business_name || businessName || ""),
    message: "Lead created from top opportunity.",
  };
  console.info("[Action Debug] create-lead response sent", {
    request_id: requestId,
    status: 200,
    body: responseBody,
  });
  return NextResponse.json({
    ...responseBody,
  });
}
