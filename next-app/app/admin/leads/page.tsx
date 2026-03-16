import { createClient } from "@/lib/supabase/server";
import { BackfillLeadsButton } from "@/components/admin/backfill-leads-button";
import { LeadsWorkflowView, type WorkflowLead } from "@/components/admin/leads-workflow-view";

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
};

type OpportunityRow = {
  id: string;
  business_name?: string;
  category?: string;
  website?: string;
  website_status?: string | null;
  opportunity_score?: number;
  opportunity_reason?: string | null;
  opportunity_signals?: string[] | null;
  close_probability?: "low" | "medium" | "high" | null;
};

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
  phone_from_site?: string | null;
  audit_issues?: string[] | null;
  strongest_problems?: string[] | null;
  screenshot_url?: string | null;
  screenshot_urls?: string[] | null;
  homepage_screenshot_url?: string | null;
  annotated_screenshot_url?: string | null;
  notes?: string | null;
  outcome?: string | null;
  created_at?: string | null;
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
    normalized === "closed_won" ||
    normalized === "closed_lost" ||
    normalized === "do_not_contact"
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
  }>;
}) {
  const { source, date, status, sort } = await searchParams;
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
      "id,owner_id,workspace_id,created_at,status,business_name,email,phone,website,industry,notes,linked_opportunity_id,opportunity_score,lead_source"
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
  const { data: fallbackOppRows } = opportunityIds.length
    ? await supabase
        .from("opportunities")
        .select("id,business_name,category,website,website_status,opportunity_score,opportunity_reason,opportunity_signals")
        .in("id", opportunityIds)
    : { data: [] as OpportunityRow[] };
  const fallbackOppById = new Map(
    (fallbackOppRows || []).map((row) => [String(row.id || ""), row as OpportunityRow])
  );
  if (opportunityIds.length && (fallbackOppRows || []).length) {
    console.info("[Leads List] fallback relationship fetch used", {
      requested_opportunity_ids: opportunityIds.length,
      resolved_opportunity_rows: (fallbackOppRows || []).length,
    });
  }
  const { data: caseRowsRaw } = opportunityIds.length
    ? await supabase
        .from("case_files")
        .select(
          "id,opportunity_id,status,email,contact_page,phone_from_site,audit_issues,strongest_problems,screenshot_url,screenshot_urls,homepage_screenshot_url,annotated_screenshot_url,notes,outcome,created_at"
        )
        .in("opportunity_id", opportunityIds)
        .order("created_at", { ascending: false })
        .limit(1000)
    : { data: [] as CaseByOpportunityRow[] };
  const caseRows = (caseRowsRaw || []) as CaseByOpportunityRow[];
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
    const phone = String(caseRow?.phone_from_site || row.phone || "").trim();
    const contactPage = String(caseRow?.contact_page || "").trim();
    const website = String(opp?.website || row.website || "").trim();
    return {
      id: String(row.id || ""),
      related_case_id: String(caseRow?.id || "") || null,
      opportunity_id: linkedOppId || null,
      business_name: String(opp?.business_name || row.business_name || "Unknown business"),
      category: String(opp?.category || row.industry || "").trim() || null,
      website_status: String(opp?.website_status || "").trim() || null,
      opportunity_score: opp?.opportunity_score ?? row.opportunity_score ?? null,
      close_probability:
        (String(opp?.close_probability || "").trim().toLowerCase() as "low" | "medium" | "high") ||
        deriveCloseProbability(opp?.opportunity_score ?? row.opportunity_score, opp?.category || row.industry, issueList),
      website: website || null,
      email: email || null,
      phone_from_site: phone || null,
      contact_page: contactPage || null,
      contact_method: email
        ? "email"
        : phone
          ? "phone"
          : contactPage
            ? "contact page"
            : website
              ? "website"
              : "none",
      detected_issue_summary: opportunityReason || issueList[0] || "No immediate website breakage detected",
      detected_issues: issueList,
      status: normalizeStatus(row.status),
      created_at: row.created_at || null,
      screenshot_urls: screenshotCandidates,
      annotated_screenshot_url: caseRow?.annotated_screenshot_url || null,
      timeline: [],
      notes: [String(caseRow?.outcome || "").trim(), String(caseRow?.notes || "").trim(), String(row.notes || "").trim()].filter(Boolean),
      lead_source: String(row.lead_source || "").trim() || null,
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
  if (sort === "score_desc") {
    workflowLeads = [...workflowLeads].sort(
      (a, b) => Number(b.opportunity_score ?? 0) - Number(a.opportunity_score ?? 0)
    );
  } else {
    workflowLeads = [...workflowLeads].sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
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
    const workspaceId = String(process.env.SCOUT_BRAIN_WORKSPACE_ID || "").trim();
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
      emptyStateReason = `No leads found for source "${source}".`;
    } else if (status) {
      emptyStateReason = `No leads currently match status "${status.replace(/_/g, " ")}".`;
    } else if ((opportunitiesCount || 0) > 0 && (casesCount || 0) > 0) {
      emptyStateReason =
        "Scout opportunities/cases exist, but no CRM leads are linked yet. Run intake backfill and confirm workspace alignment.";
    } else {
      emptyStateReason =
        "No leads created yet. Run Scout and use intake/backfill to convert opportunities into leads. If opportunities exist but leads do not, verify workspace alignment and intake results.";
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
