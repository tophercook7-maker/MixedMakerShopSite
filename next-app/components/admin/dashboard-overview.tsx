import Link from "next/link";
import type { Lead, Project, Task, Payment } from "@/lib/db-types";

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (["won", "paid", "complete", "done"].includes(s)) return "admin-badge admin-badge-won";
  if (["new", "pending", "todo"].includes(s)) return "admin-badge admin-badge-new";
  if (["lost", "overdue"].includes(s)) return "admin-badge admin-badge-lost";
  if (["in_progress", "contacted", "interested", "proposal_sent", "planning", "design", "development", "testing"].includes(s))
    return "admin-badge admin-badge-progress";
  return "admin-badge admin-badge-pending";
}

type Props = {
  recentLeads: Lead[];
  todaysTasks: Task[];
  activeProjects: Project[];
  recentPayments: Payment[];
};

export function DashboardOverview({
  recentLeads,
  todaysTasks,
  activeProjects,
  recentPayments,
}: Props) {
  const Empty = ({ title, desc }: { title: string; desc: string }) => (
    <div className="admin-empty">
      <div className="admin-empty-icon">—</div>
      <div className="admin-empty-title">{title}</div>
      <div className="admin-empty-desc">{desc}</div>
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2 mt-8">
      <div className="admin-card">
        <h2 className="font-semibold mb-3 text-[var(--admin-fg)]">Recent leads</h2>
        {recentLeads.length === 0 ? (
          <Empty title="No leads yet" desc="New leads will appear here" />
        ) : (
          <ul className="space-y-2">
            {recentLeads.map((l) => (
              <li key={l.id} className="flex items-center justify-between text-sm py-1">
                <span className="truncate text-[var(--admin-fg)]">{l.business_name}</span>
                <span className={`shrink-0 ml-2 ${statusBadgeClass(l.status)}`}>{l.status.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin/leads" className="mt-3 inline-block text-sm text-[var(--admin-gold)] hover:underline">
          View all →
        </Link>
      </div>
      <div className="admin-card">
        <h2 className="font-semibold mb-3 text-[var(--admin-fg)]">Today&apos;s tasks</h2>
        {todaysTasks.length === 0 ? (
          <Empty title="No tasks due today" desc="You&apos;re all caught up" />
        ) : (
          <ul className="space-y-2">
            {todaysTasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm py-1">
                <span className="truncate text-[var(--admin-fg)]">{t.title}</span>
                <span className={`shrink-0 ml-2 ${statusBadgeClass(t.priority)}`}>{t.priority}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin/tasks" className="mt-3 inline-block text-sm text-[var(--admin-gold)] hover:underline">
          View all →
        </Link>
      </div>
      <div className="admin-card">
        <h2 className="font-semibold mb-3 text-[var(--admin-fg)]">Active projects</h2>
        {activeProjects.length === 0 ? (
          <Empty title="No active projects" desc="Projects in progress will show here" />
        ) : (
          <ul className="space-y-2">
            {activeProjects.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm py-1">
                <span className="truncate text-[var(--admin-fg)]">{p.name}</span>
                <span className={`shrink-0 ml-2 ${statusBadgeClass(p.status)}`}>{p.status.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin/projects" className="mt-3 inline-block text-sm text-[var(--admin-gold)] hover:underline">
          View all →
        </Link>
      </div>
      <div className="admin-card">
        <h2 className="font-semibold mb-3 text-[var(--admin-fg)]">Recent payments</h2>
        {recentPayments.length === 0 ? (
          <Empty title="No payments yet" desc="Paid invoices will appear here" />
        ) : (
          <ul className="space-y-2">
            {recentPayments.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm py-1">
                <span className="text-[var(--admin-fg)]">${Number(p.amount).toLocaleString()}</span>
                <span className="text-[var(--admin-muted)]">{p.payment_date ?? "—"}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin/payments" className="mt-3 inline-block text-sm text-[var(--admin-gold)] hover:underline">
          View all →
        </Link>
      </div>
    </div>
  );
}
