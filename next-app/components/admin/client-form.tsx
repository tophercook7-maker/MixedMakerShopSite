"use client";

import { useState } from "react";
import type { Client } from "@/lib/db-types";

type Props = {
  client?: Client;
  onClose: () => void;
  onSave: (u: Partial<Client> | Record<string, unknown>) => void;
  onDelete?: () => void;
};

export function ClientForm({ client, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState({
    business_name: client?.business_name ?? "",
    contact_name: client?.contact_name ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    website: client?.website ?? "",
    hosting_provider: client?.hosting_provider ?? "",
    maintenance_plan: client?.maintenance_plan ?? "",
    notes: client?.notes ?? "",
  });

  const handleSave = () => {
    const payload = {
      ...form,
      contact_name: form.contact_name || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      website: form.website || undefined,
      hosting_provider: form.hosting_provider || undefined,
      maintenance_plan: form.maintenance_plan || undefined,
      notes: form.notes || undefined,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center admin-modal-backdrop p-4" onClick={onClose}>
      <div className="admin-modal w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-3" style={{ color: "var(--admin-fg)" }}>{client ? "Edit client" : "Add client"}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Business name *</label>
            <input
              value={form.business_name}
              onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Contact name</label>
            <input
              value={form.contact_name}
              onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Website</label>
            <input
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Hosting provider</label>
            <input
              value={form.hosting_provider}
              onChange={(e) => setForm((f) => ({ ...f, hosting_provider: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Maintenance plan</label>
            <input
              value={form.maintenance_plan}
              onChange={(e) => setForm((f) => ({ ...f, maintenance_plan: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Notes</label>
            <textarea
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
