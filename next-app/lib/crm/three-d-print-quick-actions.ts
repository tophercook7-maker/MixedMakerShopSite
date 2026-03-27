import { mapPrintPipelineToLeadStatus, normalizePrintPipelineStatus, type ThreeDPrintPipelineStatus } from "@/lib/crm/three-d-print-lead";

const BUMP_DAYS_MS = 3 * 86400000;

function bumpFollowUp(): string {
  return new Date(Date.now() + BUMP_DAYS_MS).toISOString();
}

export type PrintQuickActionId =
  | "mark_reviewed"
  | "mark_needs_quote"
  | "mark_quote_sent"
  | "mark_waiting_customer"
  | "in_progress"
  | "completed";

/** Optimistic PATCH payloads for 3D CRM quick actions (existing columns only). */
export function buildPrintQuickActionPatch(action: PrintQuickActionId): Record<string, unknown> {
  const now = new Date().toISOString();
  const next = bumpFollowUp();

  const withPipeline = (p: ThreeDPrintPipelineStatus, touchSchedule: boolean) => {
    const base: Record<string, unknown> = {
      print_pipeline_status: p,
      status: mapPrintPipelineToLeadStatus(p),
      last_contacted_at: now,
    };
    if (touchSchedule) base.next_follow_up_at = next;
    return base;
  };

  switch (action) {
    case "mark_reviewed":
      return withPipeline("quoted", true);
    case "mark_needs_quote":
      return withPipeline("need_info", true);
    case "mark_quote_sent":
      return {
        last_contacted_at: now,
        next_follow_up_at: next,
      };
    case "mark_waiting_customer":
      return withPipeline("approved", true);
    case "in_progress":
      return withPipeline("printing", true);
    case "completed":
      return withPipeline("delivered", false);
    default:
      return {};
  }
}

export const PRINT_QUICK_ACTION_BUTTONS: { id: PrintQuickActionId; label: string }[] = [
  { id: "mark_reviewed", label: "Mark reviewed" },
  { id: "mark_needs_quote", label: "Mark needs quote" },
  { id: "mark_quote_sent", label: "Mark quote sent" },
  { id: "mark_waiting_customer", label: "Waiting on customer" },
  { id: "in_progress", label: "In progress" },
  { id: "completed", label: "Completed" },
];

/** Suggest which quick actions make sense from current pipeline (still allow all in overflow). */
export function suggestedPrintQuickActions(lead: { print_pipeline_status?: string | null }): PrintQuickActionId[] {
  const p = normalizePrintPipelineStatus(lead.print_pipeline_status);
  switch (p) {
    case "new":
      return ["mark_needs_quote", "mark_reviewed", "mark_quote_sent", "mark_waiting_customer", "in_progress", "completed"];
    case "need_info":
      return ["mark_reviewed", "mark_needs_quote", "mark_quote_sent", "mark_waiting_customer", "in_progress", "completed"];
    case "quoted":
      return ["mark_quote_sent", "mark_waiting_customer", "in_progress", "completed", "mark_needs_quote"];
    case "approved":
      return ["in_progress", "mark_waiting_customer", "completed", "mark_quote_sent"];
    case "printing":
    case "ready":
      return ["completed", "in_progress", "mark_waiting_customer"];
    case "delivered":
    case "closed":
      return ["mark_needs_quote", "in_progress"];
    default:
      return PRINT_QUICK_ACTION_BUTTONS.map((b) => b.id);
  }
}
