"use client";

import { useState } from "react";
import type { Project } from "@/lib/db-types";
import type { Client } from "@/lib/db-types";
import { CRM_PROJECT_STATUSES, projectStatusLabel } from "@/lib/crm/project-status";

const STATUSES = CRM_PROJECT_STATUSES;

type Props = {
  project?: Project;
  clients: Client[];
  onClose: () => void;
  onSave: (u: Partial<Project> | Record<string, unknown>) => void;
  onDelete?: () => void;
};

export function ProjectForm({ project, clients, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState({
    client_id: project?.client_id ?? "",
    name: project?.name ?? "",
    status: (project?.status ?? "draft") as (typeof STATUSES)[number],
    deadline: project?.deadline ?? "",
    price: project?.price != null ? String(project.price) : "",
    notes: project?.notes ?? "",
  });

  const handleSave = () => {
    const payload = {
      client_id: form.client_id,
      name: form.name,
      status: form.status,
      deadline: form.deadline || undefined,
      price: form.price ? parseFloat(form.price) : undefined,
      notes: form.notes || undefined,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center admin-modal-backdrop p-4" onClick={onClose}>
      <div className="admin-modal w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="admin-text-fg font-semibold mb-3">{project ? "Edit project" : "Add project"}</h3>
        <div className="space-y-3">
          <div>
            <label className="admin-text-muted block text-xs font-medium mb-1">Client *</label>
            <select
              aria-label="Client"
              title="Client"
              value={form.client_id}
              onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
              className="admin-select w-full"
              disabled={!!project}
            >
              <option value="">Select client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.business_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-text-muted block text-xs font-medium mb-1">Project name *</label>
            <input
              aria-label="Project name"
              title="Project name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-text-muted block text-xs font-medium mb-1">Status</label>
            <select
              aria-label="Project status"
              title="Project status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as (typeof STATUSES)[number] }))}
              className="admin-select w-full"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{projectStatusLabel(s)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-text-muted block text-xs font-medium mb-1">Deadline</label>
            <input
              aria-label="Deadline"
              title="Deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-text-muted block text-xs font-medium mb-1">Price</label>
            <input
              aria-label="Price"
              title="Price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-text-muted block text-xs font-medium mb-1">Notes</label>
            <textarea
              aria-label="Notes"
              title="Notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="admin-input"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-between gap-2">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="admin-btn-danger"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="admin-btn-ghost">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="admin-btn-primary"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
