import Link from "next/link";
import type { Lead, Project, Task, Payment } from "@/lib/db-types";

type Props = {
  recentLeads: Lead[];
  todaysTasks: Task[];
  activeProjects: Project[];
  recentPayments: Payment[];
};

export function DashboardOverview({ recentLeads, todaysTasks, activeProjects, recentPayments }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 mt-8">
      <div className="rounded-lg border bg-card p-4">
        <h2 className="font-semibold mb-3">Recent leads</h2>
        <ul className="space-y-2">
          {recentLeads.length === 0 ? (
            <li className="text-sm text-muted-foreground">No leads yet</li>
          ) : (
            recentLeads.map((l) => (
              <li key={l.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{l.business_name}</span>
                <span className="text-muted-foreground capitalize shrink-0 ml-2">{l.status}</span>
              </li>
            ))
          )}
        </ul>
        <Link href="/admin/leads" className="mt-3 inline-block text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <h2 className="font-semibold mb-3">Today’s tasks</h2>
        <ul className="space-y-2">
          {todaysTasks.length === 0 ? (
            <li className="text-sm text-muted-foreground">No tasks due today</li>
          ) : (
            todaysTasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{t.title}</span>
                <span className="text-muted-foreground capitalize shrink-0 ml-2">{t.priority}</span>
              </li>
            ))
          )}
        </ul>
        <Link href="/admin/tasks" className="mt-3 inline-block text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <h2 className="font-semibold mb-3">Active projects</h2>
        <ul className="space-y-2">
          {activeProjects.length === 0 ? (
            <li className="text-sm text-muted-foreground">No active projects</li>
          ) : (
            activeProjects.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{p.name}</span>
                <span className="text-muted-foreground capitalize shrink-0 ml-2">{p.status}</span>
              </li>
            ))
          )}
        </ul>
        <Link href="/admin/projects" className="mt-3 inline-block text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <h2 className="font-semibold mb-3">Recent payments</h2>
        <ul className="space-y-2">
          {recentPayments.length === 0 ? (
            <li className="text-sm text-muted-foreground">No payments yet</li>
          ) : (
            recentPayments.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span>${Number(p.amount).toLocaleString()}</span>
                <span className="text-muted-foreground">{p.payment_date ?? "—"}</span>
              </li>
            ))
          )}
        </ul>
        <Link href="/admin/payments" className="mt-3 inline-block text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
    </div>
  );
}
