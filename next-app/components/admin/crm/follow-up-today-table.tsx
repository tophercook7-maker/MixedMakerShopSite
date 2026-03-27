"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { patchLeadApi } from "@/lib/crm/patch-lead-client";
import { applyWorkflowLeadPatch } from "@/lib/crm/apply-workflow-lead-patch";
import { isFollowUpDueTodayUtc, simpleLeadStatusLabel } from "@/lib/crm/simple-lead-status-ui";
import { LeadServiceTypeBadge, resolveServiceTypeForDisplay } from "@/components/admin/crm/lead-service-type-badge";
import { LeadWorkflowDrawer } from "@/components/admin/crm/lead-workflow-drawer";

function fmtShort(iso: string | null | undefined): string {
  if (!iso || !String(iso).trim()) return "—";
  const d = new Date(String(iso));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function FollowUpTodayTable({ initialLeads }: { initialLeads: WorkflowLead[] }) {
  const router = useRouter();
  const [leads, setLeads] = useState<WorkflowLead[]>(initialLeads);
  const [drawerLead, setDrawerLead] = useState<WorkflowLead | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const sorted = useMemo(
    () =>
      [...leads].sort((a, b) => {
        const ta = a.next_follow_up_at ? new Date(a.next_follow_up_at).getTime() : 0;
        const tb = b.next_follow_up_at ? new Date(b.next_follow_up_at).getTime() : 0;
        return ta - tb;
      }),
    [leads],
  );

  const mergeLeadPatch = (leadId: string, patch: Record<string, unknown>) => {
    setLeads((prev) => {
      const mapped = prev.map((l) => (l.id === leadId ? applyWorkflowLeadPatch(l, patch) : l));
      return mapped.filter((l) => isFollowUpDueTodayUtc(l.next_follow_up_at));
    });
    setDrawerLead((cur) => {
      if (!cur || cur.id !== leadId) return cur;
      const updated = applyWorkflowLeadPatch(cur, patch);
      if (!isFollowUpDueTodayUtc(updated.next_follow_up_at)) return null;
      return updated;
    });
    router.refresh();
  };

  async function markFollowUpSent(lead: WorkflowLead) {
    const nowIso = new Date().toISOString();
    const bump = new Date(Date.now() + 3 * 86400000).toISOString();
    setBusyId(lead.id);
    setToast(null);
    const r = await patchLeadApi(lead.id, {
      last_contacted_at: nowIso,
      next_follow_up_at: bump,
      status: lead.status === "replied" ? lead.status : "contacted",
    });
    setBusyId(null);
    if (!r.ok) {
      setToast(r.error);
      return;
    }
    setToast(`Follow-up logged for ${lead.business_name}`);
    mergeLeadPatch(lead.id, {
      last_contacted_at: nowIso,
      next_follow_up_at: bump,
      status: lead.status === "replied" ? lead.status : "contacted",
    });
    setDrawerLead((cur) => (cur?.id === lead.id ? null : cur));
  }

  return (
    <div className="space-y-3">
      {toast ? (
        <p className="text-xs rounded-md border px-3 py-2 border-emerald-500/35 text-emerald-100/95 bg-emerald-500/10">{toast}</p>
      ) : null}
      <div className="overflow-x-auto admin-card p-0">
        <table className="w-full text-sm border-collapse" style={{ color: "var(--admin-fg)" }}>
          <thead>
            <tr className="border-b text-left text-[10px] uppercase tracking-wide" style={{ borderColor: "var(--admin-border)", color: "var(--admin-muted)" }}>
              <th className="p-3 font-semibold">Business</th>
              <th className="p-3 font-semibold">Service</th>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3 font-semibold">Website</th>
              <th className="p-3 font-semibold">Facebook</th>
              <th className="p-3 font-semibold">1st sent</th>
              <th className="p-3 font-semibold">Next F/U</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-sm" style={{ color: "var(--admin-muted)" }}>
                  No leads due for follow-up today (UTC).
                </td>
              </tr>
            ) : (
              sorted.map((lead) => {
                const svc = resolveServiceTypeForDisplay({
                  service_type: lead.service_type,
                  lead_source: lead.lead_source,
                  source: lead.source,
                  lead_tags: lead.lead_tags,
                });
                const busy = busyId === lead.id;
                const label = simpleLeadStatusLabel({
                  status: lead.status,
                  next_follow_up_at: lead.next_follow_up_at,
                  first_outreach_sent_at: lead.first_outreach_sent_at,
                });
                return (
                  <tr key={lead.id} className="border-b align-top" style={{ borderColor: "var(--admin-border)" }}>
                    <td className="p-3">
                      <div className="font-medium">{lead.business_name}</div>
                      {lead.known_owner_name ? (
                        <div className="text-[11px] opacity-85 mt-0.5" style={{ color: "var(--admin-muted)" }}>
                          {lead.known_owner_name}
                        </div>
                      ) : null}
                    </td>
                    <td className="p-3">
                      <LeadServiceTypeBadge serviceType={svc} />
                    </td>
                    <td className="p-3 text-xs break-all max-w-[140px]" style={{ color: "var(--admin-muted)" }}>
                      {lead.email || "—"}
                    </td>
                    <td className="p-3 text-xs break-all max-w-[120px]" style={{ color: "var(--admin-muted)" }}>
                      {lead.website || "—"}
                    </td>
                    <td className="p-3 text-xs break-all max-w-[120px]" style={{ color: "var(--admin-muted)" }}>
                      {lead.facebook_url || "—"}
                    </td>
                    <td className="p-3 text-xs whitespace-nowrap">{fmtShort(lead.first_outreach_sent_at)}</td>
                    <td className="p-3 text-xs whitespace-nowrap">{fmtShort(lead.next_follow_up_at)}</td>
                    <td className="p-3 text-xs">
                      <div className="font-medium text-emerald-100/90">{label}</div>
                      <div className="text-[10px] font-mono opacity-70 mt-0.5" title="Raw CRM status">
                        {lead.status}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          className="admin-btn-primary text-[10px] px-2 py-1"
                          onClick={() => setDrawerLead(lead)}
                        >
                          Open workflow
                        </button>
                        <button
                          type="button"
                          className="admin-btn-ghost text-[10px] px-2 py-1 border border-[var(--admin-border)]"
                          disabled={busy}
                          onClick={() => void markFollowUpSent(lead)}
                        >
                          Mark follow-up sent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <LeadWorkflowDrawer
        lead={drawerLead}
        open={Boolean(drawerLead)}
        onClose={() => setDrawerLead(null)}
        onLeadUpdated={mergeLeadPatch}
      />
    </div>
  );
}
