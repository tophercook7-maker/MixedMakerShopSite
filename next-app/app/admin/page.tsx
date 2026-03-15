import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/admin/stats-cards";
import { DashboardOverview } from "@/components/admin/dashboard-overview";
import { Users, UserCheck, FolderKanban, CheckSquare, DollarSign, LayoutGrid, Sparkles } from "lucide-react";
import { getScoutSummary } from "@/lib/scout/server";
import type { Lead } from "@/lib/db-types";
import { refreshDueFollowUps } from "@/lib/leads-workflow";
import Link from "next/link";

const ACTIVE_PROJECT_STATUSES = ["planning", "design", "development", "testing"];

type DashboardScoutCaseRow = {
  id?: string;
  opportunity_id?: string | null;
  website_score?: number | null;
  audit_issues?: string[] | null;
  status?: string | null;
  created_at?: string | null;
  email?: string | null;
  contact_page?: string | null;
  phone_from_site?: string | null;
  opportunity?: {
    id?: string;
    business_name?: string;
    category?: string;
    website?: string;
    opportunity_score?: number;
  } | null;
};

function supabaseProjectRef(url: string | undefined): string {
  if (!url) return "missing";
  try {
    const host = new URL(url).hostname;
    const ref = host.split(".")[0];
    return ref || "unknown";
  } catch {
    return "invalid";
  }
}

export default async function AdminDashboardPage() {
  await refreshDueFollowUps();
  const supabase = await createClient();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseRef = supabaseProjectRef(supabaseUrl);
  const anonConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const serviceRoleConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  const [
    { count: newLeadsCount },
    { count: followUpsDueTodayCount },
    { count: recentlyContactedCount },
    { count: repliedCount },
    { count: closedDealsCount },
    { count: closedWorkflowCount },
    { count: clientsCount },
    { count: projectsCount },
    { count: tasksDueCount },
    { data: paymentsMonth },
    { data: recentLeads },
    { data: todaysTasks },
    { data: activeProjects },
    { data: recentPayments },
    { count: autoAddedLeadsCount },
    { data: scoutAutoLeads },
    { data: scoutContactCandidates },
    { data: newReplyThreads },
    scoutSummaryResult,
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "follow_up_due"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("last_contacted_at", dayStart),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "replied"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "closed_won"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .in("status", ["closed_won", "closed_lost", "do_not_contact"]),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .in("status", ACTIVE_PROJECT_STATUSES),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("due_date", today)
      .neq("status", "done"),
    supabase
      .from("payments")
      .select("amount")
      .gte("payment_date", monthStart)
      .eq("status", "paid"),
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("tasks")
      .select("*")
      .eq("due_date", today)
      .neq("status", "done")
      .limit(5),
    supabase
      .from("projects")
      .select("*")
      .in("status", ACTIVE_PROJECT_STATUSES)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("lead_source", "scout-brain")
      .gte("created_at", dayStart),
    supabase
      .from("leads")
      .select("*")
      .eq("lead_source", "scout-brain")
      .eq("status", "new")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("leads")
      .select("*")
      .eq("lead_source", "scout-brain")
      .eq("status", "new")
      .is("last_contacted_at", null)
      .order("opportunity_score", { ascending: false, nullsFirst: false })
      .limit(150),
    supabase
      .from("email_threads")
      .select("lead_id,status,last_message_at,contact_email,subject")
      .eq("status", "active")
      .order("last_message_at", { ascending: false })
      .limit(5),
    getScoutSummary(),
  ]);

  const [
    { count: caseNewLeadsCount, error: caseNewLeadsError },
    { count: caseFollowUpsCount, error: caseFollowUpsError },
    { count: caseRepliedCount, error: caseRepliedError },
    { count: caseClosedCount, error: caseClosedError },
    { count: caseAuditedCount, error: caseAuditedError },
    { data: topOpportunityRows, error: topOpportunityError },
  ] = await Promise.all([
    supabase
      .from("case_files")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("case_files")
      .select("*", { count: "exact", head: true })
      .eq("status", "follow_up"),
    supabase
      .from("case_files")
      .select("*", { count: "exact", head: true })
      .eq("status", "replied"),
    supabase
      .from("case_files")
      .select("*", { count: "exact", head: true })
      .eq("status", "closed"),
    supabase
      .from("case_files")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("opportunities")
      .select("id,business_name,category,website,opportunity_score,recommended_contact_method")
      .order("opportunity_score", { ascending: false })
      .limit(5),
  ]);

  let scoutCaseRows: DashboardScoutCaseRow[] = [];
  let scoutCaseQueryMode: "relationship" | "simple_fallback" | "failed" = "relationship";
  let scoutCaseError: string | null = null;
  const { data: joinedScoutRows, error: joinedScoutError } = await supabase
    .from("case_files")
    .select(`
      id,
      opportunity_id,
      website_score,
      audit_issues,
      status,
      created_at,
      email,
      contact_page,
      phone_from_site,
      opportunity:opportunities(
        id,
        business_name,
        category,
        website,
        opportunity_score
      )
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  if (joinedScoutError) {
    scoutCaseQueryMode = "simple_fallback";
    scoutCaseError = `[relationship query] ${joinedScoutError.message}`;
    const { data: fallbackRows, error: fallbackError } = await supabase
      .from("case_files")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (fallbackError) {
      scoutCaseQueryMode = "failed";
      scoutCaseError = `${scoutCaseError} | [simple fallback] ${fallbackError.message}`;
      scoutCaseRows = [];
    } else {
      scoutCaseRows = (fallbackRows || []) as DashboardScoutCaseRow[];
    }
  } else {
    scoutCaseRows = (joinedScoutRows || []) as DashboardScoutCaseRow[];
  }

  console.info("[Admin Dashboard] scout case_files debug", {
    supabase_project_ref: supabaseRef,
    anon_key_configured: anonConfigured,
    service_role_configured: serviceRoleConfigured,
    query_mode: scoutCaseQueryMode,
    rows_returned: scoutCaseRows.length,
    query_error: scoutCaseError,
  });
  const caseMetricErrors = [
    caseNewLeadsError?.message,
    caseFollowUpsError?.message,
    caseRepliedError?.message,
    caseClosedError?.message,
    caseAuditedError?.message,
    topOpportunityError?.message,
  ].filter(Boolean);
  if (caseMetricErrors.length) {
    console.warn("[Admin Dashboard] case_files/opportunities metric query errors", caseMetricErrors);
  }

  const revenue =
    (paymentsMonth ?? []).reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  const stats = [
    {
      label: "New leads",
      value: caseNewLeadsCount ?? 0,
      href: "/admin/leads?status=new",
      icon: Users,
    },
    {
      label: "Follow-Ups Due Today",
      value: caseFollowUpsCount ?? 0,
      href: "/admin/leads?status=follow_up",
      icon: CheckSquare,
    },
    {
      label: "Recently Contacted",
      value: recentlyContactedCount ?? 0,
      href: "/admin/leads",
      icon: Users,
    },
    {
      label: "Closed Deals",
      value: caseClosedCount ?? 0,
      href: "/admin/leads?status=closed",
      icon: UserCheck,
    },
    {
      label: "Revenue this month",
      value: `$${revenue.toLocaleString()}`,
      href: "/admin/payments",
      icon: DollarSign,
    },
    {
      label: "Active projects",
      value: projectsCount ?? 0,
      href: "/admin/projects",
      icon: FolderKanban,
    },
    {
      label: "Tasks due today",
      value: tasksDueCount ?? 0,
      href: "/admin/tasks",
      icon: CheckSquare,
    },
    {
      label: "Active clients",
      value: clientsCount ?? 0,
      href: "/admin/clients",
      icon: UserCheck,
    },
    {
      label: "Websites Audited",
      value: caseAuditedCount ?? 0,
      href: "/admin/cases",
      icon: Sparkles,
    },
  ];

  const scoutSummary = scoutSummaryResult.data;
  const topFiveToContactToday = (topOpportunityRows || []).map((row) => ({
    id: String(row.id || ""),
    business_name: String(row.business_name || "Unknown business"),
    score: Number(row.opportunity_score ?? 0),
    issue_summary: "Top opportunity from Scout scoring",
    best_contact_method: String(row.recommended_contact_method || "Website"),
  }));
  const lastScoutRunSummary =
    scoutSummary && scoutSummary.last_run_time
      ? `Last run ${new Date(scoutSummary.last_run_time).toLocaleString()} — ${scoutSummary.today_businesses_discovered} discovered, ${scoutSummary.today_high_opportunity_total} high-opportunity, ${scoutSummary.top_opportunities_count} top opportunities.`
      : "No Scout run summary available yet. Run Scout or wait for morning scheduled intake.";
  const scoutFollowUpsDue = scoutSummary?.followups_due ?? 0;
  const scoutConfigured = scoutSummaryResult.configured;
  const scoutError = scoutSummaryResult.error;
  console.info("[Admin Dashboard] dashboard summary source", {
    leads_found_today: scoutSummary?.leads_found_today ?? 0,
    top_opportunities_count: scoutSummary?.top_opportunities_count ?? 0,
    websites_audited: scoutSummary?.dashboard_websites_audited ?? 0,
    followups_due: scoutSummary?.followups_due ?? 0,
    case_files_new: caseNewLeadsCount ?? 0,
    case_files_follow_up: caseFollowUpsCount ?? 0,
    case_files_replied: caseRepliedCount ?? 0,
    case_files_closed: caseClosedCount ?? 0,
    case_files_total: caseAuditedCount ?? 0,
    top_opportunities_rows: (topOpportunityRows || []).length,
  });
  const replyLeadIds = (newReplyThreads || [])
    .map((row) => row.lead_id)
    .filter((id): id is string => Boolean(id));
  const { data: replyLeads } = replyLeadIds.length
    ? await supabase
        .from("leads")
        .select("id,business_name,status")
        .in("id", replyLeadIds)
    : { data: [] as { id: string; business_name: string; status: string }[] };
  const replyLeadMap = new Map((replyLeads || []).map((lead) => [lead.id, lead]));
  const newReplies = (newReplyThreads || []).map((thread) => ({
    lead_id: thread.lead_id as string | null,
    business_name: thread.lead_id ? replyLeadMap.get(thread.lead_id)?.business_name || "Unknown lead" : "Unknown lead",
    status: thread.status as string | null,
    last_message_at: thread.last_message_at as string | null,
    subject: thread.subject as string | null,
    contact_email: thread.contact_email as string | null,
  }));

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <>
      <div className="admin-welcome">
        <h1 className="admin-welcome-title">{greeting}</h1>
        <p className="admin-welcome-desc">
          Your private command center for CRM + Scout intelligence. Use the sidebar to move between CRM, Leads, Cases, Outreach, Scout, and Notes.
        </p>
      </div>
      <section className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
              Scout-Brain Integration
            </h2>
            {!scoutConfigured ? (
              <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
                Scout is not configured yet. Set `SCOUT_BRAIN_API_BASE_URL` in `next-app/.env.local`.
              </p>
            ) : scoutError ? (
              <p className="text-sm mt-1" style={{ color: "#fca5a5" }}>
                Scout connection issue: {scoutError}
              </p>
            ) : (
              <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
                Last run: {scoutSummary?.last_run_time ? new Date(scoutSummary.last_run_time).toLocaleString() : "none"} ·
                Top opportunities: {scoutSummary?.top_opportunities_count ?? 0}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/scout" className="admin-btn-primary">
              Run Scout
            </Link>
            <Link href="/admin/outreach" className="admin-btn-ghost">
              Open Outreach
            </Link>
          </div>
        </div>
      </section>
      <section className="admin-card">
        <h2 className="text-sm font-semibold mb-1" style={{ color: "var(--admin-fg)" }}>
          Dashboard Data Debug (temporary)
        </h2>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          supabase_project_ref: {supabaseRef} | anon_key_configured: {String(anonConfigured)} | service_role_configured:{" "}
          {String(serviceRoleConfigured)} | query_mode: {scoutCaseQueryMode} | rows_returned: {scoutCaseRows.length}
        </p>
        {scoutCaseError ? (
          <p className="text-xs mt-1" style={{ color: "#fca5a5" }}>
            error message: {scoutCaseError}
          </p>
        ) : null}
        <details className="mt-2">
          <summary className="cursor-pointer text-[var(--admin-gold)]">First row preview</summary>
          <pre className="mt-1 p-2 rounded-md overflow-x-auto text-xs" style={{ background: "rgba(255,255,255,0.04)" }}>
            {JSON.stringify(scoutCaseRows?.[0] ?? null, null, 2)}
          </pre>
        </details>
      </section>
      <section className="admin-card">
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
          Scout Case Records (debug)
        </h2>
        {scoutCaseRows.length === 0 ? (
          <p className="text-xs" style={{ color: scoutCaseError ? "#fca5a5" : "var(--admin-muted)" }}>
            {scoutCaseError
              ? "Scout case query failed. See debug error above."
              : "No case_files rows returned from dashboard query."}
          </p>
        ) : (
          <div className="admin-table-wrap overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>id</th>
                  <th>opportunity_id</th>
                  <th>status</th>
                  <th>created_at</th>
                  <th>email</th>
                </tr>
              </thead>
              <tbody>
                {scoutCaseRows.slice(0, 20).map((row, idx) => (
                  <tr key={String(row.id || idx)}>
                    <td className="text-xs">{String(row.id || "—")}</td>
                    <td className="text-xs">{String(row.opportunity_id || "—")}</td>
                    <td className="text-xs">{String(row.status || "—")}</td>
                    <td className="text-xs">
                      {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="text-xs">{String(row.email || "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <StatsCards stats={stats} />
      <h2 className="admin-section-title mt-10 mb-4">
        <LayoutGrid className="admin-section-title-icon h-4 w-4" />
        Overview
      </h2>
      <DashboardOverview
        recentLeads={recentLeads ?? []}
        todaysTasks={todaysTasks ?? []}
        activeProjects={activeProjects ?? []}
        recentPayments={recentPayments ?? []}
        scoutAutoLeads={((scoutAutoLeads ?? []) as Lead[])}
        topFiveToContactToday={topFiveToContactToday}
        lastScoutRunSummary={lastScoutRunSummary}
        scoutFollowUpsDue={scoutFollowUpsDue}
        newReplies={newReplies}
        workflowQueues={{
          newLeads: caseNewLeadsCount ?? 0,
          followUpsDue: caseFollowUpsCount ?? 0,
          replied: caseRepliedCount ?? 0,
          closed: caseClosedCount ?? 0,
        }}
        scoutSummaryMetrics={{
          leadsFoundToday: scoutSummary?.leads_found_today ?? 0,
          topOpportunities: (topOpportunityRows || []).length,
          websitesAudited: caseAuditedCount ?? 0,
          followUpsDue: caseFollowUpsCount ?? 0,
        }}
      />
    </>
  );
}
