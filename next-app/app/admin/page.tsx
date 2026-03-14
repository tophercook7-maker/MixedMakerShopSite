import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/admin/stats-cards";
import { DashboardOverview } from "@/components/admin/dashboard-overview";
import { Users, UserCheck, FolderKanban, CheckSquare, DollarSign, LayoutGrid, Sparkles } from "lucide-react";
import { getScoutSummary } from "@/lib/scout/server";
import type { Lead } from "@/lib/db-types";
import { refreshDueFollowUps } from "@/lib/leads-workflow";
import Link from "next/link";

const ACTIVE_PROJECT_STATUSES = ["planning", "design", "development", "testing"];

export default async function AdminDashboardPage() {
  await refreshDueFollowUps();
  const supabase = await createClient();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

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

  const revenue =
    (paymentsMonth ?? []).reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  const stats = [
    {
      label: "New leads",
      value: newLeadsCount ?? 0,
      href: "/admin/leads?status=new",
      icon: Users,
    },
    {
      label: "Follow-Ups Due Today",
      value: followUpsDueTodayCount ?? 0,
      href: "/admin/outreach?status=follow_up_due",
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
      value: closedDealsCount ?? 0,
      href: "/admin/leads?status=closed_won",
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
      label: "New Auto-Added Leads",
      value: autoAddedLeadsCount ?? 0,
      href: "/admin/leads?source=scout-brain&date=today",
      icon: Sparkles,
    },
  ];

  const scoutSummary = scoutSummaryResult.data;
  const candidateLeads = (scoutContactCandidates ?? []) as Lead[];
  const linkedOppIds = candidateLeads
    .map((lead) => String(lead.linked_opportunity_id || "").trim())
    .filter((id): id is string => Boolean(id));
  const { data: linkedOppRows } = linkedOppIds.length
    ? await supabase
        .from("opportunities")
        .select("id,lane,no_website,mobile_ready,mobile_score,website_speed,outdated_design_clues,recommended_contact_method")
        .in("id", linkedOppIds)
    : { data: [] as Record<string, unknown>[] };
  const oppById = new Map((linkedOppRows || []).map((row) => [String(row.id || ""), row]));
  const topFiveToContactToday = candidateLeads
    .filter((lead) => {
      const hasContactPath = Boolean(
        String(lead.email || "").trim() ||
        String(lead.phone || "").trim() ||
        String(lead.website || "").trim() ||
        String(lead.best_contact_method || "").trim()
      );
      return hasContactPath && lead.status === "new" && !lead.last_contacted_at;
    })
    .map((lead) => {
      const opp = oppById.get(String(lead.linked_opportunity_id || "").trim());
      const noWebsite = !String(lead.website || "").trim() || opp?.no_website === true || String(opp?.lane || "") === "no_website";
      const terribleMobile = opp?.mobile_ready === false || Number(opp?.mobile_score ?? 100) <= 45;
      const slowWebsite = Number(opp?.website_speed ?? 0) > 3;
      const outdatedDesign = Boolean(opp?.outdated_design_clues);
      const priority =
        noWebsite ? 0 :
        terribleMobile ? 1 :
        slowWebsite ? 2 :
        outdatedDesign ? 3 : 4;
      const issueSummary =
        noWebsite ? "No website" :
        terribleMobile ? "Terrible mobile experience" :
        slowWebsite ? "Slow website" :
        outdatedDesign ? "Outdated design signals" :
        "Needs website improvements";
      const bestContactMethod =
        String(lead.best_contact_method || "").trim() ||
        String(opp?.recommended_contact_method || "").trim() ||
        (lead.email ? "Email" : lead.phone ? "Phone" : lead.website ? "Website" : "Unknown");
      return {
        id: lead.id,
        business_name: lead.business_name,
        score: Number(lead.opportunity_score ?? 0),
        issue_summary: issueSummary,
        best_contact_method: bestContactMethod,
        priority,
      };
    })
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.score - a.score;
    })
    .slice(0, 5);
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
    leads_query_new: newLeadsCount ?? 0,
    leads_query_follow_up_due: followUpsDueTodayCount ?? 0,
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
          newLeads: newLeadsCount ?? 0,
          followUpsDue: followUpsDueTodayCount ?? 0,
          replied: repliedCount ?? 0,
          closed: closedWorkflowCount ?? 0,
        }}
        scoutSummaryMetrics={{
          leadsFoundToday: scoutSummary?.leads_found_today ?? 0,
          topOpportunities: scoutSummary?.top_opportunities_count ?? 0,
          websitesAudited: scoutSummary?.dashboard_websites_audited ?? 0,
          followUpsDue: scoutSummary?.followups_due ?? 0,
        }}
      />
    </>
  );
}
