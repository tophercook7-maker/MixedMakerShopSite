"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Payment } from "@/lib/db-types";
import type { Client } from "@/lib/db-types";
import type { Project } from "@/lib/db-types";
import { PaymentForm } from "./payment-form";

type PaymentRow = Payment & {
  clients?: { business_name: string } | null;
  projects?: { name: string } | null;
};

type Props = { payments: PaymentRow[]; clients: Client[]; projects: Project[] };

export function PaymentsTable({ payments, clients, projects }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<PaymentRow | null>(null);
  const [adding, setAdding] = useState(false);

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);

  const clientName = (p: PaymentRow) => (p.clients && typeof p.clients === "object" && "business_name" in p.clients ? (p.clients as { business_name: string }).business_name : "—");
  const projectName = (p: PaymentRow) => (p.projects && typeof p.projects === "object" && "name" in p.projects ? (p.projects as { name: string }).name : "—");
  const statusClass = (s: string) => {
    if (s === "paid") return "admin-badge admin-badge-paid";
    if (["overdue"].includes(s)) return "admin-badge admin-badge-overdue";
    return "admin-badge admin-badge-pending";
  };

  async function updatePayment(id: string, updates: Partial<Payment>) {
    const res = await fetch(`/api/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return;
    setEditing(null);
    router.refresh();
  }

  async function deletePayment(id: string) {
    if (!confirm("Delete this payment?")) return;
    const res = await fetch(`/api/payments/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setEditing(null);
    router.refresh();
  }

  async function createPayment(payload: Record<string, unknown>) {
    const res = await fetch("/api/payments", {
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
      <div className="flex flex-wrap gap-4 items-center">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="admin-btn-primary"
        >
          Add payment
        </button>
        <div className="flex gap-6 text-sm" style={{ color: "var(--admin-muted)" }}>
          <span>Paid total: <strong style={{ color: "var(--admin-fg)" }}>${totalPaid.toLocaleString()}</strong></span>
          <span>Pending: <strong style={{ color: "var(--admin-fg)" }}>${totalPending.toLocaleString()}</strong></span>
        </div>
      </div>
      <div className="admin-table-wrap overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Client</th>
              <th className="text-left p-3 font-medium">Project</th>
              <th className="text-left p-3 font-medium">Amount</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Payment date</th>
              <th className="w-20 p-3" />
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3">{clientName(p)}</td>
                <td className="p-3">{projectName(p) || "—"}</td>
                <td className="p-3">${Number(p.amount).toLocaleString()}</td>
                <td className="p-3"><span className={statusClass(p.status)}>{p.status}</span></td>
                <td className="p-3" style={{ color: "var(--admin-muted)" }}>{p.payment_date ?? "—"}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => setEditing(p)}
                    className="text-[var(--admin-gold)] hover:underline font-medium"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {payments.length === 0 && (
        <div className="admin-empty admin-card">
          <div className="admin-empty-title">No payments yet</div>
        </div>
      )}
      {editing && (
        <PaymentForm
          payment={editing}
          clients={clients}
          projects={projects}
          onClose={() => setEditing(null)}
          onSave={(updates) => updatePayment(editing.id, updates)}
          onDelete={() => deletePayment(editing.id)}
        />
      )}
      {adding && (
        <PaymentForm
          clients={clients}
          projects={projects}
          onClose={() => setAdding(false)}
          onSave={(payload) => createPayment(payload)}
        />
      )}
    </div>
  );
}
