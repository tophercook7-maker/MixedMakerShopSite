import { leadHasStandaloneWebsite, pickLeadInsertFields } from "@/lib/crm-lead-schema";
import { findLeadDuplicate, normalizeFacebookUrl, normalizeWebsiteUrl } from "@/lib/leads-dedup";
import { evaluateScoutIntakeTarget, scoreScoutLead } from "@/lib/scout-conversion";

type SupabaseLike = {
  from: (table: string) => any;
};

type OpportunitySeed = {
  id: string;
  owner_id?: string | null;
  user_id?: string | null;
  workspace_id?: string | null;
  business_name?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  created_at?: string | null;
  category?: string | null;
  industry?: string | null;
  address?: string | null;
  city?: string | null;
};

type SyncStats = {
  opportunities_scanned: number;
  opportunities_found: number;
  opportunities_eligible: number;
  leads_created: number;
  already_existing: number;
  skipped_missing_business_name: number;
  skipped_missing_workspace_id: number;
  skipped_owner_mismatch: number;
  skipped_missing_contact_path: number;
  skipped_low_conversion: number;
  skipped_excluded: number;
  skipped_missing_opportunity: number;
  skipped_duplicate: number;
  insert_failed: number;
  failed: number;
  exact_insert_errors: string[];
  failing_records: Array<{
    id: string | null;
    business_name: string | null;
    workspace_id: string | null;
    website: string | null;
    email: string | null;
    phone: string | null;
    reason_skipped_or_failed: string;
  }>;
};

function slugTokenToBusinessNameQuery(token: string): string {
  return String(token || "")
    .trim()
    .toLowerCase()
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isUuidLike(value: string | null | undefined): boolean {
  const raw = String(value || "").trim().toLowerCase();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(raw);
}

async function loadOpportunitiesForOwner(supabase: SupabaseLike, ownerId: string, limit: number): Promise<OpportunitySeed[]> {
  const variants = [
    "id,owner_id,user_id,workspace_id,business_name,website,phone,email,created_at,category,industry,address,city",
    "id,user_id,workspace_id,business_name,website,phone,created_at,category,industry,address,city",
    "id,user_id,workspace_id,business_name,website,created_at,category,address,city",
  ];
  for (const select of variants) {
    const primary = await supabase
      .from("opportunities")
      .select(select)
      .eq("user_id", ownerId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (!primary.error) return (primary.data || []) as OpportunitySeed[];

    const secondary = await supabase
      .from("opportunities")
      .select(select)
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (!secondary.error) return (secondary.data || []) as OpportunitySeed[];
  }
  return [];
}

export async function upsertLeadFromOpportunity(
  supabase: SupabaseLike,
  ownerId: string,
  opp: OpportunitySeed
): Promise<{ leadId: string | null; created: boolean; skipped: boolean; reason: string | null; error: string | null }> {
  const oppId = String(opp.id || "").trim();
  if (!oppId) return { leadId: null, created: false, skipped: true, reason: "missing_opportunity", error: null };
  const businessName = String(opp.business_name || "").trim();
  const workspaceId = String(opp.workspace_id || "").trim();
  const website = String(opp.website || "").trim();
  const phone = String(opp.phone || "").trim();
  const email = String(opp.email || "").trim().toLowerCase();
  const oppOwner = String(opp.owner_id || opp.user_id || "").trim();
  if (!businessName) return { leadId: null, created: false, skipped: true, reason: "missing_business_name", error: null };
  if (!workspaceId) return { leadId: null, created: false, skipped: true, reason: "missing_workspace_id", error: null };
  if (oppOwner && oppOwner !== ownerId) {
    return { leadId: null, created: false, skipped: true, reason: "owner_mismatch", error: null };
  }
  if (!email && !phone) return { leadId: null, created: false, skipped: true, reason: "missing_contact_path", error: null };

  const intake = evaluateScoutIntakeTarget({
    category: String(opp.category || opp.industry || "").trim() || null,
    website,
    facebookUrl: null,
    phone,
    email,
  });
  if (!intake.ok) {
    return {
      leadId: null,
      created: false,
      skipped: true,
      reason: intake.skipReason || "skipped_intake",
      error: null,
    };
  }

  const conversion = scoreScoutLead({
    business_name: businessName,
    category: String(opp.category || opp.industry || "").trim() || null,
    website,
    phone,
    email,
    review_count: null,
    issue_texts: [],
    website_status: null,
  });
  if (conversion.excluded) {
    return { leadId: null, created: false, skipped: true, reason: "excluded", error: null };
  }
  if (!conversion.has_phone && !conversion.has_email) {
    return { leadId: null, created: false, skipped: true, reason: "missing_contact_path", error: null };
  }

  const existing = await supabase
    .from("leads")
    .select("id")
    .eq("owner_id", ownerId)
    .eq("linked_opportunity_id", oppId)
    .limit(1);
  if (existing.error) {
    return {
      leadId: null,
      created: false,
      skipped: false,
      reason: "insert_failed",
      error: String(existing.error?.message || "lead existence check failed"),
    };
  }
  const existingId = String((existing.data || [])[0]?.id || "").trim();
  if (existingId) return { leadId: existingId, created: false, skipped: true, reason: "duplicate", error: null };

  const dedup = await findLeadDuplicate({
    supabase,
    ownerId,
    businessName,
    email,
    phone,
    website,
    facebookUrl: null,
  });
  if (dedup.duplicate && dedup.matchedLeadId) {
    return { leadId: dedup.matchedLeadId, created: false, skipped: true, reason: "duplicate", error: null };
  }

  const payload = pickLeadInsertFields({
    owner_id: ownerId,
    workspace_id: workspaceId,
    linked_opportunity_id: oppId,
    business_name: businessName || "Unknown business",
    website: website || null,
    phone: phone || null,
    email: email || null,
    category: String(opp.category || opp.industry || "").trim() || null,
    industry: String(opp.industry || opp.category || "").trim() || null,
    address: String(opp.address || "").trim() || null,
    why_this_lead_is_here: conversion.why_this_lead,
    visual_business: conversion.visual_business,
    scout_intake_reason: intake.intakeReason,
    has_website: leadHasStandaloneWebsite(website),
    normalized_website: normalizeWebsiteUrl(website) || null,
    conversion_score: conversion.lead_score,
    opportunity_score: conversion.lead_score,
    source: "scout_mixed",
    lead_source: "scout_mixed",
    source_label: "Synced from Scout opportunity",
    status: "new",
    notes: `Auto-sync. Scout: ${intake.intakeReason || "ok"}. ${conversion.why_this_lead}`,
  });
  const createdAt = String(opp.created_at || "").trim();
  if (createdAt) (payload as Record<string, unknown>).created_at = createdAt;

  const inserted = await supabase.from("leads").insert(payload).select("id").limit(1);
  const insertedId = String((inserted.data || [])[0]?.id || "").trim();
  if (inserted.error || !insertedId) {
    return {
      leadId: null,
      created: false,
      skipped: false,
      reason: "insert_failed",
      error: String(inserted.error?.message || "insert returned no id"),
    };
  }
  const verify = await supabase
    .from("leads")
    .select("id,owner_id,workspace_id")
    .eq("id", insertedId)
    .eq("owner_id", ownerId)
    .eq("workspace_id", workspaceId)
    .limit(1);
  if (verify.error || !((verify.data || [])[0]?.id)) {
    return {
      leadId: null,
      created: false,
      skipped: false,
      reason: "post_insert_verification_failed",
      error: String(verify.error?.message || "lead not visible after insert"),
    };
  }
  return { leadId: insertedId, created: true, skipped: false, reason: null, error: null };
}

export async function syncLeadsFromOpportunities(
  supabase: SupabaseLike,
  ownerId: string,
  limit = 5000
): Promise<SyncStats> {
  const stats: SyncStats = {
    opportunities_scanned: 0,
    opportunities_found: 0,
    opportunities_eligible: 0,
    leads_created: 0,
    already_existing: 0,
    skipped_missing_business_name: 0,
    skipped_missing_workspace_id: 0,
    skipped_owner_mismatch: 0,
    skipped_missing_contact_path: 0,
    skipped_low_conversion: 0,
    skipped_excluded: 0,
    skipped_missing_opportunity: 0,
    skipped_duplicate: 0,
    insert_failed: 0,
    failed: 0,
    exact_insert_errors: [],
    failing_records: [],
  };
  const opportunities = await loadOpportunitiesForOwner(supabase, ownerId, limit);
  stats.opportunities_found = opportunities.length;

  const pushFailureSample = (opp: OpportunitySeed, reason: string) => {
    if (stats.failing_records.length >= 10) return;
    stats.failing_records.push({
      id: String(opp.id || "").trim() || null,
      business_name: String(opp.business_name || "").trim() || null,
      workspace_id: String(opp.workspace_id || "").trim() || null,
      website: String(opp.website || "").trim() || null,
      email: String(opp.email || "").trim().toLowerCase() || null,
      phone: String(opp.phone || "").trim() || null,
      reason_skipped_or_failed: reason,
    });
  };

  const addInsertError = (message: string) => {
    const clean = String(message || "").trim();
    if (!clean) return;
    if (stats.exact_insert_errors.includes(clean)) return;
    if (stats.exact_insert_errors.length >= 20) return;
    stats.exact_insert_errors.push(clean);
  };

  for (const opp of opportunities) {
    stats.opportunities_scanned += 1;
    try {
      const result = await upsertLeadFromOpportunity(supabase, ownerId, opp);
      const reason = String(result.reason || "");
      if (result.created) {
        stats.opportunities_eligible += 1;
        stats.leads_created += 1;
      } else if (reason === "duplicate" && result.leadId) {
        stats.opportunities_eligible += 1;
        stats.already_existing += 1;
        stats.skipped_duplicate += 1;
      } else if (reason === "missing_business_name") {
        stats.skipped_missing_business_name += 1;
        pushFailureSample(opp, reason);
      } else if (reason === "missing_workspace_id") {
        stats.skipped_missing_workspace_id += 1;
        pushFailureSample(opp, reason);
      } else if (reason === "missing_contact_path") {
        stats.skipped_missing_contact_path += 1;
        pushFailureSample(opp, reason);
      } else if (reason === "low_conversion_score") {
        stats.skipped_low_conversion += 1;
        pushFailureSample(opp, reason);
      } else if (reason === "excluded") {
        stats.skipped_excluded += 1;
        pushFailureSample(opp, reason);
      } else if (reason === "owner_mismatch") {
        stats.skipped_owner_mismatch += 1;
        pushFailureSample(opp, reason);
      } else if (reason === "missing_opportunity") {
        stats.skipped_missing_opportunity += 1;
        pushFailureSample(opp, reason);
      } else {
        stats.opportunities_eligible += 1;
        stats.insert_failed += 1;
        stats.failed += 1;
        const errorMessage = String(result.error || "insert_failed");
        addInsertError(errorMessage);
        pushFailureSample(opp, `insert_failed: ${errorMessage}`);
      }
    } catch (error) {
      stats.opportunities_eligible += 1;
      stats.insert_failed += 1;
      stats.failed += 1;
      const errorMessage = error instanceof Error ? error.message : "insert_failed";
      addInsertError(errorMessage);
      pushFailureSample(opp, `insert_failed: ${errorMessage}`);
    }
  }
  stats.failed = stats.insert_failed;
  return stats;
}

export async function ensureLeadFromOpportunityToken(
  supabase: SupabaseLike,
  ownerId: string,
  token: string
): Promise<{ leadId: string | null; created: boolean; opportunityId: string | null; insertError: string | null }> {
  const target = String(token || "").trim();
  if (!target) return { leadId: null, created: false, opportunityId: null, insertError: null };

  let opp: OpportunitySeed | null = null;
  if (isUuidLike(target)) {
    const byIdUser = await supabase
      .from("opportunities")
      .select("id,owner_id,user_id,workspace_id,business_name,website,phone,email,created_at,category,industry,address,city")
      .eq("id", target)
      .eq("user_id", ownerId)
      .limit(1);
    if (!byIdUser.error && (byIdUser.data || []).length > 0) {
      opp = ((byIdUser.data || [])[0] as OpportunitySeed | undefined) || null;
    } else {
      const byIdOwner = await supabase
        .from("opportunities")
        .select("id,owner_id,user_id,workspace_id,business_name,website,phone,email,created_at,category,industry,address,city")
        .eq("id", target)
        .eq("owner_id", ownerId)
        .limit(1);
      opp = ((byIdOwner.data || [])[0] as OpportunitySeed | undefined) || null;
    }
  } else {
    const businessToken = slugTokenToBusinessNameQuery(target);
    if (businessToken) {
      const byNameUser = await supabase
        .from("opportunities")
        .select("id,owner_id,user_id,workspace_id,business_name,website,phone,email,created_at,category,industry,address,city")
        .eq("user_id", ownerId)
        .ilike("business_name", `%${businessToken}%`)
        .order("created_at", { ascending: false })
        .limit(25);
      if (!byNameUser.error && (byNameUser.data || []).length > 0) {
        opp = ((byNameUser.data || [])[0] as OpportunitySeed | undefined) || null;
      } else {
        const byNameOwner = await supabase
          .from("opportunities")
          .select("id,owner_id,user_id,workspace_id,business_name,website,phone,email,created_at,category,industry,address,city")
          .eq("owner_id", ownerId)
          .ilike("business_name", `%${businessToken}%`)
          .order("created_at", { ascending: false })
          .limit(25);
        opp = ((byNameOwner.data || [])[0] as OpportunitySeed | undefined) || null;
      }
    }
  }
  if (!opp?.id) return { leadId: null, created: false, opportunityId: null, insertError: null };
  try {
    const result = await upsertLeadFromOpportunity(supabase, ownerId, opp);
    return {
      leadId: result.leadId,
      created: result.created,
      opportunityId: String(opp.id || "").trim() || null,
      insertError: result.error || (result.leadId ? null : "insert_failed_or_not_visible"),
    };
  } catch (error) {
    return {
      leadId: null,
      created: false,
      opportunityId: String(opp.id || "").trim() || null,
      insertError: error instanceof Error ? error.message : "unknown",
    };
  }
}
