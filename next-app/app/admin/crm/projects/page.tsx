import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { calculateProjectBalance, projectMoneyBadge, projectPaymentStatusLabel } from "@/lib/crm/project-money";
import { projectStatusClass, projectStatusLabel } from "@/lib/crm/project-status";

type ProjectRow = {
  id: string;
  name: string;
  status: string;
  deadline: string | null;
  price: number | null;
  estimated_price: number | null;
  amount_paid: number | null;
  payment_status: string | null;
  created_at: string | null;
  clients?: { business_name: string | null; contact_name: string | null; email: string | null }[] | null;
};

function fmtMoney(value: number | null): string {
  return value == null ? "—" : `$${Number(value).toLocaleString()}`;
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function ProjectList({ title, projects }: { title: string; projects: ProjectRow[] }) {
  return (
    <section className="admin-card p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="admin-text-fg text-sm font-semibold">{title}</h2>
        <span className="admin-count-badge">{projects.length}</span>
      </div>
      {projects.length ? (
        <div className="grid gap-3">
          {projects.map((project) => {
            const client = project.clients?.[0] ?? null;
            const estimatedPrice = project.estimated_price ?? project.price ?? null;
            const amountPaid = project.amount_paid ?? 0;
            const balance = calculateProjectBalance(estimatedPrice, amountPaid);
            const moneyBadge = projectMoneyBadge({
              estimatedPrice,
              amountPaid,
              paymentStatus: project.payment_status,
            });
            return (
              <Link
                key={project.id}
                href={`/admin/crm/projects/${project.id}`}
                className="admin-border-soft rounded-xl border p-3 transition hover:border-[var(--admin-gold)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="admin-text-fg font-semibold">{project.name}</h3>
                    <p className="admin-text-muted mt-1 text-xs">
                      {client?.business_name || client?.contact_name || "Unknown customer"}
                      {client?.email ? ` · ${client.email}` : ""}
                    </p>
                  </div>
                  <span className={projectStatusClass(project.status)}>{projectStatusLabel(project.status)}</span>
                </div>
                <div className="admin-text-muted mt-3 grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-7">
                  <span>Deadline: {project.deadline || "—"}</span>
                  <span>Estimated: {fmtMoney(estimatedPrice)}</span>
                  <span>Paid: {fmtMoney(amountPaid)}</span>
                  <span>Balance: {fmtMoney(balance)}</span>
                  <span>Payment: {projectPaymentStatusLabel(project.payment_status)}</span>
                  <span className={moneyBadge.className}>{moneyBadge.label}</span>
                  <span>Created: {project.created_at || "—"}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="admin-empty admin-card">
          <div className="admin-empty-title">No {title.toLowerCase()}</div>
        </div>
      )}
    </section>
  );
}

export default async function CrmProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = searchParams ? await searchParams : {};
  const view = firstParam(sp.view);
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id,name,status,deadline,price,estimated_price,amount_paid,payment_status,created_at,clients(business_name,contact_name,email)")
    .order("created_at", { ascending: false });

  const projects = (data ?? []) as ProjectRow[];
  const active = projects.filter((project) =>
    ["draft", "estimate_sent", "deposit_requested", "deposit_received", "in_progress", "waiting_on_customer"].includes(
      project.status,
    ),
  );
  const scheduled = projects.filter((project) => project.status === "scheduled");
  const completed = projects.filter((project) => project.status === "completed");
  const balanceDue = projects.filter((project) => {
    const estimatedPrice = project.estimated_price ?? project.price ?? null;
    return projectMoneyBadge({
      estimatedPrice,
      amountPaid: project.amount_paid ?? 0,
      paymentStatus: project.payment_status,
    }).label === "Balance Due";
  });
  const focusedList =
    view === "balance_due"
      ? { title: "Balance due projects", projects: balanceDue }
      : view === "completed"
        ? { title: "Completed projects", projects: completed }
        : null;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="admin-text-fg text-2xl font-bold">CRM Projects</h1>
          <p className="admin-text-muted mt-1 text-sm">
            Track converted CRM leads manually. Free-first only: no outbound notifications.
          </p>
        </div>
        <Link href="/admin/crm/hub" className="admin-btn-ghost text-sm">
          Back to CRM hub
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="admin-card p-4">
          <div className="admin-text-muted text-xs">Active projects</div>
          <div className="admin-text-fg mt-1 text-2xl font-bold">{active.length}</div>
        </div>
        <div className="admin-card p-4">
          <div className="admin-text-muted text-xs">Scheduled projects</div>
          <div className="admin-text-fg mt-1 text-2xl font-bold">{scheduled.length}</div>
        </div>
        <div className="admin-card p-4">
          <div className="admin-text-muted text-xs">Completed projects</div>
          <div className="admin-text-fg mt-1 text-2xl font-bold">{completed.length}</div>
        </div>
      </div>

      {focusedList ? (
        <ProjectList title={focusedList.title} projects={focusedList.projects} />
      ) : (
        <>
          <ProjectList title="Active projects" projects={active} />
          <ProjectList title="Scheduled projects" projects={scheduled} />
          <ProjectList title="Completed projects" projects={completed} />
        </>
      )}
    </div>
  );
}
