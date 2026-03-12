"use client";

import { useState } from "react";
import type { Payment } from "@/lib/db-types";
import type { Client } from "@/lib/db-types";
import type { Project } from "@/lib/db-types";

const STATUSES = ["pending", "paid", "overdue"] as const;

type Props = {
  payment?: Payment;
  clients: Client[];
  projects: Project[];
  onClose: () => void;
  onSave: (u: Partial<Payment> | Record<string, unknown>) => void;
  onDelete?: () => void;
};

export function PaymentForm({ payment, clients, projects, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState({
    client_id: payment?.client_id ?? "",
    project_id: payment?.project_id ?? "",
    amount: payment?.amount != null ? String(payment.amount) : "",
    status: (payment?.status ?? "pending") as (typeof STATUSES)[number],
    payment_date: payment?.payment_date ?? "",
    notes: payment?.notes ?? "",
  });

  const clientProjects = projects.filter((p) => p.client_id === form.client_id);

  const handleSave = () => {
    const payload = {
      client_id: form.client_id,
      project_id: form.project_id || null,
      amount: parseFloat(form.amount) || 0,
      status: form.status,
      payment_date: form.payment_date || null,
      notes: form.notes || undefined,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center admin-modal-backdrop p-4" onClick={onClose}>
      <div className="admin-modal w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-3" style={{ color: "var(--admin-fg)" }}>{payment ? "Edit payment" : "Add payment"}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Client *</label>
            <select
              value={form.client_id}
              onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value, project_id: "" }))}
              className="admin-select w-full"
              disabled={!!payment}
            >
              <option value="">Select client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.business_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Project (optional)</label>
            <select
              value={form.project_id}
              onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}
              className="admin-select w-full"
              disabled={!!payment}
            >
              <option value="">None</option>
              {clientProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Amount *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as (typeof STATUSES)[number] }))}
              className="admin-select w-full"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Payment date</label>
            <input
              type="date"
              value={form.payment_date}
              onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
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
