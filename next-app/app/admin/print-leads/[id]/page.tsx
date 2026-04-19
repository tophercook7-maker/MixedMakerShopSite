import { redirect } from "next/navigation";

export default async function AdminPrintLeadDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: leadId } = await params;
  const id = String(leadId || "").trim();
  if (!id) redirect("/admin/crm/print");
  redirect(`/admin/crm/print/${encodeURIComponent(id)}`);
}
