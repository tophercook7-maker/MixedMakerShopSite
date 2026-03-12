import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/admin/stats-cards";
import { DashboardOverview } from "@/components/admin/dashboard-overview";
import { Users, UserCheck, FolderKanban, CheckSquare, DollarSign, LayoutGrid } from "lucide-react";

const ACTIVE_PROJECT_STATUSES = ["planning", "design", "development", "testing"];

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const [
    { count: newLeadsCount },
    { count: clientsCount },
    { count: projectsCount },
    { count: tasksDueCount },
    { data: paymentsMonth },
    { data: recentLeads },
    { data: todaysTasks },
    { data: activeProjects },
    { data: recentPayments },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
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
      label: "Active clients",
      value: clientsCount ?? 0,
      href: "/admin/clients",
      icon: UserCheck,
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
      label: "Revenue this month",
      value: `$${revenue.toLocaleString()}`,
      href: "/admin/payments",
      icon: DollarSign,
    },
  ];

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
          Your command center for leads, clients, projects, tasks, and payments. Use the quick actions above or the sidebar to get started.
        </p>
      </div>
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
      />
    </>
  );
}
