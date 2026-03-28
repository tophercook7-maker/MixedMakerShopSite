export type WorldWatchCategory = "biblical_insight" | "global_awareness" | "prophecy_watch";

/** Public / UI shape (subset of eventual DB row). */
export type WorldWatchItemDisplay = {
  id: string;
  title: string;
  slug: string;
  category: WorldWatchCategory;
  source_name: string;
  source_url: string;
  published_at: string;
  summary: string;
  reflection: string;
  scripture_reference?: string | null;
  scripture_text?: string | null;
  image_url?: string | null;
  is_featured: boolean;
  region?: string | null;
};

export type WorldWatchFilterKey = "all" | WorldWatchCategory;
