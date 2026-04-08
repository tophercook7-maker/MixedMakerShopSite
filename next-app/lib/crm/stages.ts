import {
  CANONICAL_LEAD_STATUSES,
  type CanonicalLeadStatus,
} from "@/lib/crm-lead-schema";

/**
 * Web-design / inbound pipeline columns — same vocabulary as `leads.status` after the
 * canonical simple CRM migration.
 */
export const CRM_PIPELINE_STAGES = CANONICAL_LEAD_STATUSES;

export type CrmPipelineStage = CanonicalLeadStatus;

export const CRM_STAGE_LABELS: Record<CrmPipelineStage, string> = {
  new: "New",
  contacted: "Contacted",
  replied: "Replied",
  no_response: "No response",
  not_interested: "Not interested",
  won: "Won",
  archived: "Archived",
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
