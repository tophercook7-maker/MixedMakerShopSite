import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { mapPrintPipelineToLeadStatus } from "@/lib/crm/three-d-print-lead";

/** Merge API PATCH fields into a client `WorkflowLead` row (optimistic UI). */
export function applyWorkflowLeadPatch(l: WorkflowLead, patch: Record<string, unknown>): WorkflowLead {
  const next = { ...l } as WorkflowLead;
  if (typeof patch.notes === "string" || patch.notes === null) {
    const n = typeof patch.notes === "string" ? String(patch.notes).trim() : "";
    next.notes = n ? [n] : [];
  }
  if ("first_outreach_message" in patch) {
    next.first_outreach_message =
      typeof patch.first_outreach_message === "string" ? patch.first_outreach_message : null;
  }
  if (typeof patch.first_outreach_sent_at === "string")
    next.first_outreach_sent_at = patch.first_outreach_sent_at || null;
  if (typeof patch.last_contacted_at === "string") next.last_contacted_at = patch.last_contacted_at || null;
  if ("next_follow_up_at" in patch)
    next.next_follow_up_at = patch.next_follow_up_at ? String(patch.next_follow_up_at) : null;
  if (typeof patch.status === "string") next.status = patch.status as WorkflowLead["status"];
  if (typeof patch.follow_up_status === "string") {
    const fu = String(patch.follow_up_status).toLowerCase();
    next.follow_up_status = fu === "completed" ? "completed" : "pending";
  }
  if (typeof patch.recommended_next_action === "string") {
    next.recommended_next_action = patch.recommended_next_action as WorkflowLead["recommended_next_action"];
  }
  if (typeof patch.is_hot_lead === "boolean") next.is_hot_lead = patch.is_hot_lead;
  if (typeof patch.service_type === "string") next.service_type = patch.service_type || null;
  if (typeof patch.automation_paused === "boolean") (next as { automation_paused?: boolean }).automation_paused = patch.automation_paused;
  if (typeof patch.last_reply_at === "string")
    (next as { last_reply_at?: string | null }).last_reply_at = patch.last_reply_at || null;
  if (typeof patch.last_reply_preview === "string") next.last_reply_preview = patch.last_reply_preview || null;
  if (typeof patch.unread_reply_count === "number" && Number.isFinite(patch.unread_reply_count)) {
    next.unread_reply_count = Math.max(0, patch.unread_reply_count);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "print_pipeline_status")) {
    const pp = patch.print_pipeline_status;
    next.print_pipeline_status =
      pp === null || pp === undefined ? null : String(pp || "").trim() || null;
    if (!Object.prototype.hasOwnProperty.call(patch, "status")) {
      next.status = mapPrintPipelineToLeadStatus(
        pp === null || pp === undefined ? null : String(pp),
      ) as WorkflowLead["status"];
    }
  }
  return next;
}
