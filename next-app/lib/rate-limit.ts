/**
 * Minimal in-process rate limiter.
 *
 * Deliberately not Redis-backed: this app runs as a single `next start` process
 * on the Mac, so a Map is sufficient and has no external dependency. State
 * resets on restart, which is acceptable for abuse-throttling.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function checkRate(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  b.count += 1;
  if (b.count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  return { ok: true, remaining: limit - b.count, retryAfter: 0 };
}

/** Coarse global counter so one bad day cannot eat a monthly API allowance. */
const daily = new Map<string, number>();
export function bumpDaily(name: string, cap: number): { ok: boolean; used: number } {
  const day = new Date().toISOString().slice(0, 10);
  const key = `${name}:${day}`;
  const used = (daily.get(key) ?? 0) + 1;
  daily.set(key, used);
  Array.from(daily.keys()).forEach((k) => {
    if (!k.endsWith(day)) daily.delete(k);
  });
  return { ok: used <= cap, used };
}
