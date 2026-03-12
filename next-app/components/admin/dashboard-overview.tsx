import Link from "next/link";
import { Users, CheckSquare, FolderKanban, DollarSign } from "lucide-react";
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
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="admin-card">
        <h2 className="admin-section-title">
          <Users className="admin-section-title-icon h-4 w-4" />
          Recent leads
        </h2>
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
        <Link href="/admin/leads" className="mt-4 inline-block text-sm font-semibold text-[var(--admin-gold)] hover:underline">
          View all →
        </Link>
      </div>
      <div className="admin-card">
        <h2 className="admin-section-title">
          <CheckSquare className="admin-section-title-icon h-4 w-4" />
          Today&apos;s tasks
        </h2>
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
        <Link href="/admin/tasks" className="mt-4 inline-block text-sm font-semibold text-[var(--admin-gold)] hover:underline">
          View all →
        </Link>
      </div>
      <div className="admin-card">
        <h2 className="admin-section-title">
          <FolderKanban className="admin-section-title-icon h-4 w-4" />
          Active projects
        </h2>
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
        <Link href="/admin/projects" className="mt-4 inline-block text-sm font-semibold text-[var(--admin-gold)] hover:underline">
          View all →
        </Link>
      </div>
      <div className="admin-card">
        <h2 className="admin-section-title">
          <DollarSign className="admin-section-title-icon h-4 w-4" />
          Recent payments
        </h2>
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
        <Link href="/admin/payments" className="mt-4 inline-block text-sm font-semibold text-[var(--admin-gold)] hover:underline">
          View all →
        </Link>
      </div>
    </div>
  );
}
