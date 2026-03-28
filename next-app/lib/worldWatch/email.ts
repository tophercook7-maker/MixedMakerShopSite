/** Deep Well Weekly — build, render, and (via cron route) send member digest. */
export { buildDeepWellWeeklyEmail } from "@/lib/worldWatch/email-pipeline";
export type { WeeklyEmailDraft } from "@/lib/worldWatch/email-render";
export { selectWeeklyWorldWatchItems } from "@/lib/worldWatch/email-select";
