import Link from "next/link";
import { Building2, DollarSign, FolderKanban, ListChecks, Printer, Users } from "lucide-react";
import { CrmAlertsPanel } from "@/components/admin/crm-alerts-panel";
import { MockupStaleHubSummary } from "@/components/admin/mockup-stale-hub-summary";
import { getCrmBusinessSnapshotStats } from "@/lib/crm/business-snapshot";
import { getDailyCrmCheckStats } from "@/lib/crm/new-lead-count";
import { createClient } from "@/lib/supabase/server";

const crmModules = [
  {
    title: "3D print dashboard",
    href: "/admin/print-dashboard",
    description: "Daily snapshot: pipeline counts, money, and jobs that need attention.",
    icon: Printer,
  },
  {
    title: "Leads",
    href: "/admin/crm/web",
    description: "Manage inbound and discovered opportunities in one pipeline.",
    icon: Users,
  },
  {
    title: "Clients",
    href: "/admin/clients",
    description: "Active customer records and contact ownership.",
    icon: Building2,
  },
  {
    title: "Projects",
    href: "/admin/crm/projects",
    description: "Converted lead projects grouped by active, scheduled, and completed.",
    icon: FolderKanban,
  },
  {
    title: "Tasks",
    href: "/admin/tasks",
    description: "Work queue and due-date accountability.",
    icon: ListChecks,
  },
  {
    title: "Payments",
    href: "/admin/payments",
    description: "Revenue tracking and billing visibility.",
    icon: DollarSign,
  },
];

function fmtMoney(value: number): string {
  return `$${Math.max(0, value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default async function AdminCrmHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "");
  const [dailyStats, businessStats] = await Promise.all([
    getDailyCrmCheckStats(supabase, ownerId),
    getCrmBusinessSnapshotStats(supabase, ownerId),
  ]);
  const newLeadCount = dailyStats.newLeads;
  const dailyCards = [
    { label: "New leads", value: dailyStats.newLeads },
    { label: "Leads contacted today", value: dailyStats.contactedToday },
    { label: "Estimates sent this week", value: dailyStats.estimatesSentThisWeek },
    { label: "Archived leads this week", value: dailyStats.archivedThisWeek },
  ];
  const businessSnapshotCards = [
    { label: "New leads", value: businessStats.newLeads },
    { label: "Hot leads", value: businessStats.hotLeads },
    { label: "Active projects", value: businessStats.activeProjects },
    { label: "Scheduled projects", value: businessStats.scheduledProjects },
    { label: "Projects with balance due", value: businessStats.balanceDueProjects },
    { label: "Estimated unpaid balance", value: fmtMoney(businessStats.estimatedUnpaidBalance) },
    { label: "Paid this month", value: fmtMoney(businessStats.paidThisMonth) },
    { label: "Completed projects this month", value: businessStats.completedProjectsThisMonth },
  ];

  return (
    <div className="space-y-6">
      <section className="admin-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="admin-text-fg text-2xl font-bold mb-2">
              CRM hub
            </h1>
            <p className="admin-text-muted">
              MixedMakerShop remains the primary CRM shell. Scout-Brain intelligence is integrated into this private admin
              gradually.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Link href="/admin/crm/new-leads" className="admin-btn-ghost text-sm shrink-0">
              New leads <span className="admin-count-badge ml-2">{newLeadCount}</span>
            </Link>
            <Link href="/admin/crm/projects" className="admin-btn-ghost text-sm shrink-0">
              CRM projects
            </Link>
            <Link href="/admin/scout/review" className="admin-btn-ghost text-sm shrink-0">
              Scout review queue
            </Link>
            <Link href="/admin/crm/web?pool=top_picks" className="admin-btn-ghost text-sm shrink-0">
              Top Picks (database)
            </Link>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="admin-text-gold text-xs font-semibold uppercase tracking-[0.2em]">
              CRM Business Snapshot
            </p>
            <h2 className="admin-text-fg mt-2 text-xl font-bold">Current pipeline health</h2>
            <p className="admin-text-muted mt-2 text-sm">
              Manual CRM totals for leads, project work, balances, and this month&apos;s progress.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/crm/new-leads?status=new" className="admin-btn-ghost text-xs">
              New leads
            </Link>
            <Link href="/admin/crm/new-leads?priority=hot" className="admin-btn-ghost text-xs">
              Hot leads
            </Link>
            <Link href="/admin/crm/projects" className="admin-btn-ghost text-xs">
              Projects
            </Link>
            <Link href="/admin/crm/projects?view=balance_due" className="admin-btn-ghost text-xs">
              Balance due projects
            </Link>
            <Link href="/admin/crm/projects?view=completed" className="admin-btn-ghost text-xs">
              Completed projects
            </Link>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {businessSnapshotCards.map((card) => (
            <div key={card.label} className="admin-border-soft rounded-xl border p-4">
              <div className="admin-text-fg text-2xl font-bold">{card.value}</div>
              <div className="admin-text-muted mt-1 text-sm">{card.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="admin-text-gold text-xs font-semibold uppercase tracking-[0.2em]">
              Daily CRM Check
            </p>
            <h2 className="admin-text-fg mt-2 text-xl font-bold">Today&apos;s manual lead review</h2>
            <p className="admin-text-muted mt-2 text-sm">
              Check this inbox daily so new opportunities don&apos;t sit too long.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/crm/new-leads?status=new" className="admin-btn-ghost text-xs">
              View new leads
            </Link>
            <Link href="/admin/crm/new-leads?status=contacted" className="admin-btn-ghost text-xs">
              View contacted leads
            </Link>
            <Link href="/admin/crm/new-leads?deal_status=proposal_sent" className="admin-btn-ghost text-xs">
              View proposal sent leads
            </Link>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {dailyCards.map((card) => (
            <div key={card.label} className="admin-border-soft rounded-xl border p-4">
              <div className="admin-text-fg text-2xl font-bold">{card.value}</div>
              <div className="admin-text-muted mt-1 text-sm">{card.label}</div>
            </div>
          ))}
        </div>
      </section>

      <CrmAlertsPanel />

      <section className="admin-card">
        <h2 className="admin-text-fg text-sm font-semibold mb-2">
          Mockup funnel
        </h2>
        <MockupStaleHubSummary />
        <div className="flex flex-wrap gap-2 mt-3">
          <Link href="/admin/mockup-submissions" className="admin-btn-ghost text-xs">
            Free mockup submissions
          </Link>
          <Link href="/admin/mockup-submissions?needs_attention=1" className="admin-btn-ghost text-xs">
            Mockup needs attention
          </Link>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="admin-text-fg text-sm font-semibold mb-3">
          Quick workflow views
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/crm/web" className="admin-btn-ghost text-xs">
            All leads
          </Link>
          <Link href="/admin/crm/web?queue=attention" className="admin-btn-ghost text-xs">
            Needs attention
          </Link>
          <Link href="/admin/crm/web?follow_up_today=1" className="admin-btn-ghost text-xs">
            Follow up today
          </Link>
          <Link href="/admin/crm/web?queue=new" className="admin-btn-ghost text-xs">
            New leads
          </Link>
          <Link href="/admin/crm/new-leads" className="admin-btn-ghost text-xs">
            Manual lead inbox <span className="admin-count-badge ml-2">{newLeadCount}</span>
          </Link>
          <Link href="/admin/crm/web?needs_reply=1" className="admin-btn-ghost text-xs">
            Waiting on reply
          </Link>
          <Link href="/admin/crm/print" className="admin-btn-ghost text-xs">
            3D print leads
          </Link>
          <Link href="/admin/crm/projects" className="admin-btn-ghost text-xs">
            CRM projects
          </Link>
          <Link href="/admin/scout/review" className="admin-btn-ghost text-xs">
            Scout review queue
          </Link>
          <Link href="/admin/leads/sources" className="admin-btn-ghost text-xs">
            Lead sources report
          </Link>
          <Link href="/admin/print-dashboard" className="admin-btn-ghost text-xs">
            3D print dashboard
          </Link>
        </div>
        <p className="admin-text-muted text-xs mt-3">
          &quot;Follow up today&quot; matches <code className="text-[11px]">next_follow_up_at</code> to today&apos;s UTC
          date. Refine in lead detail as your workflow evolves.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {crmModules.map(({ title, href, description, icon: Icon }) => (
          <Link key={href} href={href} className="admin-card block transition hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-2">
              <Icon className="h-5 w-5 text-[var(--admin-gold)]" />
              <h2 className="admin-text-fg text-lg font-semibold">
                {title}
              </h2>
            </div>
            <p className="admin-text-muted text-sm">
              {description}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
