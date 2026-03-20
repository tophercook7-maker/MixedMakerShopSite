/**
 * Stable fallback URLs for sample site hero/gallery images when primary URLs fail
 * (hotlink limits, expired assets, blocked CDNs, etc.).
 * Picsum seeds are deterministic and widely reachable.
 */

import type { LeadSampleRecord } from "@/lib/lead-samples";

export type SampleImageCategory =
  | "pressure-washing"
  | "auto-detailing"
  | "landscaping"
  | "plumbing"
  | "restaurant"
  | "church"
  | "coffee"
  | "default-service-business";

/** Category hero when primary src fails or is empty. */
export const SAMPLE_CATEGORY_FALLBACK_HERO: Record<SampleImageCategory, string> = {
  "pressure-washing": "https://picsum.photos/seed/mm-fb-pw-hero/1600/1000",
  "auto-detailing": "https://picsum.photos/seed/mm-fb-ad-hero/1600/1000",
  landscaping:
    "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1600&q=80",
  /** On-theme plumbing imagery (not generic Picsum) for believable service samples */
  plumbing:
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1600&q=80",
  "restaurant":
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
  church:
    "https://images.unsplash.com/photo-1465848059293-208e11dfea17?auto=format&fit=crop&w=1600&q=80",
  coffee:
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80",
  "default-service-business": "https://picsum.photos/seed/mm-fb-def-hero/1600/1000",
};

/**
 * Category fallback for service cards / gallery tiles (category stage).
 * Keeps card thumbnails on-story when primary URLs fail (plumbing was especially obvious with Picsum).
 */
export const SAMPLE_CATEGORY_FALLBACK_CARD: Record<SampleImageCategory, string> = {
  "pressure-washing": "https://picsum.photos/seed/mm-fb-pw-card/900/560",
  "auto-detailing": "https://picsum.photos/seed/mm-fb-ad-card/900/560",
  landscaping:
    "https://images.unsplash.com/photo-1458245201577-fc8a130b8829?auto=format&fit=crop&w=900&q=80",
  plumbing:
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
  "restaurant":
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80",
  church:
    "https://images.unsplash.com/photo-1531808012724-688c1de500b4?auto=format&fit=crop&w=900&q=80",
  coffee:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
  "default-service-business": "https://picsum.photos/seed/mm-fb-def-card/900/560",
};

/** Last-resort URL before gradient-only (different seed from category fallbacks). */
export const SAMPLE_ULTIMATE_FALLBACK_HERO =
  "https://picsum.photos/seed/mm-hero-ultimate-v2/1600/1000";

/** Recommended primary hero for portfolio pressure washing (high availability). */
export const PORTFOLIO_PRESSURE_WASHING_HERO_PRIMARY =
  "https://picsum.photos/seed/clearview-pw-primary/1600/1000";

/** Maps evergreen portfolio route slug → image fallback category (hub cards + sample pages). */
const PORTFOLIO_ROUTE_SLUG_TO_CATEGORY: Record<string, SampleImageCategory> = {
  "pressure-washing": "pressure-washing",
  "auto-detailing": "auto-detailing",
  landscaping: "landscaping",
  plumbing: "plumbing",
  restaurant: "restaurant",
};

export function imageCategoryFromPortfolioRouteSlug(routeSlug: string): SampleImageCategory {
  return PORTFOLIO_ROUTE_SLUG_TO_CATEGORY[routeSlug] ?? "default-service-business";
}

type DraftPick = {
  tagline: string;
  businessName: string;
  heroHeadline: string;
  offeringsTitle: string;
};

export function inferImageCategoryFromDraftPick(p: DraftPick): SampleImageCategory {
  const hay = `${p.tagline} ${p.businessName} ${p.heroHeadline} ${p.offeringsTitle}`.toLowerCase();
  if (
    hay.includes("pressure") ||
    (hay.includes("wash") && (hay.includes("exterior") || hay.includes("driveway") || hay.includes("deck")))
  ) {
    return "pressure-washing";
  }
  if (hay.includes("detail") || hay.includes("detailing") || hay.includes("ceramic") || hay.includes("wax")) {
    return "auto-detailing";
  }
  if (
    hay.includes("landscap") ||
    hay.includes("lawn") ||
    hay.includes("mulch") ||
    hay.includes("yard") ||
    hay.includes("turf")
  ) {
    return "landscaping";
  }
  if (
    hay.includes("plumb") ||
    hay.includes("hvac") ||
    hay.includes("drain") ||
    hay.includes("heating") ||
    hay.includes("cooling") ||
    hay.includes("water heater")
  ) {
    return "plumbing";
  }
  if (
    hay.includes("coffee") ||
    hay.includes("latte") ||
    hay.includes("espresso") ||
    (hay.includes("cafe") && hay.includes("pastry")) ||
    (hay.includes("coffee bar") || hay.includes("roast"))
  ) {
    return "coffee";
  }
  if (
    hay.includes("church") ||
    hay.includes("worship") ||
    hay.includes("ministry") ||
    hay.includes("ministr") ||
    hay.includes("fellowship") ||
    hay.includes("gospel") ||
    hay.includes("sunday service")
  ) {
    return "church";
  }
  if (
    hay.includes("restaurant") ||
    hay.includes("kitchen") ||
    hay.includes("food truck") ||
    hay.includes("catering") ||
    hay.includes("diner") ||
    (hay.includes("menu") && !hay.includes("coffee"))
  ) {
    return "restaurant";
  }
  return "default-service-business";
}

export function inferImageCategoryFromLeadSample(sample: LeadSampleRecord | null): SampleImageCategory {
  if (!sample) return "default-service-business";
  const hay = `${sample.business_type} ${sample.suggested_image_category} ${sample.hero_headline} ${sample.site_goal}`.toLowerCase();
  if (hay.includes("pressure") || hay.includes("pressure_washing")) return "pressure-washing";
  if (hay.includes("detail") || hay.includes("detailing")) return "auto-detailing";
  if (hay.includes("landscap") || hay.includes("lawn")) return "landscaping";
  if (hay.includes("plumb") || hay.includes("hvac")) return "plumbing";
  if (hay.includes("restaurant") || hay.includes("food")) return "restaurant";
  const pool = String(sample.suggested_image_category || "").toLowerCase();
  if (pool.includes("pressure")) return "pressure-washing";
  if (pool.includes("detail")) return "auto-detailing";
  if (pool.includes("land")) return "landscaping";
  return inferImageCategoryFromDraftPick({
    tagline: sample.business_type,
    businessName: sample.business_name,
    heroHeadline: sample.hero_headline,
    offeringsTitle: (sample.services || []).join(" "),
  });
}

export function isNonEmptyImageUrl(src: string | null | undefined): boolean {
  const s = String(src || "").trim();
  if (!s) return false;
  if (s.startsWith("data:")) return true;
  try {
    const u = new URL(s, "https://example.com");
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return /^https?:\/\//i.test(s);
  }
}
