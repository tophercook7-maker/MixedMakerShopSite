import { createClient } from "@/lib/supabase/server";
import { ClientsTable } from "@/components/admin/clients-table";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: projects } = await supabase.from("projects").select("client_id");
  const { data: payments } = await supabase.from("payments").select("client_id");
  const projectCount = (id: string) => projects?.filter((p) => p.client_id === id).length ?? 0;
  const paymentCount = (id: string) => payments?.filter((p) => p.client_id === id).length ?? 0;
  const clientsWithCounts = (clients ?? []).map((c) => ({
    ...c,
    project_count: projectCount(c.id),
    payment_count: paymentCount(c.id),
  }));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>Clients</h1>
      <ClientsTable clients={clientsWithCounts} />
    </div>
  );
}
