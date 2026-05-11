import type { MetadataRoute } from "next";
import { CASE_STUDY_ENTRIES } from "@/lib/case-studies/registry";
import { RESOURCE_ENTRIES } from "@/lib/resources/registry";
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

const RESOURCE_AND_PROOF_PATHS: readonly string[] = [
  "/resources",
  ...RESOURCE_ENTRIES.map((r) => `/resources/${r.slug}`),
  ...CASE_STUDY_ENTRIES.map((c) => `/proof/${c.slug}`),
];

const ALL_PUBLIC_PATHS = [...PUBLIC_PATHS, ...RESOURCE_AND_PROOF_PATHS];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const seen = new Set<string>();
  return ALL_PUBLIC_PATHS.filter((path) => {
    if (seen.has(path)) return false;
    seen.add(path);
    return true;
  }).map((path) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.75,
  }));
}
