"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Task } from "@/lib/db-types";
import type { Project } from "@/lib/db-types";
import { TaskForm } from "./task-form";

type TaskRow = Task & { projects?: { name: string; client_id: string; clients?: { business_name: string } | null } | null };

type Props = {
  tasksByGroup: { overdue: TaskRow[]; today: TaskRow[]; upcoming: TaskRow[] };
  projects: Project[];
};

const today = new Date().toISOString().slice(0, 10);

const priorityClass: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive",
  high: "bg-orange-500/20 text-orange-700 dark:text-orange-400",
  medium: "bg-muted text-muted-foreground",
  low: "bg-muted/50 text-muted-foreground",
};

export function TasksTable({ tasksByGroup, projects }: Props) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<TaskRow | null>(null);
  const [adding, setAdding] = useState(false);

  const allTasks = [...tasksByGroup.overdue, ...tasksByGroup.today, ...tasksByGroup.upcoming];
  const filtered = statusFilter ? allTasks.filter((t) => t.status === statusFilter) : allTasks;

  const grouped = {
    overdue: filtered.filter((t) => t.due_date && t.due_date < today && t.status !== "done"),
    today: filtered.filter((t) => t.due_date === today && t.status !== "done"),
    upcoming: filtered.filter((t) => (!t.due_date || t.due_date > today) && t.status !== "done"),
  };

  async function updateTask(id: string, updates: Partial<Task>) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return;
    setEditing(null);
    router.refresh();
  }

  async function deleteTask(id: string) {
    if (!confirm("Delete this task?")) return;
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setEditing(null);
    router.refresh();
  }

  async function createTask(payload: Record<string, unknown>) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return;
    setAdding(false);
    router.refresh();
  }

  const projectName = (t: TaskRow) => (t.projects && typeof t.projects === "object" && "name" in t.projects ? (t.projects as { name: string }).name : "—");

  const renderList = (title: string, tasks: TaskRow[], titleClass = "") => (
    <section className="rounded-lg border bg-card p-4">
      <h2 className={`font-semibold mb-3 ${titleClass}`}>{title}</h2>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="rounded border p-2 text-sm flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium truncate">{t.title}</p>
              <p className="text-muted-foreground text-xs">
                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${priorityClass[t.priority] ?? "bg-muted"}`}>
                  {t.priority}
                </span>
                {" · "}{projectName(t)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(t)}
              className="text-primary hover:underline shrink-0"
            >
              Edit
            </button>
          </li>
        ))}
        {tasks.length === 0 && <li className="text-sm text-muted-foreground">None</li>}
      </ul>
    </section>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add task
        </button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {renderList("Overdue", grouped.overdue, "text-destructive")}
        {renderList("Today", grouped.today)}
        {renderList("Upcoming", grouped.upcoming.slice(0, 15))}
      </div>
      {editing && (
        <TaskForm
          task={editing}
          projects={projects}
          onClose={() => setEditing(null)}
          onSave={(updates) => updateTask(editing.id, updates)}
          onDelete={() => deleteTask(editing.id)}
        />
      )}
      {adding && (
        <TaskForm
          projects={projects}
          onClose={() => setAdding(false)}
          onSave={(payload) => createTask(payload)}
        />
      )}
    </div>
  );
}
