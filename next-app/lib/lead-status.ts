/**
 * Pipeline status for free-mockup submissions (`mockup_submissions.lead_status`).
 * Single source of truth for labels, validation, and legacy `status` sync.
 */

export const MOCKUP_LEAD_STATUSES = [
  "new",
  "draft_created",
  "contacted",
  "replied",
  "follow_up_needed",
  "closed_won",
  "closed_lost",
  "archived",
] as const;

export type MockupLeadStatus = (typeof MOCKUP_LEAD_STATUSES)[number];

const LEGACY_STATUS_MAP: Record<string, MockupLeadStatus | undefined> = {
  new: "new",
  reviewed: "draft_created",
  contacted: "contacted",
  closed: "closed_lost",
};

export const MOCKUP_LEAD_STATUS_LABELS: Record<MockupLeadStatus, string> = {
  new: "New",
  draft_created: "Draft created",
  contacted: "Contacted",
  replied: "Replied",
  follow_up_needed: "Follow up needed",
  closed_won: "Closed won",
  closed_lost: "Closed lost",
  archived: "Archived",
};

/** Short hint shown on the lead detail view. */
export const MOCKUP_LEAD_STATUS_HINTS: Record<MockupLeadStatus, string> = {
  new: "No outreach yet",
  draft_created: "Draft ready to send",
  contacted: "Waiting for response",
  replied: "Conversation started",
  follow_up_needed: "Needs a nudge",
  closed_won: "Client acquired",
  closed_lost: "Did not move forward",
  archived: "Out of active pipeline",
};

export function isMockupLeadStatus(value: string): value is MockupLeadStatus {
  return (MOCKUP_LEAD_STATUSES as readonly string[]).includes(value);
}

/**
 * Normalize DB / legacy `status` into a pipeline value.
 */
export function parseMockupLeadStatus(raw: string | null | undefined): MockupLeadStatus {
  const t = String(raw || "").trim();
  if (isMockupLeadStatus(t)) return t;
  const mapped = LEGACY_STATUS_MAP[t];
  if (mapped) return mapped;
  return "new";
}

/**
 * Maps pipeline → legacy `mockup_submissions.status` (new | reviewed | contacted | closed) for backward compatibility.
 */
export function legacySubmissionStatusFromPipeline(lead: MockupLeadStatus): "new" | "reviewed" | "contacted" | "closed" {
  switch (lead) {
    case "new":
      return "new";
    case "draft_created":
    case "replied":
    case "follow_up_needed":
      return "reviewed";
    case "contacted":
      return "contacted";
    case "closed_won":
    case "closed_lost":
    case "archived":
      return "closed";
    default:
      return "new";
  }
}

export type MockupLeadStatusBadgeTone = "neutral" | "info" | "progress" | "positive" | "warning" | "closed";

export function mockupLeadStatusBadgeTone(status: MockupLeadStatus): MockupLeadStatusBadgeTone {
  switch (status) {
    case "new":
      return "info";
    case "draft_created":
      return "progress";
    case "contacted":
      return "neutral";
    case "replied":
      return "positive";
    case "follow_up_needed":
      return "warning";
    case "closed_won":
      return "positive";
    case "closed_lost":
    case "archived":
      return "closed";
  }
}

/** Only auto-advance to draft_created from these states when Gmail draft succeeds. */
export const GMAIL_DRAFT_AUTO_ADVANCE_FROM: readonly MockupLeadStatus[] = ["new"];
