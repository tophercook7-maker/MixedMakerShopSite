import Link from "next/link";
import { Building2, DollarSign, FolderKanban, ListChecks, Printer, Users } from "lucide-react";
import { CrmAlertsPanel } from "@/components/admin/crm-alerts-panel";
import { MockupStaleHubSummary } from "@/components/admin/mockup-stale-hub-summary";

const crmModules = [
  {
    title: "3D print dashboard",
    href: "/admin/print-dashboard",
    description: "Daily snapshot: pipeline counts, money, and jobs that need attention.",
    icon: Printer,
  },
  {
    title: "Leads",
    href: "/admin/leads",
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
    href: "/admin/projects",
    description: "Delivery lifecycle and project statuses.",
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

export default function AdminCrmHubPage() {
  return (
    <div className="space-y-6">
      <section className="admin-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--admin-fg)" }}>
              CRM hub
            </h1>
            <p style={{ color: "var(--admin-muted)" }}>
              MixedMakerShop remains the primary CRM shell. Scout-Brain intelligence is integrated into this private admin
              gradually.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Link href="/admin/scout/review" className="admin-btn-ghost text-sm shrink-0">
              Scout review queue
            </Link>
            <Link href="/admin/leads?pool=top_picks" className="admin-btn-ghost text-sm shrink-0">
              Top Picks (database)
            </Link>
          </div>
        </div>
      </section>

      <CrmAlertsPanel />

      <section className="admin-card">
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
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
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--admin-fg)" }}>
          Quick workflow views
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/leads" className="admin-btn-ghost text-xs">
            All leads
          </Link>
          <Link href="/admin/leads?queue=attention" className="admin-btn-ghost text-xs">
            Needs attention
          </Link>
          <Link href="/admin/leads?follow_up_today=1" className="admin-btn-ghost text-xs">
            Follow up today
          </Link>
          <Link href="/admin/leads?queue=new" className="admin-btn-ghost text-xs">
            New leads
          </Link>
          <Link href="/admin/leads?needs_reply=1" className="admin-btn-ghost text-xs">
            Waiting on reply
          </Link>
          <Link href="/admin/leads?crm_source=3d_printing" className="admin-btn-ghost text-xs">
            3D print leads
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
        <p className="text-xs mt-3" style={{ color: "var(--admin-muted)" }}>
          &quot;Follow up today&quot; matches <code className="text-[11px]">next_follow_up_at</code> to today&apos;s UTC
          date. Refine in lead detail as your workflow evolves.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {crmModules.map(({ title, href, description, icon: Icon }) => (
          <Link key={href} href={href} className="admin-card block transition hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-2">
              <Icon className="h-5 w-5" style={{ color: "var(--admin-gold)" }} />
              <h2 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
                {title}
              </h2>
            </div>
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
              {description}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
