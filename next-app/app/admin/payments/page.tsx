import { createClient } from "@/lib/supabase/server";
import { PaymentsTable } from "@/components/admin/payments-table";

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("*, clients(business_name), projects(name)")
    .order("created_at", { ascending: false });
  const { data: clients } = await supabase.from("clients").select("*").order("business_name");
  const { data: projects } = await supabase.from("projects").select("*").order("name");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>
      <PaymentsTable payments={payments ?? []} clients={clients ?? []} projects={projects ?? []} />
    </div>
  );
}
