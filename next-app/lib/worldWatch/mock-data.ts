import type { WorldWatchItemDisplay } from "./types";

/**
 * Placeholder editorial samples for UI until API/Supabase wiring exists.
 * Set to [] to verify empty state locally.
 */
export const WORLD_WATCH_MOCK_ITEMS: WorldWatchItemDisplay[] = [
  {
    id: "1",
    slug: "faithful-presence-in-public-life",
    title: "Faithful presence without fear in uncertain public seasons",
    category: "biblical_insight",
    source_name: "Sample trusted commentary",
    source_url: "https://example.org/faithful-presence",
    published_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    summary:
      "A measured look at how believers can engage culture and institutions with clarity, humility, and rootedness in Scripture—without drowning in noise.",
    reflection:
      "When headlines run hot, the invitation is often the same: slow down, pray, and remember whose story we belong to. Peace is not the absence of tension; it is Christ-shaped steadiness in the middle of it.",
    scripture_reference: "Philippians 4:6–7",
    scripture_text:
      "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God…",
    image_url: null,
    is_featured: true,
    region: null,
  },
  {
    id: "2",
    slug: "global-church-and-religious-liberty",
    title: "Quiet shifts in religious liberty and the global church",
    category: "global_awareness",
    source_name: "International religious freedom digest",
    source_url: "https://example.org/religious-freedom",
    published_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    summary:
      "Several regions saw policy changes affecting worship and assembly. The patterns are worth understanding—not to stir panic, but to pray specifically and support persecuted believers wisely.",
    reflection:
      "Awareness can deepen compassion. Rather than alarm, we can carry these stories as reminders to hold the persecuted church before the Lord and examine our own freedom with gratitude.",
    scripture_reference: "Hebrews 13:3",
    scripture_text: "Continue to remember those in prison as if you were together with them in prison…",
    image_url: null,
    is_featured: false,
    region: "Multiple",
  },
  {
    id: "3",
    slug: "watchfulness-without-date-setting",
    title: "Watchfulness and humility when reading the times",
    category: "prophecy_watch",
    source_name: "Thoughtful ministry commentary",
    source_url: "https://example.org/watchfulness",
    published_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    summary:
      "Some Christians see current geopolitical developments as worth watching alongside biblical themes of justice and restoration—while carefully avoiding sensational claims or fixed timelines.",
    reflection:
      "History has many seasons that felt decisive. The posture Scripture commends is awake, humble, and anchored: we watch, we serve, and we refuse to trade hope for hype.",
    scripture_reference: null,
    scripture_text: null,
    image_url: null,
    is_featured: false,
    region: null,
  },
  {
    id: "4",
    slug: "rest-as-resistance",
    title: "Sabbath rest as quiet resistance to a restless age",
    category: "biblical_insight",
    source_name: "Reflective teaching notes",
    source_url: "https://example.org/sabbath-rest",
    published_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    summary:
      "Rest is often framed as luxury; in Scripture it is a rhythm of trust. A slower pace can be formative when the world rewards constant urgency.",
    reflection:
      "Choosing rest is not escape—it is training our hearts to believe God sustains what we cannot control.",
    scripture_reference: "Matthew 11:28–30",
    scripture_text: "Come to me, all you who are weary and burdened, and I will give you rest.",
    image_url: null,
    is_featured: false,
    region: null,
  },
];

/** Newest first by published_at. */
export function getWorldWatchItemsSorted(): WorldWatchItemDisplay[] {
  return [...WORLD_WATCH_MOCK_ITEMS].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

export function getWorldWatchFeatured(
  items: WorldWatchItemDisplay[]
): WorldWatchItemDisplay | undefined {
  return items.find((i) => i.is_featured) ?? items[0];
}

export function filterWorldWatchItems(
  items: WorldWatchItemDisplay[],
  filter: "all" | WorldWatchItemDisplay["category"]
): WorldWatchItemDisplay[] {
  if (filter === "all") return items;
  return items.filter((i) => i.category === filter);
}

/** Featured + next two newest (excluding featured from the two if duplicate). */
export function getWorldWatchHomePreviewData(items: WorldWatchItemDisplay[]): {
  featured: WorldWatchItemDisplay | undefined;
  recent: WorldWatchItemDisplay[];
} {
  const sorted = [...items].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
  const featured = sorted.find((i) => i.is_featured) ?? sorted[0];
  const rest = sorted.filter((i) => i.id !== featured?.id);
  return { featured, recent: rest.slice(0, 2) };
}
