import Link from "next/link";
import { Building2, DollarSign, FolderKanban, ListChecks, Users } from "lucide-react";
import { CrmAlertsPanel } from "@/components/admin/crm-alerts-panel";

const crmModules = [
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
          <Link href="/admin/crm" className="admin-btn-ghost text-sm shrink-0">
            ← Local CRM (browser)
          </Link>
        </div>
      </section>

      <CrmAlertsPanel />

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
