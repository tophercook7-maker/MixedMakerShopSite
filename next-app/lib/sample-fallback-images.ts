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
  | "default-service-business";

/** Category hero when primary src fails or is empty. */
export const SAMPLE_CATEGORY_FALLBACK_HERO: Record<SampleImageCategory, string> = {
  "pressure-washing": "https://picsum.photos/seed/mm-fb-pw-hero/1600/1000",
  "auto-detailing": "https://picsum.photos/seed/mm-fb-ad-hero/1600/1000",
  "landscaping": "https://picsum.photos/seed/mm-fb-lg-hero/1600/1000",
  "plumbing": "https://picsum.photos/seed/mm-fb-pl-hero/1600/1000",
  "restaurant": "https://picsum.photos/seed/mm-fb-rs-hero/1600/1000",
  "default-service-business": "https://picsum.photos/seed/mm-fb-def-hero/1600/1000",
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
    hay.includes("restaurant") ||
    hay.includes("kitchen") ||
    hay.includes("food truck") ||
    hay.includes("catering") ||
    hay.includes("diner") ||
    hay.includes("menu")
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
