import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectActionPanel } from "@/components/admin/crm/project-action-panel";
import { createClient } from "@/lib/supabase/server";
import { calculateProjectBalance, projectMoneyBadge, projectPaymentStatusLabel } from "@/lib/crm/project-money";
import { projectStatusClass, projectStatusLabel } from "@/lib/crm/project-status";

type ProjectDetail = {
  id: string;
  name: string;
  status: string;
  deadline: string | null;
  price: number | null;
  notes: string | null;
  estimated_price: number | null;
  deposit_amount: number | null;
  amount_paid: number | null;
  payment_status: string | null;
  payment_method: string | null;
  scheduled_start_date: string | null;
  due_date: string | null;
  internal_notes: string | null;
  action_checklist: Record<string, unknown> | null;
  created_at: string | null;
  clients?: {
    business_name: string | null;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
  }[] | null;
};

function fmtMoney(value: number | null): string {
  return value == null ? "—" : `$${Number(value).toLocaleString()}`;
}

export default async function CrmProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id,name,status,deadline,price,notes,estimated_price,deposit_amount,amount_paid,payment_status,payment_method,scheduled_start_date,due_date,internal_notes,action_checklist,created_at,clients(business_name,contact_name,email,phone,website)")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const project = data as ProjectDetail;
  const client = project.clients?.[0] ?? null;
  const estimatedPrice = project.estimated_price ?? project.price ?? null;
  const amountPaid = project.amount_paid ?? 0;
  const balanceRemaining = calculateProjectBalance(estimatedPrice, amountPaid);
  const moneyBadge = projectMoneyBadge({
    estimatedPrice,
    amountPaid,
    paymentStatus: project.payment_status,
  });
  const dueDate = project.due_date || project.deadline || null;
  const internalNotes = project.internal_notes || project.notes || null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="admin-text-fg text-2xl font-bold">{project.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={projectStatusClass(project.status)}>{projectStatusLabel(project.status)}</span>
            <span className={moneyBadge.className}>{moneyBadge.label}</span>
            <span className="admin-text-muted text-xs">Created {project.created_at || "—"}</span>
          </div>
        </div>
        <Link href="/admin/crm/projects" className="admin-btn-ghost text-sm">
          Back to projects
        </Link>
      </div>

      <section className="admin-card p-4 space-y-3">
        <h2 className="admin-text-fg text-sm font-semibold">Customer</h2>
        <dl className="admin-text-muted grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="admin-text-fg font-semibold">Business / customer</dt>
            <dd>{client?.business_name || client?.contact_name || "—"}</dd>
          </div>
          <div>
            <dt className="admin-text-fg font-semibold">Contact name</dt>
            <dd>{client?.contact_name || "—"}</dd>
          </div>
          <div>
            <dt className="admin-text-fg font-semibold">Email</dt>
            <dd>{client?.email || "—"}</dd>
          </div>
          <div>
            <dt className="admin-text-fg font-semibold">Phone</dt>
            <dd>{client?.phone || "—"}</dd>
          </div>
          <div>
            <dt className="admin-text-fg font-semibold">Website</dt>
            <dd>{client?.website || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="admin-card p-4 space-y-3">
        <h2 className="admin-text-fg text-sm font-semibold">Project</h2>
        <dl className="admin-text-muted grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="admin-text-fg font-semibold">Status</dt>
            <dd>{projectStatusLabel(project.status)}</dd>
          </div>
          <div>
            <dt className="admin-text-fg font-semibold">Estimated price</dt>
            <dd>{fmtMoney(estimatedPrice)}</dd>
          </div>
          <div>
            <dt className="admin-text-fg font-semibold">Deposit amount</dt>
            <dd>{fmtMoney(project.deposit_amount)}</dd>
          </div>
          <div>
            <dt className="admin-text-fg font-semibold">Amount paid</dt>
            <dd>{fmtMoney(amountPaid)}</dd>
          </div>
          <div>
            <dt className="admin-text-fg font-semibold">Balance remaining</dt>
            <dd>{fmtMoney(balanceRemaining)}</dd>
          </div>
          <div>
            <dt className="admin-text-fg font-semibold">Payment status</dt>
            <dd>{projectPaymentStatusLabel(project.payment_status)}</dd>
          </div>
          <div>
            <dt className="admin-text-fg font-semibold">Payment method</dt>
            <dd>{project.payment_method || "—"}</dd>
          </div>
          <div>
            <dt className="admin-text-fg font-semibold">Scheduled start date</dt>
            <dd>{project.scheduled_start_date || "—"}</dd>
          </div>
          <div>
            <dt className="admin-text-fg font-semibold">Due date</dt>
            <dd>{dueDate || "—"}</dd>
          </div>
        </dl>
      </section>

      <ProjectActionPanel
        projectId={project.id}
        project={{
          estimated_price: estimatedPrice,
          deposit_amount: project.deposit_amount,
          amount_paid: amountPaid,
          payment_status: project.payment_status,
          payment_method: project.payment_method,
          scheduled_start_date: project.scheduled_start_date,
          due_date: dueDate,
          internal_notes: internalNotes,
          action_checklist: project.action_checklist,
        }}
      />

      <section className="admin-card p-4 space-y-3">
        <h2 className="admin-text-fg text-sm font-semibold">Internal notes</h2>
        <pre className="admin-border-soft whitespace-pre-wrap rounded-xl border p-3 text-sm admin-text-muted">
          {internalNotes || "No project notes yet."}
        </pre>
      </section>
    </div>
  );
}
