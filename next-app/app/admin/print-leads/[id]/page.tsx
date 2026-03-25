import { redirect } from "next/navigation";

/** Per-lead workspace is `/admin/leads/[id]` (single CRM). */
export default async function AdminPrintLeadDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: leadId } = await params;
  const id = String(leadId || "").trim();
  if (!id) redirect("/admin/leads?crm_source=3d_printing");
  redirect(`/admin/leads/${encodeURIComponent(id)}`);
}
