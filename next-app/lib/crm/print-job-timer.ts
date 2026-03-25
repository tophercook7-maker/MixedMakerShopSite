/**
 * Human display + elapsed math for 3D print job timer (`print_timer_*` columns).
 */

export function formatMinutesHuman(totalMinutes: number): string {
  const n = Math.max(0, Math.floor(Number(totalMinutes) || 0));
  if (n === 0) return "0m";
  const h = Math.floor(n / 60);
  const m = n % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/** Whole minutes since `iso` until `nowMs` (non-negative). */
export function elapsedWholeMinutesSince(iso: string | null | undefined, nowMs: number = Date.now()): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, Math.round((nowMs - t) / 60000));
}
