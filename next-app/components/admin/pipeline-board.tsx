"use client";

import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/db-types";

const STATUSES = ["new", "contacted", "interested", "proposal_sent", "won", "lost"] as const;

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
          <div
            key={status}
            className="w-64 shrink-0 rounded-lg border bg-card p-3"
          >
            <h3 className="font-medium capitalize mb-2">
              {status.replace("_", " ")} ({leads.length})
            </h3>
            <div className="space-y-2">
              {leads.map((l) => (
                <div
                  key={l.id}
                  className="rounded border bg-background p-2 text-sm"
                >
                  <p className="font-medium truncate">{l.business_name}</p>
                  <p className="text-muted-foreground text-xs truncate">{l.contact_name || l.email || "—"}</p>
                  <select
                    value={l.status}
                    onChange={(e) => updateStatus(l.id, e.target.value)}
                    className="mt-2 w-full rounded border border-input bg-background px-2 py-1 text-xs"
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
