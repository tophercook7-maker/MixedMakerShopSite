import { createClient } from "@/lib/supabase/server";
import { TasksTable } from "@/components/admin/tasks-table";

export default async function AdminTasksPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, projects(name, client_id, clients(business_name))")
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  const { data: projects } = await supabase.from("projects").select("*").order("name");
  const byDate = {
    overdue: (tasks ?? []).filter((t) => t.due_date && t.due_date < today && t.status !== "done"),
    today: (tasks ?? []).filter((t) => t.due_date === today && t.status !== "done"),
    upcoming: (tasks ?? []).filter((t) => (!t.due_date || t.due_date > today) && t.status !== "done"),
  };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tasks</h1>
      <TasksTable tasksByGroup={byDate} projects={projects ?? []} />
    </div>
  );
}
