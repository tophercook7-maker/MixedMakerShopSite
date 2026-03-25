/** Automated 3D print quote follow-up copy (email via Resend cron). */

export const PRINT_QUOTE_FOLLOWUP_1 = [
  "Hey — just checking in on your 3D print request.",
  "",
  "Did you still want help with that?",
  "",
  "If you've got a photo or more details, feel free to send it over.",
  "",
  "– Topher",
].join("\n");

export const PRINT_QUOTE_FOLLOWUP_2 = [
  "Hey — I didn't want to bug you, just wanted to see if you still needed that part made.",
  "",
  "If not, no worries.",
  "",
  "If you do, I'm here.",
  "",
  "– Topher",
].join("\n");

export function printQuoteFollowupSubject(stage: 1 | 2): string {
  return stage === 1 ? "Quick check on your 3D print request" : "Still need that part?";
}
