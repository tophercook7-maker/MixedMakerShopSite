/** America/Chicago helpers for Deep Well Weekly scheduling. */

export function chicagoYmd(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function chicagoWeekdayHour(d: Date): { weekdayShort: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(d);
  const weekdayShort = String(parts.find((p) => p.type === "weekday")?.value || "");
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? NaN);
  return { weekdayShort, hour: Number.isFinite(hour) ? hour : -1 };
}

/**
 * True during automated Sunday morning send window (7–9 AM Chicago).
 * Bypass with DEEP_WELL_WEEKLY_SKIP_TIME_GUARD=1 for testing.
 */
export function isChicagoSundayMorningSendWindow(d: Date): boolean {
  if (String(process.env.DEEP_WELL_WEEKLY_SKIP_TIME_GUARD || "").trim() === "1") return true;
  const { weekdayShort, hour } = chicagoWeekdayHour(d);
  return weekdayShort === "Sun" && hour >= 7 && hour <= 9;
}

/** Inclusive range for “last 7 days” ending `end` (Chicago-anchored calendar is not required for mock data). */
export function getUtcRangeLastDays(end: Date, days: number): { start: Date; end: Date } {
  const endMs = end.getTime();
  const start = new Date(endMs - days * 86400000);
  return { start, end };
}
