"use client";

import { useState } from "react";
import type { Lead } from "@/lib/db-types";

const STATUSES = ["new", "contacted", "interested", "proposal_sent", "won", "lost"] as const;

type Props = {
  lead?: Lead;
  onClose: () => void;
  onSave: (u: Partial<Lead> | Record<string, unknown>) => void;
  onDelete?: () => void;
  onConvertToClient?: (leadId: string) => void;
};

export function LeadForm({ lead, onClose, onSave, onDelete, onConvertToClient }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    business_name: lead?.business_name ?? "",
    contact_name: lead?.contact_name ?? "",
    email: lead?.email ?? "",
    phone: lead?.phone ?? "",
    website: lead?.website ?? "",
    industry: lead?.industry ?? "",
    lead_source: lead?.lead_source ?? "",
    status: (lead?.status ?? "new") as (typeof STATUSES)[number],
    notes: lead?.notes ?? "",
    follow_up_date: lead?.follow_up_date ?? "",
  });

  const handleSave = () => {
    setError(null);
    const businessName = form.business_name.trim();
    if (!businessName) {
      setError("Business name is required");
      return;
    }
    const payload = {
      ...form,
      business_name: businessName,
      contact_name: form.contact_name?.trim() || undefined,
      email: form.email?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      website: form.website?.trim() || undefined,
      industry: form.industry?.trim() || undefined,
      lead_source: form.lead_source?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
      follow_up_date: form.follow_up_date?.trim() || undefined,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center admin-modal-backdrop p-4" onClick={onClose}>
      <div className="admin-modal w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-3" style={{ color: "var(--admin-fg)" }}>{lead ? "Edit lead" : "Add lead"}</h3>
        {error && <p className="text-sm mb-3" style={{ color: "var(--admin-orange)" }}>{error}</p>}
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
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Industry</label>
            <input
              value={form.industry}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Lead source</label>
            <input
              value={form.lead_source}
              onChange={(e) => setForm((f) => ({ ...f, lead_source: e.target.value }))}
              placeholder="e.g. contact_form, website_check"
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
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--admin-muted)" }}>Follow-up date</label>
            <input
              type="date"
              value={form.follow_up_date}
              onChange={(e) => setForm((f) => ({ ...f, follow_up_date: e.target.value }))}
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
        <div className="mt-4 flex justify-between gap-2 flex-wrap">
          <div className="flex gap-2 items-center">
            {lead && onConvertToClient && (
              <button type="button" onClick={() => onConvertToClient(lead.id)} className="admin-btn-primary">
                Convert to client
              </button>
            )}
            {onDelete && (
              <button type="button" onClick={onDelete} className="admin-btn-ghost" style={{ color: "var(--admin-orange)" }}>
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="admin-btn-ghost">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="admin-btn-primary">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
