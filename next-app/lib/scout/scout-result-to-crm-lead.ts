import type { SupabaseClient } from "@supabase/supabase-js";
import { buildLeadAssessment } from "@/lib/lead-assessment";
import { resolveWorkspaceIdForOwner } from "@/lib/calendar-events";
import { findLeadDuplicate, normalizeFacebookUrl, normalizeWebsiteUrl } from "@/lib/leads-dedup";
import { scoreScoutLead } from "@/lib/scout-conversion";
import { leadHasStandaloneWebsite, pickLeadInsertFields } from "@/lib/crm-lead-schema";
import { markScoutResultLinked } from "@/lib/scout/scout-results-service";
import { hydrateScoutResultRecord } from "@/lib/scout/scout-results-hydrate";

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

export type ResolveScoutLeadToCrmResult =
  | {
      ok: true;
      leadId: string;
      created: boolean;
      businessName: string;
      reason: "created" | "already_in_crm" | "duplicate_existing_lead";
      duplicate_reason?: string;
    }
  | { ok: false; status: number; error: string; reason?: string };

const SCOUT_SELECT =
  "id,business_name,city,state,category,source_type,source_url,source_external_id,website_url,facebook_url,phone,opportunity_reason,raw_source_payload,skipped,added_to_leads,linked_lead_id";

/**
 * Ensures a CRM lead exists for a Scout result: reuse linked lead, link dedupe match, or insert new.
 */
export async function resolveOrCreateLeadFromScoutResult(
  supabase: SupabaseClient,
  ownerId: string,
  scoutId: string
): Promise<ResolveScoutLeadToCrmResult> {
  const { data: row, error: loadErr } = await supabase
    .from("scout_results")
    .select(SCOUT_SELECT)
    .eq("id", scoutId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (loadErr) {
    return { ok: false, status: 500, error: loadErr.message, reason: "load_failed" };
  }
  if (!row) {
    return { ok: false, status: 404, error: "Not found.", reason: "not_found" };
  }

  const sr = row as ScoutResultRow;
  const h = hydrateScoutResultRecord(row as Record<string, unknown>);

  if (sr.skipped) {
    return {
      ok: false,
      status: 409,
      error: "This Scout row is skipped; un-skip before using it.",
      reason: "skipped",
    };
  }

  if (sr.added_to_leads && sr.linked_lead_id) {
    return {
      ok: true,
      leadId: String(sr.linked_lead_id),
      created: false,
      businessName: h.business_name || "Unknown business",
      reason: "already_in_crm",
    };
  }

  const businessName = h.business_name || "Unknown business";
  const website = String(sr.website_url || "").trim() || null;
  const facebookUrl = h.facebook_url;
  const phoneRaw = h.phone;
  const emailRaw = emailFromRaw(sr.raw_source_payload);
  const reason = String(sr.opportunity_reason || "").trim();

  const conversion = scoreScoutLead({
    business_name: businessName,
    category: h.category,
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
    category: h.category,
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
    return {
      ok: false,
      status: 422,
      error:
        "No workspace_id could be resolved. Add a lead with a workspace, or set SCOUT_WORKSPACE_ID.",
      reason: "missing_workspace",
    };
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
    return {
      ok: true,
      leadId: dedup.matchedLeadId,
      created: false,
      businessName,
      reason: "duplicate_existing_lead",
      duplicate_reason: dedup.reason ? String(dedup.reason) : undefined,
    };
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
    city: h.city,
    state: h.state,
    has_website: leadHasStandaloneWebsite(website),
    normalized_website: normalizeWebsiteUrl(website) || null,
    normalized_facebook_url: normalizeFacebookUrl(facebookUrl) || null,
    category: h.category,
    industry: h.category,
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
    return { ok: false, status: 500, error: insertError.message, reason: "insert_failed" };
  }
  const inserted = (insertedRows || [])[0] as { id?: string | null; business_name?: string | null } | undefined;
  const newId = String(inserted?.id || "").trim();
  if (!newId) {
    return {
      ok: false,
      status: 500,
      error: "Insert succeeded but no id returned.",
      reason: "insert_missing_id",
    };
  }

  await markScoutResultLinked(supabase, ownerId, scoutId, newId);

  return {
    ok: true,
    leadId: newId,
    created: true,
    businessName: String(inserted?.business_name ?? businessName),
    reason: "created",
  };
}
