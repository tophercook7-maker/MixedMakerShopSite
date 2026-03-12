import { createClient } from "@/lib/supabase/server";
import { ProjectsTable } from "@/components/admin/projects-table";

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*, clients(business_name)")
    .order("created_at", { ascending: false });
  const { data: clients } = await supabase.from("clients").select("*").order("business_name");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>Projects</h1>
      <ProjectsTable projects={projects ?? []} clients={clients ?? []} />
    </div>
  );
}
