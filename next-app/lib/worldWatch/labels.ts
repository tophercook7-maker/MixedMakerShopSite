import type { WorldWatchCategory, WorldWatchFilterKey } from "./types";

export const CATEGORY_LABEL: Record<WorldWatchCategory, string> = {
  biblical_insight: "Biblical Insight",
  global_awareness: "Global Awareness",
  prophecy_watch: "Prophecy Watch",
};

export const FILTER_OPTIONS: { key: WorldWatchFilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "biblical_insight", label: "Biblical Insight" },
  { key: "global_awareness", label: "Global Awareness" },
  { key: "prophecy_watch", label: "Prophecy Watch" },
];
