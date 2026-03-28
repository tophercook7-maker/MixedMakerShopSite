import { publicSiteBase } from "@/lib/crm/print-payment";
import { buildWeeklyDraftFromSelection, refineWeeklyDraftWithAi } from "@/lib/worldWatch/email-ai";
import { renderWeeklyEmailHtml, renderWeeklyEmailText, type WeeklyEmailDraft } from "@/lib/worldWatch/email-render";
import { selectWeeklyWorldWatchItems } from "@/lib/worldWatch/email-select";
import { getUtcRangeLastDays } from "@/lib/worldWatch/chicago-week";
import { getWorldWatchItemsSorted } from "@/lib/worldWatch/mock-data";

export type BuiltWeeklyEmail = {
  draft: WeeklyEmailDraft;
  html: string;
  text: string;
  weekStart: Date;
  weekEnd: Date;
};

/**
 * Build weekly member email from current World Watch source data (mock or future DB).
 * @param now - reference time (typically `new Date()`); window is last 7 days ending `now`.
 */
export async function buildDeepWellWeeklyEmail(now: Date): Promise<BuiltWeeklyEmail> {
  const { start, end } = getUtcRangeLastDays(now, 7);
  const items = getWorldWatchItemsSorted();
  const selected = selectWeeklyWorldWatchItems(items, start, end);
  let draft = buildWeeklyDraftFromSelection(selected);
  const refined = await refineWeeklyDraftWithAi(draft);
  if (refined) draft = refined;

  const base = publicSiteBase() || "https://mixedmakershop.com";
  return {
    draft,
    html: renderWeeklyEmailHtml(draft, { siteBase: base }),
    text: renderWeeklyEmailText(draft, { siteBase: base }),
    weekStart: start,
    weekEnd: end,
  };
}
