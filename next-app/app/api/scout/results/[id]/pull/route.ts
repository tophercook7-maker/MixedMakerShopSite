import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildLeadAssessment } from "@/lib/lead-assessment";
import { resolveWorkspaceIdForOwner } from "@/lib/calendar-events";
import { findLeadDuplicate, normalizeFacebookUrl, normalizeWebsiteUrl } from "@/lib/leads-dedup";
import { scoreScoutLead } from "@/lib/scout-conversion";
import { leadHasStandaloneWebsite, pickLeadInsertFields } from "@/lib/crm-lead-schema";
import { markScoutResultLinked } from "@/lib/scout/scout-results-service";

export const dynamic = "force-dynamic";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "").trim()
  );
}

function emailFromRaw(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const e = o.email ?? o.contact_email ?? o.best_email;
  const s = String(e || "").trim();
  return s || null;
}

type ScoutResultRow = {
  id: string;
  business_name: string | null;
  city: string | null;
  state: string | null;
  category: string | null;
  source_type: string | null;
  source_url: string | null;
  source_external_id: string | null;
  website_url: string | null;
  facebook_url: string | null;
  phone: string | null;
  opportunity_reason: string | null;
  raw_source_payload: Record<string, unknown> | null;
  skipped: boolean | null;
  added_to_leads: boolean | null;
  linked_lead_id: string | null;
};

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const scoutId = String(id || "").trim();
  if (!scoutId) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: row, error: loadErr } = await supabase
    .from("scout_results")
    .select(
      "id,business_name,city,state,category,source_type,source_url,source_external_id,website_url,facebook_url,phone,opportunity_reason,raw_source_payload,skipped,added_to_leads,linked_lead_id"
    )
    .eq("id", scoutId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (loadErr) return NextResponse.json({ error: loadErr.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const sr = row as ScoutResultRow;
  if (sr.skipped) {
    return NextResponse.json({ error: "This Scout row is skipped; un-skip before pulling." }, { status: 409 });
  }
  if (sr.added_to_leads && sr.linked_lead_id) {
    return NextResponse.json({
      ok: true,
      created: false,
      reason: "already_in_crm",
      lead_id: String(sr.linked_lead_id),
    });
  }

  const businessName = String(sr.business_name || "").trim() || "Unknown business";
  const website = String(sr.website_url || "").trim() || null;
  const facebookUrl = String(sr.facebook_url || "").trim() || null;
  const phoneRaw = String(sr.phone || "").trim() || null;
  const emailRaw = emailFromRaw(sr.raw_source_payload);
  const reason = String(sr.opportunity_reason || "").trim();

  const conversion = scoreScoutLead({
    business_name: businessName,
    category: sr.category,
    website,
    phone: phoneRaw,
    email: emailRaw,
    review_count: Number((sr.raw_source_payload as { google_review_count?: unknown } | null)?.google_review_count ?? 0),
    issue_texts: reason ? [reason] : [],
    website_status: null,
  });

  const assessment = buildLeadAssessment({
    website,
    opportunity_score: conversion.lead_score,
    category: String(sr.category || "").trim() || null,
    issue_summary: reason || null,
    issue_list: reason ? [reason] : [],
    email: emailRaw,
    phone: phoneRaw,
    facebook_url: facebookUrl,
    lead_status: "new",
    has_contact_path: Boolean(emailRaw || phoneRaw || facebookUrl || website),
  });

  const workspaceId = await resolveWorkspaceIdForOwner(ownerId);
  if (!workspaceId) {
    return NextResponse.json(
      {
        error: "No workspace_id could be resolved. Add a lead with a workspace, or set SCOUT_WORKSPACE_ID.",
        reason: "missing_workspace",
      },
      { status: 422 }
    );
  }

  let linkedOpportunityId: string | null = null;
  const ext = String(sr.source_external_id || "").trim();
  if (ext && isUuid(ext)) {
    const { data: oppScoped } = await supabase
      .from("opportunities")
      .select("id")
      .eq("id", ext)
      .or(`owner_id.eq.${ownerId},user_id.eq.${ownerId}`)
      .maybeSingle();
    if (oppScoped?.id) linkedOpportunityId = ext;
  }

  const dedup = await findLeadDuplicate({
    supabase,
    ownerId,
    businessName,
    email: emailRaw,
    phone: phoneRaw,
    website,
    facebookUrl,
  });
  if (dedup.duplicate && dedup.matchedLeadId) {
    await markScoutResultLinked(supabase, ownerId, scoutId, dedup.matchedLeadId);
    return NextResponse.json({
      ok: true,
      created: false,
      reason: "duplicate_existing_lead",
      lead_id: dedup.matchedLeadId,
      duplicate_reason: dedup.reason,
      message: "Linked to existing CRM lead.",
    });
  }

  const nowIso = new Date().toISOString();
  const insertPayload = pickLeadInsertFields({
    owner_id: ownerId,
    workspace_id: workspaceId,
    linked_opportunity_id: linkedOpportunityId,
    business_name: businessName,
    contact_name: null,
    email: emailRaw,
    phone: phoneRaw,
    website,
    facebook_url: facebookUrl,
    city: String(sr.city || "").trim() || null,
    state: String(sr.state || "").trim() || null,
    has_website: leadHasStandaloneWebsite(website),
    normalized_website: normalizeWebsiteUrl(website) || null,
    normalized_facebook_url: normalizeFacebookUrl(facebookUrl) || null,
    category: String(sr.category || "").trim() || null,
    industry: String(sr.category || "").trim() || null,
    source: "scout",
    lead_source: "scout",
    source_url: String(sr.source_url || "").trim() || null,
    source_label: "Pulled from Scout review",
    scout_intake_reason: "scout_queue_pull",
    why_this_lead_is_here: conversion.why_this_lead || assessment.why_this_lead_is_here,
    visual_business: conversion.visual_business,
    opportunity_score: conversion.lead_score,
    conversion_score: conversion.lead_score,
    best_contact_method: assessment.best_contact_method || "none",
    auto_intake: true,
    status: "new",
    notes: `Scout discovery queue → CRM. ${reason || conversion.why_this_lead || ""}`.trim(),
    next_follow_up_at: nowIso,
    follow_up_count: 0,
    follow_up_status: "pending",
    last_updated_at: nowIso,
  });

  const { data: insertedRows, error: insertError } = await supabase
    .from("leads")
    .insert(insertPayload)
    .select("id,business_name")
    .limit(1);

  if (insertError) {
    return NextResponse.json({ error: insertError.message, reason: "insert_failed" }, { status: 500 });
  }
  const inserted = (insertedRows || [])[0] as { id?: string | null; business_name?: string | null } | undefined;
  const newId = String(inserted?.id || "").trim();
  if (!newId) {
    return NextResponse.json({ error: "Insert succeeded but no id returned.", reason: "insert_missing_id" }, { status: 500 });
  }

  await markScoutResultLinked(supabase, ownerId, scoutId, newId);

  return NextResponse.json({
    ok: true,
    created: true,
    reason: "created",
    lead_id: newId,
    business_name: String(inserted?.business_name ?? businessName),
  });
}
