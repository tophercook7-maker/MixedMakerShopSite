/**
 * 3D print CRM — human-friendly board lanes (maps to existing `print_pipeline_status` + payment fields).
 * No schema migration; `resolvePrintUiLane` is the single source of truth for grouping.
 */

import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { normalizePrintPaymentStatus } from "@/lib/crm/print-payment";
import {
  mapPrintPipelineToLeadStatus,
  normalizePrintPipelineStatus,
  THREE_D_PRINT_PIPELINE_ORDER,
  type ThreeDPrintPipelineStatus,
} from "@/lib/crm/three-d-print-lead";

const PIPELINE_ORDER_SET = new Set<string>(THREE_D_PRINT_PIPELINE_ORDER);

export const THREE_D_PRINT_UI_LANE_ORDER = [
  "new_print",
  "files_submitted",
  "needs_review",
  "needs_quote",
  "waiting_customer",
  "in_progress",
  "completed",
] as const;

export type ThreeDPrintUiLane = (typeof THREE_D_PRINT_UI_LANE_ORDER)[number];

export const THREE_D_PRINT_UI_LANE_LABELS: Record<ThreeDPrintUiLane, string> = {
  new_print: "New Print Leads",
  files_submitted: "Files Submitted",
  needs_review: "Needs Review",
  needs_quote: "Needs Quote",
  waiting_customer: "Waiting on Customer",
  in_progress: "In Progress",
  completed: "Completed",
};

export function hasPrintFileAttached(lead: Pick<WorkflowLead, "print_attachment_url">): boolean {
  return Boolean(String(lead.print_attachment_url || "").trim());
}

/** Which physical board column a lead belongs in. */
export function resolvePrintUiLane(lead: WorkflowLead): ThreeDPrintUiLane {
  const p = normalizePrintPipelineStatus(lead.print_pipeline_status);
  const pay = normalizePrintPaymentStatus(lead.payment_status);
  const hasLink = Boolean(String(lead.payment_link || "").trim());

  if (p === "new") {
    return hasPrintFileAttached(lead) ? "files_submitted" : "new_print";
  }
  if (p === "need_info") return "needs_review";
  if (p === "quoted") {
    if (hasLink || pay === "deposit_requested" || pay === "partially_paid") return "waiting_customer";
    return "needs_quote";
  }
  if (p === "approved") return "waiting_customer";
  if (p === "printing" || p === "ready") return "in_progress";
  if (p === "delivered" || p === "closed") return "completed";
  return "new_print";
}

/** URL + filter parsing: UI lane id, exact legacy pipeline, or all. */
export type PrintCrmStageFilter =
  | { kind: "all" }
  | { kind: "ui"; lane: ThreeDPrintUiLane }
  | { kind: "pipeline"; pipeline: ThreeDPrintPipelineStatus };

export function parsePrintCrmStageQuery(raw: string | null | undefined): PrintCrmStageFilter {
  const k = String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/-/g, "_");
  if (!k || k === "all") return { kind: "all" };
  if ((THREE_D_PRINT_UI_LANE_ORDER as readonly string[]).includes(k)) return { kind: "ui", lane: k as ThreeDPrintUiLane };
  if (PIPELINE_ORDER_SET.has(k)) return { kind: "pipeline", pipeline: k as ThreeDPrintPipelineStatus };
  return { kind: "all" };
}

export function printLeadMatchesCrmStageFilter(lead: WorkflowLead, f: PrintCrmStageFilter): boolean {
  if (f.kind === "all") return true;
  if (f.kind === "pipeline") return normalizePrintPipelineStatus(lead.print_pipeline_status) === f.pipeline;
  return resolvePrintUiLane(lead) === f.lane;
}

export function printCrmStageFiltersEqual(a: PrintCrmStageFilter, b: PrintCrmStageFilter): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "all") return true;
  if (a.kind === "ui" && b.kind === "ui") return a.lane === b.lane;
  if (a.kind === "pipeline" && b.kind === "pipeline") return a.pipeline === b.pipeline;
  return false;
}

export function serializePrintCrmStageFilter(f: PrintCrmStageFilter): string {
  if (f.kind === "all") return "";
  if (f.kind === "ui") return f.lane;
  return f.pipeline;
}

/** PATCH when a card is dropped on a lane (sets `print_pipeline_status` + CRM `status`). */
export function printUiLaneDropPatch(lane: ThreeDPrintUiLane): {
  print_pipeline_status: ThreeDPrintPipelineStatus;
  status: ReturnType<typeof mapPrintPipelineToLeadStatus>;
} {
  const map: Record<ThreeDPrintUiLane, ThreeDPrintPipelineStatus> = {
    new_print: "new",
    files_submitted: "new",
    needs_review: "need_info",
    needs_quote: "quoted",
    waiting_customer: "approved",
    in_progress: "printing",
    completed: "delivered",
  };
  const p = map[lane];
  return { print_pipeline_status: p, status: mapPrintPipelineToLeadStatus(p) };
}

export const THREE_D_PRINT_CRM_FILTER_TABS: { filter: PrintCrmStageFilter; label: string }[] = [
  { filter: { kind: "all" }, label: "All" },
  ...THREE_D_PRINT_UI_LANE_ORDER.map((lane) => ({
    filter: { kind: "ui" as const, lane },
    label: THREE_D_PRINT_UI_LANE_LABELS[lane],
  })),
];
