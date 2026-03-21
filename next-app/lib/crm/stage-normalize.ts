import type { CrmPipelineStage } from "@/lib/crm/stages";

/** Map DB / legacy status strings to pipeline stages used in the UI. */
export function normalizeWorkflowLeadStatus(value: string | null | undefined): CrmPipelineStage {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (!normalized) return "new";
  if (normalized === "follow_up_due" || normalized === "follow_up") return "contacted";
  if (normalized === "closed_won") return "won";
  if (
    normalized === "closed_lost" ||
    normalized === "no_response" ||
    normalized === "not_interested" ||
    normalized === "archived" ||
    normalized === "closed" ||
    normalized === "do_not_contact" ||
    normalized === "research_later"
  ) {
    return "lost";
  }
  if (
    normalized === "new" ||
    normalized === "contacted" ||
    normalized === "replied" ||
    normalized === "qualified" ||
    normalized === "proposal_sent" ||
    normalized === "won" ||
    normalized === "lost"
  ) {
    return normalized;
  }
  return "new";
}
