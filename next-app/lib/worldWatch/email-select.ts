import type { WorldWatchItemDisplay } from "@/lib/worldWatch/types";

export type SelectedWeeklyContent = {
  biblical: WorldWatchItemDisplay | null;
  global: WorldWatchItemDisplay[];
  prophecy: WorldWatchItemDisplay | null;
};

function inWindow(item: WorldWatchItemDisplay, start: Date, end: Date): boolean {
  const t = new Date(item.published_at).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

/** Prefer calmer prophecy framing: short copy, no excessive punctuation. */
function prophecyEligible(item: WorldWatchItemDisplay): boolean {
  const s = `${item.title} ${item.summary}`;
  const excl = (s.match(/!/g) || []).length;
  if (excl > 2) return false;
  if (/urgent|breaking|must read|shocking/i.test(s)) return false;
  return item.summary.length < 420;
}

/**
 * Select content for Deep Well Weekly from items in the date window.
 * - 1 biblical_insight (newest in window)
 * - up to 3 global_awareness
 * - 0–1 prophecy_watch if eligibility passes
 */
export function selectWeeklyWorldWatchItems(
  items: WorldWatchItemDisplay[],
  start: Date,
  end: Date
): SelectedWeeklyContent {
  const windowed = items.filter((i) => inWindow(i, start, end));
  const sorted = [...windowed].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );

  const biblicalInWindow = sorted.find((i) => i.category === "biblical_insight");
  const biblicalFallback = [...items]
    .filter((i) => i.category === "biblical_insight")
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())[0];
  const biblical = biblicalInWindow ?? biblicalFallback ?? null;

  const global = sorted
    .filter((i) => i.category === "global_awareness")
    .slice(0, 3);

  const prophecyCandidates = sorted.filter((i) => i.category === "prophecy_watch").filter(prophecyEligible);
  const prophecy = prophecyCandidates[0] ?? null;

  return { biblical, global, prophecy };
}
