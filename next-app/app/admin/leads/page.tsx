import { createClient } from "@/lib/supabase/server";
import { BackfillLeadsButton } from "@/components/admin/backfill-leads-button";
import { LeadsWorkflowView, type WorkflowLead } from "@/components/admin/leads-workflow-view";
import { buildLeadAssessment, scoreToLeadBucket } from "@/lib/lead-assessment";
import { canonicalLeadBucket } from "@/lib/lead-bucket";

type LeadRow = {
  id: string;
  owner_id?: string | null;
  linked_opportunity_id?: string | null;
  workspace_id?: string | null;
  created_at: string | null;
  status: string | null;
  business_name?: string | null;
  email: string | null;
  phone?: string | null;
  website?: string | null;
  industry?: string | null;
  notes?: string | null;
  opportunity_score?: number | null;
  lead_source?: string | null;
  is_hot_lead?: boolean | null;
  last_reply_at?: string | null;
  last_reply_preview?: string | null;
};

type OpportunityRow = {
  id: string;
  business_name?: string;
  category?: string;
  city?: string | null;
  address?: string | null;
  website?: string;
  website_status?: string | null;
  opportunity_score?: number;
  lead_bucket?: string | null;
  opportunity_reason?: string | null;
  opportunity_signals?: string[] | null;
  close_probability?: "low" | "medium" | "high" | null;
};

function missingOpportunityReasonColumn(message: string): boolean {
  const text = String(message || "").toLowerCase();
  return text.includes("opportunities.opportunity_reason") || text.includes("column opportunity_reason");
}

function deriveCloseProbability(score: number | null | undefined, category: string | null | undefined, issues: string[]) {
  const s = Number(score ?? 0);
  const cat = String(category || "").toLowerCase();
  const highCat = [
    "dentist",
    "chiropractor",
    "restaurant",
    "cafe",
    "gym",
    "salon",
    "auto repair",
    "plumber",
    "contractor",
  ].some((k) => cat.includes(k));
  const hasCaptureIssue = issues.some((i) => {
    const t = String(i || "").toLowerCase();
    return t.includes("booking") || t.includes("ordering") || t.includes("contact");
  });
  if (s >= 85 || (s >= 70 && highCat && hasCaptureIssue)) return "high";
  if (s >= 60 || highCat) return "medium";
  return "low";
}

type CaseByOpportunityRow = {
  id: string;
  opportunity_id: string | null;
  status?: string | null;
  email?: string | null;
  contact_page?: string | null;
  contact_form_url?: string | null;
  phone_from_site?: string | null;
  facebook?: string | null;
  facebook_url?: string | null;
  email_source?: string | null;
  audit_issues?: string[] | null;
  strongest_problems?: string[] | null;
  screenshot_url?: string | null;
  screenshot_urls?: string[] | null;
  homepage_screenshot_url?: string | null;
  annotated_screenshot_url?: string | null;
  notes?: string | null;
  outcome?: string | null;
  google_review_count?: number | null;
  reviews_last_30_days?: number | null;
  owner_post_detected?: boolean | null;
  new_photos_detected?: boolean | null;
  listing_recently_updated?: boolean | null;
  created_at?: string | null;
};

type IntakeDiagnostics = {
  workspaceId: string | null;
  opportunitiesInWorkspace: number;
  leadsForOwner: number;
  linkedLeadsForOwner: number;
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

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    source?: string;
    date?: string;
    status?: string;
    sort?: string;
    error?: string;
    detail?: string;
  }>;
}) {
  const { source, date, status, sort, error, detail } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
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

  let baseQuery = supabase
    .from("leads")
    .select(
      "id,owner_id,workspace_id,created_at,status,business_name,email,phone,website,industry,notes,linked_opportunity_id,opportunity_score,lead_source,is_hot_lead,last_reply_at,last_reply_preview"
    )
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })
    .limit(500);
  if (date === "today") baseQuery = baseQuery.gte("created_at", dayStart);

  const { data: joinedRows, error: joinedError } = await baseQuery;
  let queryMode: "relationship" | "failed" = "relationship";
  let queryError: string | null = joinedError?.message || null;
  let rows: LeadRow[] = [];

  if (joinedError) {
    queryMode = "failed";
    queryError = joinedError.message;
    rows = [];
  } else {
    rows = (joinedRows || []) as LeadRow[];
  }

  const opportunityIds = Array.from(
    new Set(
      rows
        .map((row) => String(row.linked_opportunity_id || "").trim())
        .filter(Boolean)
    )
  );
  let fallbackOppRows: OpportunityRow[] = [];
  if (opportunityIds.length) {
    const withReason = await supabase
      .from("opportunities")
      .select("id,business_name,category,city,address,website,website_status,opportunity_score,lead_bucket,opportunity_reason,opportunity_signals")
      .in("id", opportunityIds);
    if (withReason.error?.message && missingOpportunityReasonColumn(withReason.error.message)) {
      const fallback = await supabase
        .from("opportunities")
        .select("id,business_name,category,city,address,website,website_status,opportunity_score,lead_bucket,opportunity_signals")
        .in("id", opportunityIds);
      fallbackOppRows = ((fallback.data || []) as OpportunityRow[]).map((row) => ({
        ...row,
        opportunity_reason: null,
      }));
    } else {
      fallbackOppRows = (withReason.data || []) as OpportunityRow[];
    }
  }
  const fallbackOppById = new Map(
    (fallbackOppRows || []).map((row) => [String(row.id || ""), row as OpportunityRow])
  );
  if (opportunityIds.length && (fallbackOppRows || []).length) {
    console.info("[Leads List] fallback relationship fetch used", {
      requested_opportunity_ids: opportunityIds.length,
      resolved_opportunity_rows: (fallbackOppRows || []).length,
    });
  }
  let caseRows: CaseByOpportunityRow[] = [];
  if (opportunityIds.length) {
    const withEmailSource = await supabase
      .from("case_files")
      .select(
        "id,opportunity_id,status,email,contact_page,contact_form_url,phone_from_site,facebook,facebook_url,email_source,audit_issues,strongest_problems,screenshot_url,screenshot_urls,homepage_screenshot_url,annotated_screenshot_url,notes,outcome,google_review_count,reviews_last_30_days,owner_post_detected,new_photos_detected,listing_recently_updated,created_at"
      )
      .in("opportunity_id", opportunityIds)
      .order("created_at", { ascending: false })
      .limit(1000);
    if (withEmailSource.error?.message?.toLowerCase().includes("email_source")) {
      const fallback = await supabase
        .from("case_files")
        .select(
          "id,opportunity_id,status,email,contact_page,contact_form_url,phone_from_site,facebook,facebook_url,audit_issues,strongest_problems,screenshot_url,screenshot_urls,homepage_screenshot_url,annotated_screenshot_url,notes,outcome,google_review_count,reviews_last_30_days,owner_post_detected,new_photos_detected,listing_recently_updated,created_at"
        )
        .in("opportunity_id", opportunityIds)
        .order("created_at", { ascending: false })
        .limit(1000);
      caseRows = (fallback.data || []) as CaseByOpportunityRow[];
    } else {
      caseRows = (withEmailSource.data || []) as CaseByOpportunityRow[];
    }
  }
  const latestCaseByOppId = new Map<string, CaseByOpportunityRow>();
  for (const row of caseRows) {
    const oppId = String(row.opportunity_id || "").trim();
    if (!oppId || latestCaseByOppId.has(oppId)) continue;
    latestCaseByOppId.set(oppId, row);
  }

  let workflowLeads: WorkflowLead[] = rows.map((row) => {
    const linkedOppId = String(row.linked_opportunity_id || "").trim();
    const opp = linkedOppId ? fallbackOppById.get(linkedOppId) : undefined;
    const caseRow = linkedOppId ? latestCaseByOppId.get(linkedOppId) : undefined;
    const detectedIssuesRaw = Array.isArray(caseRow?.audit_issues)
      ? caseRow!.audit_issues!
      : Array.isArray(caseRow?.strongest_problems)
        ? caseRow!.strongest_problems!
        : [];
    const detectedIssues = detectedIssuesRaw.map((v) => String(v || "").trim()).filter(Boolean).slice(0, 6);
    const opportunityReason = String(opp?.opportunity_reason || "").trim();
    const opportunitySignals = Array.isArray(opp?.opportunity_signals)
      ? opp!.opportunity_signals!.map((v) => String(v || "").trim()).filter(Boolean)
      : [];
    const signalEmailSource =
      opportunitySignals.find((signal) => signal.toLowerCase().startsWith("email_source:"))?.split(":")[1]?.trim() || "";
    const issueList =
      opportunityReason && !detectedIssues.some((issue) => issue.toLowerCase() === opportunityReason.toLowerCase())
        ? [opportunityReason, ...detectedIssues, ...opportunitySignals].slice(0, 6)
        : [...detectedIssues, ...opportunitySignals].slice(0, 6);
    const screenshotCandidates = [
      caseRow?.annotated_screenshot_url,
      caseRow?.screenshot_url,
      caseRow?.homepage_screenshot_url,
      ...(Array.isArray(caseRow?.screenshot_urls) ? caseRow!.screenshot_urls! : []),
    ]
      .map((v) => String(v || "").trim())
      .filter(Boolean);
    const email = String(row.email || caseRow?.email || "").trim();
    const hasEmail = Boolean(email);
    const emailSource = String(caseRow?.email_source || signalEmailSource || "unknown").trim().toLowerCase();
    const phone = String(caseRow?.phone_from_site || row.phone || "").trim();
    const contactPage = String(caseRow?.contact_page || caseRow?.contact_form_url || "").trim();
    const facebookUrl = String(caseRow?.facebook_url || caseRow?.facebook || "").trim();
    const website = String(opp?.website || row.website || "").trim();
    const assessment = buildLeadAssessment({
      website,
      website_status: opp?.website_status || null,
      opportunity_score: opp?.opportunity_score ?? row.opportunity_score ?? null,
      issue_summary: opportunityReason || issueList[0] || "",
      issue_list: issueList,
      category: opp?.category || row.industry || null,
      email,
      phone,
      contact_page: contactPage,
      facebook_url: facebookUrl,
      reviews_last_30_days: caseRow?.reviews_last_30_days ?? null,
      google_review_count: caseRow?.google_review_count ?? null,
      owner_post_detected: caseRow?.owner_post_detected ?? null,
      new_photos_detected: caseRow?.new_photos_detected ?? null,
      listing_recently_updated: caseRow?.listing_recently_updated ?? null,
      lead_status: row.status || null,
    });
    return {
      id: String(row.id || ""),
      workspace_id: String(row.workspace_id || "").trim() || null,
      related_case_id: String(caseRow?.id || "") || null,
      opportunity_id: linkedOppId || null,
      business_name: String(opp?.business_name || row.business_name || "Unknown business"),
      category: String(opp?.category || row.industry || "").trim() || null,
      city: String(opp?.city || "").trim() || null,
      address: String(opp?.address || "").trim() || null,
      website_status: String(opp?.website_status || "").trim() || null,
      opportunity_score: opp?.opportunity_score ?? row.opportunity_score ?? null,
      lead_bucket:
        hasEmail
          ? canonicalLeadBucket(
              String(opp?.lead_bucket || "").trim(),
              opp?.opportunity_score ?? row.opportunity_score ?? null
            ) ||
            assessment.lead_bucket ||
            scoreToLeadBucket(opp?.opportunity_score ?? row.opportunity_score ?? null)
          : "Needs Review",
      close_probability:
        (String(opp?.close_probability || "").trim().toLowerCase() as "low" | "medium" | "high") ||
        assessment.close_probability ||
        deriveCloseProbability(opp?.opportunity_score ?? row.opportunity_score, opp?.category || row.industry, issueList),
      website: website || null,
      email: email || null,
      email_source: email ? emailSource || "unknown" : null,
      phone_from_site: phone || null,
      contact_page: contactPage || null,
      facebook_url: facebookUrl || null,
      contact_method: email
        ? "email"
        : contactPage
            ? "contact page"
          : phone
            ? "phone"
            : facebookUrl
              ? "facebook"
              : "none",
      detected_issue_summary: opportunityReason || issueList[0] || "Contact info is hard to find",
      detected_issues: issueList,
      lead_type: hasEmail ? assessment.lead_type : "Needs Review",
      best_contact_method: hasEmail ? assessment.best_contact_method || null : "none",
      primary_problem: assessment.primary_problem,
      why_it_matters: assessment.why_it_matters,
      why_this_lead_is_here: assessment.why_this_lead_is_here,
      best_pitch_angle: assessment.best_pitch_angle,
      recommended_next_action: hasEmail ? assessment.recommended_next_action : "Research Later",
      status: normalizeStatus(row.status),
      created_at: row.created_at || null,
      screenshot_urls: screenshotCandidates,
      annotated_screenshot_url: caseRow?.annotated_screenshot_url || null,
      timeline: [],
      notes: [String(caseRow?.outcome || "").trim(), String(caseRow?.notes || "").trim(), String(row.notes || "").trim()].filter(Boolean),
      lead_source: String(row.lead_source || "").trim() || null,
      is_hot_lead: Boolean(row.is_hot_lead),
      last_reply_at: String(row.last_reply_at || "").trim() || null,
      last_reply_preview: String(row.last_reply_preview || "").trim() || null,
    };
  });
  console.info("[Leads List] related data resolved", {
    leads_count: rows.length,
    opportunities_resolved: fallbackOppById.size,
    cases_resolved: latestCaseByOppId.size,
  });

  if (source) {
    const wantedSource = String(source || "").trim().toLowerCase();
    workflowLeads = workflowLeads.filter((lead) => {
      const leadSource = String(lead.lead_source || "")
        .trim()
        .toLowerCase();
      return leadSource === wantedSource;
    });
  }
  if (status) {
    const wanted = normalizeStatus(status);
    workflowLeads = workflowLeads.filter((l) => l.status === wanted);
  }

  const workspaceId = String(process.env.SCOUT_BRAIN_WORKSPACE_ID || "").trim();
  const opportunitiesCountResult = workspaceId
    ? await supabase
        .from("opportunities")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
    : null;
  const intakeDiagnostics: IntakeDiagnostics = {
    workspaceId: workspaceId || null,
    opportunitiesInWorkspace: Number(opportunitiesCountResult?.count || 0),
    leadsForOwner: rows.length,
    linkedLeadsForOwner: rows.filter((row) => String(row.linked_opportunity_id || "").trim()).length,
  };
  if (sort === "created_desc") {
    workflowLeads = [...workflowLeads].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  } else {
    workflowLeads = [...workflowLeads].sort(
      (a, b) => {
        const scoreDelta = Number(b.opportunity_score ?? 0) - Number(a.opportunity_score ?? 0);
        if (scoreDelta !== 0) return scoreDelta;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    );
  }
  const leadIds = workflowLeads.map((lead) => lead.id).filter(Boolean);
  const { data: directLeadMessages } = leadIds.length
    ? await supabase
        .from("email_messages")
        .select("id,lead_id,direction,subject,body,delivery_status,sent_at,received_at,created_at")
        .in("lead_id", leadIds)
        .order("created_at", { ascending: true })
        .limit(3000)
    : { data: [] as Array<Record<string, unknown>> };

  const leadEmails = Array.from(
    new Set(
      workflowLeads
        .map((lead) => String(lead.email || "").trim().toLowerCase())
        .filter(Boolean)
    )
  );
  const { data: threadRows } = leadEmails.length
    ? await supabase
        .from("email_threads")
        .select("id,contact_email,subject,status,last_message_at")
        .in("contact_email", leadEmails)
        .order("last_message_at", { ascending: false })
        .limit(500)
    : { data: [] as Array<Record<string, unknown>> };
  const threadIds = (threadRows || [])
    .map((row) => String(row.id || "").trim())
    .filter(Boolean);
  const { data: messageRows } = threadIds.length
    ? await supabase
        .from("email_messages")
        .select("id,thread_id,direction,subject,body,delivery_status,sent_at,received_at,created_at")
        .in("thread_id", threadIds)
        .order("created_at", { ascending: true })
        .limit(2000)
    : { data: [] as Array<Record<string, unknown>> };
  const emailByThreadId = new Map(
    (threadRows || []).map((row) => [
      String(row.id || ""),
      String(row.contact_email || "").trim().toLowerCase(),
    ])
  );
  const timelineByLeadId = new Map<string, WorkflowLead["timeline"]>();
  for (const message of directLeadMessages || []) {
    const leadId = String(message.lead_id || "").trim();
    if (!leadId) continue;
    if (!timelineByLeadId.has(leadId)) timelineByLeadId.set(leadId, []);
    timelineByLeadId.get(leadId)!.push({
      id: String(message.id || `${leadId}-${message.created_at || "row"}`),
      direction: String(message.direction || ""),
      subject: message.subject ? String(message.subject) : null,
      body: message.body ? String(message.body) : null,
      status: message.delivery_status ? String(message.delivery_status) : null,
      occurred_at: String(message.received_at || message.sent_at || message.created_at || ""),
    });
  }

  const timelineByEmail = new Map<string, WorkflowLead["timeline"]>();
  for (const message of messageRows || []) {
    const threadId = String(message.thread_id || "").trim();
    const email = emailByThreadId.get(threadId);
    if (!email) continue;
    if (!timelineByEmail.has(email)) timelineByEmail.set(email, []);
    timelineByEmail.get(email)!.push({
      id: String(message.id || `${threadId}-${message.created_at || "row"}`),
      direction: String(message.direction || ""),
      subject: message.subject ? String(message.subject) : null,
      body: message.body ? String(message.body) : null,
      status: message.delivery_status ? String(message.delivery_status) : null,
      occurred_at: String(
        message.received_at || message.sent_at || message.created_at || ""
      ),
    });
  }
  workflowLeads = workflowLeads.map((lead) => {
    const email = String(lead.email || "").trim().toLowerCase();
    const byLead = timelineByLeadId.get(lead.id) || [];
    const byEmail = email ? timelineByEmail.get(email) || [] : [];
    const merged = [...byLead, ...byEmail];
    const deduped = new Map<string, WorkflowLead["timeline"][number]>();
    for (const item of merged) deduped.set(item.id, item);
    const sorted = Array.from(deduped.values()).sort(
      (a, b) => new Date(a.occurred_at || 0).getTime() - new Date(b.occurred_at || 0).getTime()
    );
    return {
      ...lead,
      timeline: sorted,
    };
  });

  let emptyStateReason = "";
  if (workflowLeads.length === 0) {
    const [{ count: opportunitiesCount }, { count: casesCount }] = await Promise.all([
      workspaceId
        ? supabase
            .from("opportunities")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
        : Promise.resolve({ count: null }),
      workspaceId
        ? supabase
            .from("case_files")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
        : Promise.resolve({ count: null }),
    ]);
    if (source) {
      emptyStateReason = `No leads found for source "${source}". Filters may be too strict for current intake data.`;
    } else if (status) {
      emptyStateReason = `No leads currently match status "${status.replace(/_/g, " ")}". Filters may be too strict.`;
    } else if ((opportunitiesCount || 0) === 0) {
      emptyStateReason = "Scout created no opportunities yet. Run Scout first, then re-open Leads.";
    } else if ((opportunitiesCount || 0) > 0 && (casesCount || 0) > 0 && rows.length === 0) {
      emptyStateReason =
        "Opportunities exist, but intake created no leads for this owner yet. Run intake backfill and check workspace/owner alignment.";
    } else if ((opportunitiesCount || 0) > 0 && rows.length === 0) {
      emptyStateReason =
        "Scout opportunities exist, but no CRM leads were inserted yet. Run intake backfill and inspect insert failures.";
    } else {
      emptyStateReason =
        "No leads created yet. Run Scout and backfill to convert opportunities into leads.";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>Leads</h1>
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
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
          Lead Intake Diagnostics
        </h2>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          opportunities evaluated: {intakeDiagnostics.opportunitiesInWorkspace} | leads created: {intakeDiagnostics.leadsForOwner} | linked opportunities:{" "}
          {intakeDiagnostics.linkedLeadsForOwner} | workspace: {intakeDiagnostics.workspaceId || "not configured"}
        </p>
        {intakeDiagnostics.opportunitiesInWorkspace > 0 && intakeDiagnostics.leadsForOwner === 0 ? (
          <p className="text-xs mt-2" style={{ color: "#fca5a5" }}>
            Opportunities exist but no leads were created for this owner. Run backfill and review insert failure details below.
          </p>
        ) : null}
      </section>
      {queryMode === "failed" ? (
        <section className="admin-card">
          <p className="text-sm" style={{ color: "#fca5a5" }}>
            Could not load leads: {queryError || "unknown error"}
          </p>
        </section>
      ) : (
        <LeadsWorkflowView initialLeads={workflowLeads} emptyStateReason={emptyStateReason} />
      )}
    </div>
  );
}
