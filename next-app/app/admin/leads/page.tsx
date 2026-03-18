import { createClient } from "@/lib/supabase/server";
import { BackfillLeadsButton } from "@/components/admin/backfill-leads-button";
import { LeadsWorkflowView, type WorkflowLead } from "@/components/admin/leads-workflow-view";

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
  return {
    id: String(row.id || ""),
    workspace_id: String(row.workspace_id || "").trim() || null,
    related_case_id: null,
    lead_source: null,
    opportunity_id: null,
    business_name: businessName,
    category: String(row.industry || "").trim() || null,
    city: null,
    address: String(row.address || "").trim() || null,
    website_status: null,
    opportunity_score: null,
    lead_bucket: email ? "Good Prospect" : "Needs Review",
    close_probability: null,
    lead_type: email ? "Easy Win" : "Needs Review",
    best_contact_method: email ? "email" : phone ? "phone" : "none",
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
    recommended_next_action: email ? "Generate Email" : "Research Later",
    outreach_channel: email ? "email" : phone ? "contact" : "skip",
    is_door_to_door_candidate: false,
    website: website || null,
    email: email || null,
    email_source: email ? "manual" : "No Email Found",
    phone_from_site: phone || null,
    contact_page: null,
    facebook_url: null,
    google_review_count: null,
    google_rating: null,
    door_score: null,
    distance_km: null,
    contact_method: email ? "email" : phone ? "phone" : "No Contact Path",
    detected_issue_summary: "No website audit data yet",
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
    is_manual: true,
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
    const { data, error: leadsError } = await supabase
      .from("leads")
      .select(
        `
          id,
          owner_id,
          workspace_id,
          created_at,
          status,
          business_name,
          email,
          phone,
          website,
          industry,
          notes,
          address
        `
      )
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (leadsError) {
      console.error("Leads query error:", leadsError);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("leads")
        .select("id,owner_id,workspace_id,created_at,status,business_name,email,phone,website,industry,notes,address")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });
      if (fallbackError) {
        console.error("Leads fallback query error:", fallbackError);
      } else {
        rows = (fallbackData || []) as LeadRow[];
      }
    } else {
      rows = (data || []) as LeadRow[];
    }
  } catch (err) {
    console.error("Leads load failed:", err);
  }

  const workflowLeads = rows.map(toWorkflowLead);
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
          DB reality - public.leads: {totalLeadsCount} | public.opportunities: {totalOpportunitiesCount}
        </p>
      </section>

      <LeadsWorkflowView initialLeads={workflowLeads} emptyStateReason={emptyStateReason} />
    </div>
  );
}
