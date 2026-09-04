/**
 * Booking slot generation in the SHOP's local time zone (default America/Chicago).
 *
 * Previously slots were built as `${day}T09:00Z`, i.e. 9am UTC = 4am Central, so
 * visitors saw 4:00 AM – 11:30 AM openings. Everything here converts a wall-clock
 * time in BOOKING_TZ to the correct UTC instant, DST-aware, with no dependencies.
 */

export type HardBlock = { start: Date; end: Date };
export type Slot = { start_time: string; end_time: string };

export const BOOKING_TZ = String(process.env.BOOKING_TZ || "America/Chicago").trim() || "America/Chicago";
export const REVIEW_LENGTH_MINUTES = 15;

export function bookingHours() {
  return {
    openHour: Number(process.env.BOOKING_OPEN_HOUR || 9),
    closeHour: Number(process.env.BOOKING_CLOSE_HOUR || 17),
    slotMinutes: Number(process.env.BOOKING_SLOT_MINUTES || 30),
  };
}

/** Offset (minutes) of `tz` from UTC at the given instant. Positive = ahead of UTC. */
function tzOffsetMinutes(at: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - at.getTime()) / 60000);
}

/** UTC instant for wall-clock `day` (YYYY-MM-DD) + hour:minute in `tz`. */
export function zonedTimeToUtc(day: string, hour: number, minute: number, tz: string = BOOKING_TZ): Date {
  const [y, m, d] = day.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, hour, minute, 0, 0);
  // Two passes handle DST transitions correctly.
  let utc = guess - tzOffsetMinutes(new Date(guess), tz) * 60000;
  utc = guess - tzOffsetMinutes(new Date(utc), tz) * 60000;
  return new Date(utc);
}

/** YYYY-MM-DD of `at` as seen in `tz`. */
export function dayInTz(at: Date, tz: string = BOOKING_TZ): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Add N calendar days to a YYYY-MM-DD string. */
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** [start, end) of the local calendar day in UTC. */
export function dayBoundsUtc(day: string, tz: string = BOOKING_TZ): { dayStart: Date; dayEnd: Date } {
  return { dayStart: zonedTimeToUtc(day, 0, 0, tz), dayEnd: zonedTimeToUtc(addDays(day, 1), 0, 0, tz) };
}

export function isValidDay(day: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(new Date(`${day}T00:00:00Z`).getTime());
}

/**
 * Open slots for one local day. Skips anything overlapping a hard block and
 * anything starting before `notBefore` (defaults to now — never offer the past).
 */
export function buildDaySlots(
  day: string,
  hardBlocks: HardBlock[],
  opts: { notBefore?: Date; tz?: string } = {}
): Slot[] {
  const tz = opts.tz || BOOKING_TZ;
  const notBefore = opts.notBefore ?? new Date();
  const { openHour, closeHour, slotMinutes } = bookingHours();
  const closeAt = zonedTimeToUtc(day, closeHour, 0, tz);
  const slots: Slot[] = [];
  for (let hour = openHour; hour < closeHour; hour += 1) {
    for (let min = 0; min < 60; min += slotMinutes) {
      const slotStart = zonedTimeToUtc(day, hour, min, tz);
      const slotEnd = new Date(slotStart.getTime() + REVIEW_LENGTH_MINUTES * 60 * 1000);
      if (slotEnd > closeAt) continue;
      if (slotStart < notBefore) continue;
      const conflict = hardBlocks.some((block) => slotStart < block.end && slotEnd > block.start);
      if (!conflict) slots.push({ start_time: slotStart.toISOString(), end_time: slotEnd.toISOString() });
    }
  }
  return slots;
}
