/** Add N weekdays (Mon–Fri), skipping Sat/Sun. */
export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  let left = Math.max(0, Math.floor(days));
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) left -= 1;
  }
  return d;
}

export function addBusinessDaysIso(from: Date, days: number): string {
  const d = addBusinessDays(from, days);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}
