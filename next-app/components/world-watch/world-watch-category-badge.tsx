import type { WorldWatchCategory } from "@/lib/worldWatch/types";
import { CATEGORY_LABEL } from "@/lib/worldWatch/labels";
import { cn } from "@/lib/utils";

const BADGE_STYLES: Record<WorldWatchCategory, string> = {
  biblical_insight: "border-amber-500/25 bg-amber-500/10 text-amber-100/90",
  global_awareness: "border-sky-400/25 bg-sky-400/10 text-sky-100/90",
  prophecy_watch: "border-violet-400/22 bg-violet-400/8 text-violet-100/88",
};

export function WorldWatchCategoryBadge({
  category,
  className,
}: {
  category: WorldWatchCategory;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight",
        BADGE_STYLES[category],
        className
      )}
    >
      {CATEGORY_LABEL[category]}
    </span>
  );
}
