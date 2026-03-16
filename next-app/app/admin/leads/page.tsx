import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BackfillLeadsButton } from "@/components/admin/backfill-leads-button";
import { LeadsWorkflowView, type WorkflowLead } from "@/components/admin/leads-workflow-view";

type CaseLeadRow = {
  id: string;
  opportunity_id: string | null;
  workspace_id?: string | null;
  created_at: string | null;
  status: string | null;
  email: string | null;
  contact_page: string | null;
  phone_from_site: string | null;
  audit_issues?: string[] | null;
  strongest_problems?: string[] | null;
  screenshot_url?: string | null;
  screenshot_urls?: string[] | null;
  homepage_screenshot_url?: string | null;
  annotated_screenshot_url?: string | null;
  annotation_payload?: unknown;
  opportunity?: {
    id?: string;
    business_name?: string;
    category?: string;
    website?: string;
    opportunity_score?: number;
    opportunity_reason?: string | null;
  } | null;
};

function normalizeStatus(value: string | null | undefined): string {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (!normalized) return "new";
  if (normalized === "follow_up_due") return "follow_up";
  if (normalized === "closed_won") return "closed";
  return normalized;
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
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  let baseQuery = supabase
    .from("case_files")
    .select(`
      *,
      opportunity:opportunities(
        id,
        business_name,
        category,
        website,
        opportunity_score,
        opportunity_reason
      )
    `)
    .order("created_at", { ascending: false })
    .limit(500);
  if (date === "today") baseQuery = baseQuery.gte("created_at", dayStart);

  const { data: joinedRows, error: joinedError } = await baseQuery;
  let queryMode: "relationship" | "simple_fallback" | "failed" = "relationship";
  let queryError: string | null = joinedError?.message || null;
  let rows: CaseLeadRow[] = [];

  if (joinedError) {
    queryMode = "simple_fallback";
    let fallbackQuery = supabase
      .from("case_files")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (date === "today") fallbackQuery = fallbackQuery.gte("created_at", dayStart);
    const { data: fallbackRows, error: fallbackError } = await fallbackQuery;
    if (fallbackError) {
      queryMode = "failed";
      queryError = `${joinedError.message} | fallback: ${fallbackError.message}`;
      rows = [];
    } else {
      rows = (fallbackRows || []) as CaseLeadRow[];
    }
  } else {
    rows = (joinedRows || []) as CaseLeadRow[];
  }

  let workflowLeads: WorkflowLead[] = rows.map((row) => {
    const detectedIssuesRaw = Array.isArray(row.audit_issues)
      ? row.audit_issues
      : Array.isArray(row.strongest_problems)
        ? row.strongest_problems
        : [];
    const detectedIssues = detectedIssuesRaw
      .map((v) => String(v || "").trim())
      .filter(Boolean)
      .slice(0, 6);
    const opportunityReason = String(row.opportunity?.opportunity_reason || "").trim();
    const detectedIssuesWithReason =
      opportunityReason && !detectedIssues.some((issue) => issue.toLowerCase() === opportunityReason.toLowerCase())
        ? [opportunityReason, ...detectedIssues].slice(0, 6)
        : detectedIssues;
    const screenshotCandidates = [
      row.annotated_screenshot_url,
      row.screenshot_url,
      row.homepage_screenshot_url,
      ...(Array.isArray(row.screenshot_urls) ? row.screenshot_urls : []),
    ]
      .map((v) => String(v || "").trim())
      .filter(Boolean);
    return {
      id: String(row.id || ""),
      opportunity_id: String(row.opportunity_id || "") || null,
      business_name: String(row.opportunity?.business_name || "Unknown business"),
      category: row.opportunity?.category ? String(row.opportunity.category) : null,
      opportunity_score:
        row.opportunity?.opportunity_score != null
          ? Number(row.opportunity.opportunity_score)
          : null,
      website: row.opportunity?.website ? String(row.opportunity.website) : null,
      email: row.email ? String(row.email) : null,
      phone_from_site: row.phone_from_site ? String(row.phone_from_site) : null,
      contact_page: row.contact_page ? String(row.contact_page) : null,
      contact_method: row.email
        ? "email"
        : row.phone_from_site
          ? "phone"
          : row.contact_page
            ? "contact page"
            : row.opportunity?.website
              ? "website"
              : "none",
      detected_issue_summary: opportunityReason || detectedIssues[0] || "Website pain signals detected",
      detected_issues: detectedIssuesWithReason,
      status: normalizeStatus(row.status),
      created_at: row.created_at || null,
      screenshot_urls: screenshotCandidates,
      annotated_screenshot_url: row.annotated_screenshot_url || null,
      timeline: [],
      notes: [
        String((row as { outcome?: string | null }).outcome || "").trim(),
        String((row as { notes?: string | null }).notes || "").trim(),
      ].filter(Boolean),
    };
  });
  if (source && source !== "scout-brain") {
    workflowLeads = [];
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
    return {
      ...lead,
      timeline: email ? timelineByEmail.get(email) || [] : [],
    };
  });

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
        <LeadsWorkflowView initialLeads={workflowLeads} />
      )}
    </div>
  );
}
