"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Client } from "@/lib/db-types";
import { ClientForm } from "./client-form";

type ClientRow = Client & { project_count?: number; payment_count?: number };

type Props = { clients: ClientRow[] };

export function ClientsTable({ clients }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<ClientRow | null>(null);
  const [editing, setEditing] = useState<ClientRow | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      !search ||
      [c.business_name, c.contact_name, c.email].some((v) => v && String(v).toLowerCase().includes(q))
    );
  });

  async function updateClient(id: string, updates: Partial<Client>) {
    const res = await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return;
    setEditing(null);
    router.refresh();
  }

  async function deleteClient(id: string) {
    if (!confirm("Delete this client? Projects and payments will be affected.")) return;
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setEditing(null);
    setDetail(null);
    router.refresh();
  }

  async function createClient(payload: Record<string, unknown>) {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return;
    setAdding(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="search"
          placeholder="Search clients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm w-64"
        />
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add client
        </button>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Business</th>
              <th className="text-left p-3 font-medium">Contact</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Projects</th>
              <th className="text-left p-3 font-medium">Payments</th>
              <th className="w-24 p-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-3">{c.business_name}</td>
                <td className="p-3">{c.contact_name ?? "—"}</td>
                <td className="p-3">{c.email ?? "—"}</td>
                <td className="p-3">{c.project_count ?? 0}</td>
                <td className="p-3">{c.payment_count ?? 0}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => setDetail(c)}
                    className="text-primary hover:underline text-xs mr-2"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
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
        <p className="text-sm text-muted-foreground py-6 text-center">No clients found.</p>
      )}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetail(null)}>
          <div className="w-full max-w-lg rounded-lg border bg-background p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg">{detail.business_name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{detail.contact_name}</p>
            <p className="text-sm text-muted-foreground">{detail.email}</p>
            {detail.website && <p className="text-sm text-muted-foreground">{detail.website}</p>}
            {detail.notes && <p className="mt-2 text-sm">{detail.notes}</p>}
            <p className="mt-3 text-sm font-medium">Projects: {detail.project_count ?? 0}</p>
            <p className="text-sm font-medium">Payments: {detail.payment_count ?? 0}</p>
            <div className="mt-4 flex gap-2">
              <Link href={`/admin/projects?client=${detail.id}`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
                View projects
              </Link>
              <Link href={`/admin/payments?client=${detail.id}`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
                View payments
              </Link>
              <button type="button" onClick={() => { setDetail(null); setEditing(detail); }} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90">
                Edit
              </button>
              <button type="button" onClick={() => setDetail(null)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Close</button>
            </div>
          </div>
        </div>
      )}
      {editing && (
        <ClientForm
          client={editing}
          onClose={() => setEditing(null)}
          onSave={(updates) => updateClient(editing.id, updates)}
          onDelete={() => deleteClient(editing.id)}
        />
      )}
      {adding && (
        <ClientForm
          onClose={() => setAdding(false)}
          onSave={(payload) => createClient(payload)}
        />
      )}
    </div>
  );
}
