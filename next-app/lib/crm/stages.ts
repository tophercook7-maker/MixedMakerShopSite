/** Canonical web-design CRM pipeline (matches `leads.status` after migration). */

export const CRM_PIPELINE_STAGES = [
  "new",
  "contacted",
  "replied",
  "qualified",
  "proposal_sent",
  "won",
  "lost",
] as const;

export type CrmPipelineStage = (typeof CRM_PIPELINE_STAGES)[number];

export const CRM_STAGE_LABELS: Record<CrmPipelineStage, string> = {
  new: "New",
  contacted: "Contacted",
  replied: "Replied",
  qualified: "Qualified",
  proposal_sent: "Proposal Sent",
  won: "Won",
  lost: "Lost",
};

/** Secondary tags (stored on `leads.lead_tags` or derived in UI). */
export const CRM_LEAD_TAG_OPTIONS = [
  "needs_website_review",
  "no_website",
  "bad_website",
  "strong_prospect",
  "follow_up_scheduled",
  "hot_lead",
  "waiting_on_reply",
] as const;

export type CrmLeadTag = (typeof CRM_LEAD_TAG_OPTIONS)[number];

export const CRM_LEAD_TAG_LABELS: Record<CrmLeadTag, string> = {
  needs_website_review: "Needs Website Review",
  no_website: "No Website",
  bad_website: "Bad Website",
  strong_prospect: "Strong Prospect",
  follow_up_scheduled: "Follow-Up Scheduled",
  hot_lead: "Hot Lead",
  waiting_on_reply: "Waiting On Reply",
};
