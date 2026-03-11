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
    const payload = {
      ...form,
      contact_name: form.contact_name || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      website: form.website || undefined,
      industry: form.industry || undefined,
      lead_source: form.lead_source || undefined,
      notes: form.notes || undefined,
      follow_up_date: form.follow_up_date || undefined,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg border bg-background p-4 shadow-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-3">{lead ? "Edit lead" : "Add lead"}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Business name *</label>
            <input
              value={form.business_name}
              onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Contact name</label>
            <input
              value={form.contact_name}
              onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Website</label>
            <input
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Industry</label>
            <input
              value={form.industry}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Lead source</label>
            <input
              value={form.lead_source}
              onChange={(e) => setForm((f) => ({ ...f, lead_source: e.target.value }))}
              placeholder="e.g. contact_form, website_check"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as (typeof STATUSES)[number] }))}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Follow-up date</label>
            <input
              type="date"
              value={form.follow_up_date}
              onChange={(e) => setForm((f) => ({ ...f, follow_up_date: e.target.value }))}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-between gap-2 flex-wrap">
          <div className="flex gap-2 items-center">
            {lead && onConvertToClient && (
              <button
                type="button"
                onClick={() => onConvertToClient(lead.id)}
                className="rounded-md border border-primary text-primary px-3 py-1.5 text-sm hover:bg-primary/10"
              >
                Convert to client
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-md border border-destructive text-destructive px-3 py-1.5 text-sm hover:bg-destructive/10"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
