import type { WorldWatchItemDisplay } from "@/lib/worldWatch/types";

function firstLines(text: string, maxLines: number): string {
  const lines = String(text || "")
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const slice = lines.slice(0, maxLines).join(" ");
  if (!slice) return "";
  const fullFlat = lines.join(" ");
  if (slice.length < fullFlat.length) return `${slice}…`;
  if (slice.length > 220) return `${slice.slice(0, 217)}…`;
  return slice;
}

/** Public teaser shape for non-members — no full summary, reflection, or scripture. */
export function toWorldWatchTeaserItem(item: WorldWatchItemDisplay): WorldWatchItemDisplay {
  return {
    ...item,
    summary: firstLines(item.summary, 2),
    reflection: "",
    scripture_reference: null,
    scripture_text: null,
  };
}
