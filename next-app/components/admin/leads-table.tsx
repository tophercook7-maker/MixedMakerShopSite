"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/db-types";
import { LeadForm } from "./lead-form";

type Props = { leads: Lead[] };

export function LeadsTable({ leads }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<Lead | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = leads.filter((l) => {
    const matchSearch =
      !search ||
      [l.business_name, l.contact_name, l.email].some(
        (v) => v && String(v).toLowerCase().includes(search.toLowerCase())
      );
    const matchStatus = !statusFilter || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function updateLead(id: string, updates: Partial<Lead>) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return;
    setEditing(null);
    router.refresh();
  }

  async function deleteLead(id: string) {
    if (!confirm("Delete this lead?")) return;
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setEditing(null);
    router.refresh();
  }

  async function createLead(payload: Record<string, unknown>) {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return;
    setAdding(false);
    router.refresh();
  }

  async function convertToClient(leadId: string) {
    const res = await fetch("/api/leads/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, markWon: true }),
    });
    if (!res.ok) return;
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="search"
          placeholder="Search leads…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm w-48"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="interested">Interested</option>
          <option value="proposal_sent">Proposal sent</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add lead
        </button>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Business</th>
              <th className="text-left p-3 font-medium">Contact</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Source</th>
              <th className="text-left p-3 font-medium">Created</th>
              <th className="w-24 p-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-b last:border-0">
                <td className="p-3">{l.business_name}</td>
                <td className="p-3">{l.contact_name ?? "—"}</td>
                <td className="p-3">{l.email ?? "—"}</td>
                <td className="p-3 capitalize">{l.status.replace("_", " ")}</td>
                <td className="p-3 text-muted-foreground">{l.lead_source ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{l.created_at?.slice(0, 10)}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => setEditing(l)}
                    className="text-primary hover:underline text-xs"
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
        <p className="text-sm text-muted-foreground py-6 text-center">No leads match your filters.</p>
      )}
      {editing && (
        <LeadForm
          lead={editing}
          onClose={() => setEditing(null)}
          onSave={(updates) => updateLead(editing.id, updates)}
          onDelete={() => deleteLead(editing.id)}
          onConvertToClient={convertToClient}
        />
      )}
      {adding && (
        <LeadForm
          onClose={() => setAdding(false)}
          onSave={(payload) => createLead(payload)}
        />
      )}
    </div>
  );
}
