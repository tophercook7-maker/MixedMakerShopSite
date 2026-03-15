import Link from "next/link";
import { Users, CheckSquare, FolderKanban, DollarSign } from "lucide-react";
import type { Lead, Project, Task, Payment } from "@/lib/db-types";
import { ScoutLeadsIntake } from "./scout-leads-intake";

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (["closed_won", "paid", "complete", "done"].includes(s)) return "admin-badge admin-badge-won";
  if (["new", "pending", "todo"].includes(s)) return "admin-badge admin-badge-new";
  if (["closed_lost", "do_not_contact", "overdue"].includes(s)) return "admin-badge admin-badge-lost";
  if (["follow_up_due"].includes(s)) return "admin-badge admin-badge-overdue";
  if (["in_progress", "contacted", "replied", "planning", "design", "development", "testing"].includes(s))
    return "admin-badge admin-badge-progress";
  return "admin-badge admin-badge-pending";
}

type Props = {
  recentLeads: Lead[];
  todaysTasks: Task[];
  activeProjects: Project[];
  recentPayments: Payment[];
  scoutAutoLeads: Lead[];
  topFiveToContactToday: {
    id: string;
    business_name: string;
    score: number;
    issue_summary: string;
    best_contact_method: string;
  }[];
  lastScoutRunSummary: string;
  scoutFollowUpsDue: number;
  newReplies: {
    lead_id: string | null;
    business_name: string;
    status: string | null;
    last_message_at: string | null;
    subject: string | null;
    contact_email: string | null;
  }[];
  workflowQueues: {
    newLeads: number;
    followUpsDue: number;
    replied: number;
    closed: number;
  };
  scoutSummaryMetrics: {
    leadsFoundToday: number;
    topOpportunities: number;
    websitesAudited: number;
    followUpsDue: number;
  };
};

export function DashboardOverview({
  recentLeads,
  todaysTasks,
  activeProjects,
  recentPayments,
  scoutAutoLeads,
  topFiveToContactToday,
  lastScoutRunSummary,
  scoutFollowUpsDue,
  newReplies,
  workflowQueues,
  scoutSummaryMetrics,
}: Props) {
  const Empty = ({ title, desc }: { title: string; desc: string }) => (
    <div className="admin-empty">
      <div className="admin-empty-icon">—</div>
      <div className="admin-empty-title">{title}</div>
      <div className="admin-empty-desc">{desc}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="admin-card">
          <h3 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>New Leads</h3>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{workflowQueues.newLeads}</p>
        </div>
        <div className="admin-card">
          <h3 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Follow-Ups Due</h3>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{workflowQueues.followUpsDue}</p>
        </div>
        <div className="admin-card">
          <h3 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Replied</h3>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{workflowQueues.replied}</p>
        </div>
        <div className="admin-card">
          <h3 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Closed</h3>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{workflowQueues.closed}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/leads?source=scout-brain&date=today" className="admin-card block">
          <h3 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Leads Found Today</h3>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{scoutSummaryMetrics.leadsFoundToday}</p>
        </Link>
        <Link href="/admin/cases?filter=top" className="admin-card block">
          <h3 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Top Opportunities</h3>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{scoutSummaryMetrics.topOpportunities}</p>
        </Link>
        <Link href="/admin/cases?audited=true" className="admin-card block">
          <h3 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Websites Audited</h3>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{scoutSummaryMetrics.websitesAudited}</p>
        </Link>
        <Link href="/admin/outreach?status=follow_up_due" className="admin-card block">
          <h3 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Follow-Ups Due</h3>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{scoutSummaryMetrics.followUpsDue}</p>
        </Link>
      </div>

      <ScoutLeadsIntake leads={scoutAutoLeads} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="admin-card">
          <h2 className="admin-section-title">New Replies</h2>
          {newReplies.length === 0 ? (
            <Empty title="No new replies" desc="Replies will appear here after leads respond." />
          ) : (
            <ul className="space-y-2">
              {newReplies.map((reply, idx) => (
                <li key={`${reply.lead_id || "lead"}-${idx}`} className="flex items-center justify-between text-sm py-1 gap-2">
                  {reply.lead_id ? (
                    <Link
                      href={`/admin/leads?lead=${encodeURIComponent(reply.lead_id)}&focus=outreach`}
                      className="truncate text-[var(--admin-gold)] hover:underline font-semibold"
                    >
                      {reply.business_name}
                    </Link>
                  ) : (
                    <span className="truncate text-[var(--admin-fg)]">{reply.business_name}</span>
                  )}
                  <span className="text-[var(--admin-muted)]">
                    {reply.last_message_at ? new Date(reply.last_message_at).toLocaleString() : "just now"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/outreach" className="mt-4 inline-block text-sm font-semibold text-[var(--admin-gold)] hover:underline">
            Open Outreach →
          </Link>
        </div>
        <div className="admin-card">
          <h2 className="admin-section-title">Top 5 to Contact Today</h2>
          {topFiveToContactToday.length === 0 ? (
            <Empty title="No contact-ready leads" desc="Run Scout or wait for morning intake to surface top leads." />
          ) : (
            <div className="admin-table-wrap overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Score</th>
                    <th>Website Issue</th>
                    <th>Best Contact</th>
                    <th>Quick Open</th>
                    <th>Quick Send Outreach</th>
                  </tr>
                </thead>
                <tbody>
                  {topFiveToContactToday.map((lead) => (
                    <tr key={lead.id}>
                      <td>{lead.business_name}</td>
                      <td>{lead.score}</td>
                      <td>{lead.issue_summary}</td>
                      <td>{lead.best_contact_method}</td>
                      <td>
                        <Link href={`/admin/leads?lead=${encodeURIComponent(lead.id)}`} className="text-[var(--admin-gold)] hover:underline text-xs">
                          Open
                        </Link>
                      </td>
                      <td>
                        <Link href={`/admin/leads?lead=${encodeURIComponent(lead.id)}&focus=outreach`} className="text-[var(--admin-gold)] hover:underline text-xs">
                          Send
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="admin-card">
          <h2 className="admin-section-title">Last Scout Run Summary</h2>
          <p className="text-sm text-[var(--admin-muted)]">{lastScoutRunSummary}</p>
          <p className="text-sm mt-3 text-[var(--admin-fg)]">
            Follow-Ups Due: <strong>{scoutFollowUpsDue}</strong>
          </p>
          <Link href="/admin/scout" className="mt-4 inline-block text-sm font-semibold text-[var(--admin-gold)] hover:underline">
            Open Scout →
          </Link>
        </div>
      </div>

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
    </div>
  );
}
