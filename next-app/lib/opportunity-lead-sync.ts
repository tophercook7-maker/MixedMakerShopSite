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
  leads_created: number;
  already_existing: number;
  skipped_invalid: number;
  failed: number;
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
): Promise<{ leadId: string | null; created: boolean }> {
  const oppId = String(opp.id || "").trim();
  if (!oppId) return { leadId: null, created: false };

  const existing = await supabase
    .from("leads")
    .select("id")
    .eq("owner_id", ownerId)
    .or(`id.eq.${oppId},linked_opportunity_id.eq.${oppId}`)
    .limit(1);
  const existingId = String((existing.data || [])[0]?.id || "").trim();
  if (existingId) return { leadId: existingId, created: false };

  const businessName = String(opp.business_name || "").trim() || "Unknown business";
  const payload: Record<string, unknown> = {
    id: oppId,
    owner_id: String(opp.owner_id || opp.user_id || ownerId || "").trim() || ownerId,
    workspace_id: String(opp.workspace_id || "").trim() || null,
    linked_opportunity_id: oppId,
    business_name: businessName,
    website: String(opp.website || "").trim() || null,
    phone: String(opp.phone || "").trim() || null,
    email: String(opp.email || "").trim().toLowerCase() || null,
    industry: String(opp.industry || opp.category || "").trim() || null,
    address: String(opp.address || "").trim() || null,
    status: String(opp.email || "").trim() ? "new" : "research_later",
    notes: "Auto-created from opportunity sync.",
  };
  const createdAt = String(opp.created_at || "").trim();
  if (createdAt) payload.created_at = createdAt;

  const inserted = await supabase.from("leads").insert(payload).select("id").limit(1);
  const insertedId = String((inserted.data || [])[0]?.id || "").trim();
  if (inserted.error || !insertedId) return { leadId: null, created: false };
  return { leadId: insertedId, created: true };
}

export async function syncLeadsFromOpportunities(
  supabase: SupabaseLike,
  ownerId: string,
  limit = 5000
): Promise<SyncStats> {
  const stats: SyncStats = {
    opportunities_scanned: 0,
    leads_created: 0,
    already_existing: 0,
    skipped_invalid: 0,
    failed: 0,
  };
  const opportunities = await loadOpportunitiesForOwner(supabase, ownerId, limit);
  for (const opp of opportunities) {
    stats.opportunities_scanned += 1;
    const oppId = String(opp.id || "").trim();
    const businessName = String(opp.business_name || "").trim();
    if (!oppId || !businessName) {
      stats.skipped_invalid += 1;
      continue;
    }
    try {
      const result = await upsertLeadFromOpportunity(supabase, ownerId, opp);
      if (result.created) stats.leads_created += 1;
      else if (result.leadId) stats.already_existing += 1;
      else stats.failed += 1;
    } catch {
      stats.failed += 1;
    }
  }
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
      insertError: result.leadId ? null : "insert_failed_or_not_visible",
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
