"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { GripVertical } from "lucide-react";
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
import {
  isPrintAttachmentImageUrl,
  mapPrintPipelineToLeadStatus,
  normalizePrintPipelineStatus,
  printLastActivityMs,
  THREE_D_PRINT_PIPELINE_LABELS,
  THREE_D_PRINT_PIPELINE_ORDER,
  type ThreeDPrintPipelineStatus,
} from "@/lib/crm/three-d-print-lead";

function displayName(lead: WorkflowLead): string {
  const n = String(lead.known_owner_name || "").trim();
  if (n) return n;
  const b = String(lead.business_name || "").trim();
  if (b.startsWith("3D Print Quote")) return b.replace(/^3D Print Quote —\s*/i, "").trim() || b;
  return b || "—";
}

function requestSummaryOneLine(lead: WorkflowLead): string {
  const s = String(lead.print_request_summary || "").trim();
  if (s) return s.length > 72 ? `${s.slice(0, 69)}…` : s;
  const n = lead.notes?.[0] ? String(lead.notes[0]).replace(/\s+/g, " ").trim() : "";
  if (!n) return "—";
  return n.length > 72 ? `${n.slice(0, 69)}…` : n;
}

function fmtActivityShort(lead: WorkflowLead): string {
  const ms = printLastActivityMs(lead);
  if (!ms) return "—";
  try {
    return new Date(ms).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return "—";
  }
}

const DND_TYPE = "application/x-mixedmaker-print-lead-id";

function KanbanCard({
  lead,
  busy,
}: {
  lead: WorkflowLead;
  busy: boolean;
}) {
  const href = buildLeadPath(lead.id, lead.business_name);
  const tags = (lead.print_tags || []).filter(Boolean);
  const est = String(lead.print_estimate_summary || "").trim() || "—";
  const thumb = lead.print_attachment_url && isPrintAttachmentImageUrl(lead.print_attachment_url) ? lead.print_attachment_url : null;
  const paySt = normalizePrintPaymentStatus(lead.payment_status);
  const { due, dueKind } = computePrintJobAmountDueUsd(lead);
  const quotedForCard =
    lead.quoted_amount != null && Number.isFinite(Number(lead.quoted_amount)) && Number(lead.quoted_amount) > 0
      ? Number(lead.quoted_amount)
      : lead.price_charged != null && Number.isFinite(Number(lead.price_charged)) && Number(lead.price_charged) > 0
        ? Number(lead.price_charged)
        : null;
  const duePrefix = dueKind === "deposit" ? "Dep " : dueKind === "balance" ? "Bal " : dueKind === "full" ? "" : "";
  const payReqLabel = PRINT_PAYMENT_REQUEST_LABELS[normalizePrintPaymentRequestType(lead.payment_request_type)];
  const payBadge =
    paySt === "paid" ? (
      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">Paid</span>
    ) : paySt === "partially_paid" ? (
      <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-200">Partial</span>
    ) : paySt !== "refunded" ? (
      <span className="rounded bg-zinc-500/25 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
        {PRINT_PAYMENT_STATUS_LABELS[paySt]}
      </span>
    ) : (
      <span className="rounded bg-zinc-600/30 px-1.5 py-0.5 text-[10px] text-zinc-500">Refunded</span>
    );

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

  return (
    <div
      className={`group rounded-xl border border-white/[0.08] bg-zinc-900/90 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.55)] backdrop-blur-sm transition hover:border-violet-500/35 hover:shadow-[0_12px_28px_-4px_rgba(139,92,246,0.12)] ${busy ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div className="flex gap-0">
        <button
          type="button"
          draggable={!busy}
          onDragStart={onDragStart}
          className="flex shrink-0 cursor-grab touch-none items-center justify-center rounded-l-xl border-r border-white/[0.06] bg-zinc-950/80 px-1.5 text-zinc-500 hover:bg-zinc-800/80 hover:text-violet-300/90 active:cursor-grabbing"
          aria-label={`Drag to move ${displayName(lead)}`}
          title="Drag to move"
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
        <Link
          href={href}
          draggable={false}
          className="min-w-0 flex-1 block p-3 text-left outline-none ring-inset focus-visible:ring-2 focus-visible:ring-violet-500/50 rounded-r-xl"
        >
          <div className="flex gap-2">
            {thumb ? (
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-black/40">
                <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            ) : null}
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold leading-snug text-zinc-100 group-hover:text-violet-100">{displayName(lead)}</p>
              <p className="line-clamp-1 text-[11px] leading-snug text-zinc-400">{requestSummaryOneLine(lead)}</p>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {payBadge}
                {tags.length ? (
                  tags.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-violet-500/25 bg-violet-500/10 px-1.5 py-px text-[9px] font-medium uppercase tracking-wide text-violet-200/90"
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-zinc-600">—</span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 leading-snug">
                <span className="text-zinc-600">Quote </span>
                <span className="text-zinc-300 tabular-nums">{quotedForCard != null ? formatUsdAmount(quotedForCard) : "—"}</span>
                <span className="text-zinc-600"> · Due </span>
                <span className="text-amber-200/90 tabular-nums font-medium">
                  {due != null && due > 0 ? `${duePrefix}${formatUsdAmount(due)}` : "—"}
                </span>
                <span className="text-zinc-600"> · </span>
                <span className="text-zinc-400">{payReqLabel}</span>
              </p>
              <p className="text-[10px] text-zinc-500">
                <span className="text-zinc-600">Est. </span>
                <span className="text-zinc-300">{est}</span>
                <span className="mx-1.5 text-zinc-700">·</span>
                <span className="text-zinc-600">Activity </span>
                <span className="text-zinc-400">{fmtActivityShort(lead)}</span>
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export function ThreeDPrintKanban({
  leads,
  busyId,
  patchLead,
  onQuotedPaymentRequest,
}: {
  leads: WorkflowLead[];
  busyId: string | null;
  patchLead: (leadId: string, patch: Record<string, unknown>, okMsg: string, log?: string) => Promise<void>;
  /** When set, dropping a card into Quoted opens the payment-request modal instead of patching immediately. */
  onQuotedPaymentRequest?: (lead: WorkflowLead) => void;
}) {
  const [dropTarget, setDropTarget] = useState<ThreeDPrintPipelineStatus | null>(null);

  const grouped = useMemo(() => {
    const m = new Map<ThreeDPrintPipelineStatus, WorkflowLead[]>();
    for (const s of THREE_D_PRINT_PIPELINE_ORDER) m.set(s, []);
    for (const lead of leads) {
      const st = normalizePrintPipelineStatus(lead.print_pipeline_status);
      m.get(st)!.push(lead);
    }
    for (const s of THREE_D_PRINT_PIPELINE_ORDER) {
      m.get(s)!.sort((a, b) => printLastActivityMs(b) - printLastActivityMs(a));
    }
    return m;
  }, [leads]);

  const onDragOver = useCallback((e: React.DragEvent, status: ThreeDPrintPipelineStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(status);
  }, []);

  const onDrop = useCallback(
    async (e: React.DragEvent, targetStatus: ThreeDPrintPipelineStatus) => {
      e.preventDefault();
      setDropTarget(null);
      const leadId =
        e.dataTransfer.getData(DND_TYPE) || e.dataTransfer.getData("text/plain").trim();
      if (!leadId) return;
      const lead = leads.find((l) => l.id === leadId);
      if (!lead) return;
      const current = normalizePrintPipelineStatus(lead.print_pipeline_status);
      if (current === targetStatus) return;
      if (targetStatus === "quoted" && current !== "quoted" && onQuotedPaymentRequest) {
        onQuotedPaymentRequest(lead);
        return;
      }
      await patchLead(
        leadId,
        {
          print_pipeline_status: targetStatus,
          status: mapPrintPipelineToLeadStatus(targetStatus),
        },
        `Board: ${THREE_D_PRINT_PIPELINE_LABELS[targetStatus]}`,
        `kanban_drop_${targetStatus}`,
      );
    },
    [leads, patchLead, onQuotedPaymentRequest],
  );

  if (leads.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-600/80">
      <div className="flex min-h-[420px] gap-3 px-0.5" style={{ width: "max-content", minWidth: "100%" }}>
        {THREE_D_PRINT_PIPELINE_ORDER.map((status) => {
          const columnLeads = grouped.get(status) ?? [];
          const isOver = dropTarget === status;
          return (
            <div
              key={status}
              className={`flex w-[272px] shrink-0 flex-col rounded-2xl border bg-zinc-950/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-md transition-colors ${
                isOver ? "border-violet-500/50 bg-violet-950/25 ring-1 ring-violet-500/30" : "border-white/[0.07]"
              }`}
              onDragOver={(e) => onDragOver(e, status)}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null);
              }}
              onDrop={(e) => void onDrop(e, status)}
            >
              <div className="border-b border-white/[0.06] px-3 py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">{THREE_D_PRINT_PIPELINE_LABELS[status]}</h3>
                  <span className="rounded-md bg-zinc-900/90 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-500">
                    {columnLeads.length}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-2.5" style={{ maxHeight: "min(70vh, 640px)" }}>
                {columnLeads.length === 0 ? (
                  <p className="px-1 py-6 text-center text-[11px] leading-relaxed text-zinc-600">Drop a job here</p>
                ) : (
                  columnLeads.map((lead) => (
                    <KanbanCard key={lead.id} lead={lead} busy={busyId === lead.id} />
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
