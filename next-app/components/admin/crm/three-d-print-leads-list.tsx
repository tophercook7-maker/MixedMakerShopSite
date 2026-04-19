"use client";

import Link from "next/link";
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { buildPrintLeadPath } from "@/lib/lead-route";
import { normalizePrintPaymentStatus, PRINT_PAYMENT_STATUS_LABELS } from "@/lib/crm/print-payment";
import { isFollowUpDueTodayUtc } from "@/lib/crm/simple-lead-status-ui";
import { LeadServiceTypeBadge } from "@/components/admin/crm/lead-service-type-badge";
import { ThreeDPrintTriageBadgeRow } from "@/lib/crm/three-d-print-triage-badges";
import {
  buildPrintQuickActionPatch,
  PRINT_QUICK_ACTION_BUTTONS,
  type PrintQuickActionId,
  suggestedPrintQuickActions,
} from "@/lib/crm/three-d-print-quick-actions";
import { extractPrintRequestDescription, normalizePrintPipelineStatus, printLastActivityMs } from "@/lib/crm/three-d-print-lead";
import { resolvePrintUiLane, THREE_D_PRINT_UI_LANE_LABELS } from "@/lib/crm/three-d-print-ui-lanes";

function displayName(lead: WorkflowLead): string {
  const n = String(lead.known_owner_name || "").trim();
  if (n) return n;
  const b = String(lead.business_name || "").trim();
  if (b.startsWith("3D Print Quote")) return b.replace(/^3D Print Quote —\s*/i, "").trim() || b;
  return b || "—";
}

function projectTitle(lead: WorkflowLead): string {
  return String(lead.print_request_type || lead.print_request_summary || lead.business_name || "").trim() || "—";
}

function descriptionPreview(lead: WorkflowLead): string {
  const notesJoined = Array.isArray(lead.notes) && lead.notes.length ? lead.notes.join("\n") : "";
  const raw = extractPrintRequestDescription(notesJoined, lead.print_request_summary ?? null);
  const t = String(raw || "").replace(/\s+/g, " ").trim();
  if (!t || t === "—") return "—";
  return t.length > 120 ? `${t.slice(0, 117)}…` : t;
}

function fmtActivity(lead: WorkflowLead): string {
  const ms = printLastActivityMs(lead);
  if (!ms) return "—";
  try {
    return new Date(ms).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function fmtFu(iso: string | null | undefined): string {
  if (!iso || !String(iso).trim()) return "—";
  const d = new Date(String(iso));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function ThreeDPrintLeadsList({
  leads,
  busyId,
  patchLead,
  onOpenWorkflow,
  onQuotedPaymentRequest,
}: {
  leads: WorkflowLead[];
  busyId: string | null;
  patchLead: (leadId: string, patch: Record<string, unknown>, okMsg: string, log?: string) => Promise<void>;
  onOpenWorkflow: (lead: WorkflowLead) => void;
  onQuotedPaymentRequest?: (lead: WorkflowLead) => void;
}) {
  if (leads.length === 0) return null;
  return (
    <ul className="space-y-3 list-none p-0 m-0">
      {leads.map((lead) => {
        const href = buildPrintLeadPath(lead.id, lead.business_name);
        const pay = normalizePrintPaymentStatus(lead.payment_status);
        const busy = busyId === lead.id;
        const lane = resolvePrintUiLane(lead);
        const suggested = suggestedPrintQuickActions(lead);
        const fileAttached = Boolean(String(lead.print_attachment_url || "").trim());
        const followToday = isFollowUpDueTodayUtc(lead.next_follow_up_at);
        const refUrl = String(lead.source_url || lead.website || "").trim();

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

        async function markFu() {
          const nowIso = new Date().toISOString();
          const bump = new Date(Date.now() + 3 * 86400000).toISOString();
          await patchLead(lead.id, { last_contacted_at: nowIso, next_follow_up_at: bump }, "Follow-up logged.", "print_fu");
        }

        return (
          <li
            key={lead.id}
            className={`rounded-xl border border-violet-500/30 bg-black/25 px-3 py-3 space-y-2 ${
              followToday ? "ring-1 ring-amber-500/40" : ""
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                {followToday ? (
                  <p className="text-[10px] font-bold uppercase tracking-wide text-amber-200/95">Follow-up due today</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={href} className="font-semibold text-sm text-violet-100 hover:underline">
                    {displayName(lead)}
                  </Link>
                  <LeadServiceTypeBadge serviceType="3d_printing" />
                  <span className="text-[10px] font-semibold text-violet-200/90">{THREE_D_PRINT_UI_LANE_LABELS[lane]}</span>
                </div>
                <p className="text-[11px] text-zinc-400 break-all">{String(lead.email || "").trim() || "—"}</p>
                <p className="text-xs font-medium text-zinc-200">{projectTitle(lead)}</p>
              </div>
              <div className="flex flex-wrap gap-1 shrink-0">
                <button
                  type="button"
                  className="admin-btn-primary text-[10px] px-2 py-1"
                  onClick={() => onOpenWorkflow(lead)}
                >
                  Workflow
                </button>
                <Link href={href} className="admin-btn-ghost text-[10px] px-2 py-1 border border-[var(--admin-border)]">
                  Workspace
                </Link>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">{descriptionPreview(lead)}</p>
            <ThreeDPrintTriageBadgeRow lead={lead} />
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-zinc-500">
              <span>
                File: <span className={fileAttached ? "text-emerald-300" : "text-zinc-400"}>{fileAttached ? "Yes" : "No"}</span>
              </span>
              <span>
                Material: <span className="text-zinc-300">{String(lead.print_material || "").trim() || "—"}</span>
              </span>
              <span>Quote: {PRINT_PAYMENT_STATUS_LABELS[pay]}</span>
              <span>Next F/U: {fmtFu(lead.next_follow_up_at)}</span>
              <span>Activity: {fmtActivity(lead)}</span>
            </div>
            {refUrl ? (
              <p className="text-[10px] truncate">
                <span className="text-zinc-500">Ref: </span>
                <a href={refUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                  {refUrl}
                </a>
              </p>
            ) : null}
            {lead.print_deadline ? (
              <p className="text-[10px] text-zinc-500">
                Deadline:{" "}
                <span className="text-zinc-300">{fmtFu(lead.print_deadline)}</span>
              </p>
            ) : null}
            <div className="flex flex-wrap gap-1 pt-1">
              <button
                type="button"
                disabled={busy}
                className="admin-btn-ghost text-[10px] px-2 py-1 border border-amber-500/35"
                onClick={() => void markFu()}
              >
                Mark follow-up sent
              </button>
              {PRINT_QUICK_ACTION_BUTTONS.filter((b) => suggested.includes(b.id)).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  disabled={busy}
                  className="rounded border border-violet-500/35 px-2 py-0.5 text-[10px] font-medium text-violet-100/95 hover:bg-violet-500/15 disabled:opacity-40"
                  onClick={() => void runQuick(b.id)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
