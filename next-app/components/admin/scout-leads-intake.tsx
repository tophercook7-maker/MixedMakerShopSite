"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LeadStatus } from "@/lib/db-types";

type ScoutLeadRow = {
  id: string;
  business_name: string;
  status: LeadStatus;
  lead_source: string | null;
  opportunity_score?: number | null;
};

const STATUS_OPTIONS: LeadStatus[] = [
  "new",
  "contacted",
  "follow_up_due",
  "replied",
  "closed_won",
  "closed_lost",
  "do_not_contact",
];

export function ScoutLeadsIntake({ leads }: { leads: ScoutLeadRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(id: string, status: LeadStatus) {
    setPendingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Could not update lead status.");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update status.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="admin-card">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="admin-section-title !mb-0">New Leads From Scout-Brain</h2>
        <Link href="/admin/leads?source=scout-brain&status=new" className="text-sm font-semibold text-[var(--admin-gold)] hover:underline">
          Open Leads
        </Link>
      </div>

      {leads.length === 0 ? (
        <div className="admin-empty !py-8">
          <div className="admin-empty-title">No new Scout-Brain leads yet</div>
          <div className="admin-empty-desc">Morning intake will place strong opportunities here automatically.</div>
        </div>
      ) : (
        <div className="admin-table-wrap overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Business</th>
                <th>Score</th>
                <th>Source</th>
                <th>Quick Open</th>
                <th>Quick Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.business_name}</td>
                  <td>{lead.opportunity_score ?? "—"}</td>
                  <td>{lead.lead_source ?? "scout-brain"}</td>
                  <td>
                    <Link href={`/admin/leads?lead=${encodeURIComponent(lead.id)}`} className="text-[var(--admin-gold)] hover:underline text-xs">
                      Open
                    </Link>
                  </td>
                  <td>
                    <select
                      className="admin-select h-8 text-xs"
                      defaultValue={lead.status}
                      disabled={pendingId === lead.id}
                      onChange={(e) => void setStatus(lead.id, e.target.value as LeadStatus)}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && (
        <p className="text-sm mt-3" style={{ color: "#fca5a5" }}>
          {error}
        </p>
      )}
    </div>
  );
}
