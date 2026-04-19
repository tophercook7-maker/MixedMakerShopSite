import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toWorkflowLead, type LeadRowForWorkflow } from "@/lib/crm/workflow-lead-mapper";
import { PrintCrmDashboard } from "@/components/admin/crm/print-crm-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCrmPrintPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view print jobs.
        </p>
      </section>
    );
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <section className="admin-card">
        <p className="text-sm text-red-300">Could not load leads: {error.message}</p>
      </section>
    );
  }

  const rows = (data || []) as unknown as LeadRowForWorkflow[];
  const workflowLeads = rows.map(toWorkflowLead);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
            3D print CRM
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
            Print jobs only — separate from web-design outreach.
          </p>
        </div>
        <Link href="/admin/crm/web" className="admin-btn-ghost text-sm">
          Web design CRM
        </Link>
      </div>
      <PrintCrmDashboard initialLeads={workflowLeads} />
    </div>
  );
}
