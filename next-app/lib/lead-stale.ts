import type { MockupLeadStatus } from "@/lib/lead-status";

/** Tweak thresholds (hours) in one place. */
export const MOCKUP_STALE_THRESHOLDS_HOURS: Record<
  "new" | "draft_created" | "contacted" | "follow_up_needed",
  number
> = {
  new: 24,
  draft_created: 24,
  contacted: 48,
  follow_up_needed: 24,
};

export type LeadStaleSeverity = "low" | "medium" | "high";

export type LeadStaleState = {
  isStale: boolean;
  reason: string;
  severity: LeadStaleSeverity;
  /** Hours since the reference timestamp (created / pipeline update); 0 if unknown. */
  hoursSinceReference: number;
  /** Sort key: higher = more urgent among stale leads. */
  urgencyScore: number;
};

export type LeadStaleInput = {
  pipeline: MockupLeadStatus;
  createdAt?: string | null;
  statusUpdatedAt?: string | null;
  /** Fallback when `status_updated_at` is missing (e.g. legacy rows). */
  updatedAt?: string | null;
  /** Inject for tests; defaults to `new Date()`. */
  now?: Date;
};

function parseIsoMs(iso: string | null | undefined): number | null {
  if (!iso || typeof iso !== "string") return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

function pickReferenceMs(input: LeadStaleInput): number | null {
  const created = parseIsoMs(input.createdAt);
  const statusUp = parseIsoMs(input.statusUpdatedAt);
  const updated = parseIsoMs(input.updatedAt);

  switch (input.pipeline) {
    case "new":
      return created;
    case "draft_created":
      return statusUp ?? updated ?? created;
    case "contacted":
      return statusUp ?? created;
    case "follow_up_needed":
      return statusUp ?? updated ?? created;
    default:
      return null;
  }
}

function severityFromHoursOver(hoursOver: number, thresholdHours: number): LeadStaleSeverity {
  if (hoursOver >= thresholdHours) return "high";
  if (hoursOver >= thresholdHours * 0.5) return "medium";
  return "low";
}

function reasonFor(pipeline: MockupLeadStatus, thresholdHours: number): string {
  switch (pipeline) {
    case "new":
      return `New lead not contacted in over ${thresholdHours} hours.`;
    case "draft_created":
      return `Draft ready — no outreach logged for over ${thresholdHours} hours.`;
    case "contacted":
      return `No response after outreach for over ${thresholdHours} hours — consider following up.`;
    case "follow_up_needed":
      return `Follow-up needed — still quiet for over ${thresholdHours} hours.`;
    default:
      return "This lead may need attention.";
  }
}

/** Short reusable nudge you can paste or adapt (mockup funnel). */
export const MOCKUP_STALE_SUGGESTED_NUDGE =
  "Hey — just wanted to follow up on this. I had a direction in mind for your site and wanted to see if you still want me to put it together.";

/**
 * Compute stale / urgency from pipeline + timestamps (no cron — call on render).
 */
export function getLeadStaleState(input: LeadStaleInput): LeadStaleState {
  const now = input.now ?? new Date();
  const nowMs = now.getTime();

  const terminal: MockupLeadStatus[] = ["replied", "closed_won", "closed_lost", "archived"];
  if (terminal.includes(input.pipeline)) {
    return { isStale: false, reason: "", severity: "low", hoursSinceReference: 0, urgencyScore: 0 };
  }

  const thresholdKey = input.pipeline as keyof typeof MOCKUP_STALE_THRESHOLDS_HOURS;
  if (!(thresholdKey in MOCKUP_STALE_THRESHOLDS_HOURS)) {
    return { isStale: false, reason: "", severity: "low", hoursSinceReference: 0, urgencyScore: 0 };
  }

  const thresholdHours = MOCKUP_STALE_THRESHOLDS_HOURS[thresholdKey];
  const refMs = pickReferenceMs(input);
  if (refMs === null) {
    return { isStale: false, reason: "", severity: "low", hoursSinceReference: 0, urgencyScore: 0 };
  }

  const hoursSinceReference = Math.max(0, (nowMs - refMs) / (1000 * 60 * 60));
  const hoursOver = hoursSinceReference - thresholdHours;
  const isStale = hoursSinceReference >= thresholdHours;

  if (!isStale) {
    return {
      isStale: false,
      reason: "",
      severity: "low",
      hoursSinceReference,
      urgencyScore: 0,
    };
  }

  const severity = severityFromHoursOver(hoursOver, thresholdHours);
  const reason = reasonFor(input.pipeline, thresholdHours);
  const urgencyScore = hoursSinceReference * 10 + (severity === "high" ? 50 : severity === "medium" ? 25 : 0);

  return {
    isStale: true,
    reason,
    severity,
    hoursSinceReference,
    urgencyScore,
  };
}
