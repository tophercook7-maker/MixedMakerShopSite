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
  "/ai-business-tools",
  "/blog",
  "/blog/local-seo-for-plumbers",
  "/blog/3d-printed-keychains-ultimate-handout",
  "/blog/local-seo-home-service-advantage",
  "/blog/stop-dog-earing-3d-printed-bookmarks",
  "/blog/clean-and-quick-pc-service",
  "/blog/local-seo-near-me-secret",
  "/blog/automate-small-business-workflow",
  "/blog/hollow-gate",
  "/blog/business-card-3d-printed-keychain",
  "/blog/custom-3d-printed-bookmarks",
  "/blog/3d-printed-keychains-bulk-marketing",
  "/blog/mixed-maker-shop-made-simple",
  "/blog/mixed-maker-shop-guide",
  "/blog/mixed-maker-shop-comeback",
  "/blog/weekend-reclaimer-ai-automation",
  "/blog/local-seo-home-services-mistakes",
  "/blog/off-grid-lora-weather-station",
  "/blog/cleaning-service-website-essentials",
  "/blog/website-preview-generator",
  "/blog/custom-3d-printing-branding",
  "/blog/mobile-friendly-website-design",
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
  "/google-business-profile-help",
  "/growth-offer",
  "/how-much-does-a-website-cost",
  "/idea-lab",
  "/in-home-computer-repair",
  "/lawn-care-hot-springs-ar",
  "/local-seo-services",
  "/offer",
  "/portfolio",
  "/privacy",
  "/privacy-policy",
  "/terms",
  "/pressure-washing-hot-springs-ar",
  "/pricing",
  "/property-care",
  "/restaurant-website-redesign",
  "/restaurant-websites-hot-springs",
  "/see-your-website",
  "/services",
  "/small-business-websites-hot-springs",
  "/social-media-takeover",
  "/start-here",
  "/tools",
  "/tophers-recommended-tools",
  "/tophers-web-design",
  "/upload-print",
  "/web-design",
  "/web-design-hot-springs-ar",
  "/website-designer-hot-springs-ar",
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
