import type { FollowUpTemplateKey } from "@/lib/crm/follow-up-templates";
import { appendLeadNoteLine } from "@/lib/crm/append-lead-note";

/** Days after each outbound send to schedule the next check-in (or grace before auto no_response). */
export function daysAfterSendForAttempt(sendNumber: number): number | null {
  if (sendNumber === 1) return 1;
  if (sendNumber === 2) return 2;
  if (sendNumber === 3) return 4;
  if (sendNumber === 4) return 1;
  return null;
}

export function addCalendarDaysIso(from: Date, days: number): string {
  const d = new Date(from.getTime());
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function scheduleNextAfterSend(sendNumber: number, now: Date = new Date()): string | null {
  const days = daysAfterSendForAttempt(sendNumber);
  if (days == null) return null;
  return addCalendarDaysIso(now, days);
}

const TEMPLATE_SEQUENCE: FollowUpTemplateKey[] = [
  "initial_outreach",
  "follow_up_1",
  "follow_up_2",
  "follow_up_3",
];

export function templateKeyForSendNumber(sendNumber: number): FollowUpTemplateKey | null {
  const n = Math.floor(sendNumber);
  if (n < 1 || n > TEMPLATE_SEQUENCE.length) return null;
  return TEMPLATE_SEQUENCE[n - 1];
}

export type RecordOutreachResult = {
  patch: Record<string, unknown>;
  newCount: number;
  templateKey: FollowUpTemplateKey;
  noteLine: string;
};

/**
 * One outbound touch logged manually (email/text/social). Increments `follow_up_count`, sets schedule.
 * Throws if cadence already completed (4 sends).
 */
export function buildRecordOutreachPatch(input: {
  previousCount: number;
  now?: Date;
  /** Optional note line beyond the standard activity line */
  extraNote?: string | null;
  existingNotes?: string | null;
}): RecordOutreachResult {
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();
  const prev = Math.max(0, Math.floor(Number(input.previousCount) || 0));
  if (prev >= 4) {
    throw new Error("Cadence complete (4 sends). Mark replied, snooze, or close as no response.");
  }
  const newCount = prev + 1;
  const templateKey = templateKeyForSendNumber(newCount);
  if (!templateKey) {
    throw new Error("Invalid follow-up template step.");
  }
  const nextIso = scheduleNextAfterSend(newCount, now);
  const noteLine =
    newCount === 1
      ? "Initial outreach logged."
      : `Follow-up ${newCount - 1} logged — next check-in scheduled.`;
  let notes = appendLeadNoteLine(input.existingNotes, noteLine);
  if (input.extraNote?.trim()) {
    notes = appendLeadNoteLine(notes, input.extraNote.trim());
  }

  const patch: Record<string, unknown> = {
    status: "contacted",
    follow_up_count: newCount,
    follow_up_stage: Math.min(newCount, 3),
    last_contacted_at: nowIso,
    last_updated_at: nowIso,
    last_follow_up_template_key: templateKey,
    follow_up_status: "pending",
    automation_paused: false,
    sequence_active: false,
    notes,
    next_follow_up_at: nextIso,
    recommended_next_action:
      newCount >= 4 ? "Review — close as no response if still silent" : "Send or schedule next follow-up",
  };
  return { patch, newCount, templateKey, noteLine };
}

export function buildSnoozePatch(days: number, existingNext: string | null | undefined, now: Date = new Date()) {
  const base = existingNext?.trim() ? new Date(String(existingNext)) : now;
  const t = Number.isNaN(base.getTime()) ? now.getTime() : base.getTime();
  const from = new Date(t);
  const next = addCalendarDaysIso(from, days);
  return {
    next_follow_up_at: next,
    follow_up_status: "pending" as const,
    last_updated_at: now.toISOString(),
  };
}
