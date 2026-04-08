import type { CrmPipelineStage } from "@/lib/crm/stages";
import { canonicalizeLeadStatus } from "@/lib/crm-lead-schema";

/**
 * Map DB / legacy `leads.status` strings to pipeline stages for CRM UI.
 * Prefer storing only canonical statuses; this keeps older rows readable.
 */
export function normalizeWorkflowLeadStatus(value: string | null | undefined): CrmPipelineStage {
  return canonicalizeLeadStatus(value);
}
