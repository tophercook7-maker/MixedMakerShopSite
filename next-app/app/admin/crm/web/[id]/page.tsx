import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WebLeadWorkspace } from "@/components/admin/crm/web-lead-workspace";
import { isThreeDPrintLead } from "@/lib/crm/three-d-print-lead";
import { parseWebLeadWorkspaceQuery } from "@/lib/crm/web-lead-workspace-query";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCrmWebLeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const workspaceQuery = parseWebLeadWorkspaceQuery(sp);
  const leadId = String(id || "").trim();
  if (!leadId) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to open leads.
        </p>
      </section>
    );
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error || !lead) notFound();

  if (isThreeDPrintLead(lead)) {
    redirect(`/admin/crm/print/${encodeURIComponent(leadId)}`);
  }

  return <WebLeadWorkspace lead={lead as Record<string, unknown>} workspaceQuery={workspaceQuery} />;
}
