"use client";

import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/db-types";

const STATUSES = [
  "new",
  "contacted",
  "follow_up_due",
  "replied",
  "closed_won",
  "closed_lost",
  "do_not_contact",
] as const;

type Col = { status: string; leads: Lead[] };

export function PipelineBoard({ initialStatuses }: { initialStatuses: Col[] }) {
  const router = useRouter();

  async function updateStatus(leadId: string, newStatus: string) {
    const res = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) return;
    router.refresh();
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {initialStatuses.map(({ status, leads }) => (
          <div key={status} className="admin-card w-64 shrink-0 p-4">
            <h3 className="font-medium capitalize mb-3" style={{ color: "var(--admin-fg)" }}>
              {status.replace("_", " ")} ({leads.length})
            </h3>
            <div className="space-y-2">
              {leads.map((l) => (
                <div key={l.id} className="admin-card p-3 text-sm" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <p className="font-medium truncate" style={{ color: "var(--admin-fg)" }}>{l.business_name}</p>
                  <p className="text-xs truncate" style={{ color: "var(--admin-muted)" }}>{l.contact_name || l.email || "—"}</p>
                  <select
                    value={l.status}
                    onChange={(e) => updateStatus(l.id, e.target.value)}
                    className="admin-select mt-2 w-full text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
