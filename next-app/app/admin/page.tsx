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
    { count: closedDealsCount },
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
    { data: topScoutContactsToday },
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
      .eq("status", "closed_won"),
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
      .gte("created_at", dayStart)
      .order("created_at", { ascending: false })
      .limit(5),
    getScoutSummary(),
  ]);

  const revenue =
    (paymentsMonth ?? []).reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  const stats = [
    {
      label: "New leads",
      value: newLeadsCount ?? 0,
      href: "/admin/leads",
      icon: Users,
    },
    {
      label: "Follow-Ups Due Today",
      value: followUpsDueTodayCount ?? 0,
      href: "/admin/leads",
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
      href: "/admin/leads",
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
      href: "/admin/scout",
      icon: Sparkles,
    },
  ];

  const scoutSummary = scoutSummaryResult.data;
  const rankedTopScoutContacts = ((topScoutContactsToday ?? []) as Lead[]).sort(
    (a, b) => Number(b.opportunity_score ?? 0) - Number(a.opportunity_score ?? 0)
  );
  const lastScoutRunSummary =
    scoutSummary && scoutSummary.last_run_time
      ? `Last run ${new Date(scoutSummary.last_run_time).toLocaleString()} — ${scoutSummary.today_businesses_discovered} discovered, ${scoutSummary.today_high_opportunity_total} high-opportunity, ${scoutSummary.top_opportunities_count} top opportunities.`
      : "No Scout run summary available yet. Run Scout or wait for morning scheduled intake.";
  const scoutFollowUpsDue = scoutSummary?.followups_due ?? 0;
  const scoutConfigured = scoutSummaryResult.configured;
  const scoutError = scoutSummaryResult.error;

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
        topScoutContactsToday={rankedTopScoutContacts}
        lastScoutRunSummary={lastScoutRunSummary}
        scoutFollowUpsDue={scoutFollowUpsDue}
      />
    </>
  );
}
