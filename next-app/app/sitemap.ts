import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Marketing routes under app/(public)/ matching static page.tsx files (excludes dynamic [slug] routes).
 */
const PUBLIC_PATHS: readonly string[] = [
  "/",
  "/3d-printing",
  "/about",
  "/ad-lab",
  "/builds",
  "/church-websites-hot-springs",
  "/coffee-shop-websites-hot-springs",
  "/connect",
  "/connect/success",
  "/contact",
  "/contact/success",
  "/custom-3d-printing",
  "/examples",
  "/free-mockup",
  "/free-website-check",
  "/free-website-check/success",
  "/growth-offer",
  "/idea-lab",
  "/lawn-care-hot-springs-ar",
  "/offer",
  "/portfolio",
  "/pressure-washing-hot-springs-ar",
  "/pricing",
  "/property-care",
  "/restaurant-website-redesign",
  "/restaurant-websites-hot-springs",
  "/see-your-website",
  "/services",
  "/small-business-websites-hot-springs",
  "/start-here",
  "/tools",
  "/tophers-recommended-tools",
  "/tophers-web-design",
  "/upload-print",
  "/web-design",
  "/web-design-hot-springs-ar",
  "/website-roast",
  "/website-samples",
  "/websites-tools",
  "/yard-cleanup-hot-springs-ar",
  "/samples/auto-detailing",
  "/samples/landscaping",
  "/samples/plumbing",
  "/samples/pressure-washing",
  "/samples/quote-calculator",
  "/samples/restaurant",
  "/samples/wellness",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_PATHS.map((path) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.75,
  }));
}
