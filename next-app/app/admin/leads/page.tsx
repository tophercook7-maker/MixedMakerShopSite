import { createClient } from "@/lib/supabase/server";
import { BackfillLeadsButton } from "@/components/admin/backfill-leads-button";
import { LeadsWorkflowView, type WorkflowLead } from "@/components/admin/leads-workflow-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type LeadRow = {
  id: string;
  owner_id?: string | null;
  workspace_id?: string | null;
  created_at?: string | null;
  status?: string | null;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  industry?: string | null;
  notes?: string | null;
  address?: string | null;
  city?: string | null;
  category?: string | null;
  contact_page?: string | null;
  facebook_url?: string | null;
  best_contact_method?: string | null;
  email_source?: string | null;
  opportunity_reason?: string | null;
};

function normalizeStatus(value: string | null | undefined): WorkflowLead["status"] {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (!normalized) return "new";
  if (
    normalized === "new" ||
    normalized === "contacted" ||
    normalized === "follow_up_due" ||
    normalized === "replied" ||
    normalized === "no_response" ||
    normalized === "closed" ||
    normalized === "closed_won" ||
    normalized === "closed_lost" ||
    normalized === "do_not_contact" ||
    normalized === "research_later"
  ) {
    return normalized;
  }
  return "new";
}

function toWorkflowLead(row: LeadRow): WorkflowLead {
  const businessName = String(row.business_name || "").trim() || "Unknown business";
  const notes = String(row.notes || "").trim();
  const email = String(row.email || "").trim();
  const phone = String(row.phone || "").trim();
  const website = String(row.website || "").trim();
  const contactPage = String(row.contact_page || "").trim();
  const facebook = String(row.facebook_url || "").trim();
  const bestContactMethod = String(row.best_contact_method || "").trim().toLowerCase();
  const hasEmail = Boolean(email);
  const hasContactAvailable = Boolean(contactPage || facebook || phone);
  const resolvedBestContact = (
    bestContactMethod ||
    (hasEmail ? "email" : contactPage ? "contact_page" : facebook ? "facebook" : phone ? "phone" : "none")
  ) as WorkflowLead["best_contact_method"];
  return {
    id: String(row.id || ""),
    workspace_id: String(row.workspace_id || "").trim() || null,
    related_case_id: null,
    lead_source: null,
    opportunity_id: null,
    business_name: businessName,
    category: String(row.category || row.industry || "").trim() || null,
    city: String(row.city || "").trim() || null,
    address: String(row.address || "").trim() || null,
    website_status: null,
    opportunity_score: null,
    lead_bucket: hasEmail ? "Good Prospect" : hasContactAvailable ? "Needs Review" : "Low Priority",
    close_probability: null,
    lead_type: email ? "Easy Win" : "Needs Review",
    best_contact_method: resolvedBestContact,
    primary_problem: null,
    why_it_matters: null,
    why_this_lead_is_here: null,
    best_pitch_angle: null,
    estimated_value: "low",
    estimated_price_range: "$",
    expected_close_probability: null,
    email_pitch: null,
    text_pitch: null,
    door_pitch: null,
    recommended_next_action: hasEmail ? "Generate Email" : hasContactAvailable ? "Open Contact Path" : "Research Later",
    outreach_channel: hasEmail ? "email" : hasContactAvailable ? "contact" : "skip",
    is_door_to_door_candidate: false,
    website: website || null,
    email: email || null,
    email_source: String(row.email_source || "").trim() || (email ? "unknown" : "No Email Found"),
    phone_from_site: phone || null,
    contact_page: contactPage || null,
    facebook_url: facebook || null,
    google_review_count: null,
    google_rating: null,
    door_score: null,
    distance_km: null,
    contact_method: hasEmail ? "email" : hasContactAvailable ? "contact_available" : "No Contact Path",
    detected_issue_summary: String(row.opportunity_reason || "").trim() || "No website audit data yet",
    detected_issues: [],
    status: normalizeStatus(row.status),
    created_at: String(row.created_at || "").trim() || null,
    screenshot_urls: [],
    annotated_screenshot_url: null,
    timeline: [],
    notes: notes ? [notes] : [],
    is_hot_lead: false,
    last_reply_at: null,
    last_reply_preview: null,
    conversion_score: null,
    score_breakdown: null,
    from_latest_scan: false,
    is_archived: false,
    is_manual: false,
    known_owner_name: null,
    known_context: null,
    door_status: "not_visited",
    last_updated_at: String(row.created_at || "").trim() || null,
  };
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; detail?: string }>;
}) {
  const { error, detail } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view leads.
        </p>
      </section>
    );
  }

  console.info("[Leads Page] source", {
    source: "public.leads",
    owner_id: ownerId,
    non_db_sources_enabled: false,
  });

  let totalLeadsCount = 0;
  let totalOpportunitiesCount = 0;
  try {
    const leadCountRes = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId);
    totalLeadsCount = Number(leadCountRes.count || 0);
  } catch (countError) {
    console.error("[Leads Page] lead count failed", { owner_id: ownerId, error: countError });
  }

  try {
    const oppByUser = await supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("user_id", ownerId);
    if (!oppByUser.error) {
      totalOpportunitiesCount = Number(oppByUser.count || 0);
    } else {
      const oppByOwner = await supabase
        .from("opportunities")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", ownerId);
      totalOpportunitiesCount = Number(oppByOwner.count || 0);
    }
  } catch (countError) {
    console.error("[Leads Page] opportunities count failed", { owner_id: ownerId, error: countError });
  }

  let rows: LeadRow[] = [];
  try {
    const selectVariants = [
      "id,owner_id,workspace_id,created_at,status,business_name,email,email_source,phone,website,industry,category,city,notes,address,contact_page,facebook_url,best_contact_method,opportunity_reason",
      "id,owner_id,workspace_id,created_at,status,business_name,email,email_source,phone,website,industry,category,city,notes,address,contact_page,facebook_url,best_contact_method",
      "id,owner_id,workspace_id,created_at,status,business_name,email,phone,website,industry,category,city,notes,address,contact_page,facebook_url,best_contact_method",
      "id,owner_id,workspace_id,created_at,status,business_name,email,phone,website,industry,notes,address",
    ];
    for (const selectClause of selectVariants) {
      const { data, error: leadsError } = await supabase
        .from("leads")
        .select(selectClause)
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });
      if (!leadsError) {
        rows = (data || []) as unknown as LeadRow[];
        break;
      }
      console.error("Leads query variant failed:", { selectClause, error: leadsError });
    }
  } catch (err) {
    console.error("Leads load failed:", err);
  }

  const dedupedRows = Array.from(
    new Map(
      rows
        .map((row) => [String(row.id || "").trim(), row] as const)
        .filter(([id]) => Boolean(id))
    ).values()
  );
  let workflowLeads = dedupedRows.map(toWorkflowLead);
  const renderedLeadsCountBeforeGuard = workflowLeads.length;
  if (renderedLeadsCountBeforeGuard > totalLeadsCount) {
    console.error("[Leads Page] rendered rows exceeded db leads count; trimming to db count", {
      owner_id: ownerId,
      db_leads_count: totalLeadsCount,
      rendered_leads_count: renderedLeadsCountBeforeGuard,
    });
    workflowLeads = workflowLeads.slice(0, totalLeadsCount);
  }
  const renderedLeadsCount = workflowLeads.length;
  const emptyStateReason =
    workflowLeads.length === 0
      ? "No real leads yet. Run Scout or seed leads."
      : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
          Leads
        </h1>
        <div className="flex gap-2">
          <BackfillLeadsButton />
        </div>
      </div>

      {error ? (
        <section className="admin-card">
          <p className="text-sm" style={{ color: "#fca5a5" }}>
            Lead action failed: {String(detail || error || "unknown error")}
          </p>
        </section>
      ) : null}
      <section className="admin-card">
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Leads list source of truth: <strong>public.leads</strong>
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
          DB reality - db_leads_count: {totalLeadsCount} | db_opportunities_count: {totalOpportunitiesCount} | rendered_leads_count: {renderedLeadsCount}
        </p>
      </section>

      <LeadsWorkflowView initialLeads={workflowLeads} emptyStateReason={emptyStateReason} />
    </div>
  );
}
