"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { GripVertical } from "lucide-react";
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { buildPrintLeadPath } from "@/lib/lead-route";
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
import { ThreeDPrintTriageBadgeRow } from "@/lib/crm/three-d-print-triage-badges";
import {
  buildPrintQuickActionPatch,
  PRINT_QUICK_ACTION_BUTTONS,
  type PrintQuickActionId,
  suggestedPrintQuickActions,
} from "@/lib/crm/three-d-print-quick-actions";
import {
  extractPrintRequestDescription,
  isPrintAttachmentImageUrl,
  normalizePrintPipelineStatus,
  printLastActivityMs,
} from "@/lib/crm/three-d-print-lead";
import {
  printUiLaneDropPatch,
  resolvePrintUiLane,
  THREE_D_PRINT_UI_LANE_LABELS,
  THREE_D_PRINT_UI_LANE_ORDER,
  type ThreeDPrintUiLane,
} from "@/lib/crm/three-d-print-ui-lanes";

function displayName(lead: WorkflowLead): string {
  const n = String(lead.known_owner_name || "").trim();
  if (n) return n;
  const b = String(lead.business_name || "").trim();
  if (b.startsWith("3D Print Quote")) return b.replace(/^3D Print Quote —\s*/i, "").trim() || b;
  return b || "—";
}

function projectTitle(lead: WorkflowLead): string {
  const t = String(lead.print_request_type || "").trim();
  if (t) return t;
  const s = String(lead.print_request_summary || "").trim();
  if (s) return s.length > 48 ? `${s.slice(0, 45)}…` : s;
  return String(lead.business_name || "").trim() || "Print request";
}

function descriptionPreview(lead: WorkflowLead): string {
  const notesJoined = Array.isArray(lead.notes) && lead.notes.length ? lead.notes.join("\n") : "";
  const raw = extractPrintRequestDescription(notesJoined, lead.print_request_summary ?? null);
  const t = String(raw || "").replace(/\s+/g, " ").trim();
  if (!t || t === "—") return "—";
  return t.length > 100 ? `${t.slice(0, 97)}…` : t;
}

function fmtShort(iso: string | null | undefined): string {
  if (!iso || !String(iso).trim()) return "—";
  const d = new Date(String(iso));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function quoteStatusLine(lead: WorkflowLead): string {
  const pay = PRINT_PAYMENT_STATUS_LABELS[normalizePrintPaymentStatus(lead.payment_status)];
  const pr = PRINT_PAYMENT_REQUEST_LABELS[normalizePrintPaymentRequestType(lead.payment_request_type)];
  const lane = THREE_D_PRINT_UI_LANE_LABELS[resolvePrintUiLane(lead)];
  return `${lane} · ${pay} · ${pr}`;
}

function notesPreview(lead: WorkflowLead): string {
  const n = (lead.notes || []).filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (!n) return "—";
  return n.length > 90 ? `${n.slice(0, 87)}…` : n;
}

const DND_TYPE = "application/x-mixedmaker-print-lead-id";

function KanbanCard({
  lead,
  busy,
  onOpenWorkflow,
  patchLead,
  onQuotedPaymentRequest,
}: {
  lead: WorkflowLead;
  busy: boolean;
  onOpenWorkflow: (lead: WorkflowLead) => void;
  patchLead: (leadId: string, patch: Record<string, unknown>, okMsg: string, log?: string) => Promise<void>;
  onQuotedPaymentRequest?: (lead: WorkflowLead) => void;
}) {
  const href = buildPrintLeadPath(lead.id, lead.business_name);
  const thumb = lead.print_attachment_url && isPrintAttachmentImageUrl(lead.print_attachment_url) ? lead.print_attachment_url : null;
  const { due, dueKind } = computePrintJobAmountDueUsd(lead);
  const duePrefix = dueKind === "deposit" ? "Dep " : dueKind === "balance" ? "Bal " : dueKind === "full" ? "" : "";
  const fileAttached = Boolean(String(lead.print_attachment_url || "").trim());
  const followDueToday = isFollowUpDueTodayUtc(lead.next_follow_up_at);
  const refUrl = String(lead.source_url || lead.website || "").trim();
  const printDeadline = String(lead.print_deadline || "").trim();
  const suggested = suggestedPrintQuickActions(lead);

  const onDragStart = useCallback(
    (e: React.DragEvent) => {
      if (busy) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData(DND_TYPE, lead.id);
      e.dataTransfer.setData("text/plain", lead.id);
      e.dataTransfer.effectAllowed = "move";
    },
    [busy, lead.id],
  );

  async function runQuick(id: PrintQuickActionId) {
    const patch = buildPrintQuickActionPatch(id);
    const label = PRINT_QUICK_ACTION_BUTTONS.find((b) => b.id === id)?.label ?? id;
    if (
      id === "mark_reviewed" &&
      onQuotedPaymentRequest &&
      normalizePrintPipelineStatus(lead.print_pipeline_status) !== "quoted"
    ) {
      onQuotedPaymentRequest(lead);
      return;
    }
    await patchLead(lead.id, patch, `Print: ${label}`, `print_quick_${id}`);
  }

  async function markFollowUpSent() {
    const nowIso = new Date().toISOString();
    const bump = new Date(Date.now() + 3 * 86400000).toISOString();
    await patchLead(
      lead.id,
      { last_contacted_at: nowIso, next_follow_up_at: bump },
      "Follow-up logged.",
      "print_follow_up_sent",
    );
  }

  return (
    <div
      className={`group rounded-xl border border-white/[0.08] bg-zinc-900/90 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.55)] backdrop-blur-sm transition hover:border-violet-500/35 ${busy ? "opacity-50 pointer-events-none" : ""}`}
    >
      {followDueToday ? (
        <div className="rounded-t-xl border-b border-amber-500/30 bg-amber-500/10 px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-amber-200/95">
          Follow-up due today
        </div>
      ) : null}
      <div className="flex gap-0">
        <button
          type="button"
          draggable={!busy}
          onDragStart={onDragStart}
          className="flex shrink-0 cursor-grab touch-none items-center justify-center rounded-bl-xl border-r border-white/[0.06] bg-zinc-950/80 px-1.5 text-zinc-500 hover:bg-zinc-800/80 hover:text-violet-300/90 active:cursor-grabbing"
          aria-label={`Drag to move ${displayName(lead)}`}
          title="Drag to move"
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
        <div className="min-w-0 flex-1 p-3 space-y-2 rounded-r-xl">
          <div className="flex gap-2">
            {thumb ? (
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-black/40">
                <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            ) : null}
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold leading-snug text-zinc-100">{displayName(lead)}</p>
              <p className="text-[11px] text-zinc-400 break-all">{String(lead.email || "").trim() || "—"}</p>
              <p className="text-[11px] font-medium text-violet-200/90 line-clamp-2">{projectTitle(lead)}</p>
            </div>
          </div>
          <LeadServiceTypeBadge serviceType="3d_printing" />
          <p className="text-[10px] leading-snug text-zinc-500 line-clamp-2">{descriptionPreview(lead)}</p>
          <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500">
            <span>
              File:{" "}
              <span className={fileAttached ? "text-emerald-300 font-medium" : "text-zinc-400"}>{fileAttached ? "Yes" : "No"}</span>
            </span>
            <span>
              Material: <span className="text-zinc-300">{String(lead.print_material || "").trim() || "—"}</span>
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 leading-snug">{quoteStatusLine(lead)}</p>
          {due != null && due > 0 ? (
            <p className="text-[10px] text-zinc-500">
              Due:{" "}
              <span className="text-amber-200/90 tabular-nums font-medium">
                {duePrefix}
                {formatUsdAmount(due)}
              </span>
            </p>
          ) : null}
          <p className="text-[10px] text-zinc-500">
            Next follow-up: <span className="text-zinc-300">{fmtShort(lead.next_follow_up_at)}</span>
          </p>
          <p className="text-[10px] text-zinc-500 line-clamp-2">
            Notes: <span className="text-zinc-400">{notesPreview(lead)}</span>
          </p>
          {(refUrl || printDeadline) ? (
            <div className="text-[10px] text-zinc-500 space-y-0.5">
              {refUrl ? (
                <p className="truncate">
                  Ref:{" "}
                  <a href={refUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                    {refUrl.length > 40 ? `${refUrl.slice(0, 37)}…` : refUrl}
                  </a>
                </p>
              ) : null}
              {printDeadline ? (
                <p>
                  Deadline: <span className="text-zinc-300">{fmtShort(printDeadline)}</span>
                </p>
              ) : null}
            </div>
          ) : null}
          <ThreeDPrintTriageBadgeRow lead={lead} />
          <div className="flex flex-wrap gap-1 pt-1">
            <button
              type="button"
              className="rounded border border-violet-500/45 bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-100 hover:bg-violet-500/25"
              onClick={() => onOpenWorkflow(lead)}
            >
              Workflow
            </button>
            <Link href={href} className="rounded border border-zinc-600 px-2 py-0.5 text-[10px] font-medium text-zinc-300 hover:bg-zinc-800/80">
              Workspace
            </Link>
            <button
              type="button"
              className="rounded border border-amber-500/35 px-2 py-0.5 text-[10px] font-medium text-amber-200/95 hover:bg-amber-500/10"
              disabled={busy}
              onClick={() => void markFollowUpSent()}
            >
              F/U sent
            </button>
          </div>
          <div className="flex flex-wrap gap-1 border-t border-white/[0.06] pt-2">
            {PRINT_QUICK_ACTION_BUTTONS.filter((b) => suggested.includes(b.id)).map((b) => (
              <button
                key={b.id}
                type="button"
                disabled={busy}
                className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] font-medium text-zinc-300 hover:bg-white/5 disabled:opacity-40"
                onClick={() => void runQuick(b.id)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ThreeDPrintKanban({
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
  const [dropTarget, setDropTarget] = useState<ThreeDPrintUiLane | null>(null);

  const grouped = useMemo(() => {
    const m = new Map<ThreeDPrintUiLane, WorkflowLead[]>();
    for (const lane of THREE_D_PRINT_UI_LANE_ORDER) m.set(lane, []);
    for (const lead of leads) {
      const lane = resolvePrintUiLane(lead);
      m.get(lane)!.push(lead);
    }
    for (const lane of THREE_D_PRINT_UI_LANE_ORDER) {
      m.get(lane)!.sort((a, b) => printLastActivityMs(b) - printLastActivityMs(a));
    }
    return m;
  }, [leads]);

  const onDragOver = useCallback((e: React.DragEvent, lane: ThreeDPrintUiLane) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(lane);
  }, []);

  const onDrop = useCallback(
    async (e: React.DragEvent, targetLane: ThreeDPrintUiLane) => {
      e.preventDefault();
      setDropTarget(null);
      const leadId = e.dataTransfer.getData(DND_TYPE) || e.dataTransfer.getData("text/plain").trim();
      if (!leadId) return;
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) return;
      const currentLane = resolvePrintUiLane(lead);
      if (currentLane === targetLane) return;
      const { print_pipeline_status, status } = printUiLaneDropPatch(targetLane);
      const currentPipe = String(lead.print_pipeline_status || "").toLowerCase();
      if (
        targetLane === "needs_quote" &&
        print_pipeline_status === "quoted" &&
        currentPipe !== "quoted" &&
        onQuotedPaymentRequest
      ) {
        onQuotedPaymentRequest(lead);
        return;
      }
      await patchLead(
        leadId,
        { print_pipeline_status, status },
        `Board: ${THREE_D_PRINT_UI_LANE_LABELS[targetLane]}`,
        `kanban_drop_${targetLane}`,
      );
    },
    [leads, patchLead, onQuotedPaymentRequest],
  );

  if (leads.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-600/80">
      <div className="flex min-h-[420px] gap-3 px-0.5" style={{ width: "max-content", minWidth: "100%" }}>
        {THREE_D_PRINT_UI_LANE_ORDER.map((lane) => {
          const columnLeads = grouped.get(lane) ?? [];
          const isOver = dropTarget === lane;
          return (
            <div
              key={lane}
              className={`flex w-[260px] shrink-0 flex-col rounded-2xl border bg-zinc-950/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-md transition-colors ${
                isOver ? "border-violet-500/50 bg-violet-950/25 ring-1 ring-violet-500/30" : "border-white/[0.07]"
              }`}
              onDragOver={(e) => onDragOver(e, lane)}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null);
              }}
              onDrop={(e) => void onDrop(e, lane)}
            >
              <div className="border-b border-white/[0.06] px-3 py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wide text-zinc-300 leading-snug">
                    {THREE_D_PRINT_UI_LANE_LABELS[lane]}
                  </h3>
                  <span className="rounded-md bg-zinc-900/90 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-500">
                    {columnLeads.length}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-2.5" style={{ maxHeight: "min(72vh, 720px)" }}>
                {columnLeads.length === 0 ? (
                  <p className="px-1 py-6 text-center text-[11px] leading-relaxed text-zinc-600">Drop a job here</p>
                ) : (
                  columnLeads.map((lead) => (
                    <KanbanCard
                      key={lead.id}
                      lead={lead}
                      busy={busyId === lead.id}
                      patchLead={patchLead}
                      onQuotedPaymentRequest={onQuotedPaymentRequest}
                      onOpenWorkflow={onOpenWorkflow}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
