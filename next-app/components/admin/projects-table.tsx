"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/db-types";
import type { Client } from "@/lib/db-types";
import { ProjectForm } from "./project-form";

type ProjectRow = Project & { clients?: { business_name: string } | null };

type Props = { projects: ProjectRow[]; clients: Client[] };

const today = new Date().toISOString().slice(0, 10);

export function ProjectsTable({ projects, clients }: Props) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<ProjectRow | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = projects.filter((p) => !statusFilter || p.status === statusFilter);

  async function updateProject(id: string, updates: Partial<Project>) {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return;
    setEditing(null);
    router.refresh();
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project? Tasks will be deleted.")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setEditing(null);
    router.refresh();
  }

  async function createProject(payload: Record<string, unknown>) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return;
    setAdding(false);
    router.refresh();
  }

  const clientName = (p: ProjectRow) => (p.clients && typeof p.clients === "object" && "business_name" in p.clients ? (p.clients as { business_name: string }).business_name : "—");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="planning">Planning</option>
          <option value="design">Design</option>
          <option value="development">Development</option>
          <option value="testing">Testing</option>
          <option value="complete">Complete</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add project
        </button>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Client</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Deadline</th>
              <th className="text-left p-3 font-medium">Price</th>
              <th className="w-20 p-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className={`border-b last:border-0 ${p.deadline && p.deadline < today && p.status !== "complete" ? "bg-destructive/5" : ""}`}
              >
                <td className="p-3">{p.name}</td>
                <td className="p-3">{clientName(p)}</td>
                <td className="p-3 capitalize">{p.status.replace("_", " ")}</td>
                <td className="p-3 text-muted-foreground">{p.deadline ?? "—"}</td>
                <td className="p-3">{p.price != null ? `$${Number(p.price).toLocaleString()}` : "—"}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => setEditing(p)}
                    className="text-primary hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">No projects match.</p>
      )}
      {editing && (
        <ProjectForm
          project={editing}
          clients={clients}
          onClose={() => setEditing(null)}
          onSave={(updates) => updateProject(editing.id, updates)}
          onDelete={() => deleteProject(editing.id)}
        />
      )}
      {adding && (
        <ProjectForm
          clients={clients}
          onClose={() => setAdding(false)}
          onSave={(payload) => createProject(payload)}
        />
      )}
    </div>
  );
}
