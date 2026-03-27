"use client";

import Link from "next/link";
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { buildLeadPath } from "@/lib/lead-route";
import {
  computePrintJobAmountDueUsd,
  formatUsdAmount,
  normalizePrintPaymentRequestType,
  normalizePrintPaymentStatus,
  PRINT_PAYMENT_REQUEST_LABELS,
  PRINT_PAYMENT_STATUS_LABELS,
} from "@/lib/crm/print-payment";
import { isFollowUpDueTodayUtc } from "@/lib/crm/simple-lead-status-ui";
import { LeadServiceTypeBadge } from "@/components/admin/crm/lead-service-type-badge";
import {
  buildPrintQuickActionPatch,
  PRINT_QUICK_ACTION_BUTTONS,
  type PrintQuickActionId,
  suggestedPrintQuickActions,
} from "@/lib/crm/three-d-print-quick-actions";
import { normalizePrintPipelineStatus, printLastActivityMs } from "@/lib/crm/three-d-print-lead";
import { resolvePrintUiLane, THREE_D_PRINT_UI_LANE_LABELS } from "@/lib/crm/three-d-print-ui-lanes";

function displayName(lead: WorkflowLead): string {
  const n = String(lead.known_owner_name || "").trim();
  if (n) return n;
  const b = String(lead.business_name || "").trim();
  if (b.startsWith("3D Print Quote")) return b.replace(/^3D Print Quote —\s*/i, "").trim() || b;
  return b || "—";
}

function contactCell(lead: WorkflowLead): string {
  const e = String(lead.email || "").trim();
  const p = String(lead.phone_from_site || "").trim();
  if (e && p) return `${e} · ${p}`;
  return e || p || "—";
}

function requestSummary(lead: WorkflowLead): string {
  const s = String(lead.print_request_summary || "").trim();
  if (s) return s.length > 120 ? `${s.slice(0, 117)}…` : s;
  const n = lead.notes?.[0] ? String(lead.notes[0]).replace(/\s+/g, " ").trim() : "";
  if (!n) return "—";
  return n.length > 120 ? `${n.slice(0, 117)}…` : n;
}

function fmtActivity(lead: WorkflowLead): string {
  const ms = printLastActivityMs(lead);
  if (!ms) return "—";
  try {
    return new Date(ms).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "—";
  }
}

function fmtFu(iso: string | null | undefined): string {
  if (!iso || !String(iso).trim()) return "—";
  const d = new Date(String(iso));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "numeric" });
}

function PaymentMoneyCell({ lead }: { lead: WorkflowLead }) {
  const { due, dueKind } = computePrintJobAmountDueUsd(lead);
  const quoted =
    lead.quoted_amount != null && Number(lead.quoted_amount) > 0
      ? formatUsdAmount(Number(lead.quoted_amount))
      : lead.price_charged != null && Number(lead.price_charged) > 0
        ? formatUsdAmount(Number(lead.price_charged))
        : "—";
  const duePrefix = dueKind === "deposit" ? "Dep " : dueKind === "balance" ? "Bal " : dueKind === "full" ? "" : "";
  const dueStr = due != null && due > 0 ? `${duePrefix}${formatUsdAmount(due)}` : "—";
  const st = PRINT_PAYMENT_STATUS_LABELS[normalizePrintPaymentStatus(lead.payment_status)];
  const pr = PRINT_PAYMENT_REQUEST_LABELS[normalizePrintPaymentRequestType(lead.payment_request_type)];
  return (
    <div className="text-[10px] leading-snug space-y-0.5" style={{ color: "var(--admin-muted)" }}>
      <p>
        <span className="opacity-80">Q </span>
        <span className="text-zinc-200 tabular-nums">{quoted}</span>
        <span className="opacity-80"> · Due </span>
        <span className="text-amber-200/90 tabular-nums font-medium">{dueStr}</span>
      </p>
      <p className="opacity-95">{st}</p>
      <p className="opacity-80">{pr}</p>
    </div>
  );
}

export function ThreeDPrintRequestsTable({
  leads,
  busyId,
  patchLead,
  onQuotedPaymentRequest,
  onOpenWorkflow,
}: {
  leads: WorkflowLead[];
  busyId: string | null;
  patchLead: (leadId: string, patch: Record<string, unknown>, okMsg: string, log?: string) => Promise<void>;
  onQuotedPaymentRequest?: (lead: WorkflowLead) => void;
  onOpenWorkflow: (lead: WorkflowLead) => void;
}) {
  if (leads.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border-2 border-violet-500/35 bg-black/20">
      <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--admin-border)" }}>
            <th className="py-2.5 px-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Name
            </th>
            <th className="py-2.5 px-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Contact
            </th>
            <th className="py-2.5 px-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Request
            </th>
            <th className="py-2.5 px-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Lane
            </th>
            <th className="py-2.5 px-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Next F/U
            </th>
            <th className="py-2.5 px-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Tags
            </th>
            <th className="py-2.5 px-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Estimate
            </th>
            <th className="py-2.5 px-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Payment
            </th>
            <th className="py-2.5 px-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Activity
            </th>
            <th className="py-2.5 px-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Open
            </th>
            <th className="py-2.5 px-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Quick
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const busy = busyId === lead.id;
            const href = buildLeadPath(lead.id, lead.business_name);
            const tags = (lead.print_tags || []).filter(Boolean);
            const lane = resolvePrintUiLane(lead);
            const fuToday = isFollowUpDueTodayUtc(lead.next_follow_up_at);
            const suggested = suggestedPrintQuickActions(lead);

            async function runQuick(id: PrintQuickActionId) {
              if (
                id === "mark_reviewed" &&
                onQuotedPaymentRequest &&
                normalizePrintPipelineStatus(lead.print_pipeline_status) !== "quoted"
              ) {
                onQuotedPaymentRequest(lead);
                return;
              }
              const patch = buildPrintQuickActionPatch(id);
              const label = PRINT_QUICK_ACTION_BUTTONS.find((b) => b.id === id)?.label ?? id;
              await patchLead(lead.id, patch, `Print: ${label}`, `print_quick_${id}`);
            }

            return (
              <tr
                key={lead.id}
                className={`border-b transition hover:bg-violet-500/[0.06] ${fuToday ? "bg-amber-500/[0.07]" : ""}`}
                style={{ borderColor: "var(--admin-border)" }}
              >
                <td className="py-2 px-3 align-top font-medium" style={{ color: "var(--admin-fg)" }}>
                  <div className="flex flex-col gap-1">
                    {fuToday ? (
                      <span className="text-[9px] font-bold uppercase text-amber-200/95 w-fit">Due today</span>
                    ) : null}
                    {displayName(lead)}
                    <LeadServiceTypeBadge serviceType="3d_printing" />
                  </div>
                </td>
                <td className="py-2 px-3 align-top text-xs max-w-[200px]" style={{ color: "var(--admin-muted)" }}>
                  {contactCell(lead)}
                </td>
                <td className="py-2 px-3 align-top text-xs max-w-[240px]" style={{ color: "var(--admin-fg)" }}>
                  {requestSummary(lead)}
                </td>
                <td className="py-2 px-3 align-top text-[11px] font-medium text-violet-200/95 max-w-[140px]">
                  {THREE_D_PRINT_UI_LANE_LABELS[lane]}
                  <div className="text-[9px] font-mono opacity-70 mt-0.5">{normalizePrintPipelineStatus(lead.print_pipeline_status)}</div>
                </td>
                <td className="py-2 px-3 align-top text-[11px]" style={{ color: "var(--admin-muted)" }}>
                  {fmtFu(lead.next_follow_up_at)}
                </td>
                <td className="py-2 px-3 align-top text-[11px]" style={{ color: "var(--admin-muted)" }}>
                  {tags.length ? tags.join(", ") : "—"}
                </td>
                <td className="py-2 px-3 align-top text-[11px] max-w-[160px]" style={{ color: "var(--admin-muted)" }}>
                  {String(lead.print_estimate_summary || "").trim() || "—"}
                </td>
                <td className="py-2 px-3 align-top max-w-[150px]">
                  <PaymentMoneyCell lead={lead} />
                </td>
                <td className="py-2 px-3 align-top text-[11px]" style={{ color: "var(--admin-muted)" }}>
                  {fmtActivity(lead)}
                </td>
                <td className="py-2 px-3 align-top space-y-1">
                  <button type="button" className="block text-sky-400 hover:underline text-xs font-medium" onClick={() => onOpenWorkflow(lead)}>
                    Workflow
                  </button>
                  <Link href={href} className="block text-violet-300 hover:underline text-xs font-medium">
                    Workspace →
                  </Link>
                </td>
                <td className="py-2 px-3 align-top">
                  <div className="flex flex-wrap gap-1 max-w-[320px]">
                    {PRINT_QUICK_ACTION_BUTTONS.filter((b) => suggested.includes(b.id)).map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        disabled={busy}
                        className="rounded border border-violet-500/40 px-1.5 py-0.5 text-[10px] font-medium text-violet-100/95 hover:bg-violet-500/20 disabled:opacity-40"
                        onClick={() => void runQuick(a.id)}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
