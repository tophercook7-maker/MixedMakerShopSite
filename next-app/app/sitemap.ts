import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog/registry";
import { CASE_STUDY_ENTRIES } from "@/lib/case-studies/registry";
import { RESOURCE_ENTRIES } from "@/lib/resources/registry";
import { SITE_URL } from "@/lib/site";
import { WEBSITE_SAMPLES } from "@/lib/website-samples";

/**
 * Marketing routes under app/(public)/ matching static page.tsx files (excludes dynamic [slug] routes).
 * 2026-09-05: redirect-only URLs, form success pages, and llms.txt removed — Search Console flagged
 * every redirecting sitemap entry as a "redirect error" and the rest waste crawl budget.
 */
const PUBLIC_PATHS: readonly string[] = [
  "/",
  "/about",
  "/ad-lab",
  "/ai-business-tools",
  "/blog",
  "/builds",
  "/church-websites-hot-springs",
  "/coffee-shop-websites-hot-springs",
  "/connect",
  "/contact",
  "/examples",
  "/free-mockup",
  "/free-website-check",
  "/google-business-profile-help",
  "/how-much-does-a-website-cost",
  "/idea-lab",
  "/in-home-computer-repair",
  "/3d-printing",
  "/family-history",
  "/lawn-care-hot-springs-ar",
  "/local-seo-services",
  "/offer",
  "/portfolio/index.html",
  "/privacy",
  "/terms",
  "/pressure-washing-hot-springs-ar",
  "/price-sheet",
  "/pricing",
  "/property-care",
  "/restaurant-website-redesign",
  "/restaurant-websites-hot-springs",
  "/small-business-website-design",
  "/small-business-websites-hot-springs",
  "/social-media-takeover",
  "/start-here",
  "/lab",
  "/tools",
  "/web-design",
  "/web-design-hot-springs-ar",
  "/website-maintenance",
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

const WEBSITE_SAMPLE_PATHS: readonly string[] = WEBSITE_SAMPLES.filter((sample) => !sample.externalHref).map(
  (sample) => `/website-samples/${sample.slug}`,
);

const BLOG_ARTICLE_PATHS: readonly string[] = BLOG_POSTS.flatMap((post) => (post.href ? [post.href] : []));

const RESOURCE_AND_PROOF_PATHS: readonly string[] = [
  "/resources",
  ...RESOURCE_ENTRIES.map((r) => `/resources/${r.slug}`),
  ...CASE_STUDY_ENTRIES.map((c) => `/proof/${c.slug}`),
];

const ALL_PUBLIC_PATHS = [
  ...PUBLIC_PATHS,
  ...BLOG_ARTICLE_PATHS,
  ...WEBSITE_SAMPLE_PATHS,
  ...RESOURCE_AND_PROOF_PATHS,
];

/** Real publish dates for blog posts so the sitemap reflects actual content age. */
const blogDateByPath = new Map(
  BLOG_POSTS.filter((p) => p.href).map((p) => [p.href as string, p.publishedAt]),
);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const seen = new Set<string>();
  return ALL_PUBLIC_PATHS.filter((path) => {
    if (seen.has(path)) return false;
    seen.add(path);
    return true;
  }).map((path) => {
    const blogDate = blogDateByPath.get(path);
    // Cap lastmod at `now`: some blog posts are scheduled ahead with a future
    // publishedAt, and a future <lastmod> is invalid per the sitemap spec (ignored
    // by crawlers). This only affects sitemap output, not the displayed publish date.
    const lastModified = blogDate && new Date(blogDate) < now ? new Date(blogDate) : now;
    return {
      url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.75,
    };
  });
}
