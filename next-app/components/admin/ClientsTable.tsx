"use client";

import { useState } from "react";
import { Client } from "@/types";

type ClientRow = Client & { project_count?: number; payment_count?: number };

export function ClientsTable({ clients }: { clients: ClientRow[] }) {
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<ClientRow | null>(null);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      !search ||
      [c.name, c.email, c.company].some((v) => v && String(v).toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Search clients…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm w-64"
      />
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Company</th>
              <th className="text-left p-3 font-medium">Projects</th>
              <th className="text-left p-3 font-medium">Payments</th>
              <th className="w-20 p-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.email ?? "—"}</td>
                <td className="p-3">{c.company ?? "—"}</td>
                <td className="p-3">{c.project_count ?? 0}</td>
                <td className="p-3">{c.payment_count ?? 0}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => setDetail(c)}
                    className="text-primary hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetail(null)}>
          <div className="w-full max-w-lg rounded-lg border bg-background p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg">{detail.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{detail.email}</p>
            <p className="text-sm text-muted-foreground">{detail.company}</p>
            {detail.notes && <p className="mt-2 text-sm">{detail.notes}</p>}
            <p className="mt-3 text-sm font-medium">Projects: {detail.project_count ?? 0}</p>
            <p className="text-sm font-medium">Payments: {detail.payment_count ?? 0}</p>
            <button type="button" onClick={() => setDetail(null)} className="mt-4 rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
