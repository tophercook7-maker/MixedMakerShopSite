/** Published and upcoming blog posts shown on `/blog`. */
export type BlogIndexPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  /** Minutes parsed from `readTime` for sorting. */
  readMinutes: number;
  /** ISO date for sort order (newest first by default). */
  publishedAt: string;
  /** Highlight on index when filters are at default. */
  featured?: boolean;
  /** When set, the card links to a live article page. */
  href?: string;
};

export type BlogSortKey = "recommended" | "newest" | "oldest" | "title" | "quick-read";

export function parseReadMinutes(readTime: string): number {
  const match = readTime.match(/(\d+)/);
  return match ? Number(match[1]) : 5;
}

const posts: BlogIndexPost[] = [
  {
    slug: "cleaning-service-website-essentials",
    title: "Quick Refresh: What Every Modern Cleaning Service Website Needs",
    category: "Quick Refresh",
    excerpt:
      "Booking, trust, real before-and-after photos, and local SEO for Arkansas cleaning businesses — without agency fluff.",
    readTime: "7 min read",
    readMinutes: 7,
    publishedAt: "2026-06-05",
    href: "/blog/cleaning-service-website-essentials",
  },
  {
    slug: "website-preview-generator",
    title: "See Before You Spend: The Power of Our Website Preview Generator",
    category: "Web Design",
    excerpt:
      "Stop buying web design blind. Our free preview generator shows your homepage direction in about two minutes — no credit card, no contract.",
    readTime: "7 min read",
    readMinutes: 7,
    publishedAt: "2026-06-04",
    href: "/blog/website-preview-generator",
  },
  {
    slug: "custom-3d-printing-branding",
    title: "Beyond Plastic: How Custom 3D Printing Services Can Level Up Your Branding",
    category: "3D Printing",
    excerpt:
      "Ditch catalog swag that ends up in the junk drawer. Custom 3D printed keychains, bookmarks, and branded gear that customers actually keep — in small batches from Hot Springs.",
    readTime: "8 min read",
    readMinutes: 8,
    publishedAt: "2026-06-03",
    featured: true,
    href: "/blog/custom-3d-printing-branding",
  },
  {
    slug: "mobile-friendly-website-design",
    title: "7 Mistakes You’re Making with Your Mobile Friendly Website Design",
    category: "Mobile Website Design",
    excerpt:
      "Just because your website fits on a phone does not mean it works on a phone. Here are seven common mobile design mistakes that quietly kill conversions.",
    readTime: "7 min read",
    readMinutes: 7,
    publishedAt: "2026-05-28",
    href: "/blog/mobile-friendly-website-design",
  },
  {
    slug: "small-business-website-tune-up",
    title: "Does Your Small Business Website Need a Tune-Up?",
    category: "Website Basics",
    excerpt:
      "A quick guide to spotting outdated design, confusing pages, weak calls-to-action, and other small problems that quietly cost you customers.",
    readTime: "4 min read",
    readMinutes: 4,
    publishedAt: "2026-05-20",
  },
  {
    slug: "local-business-homepage",
    title: "What Should Be on a Local Business Homepage?",
    category: "Local SEO",
    excerpt:
      "Your homepage does not need to be complicated. It needs to clearly show what you do, where you serve, why people should trust you, and how to contact you.",
    readTime: "5 min read",
    readMinutes: 5,
    publishedAt: "2026-05-15",
  },
  {
    slug: "landing-page-vs-full-website",
    title: "Why a Landing Page Can Beat a Full Website",
    category: "Lead Generation",
    excerpt:
      "For some businesses, one focused page with the right offer can do more than a bloated website with ten weak pages.",
    readTime: "3 min read",
    readMinutes: 3,
    publishedAt: "2026-05-10",
  },
  {
    slug: "simple-website-fixes-professional",
    title: "Simple Website Fixes That Make You Look More Professional",
    category: "Web Design",
    excerpt:
      "Better spacing, clearer buttons, stronger photos, cleaner wording, and a faster path to contact can change how people see your business.",
    readTime: "4 min read",
    readMinutes: 4,
    publishedAt: "2026-05-05",
  },
  {
    slug: "facebook-traffic-to-website-leads",
    title: "How to Turn Facebook Traffic Into Website Leads",
    category: "Marketing",
    excerpt:
      "Sharing your business on Facebook is good. Sending people to a page that actually captures interest is better.",
    readTime: "5 min read",
    readMinutes: 5,
    publishedAt: "2026-04-28",
  },
];

/** All blog posts for the index (newest `publishedAt` first). */
export const BLOG_POSTS: readonly BlogIndexPost[] = [...posts].sort(
  (a, b) => b.publishedAt.localeCompare(a.publishedAt),
);

/** @deprecated Use `BLOG_POSTS.find((p) => p.featured)` — kept for article metadata parity. */
export const FEATURED_BLOG_POST: BlogIndexPost =
  BLOG_POSTS.find((p) => p.featured) ?? BLOG_POSTS[0]!;

/** @deprecated Use `BLOG_POSTS` — non-featured posts only. */
export const MORE_BLOG_POSTS: readonly BlogIndexPost[] = BLOG_POSTS.filter((p) => !p.featured);

/** Unique categories for filter chips (stable alphabetical order). */
export const BLOG_CATEGORIES: readonly string[] = Array.from(
  new Set(BLOG_POSTS.map((p) => p.category)),
).sort((a, b) => a.localeCompare(b));

export function isBlogPostPublished(post: BlogIndexPost): boolean {
  return Boolean(post.href);
}

export function sortBlogPosts(posts: readonly BlogIndexPost[], sort: BlogSortKey): BlogIndexPost[] {
  const list = [...posts];
  switch (sort) {
    case "newest":
      return list.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    case "oldest":
      return list.sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
    case "title":
      return list.sort((a, b) => a.title.localeCompare(b.title));
    case "quick-read":
      return list.sort((a, b) => a.readMinutes - b.readMinutes || a.title.localeCompare(b.title));
    case "recommended":
    default:
      return list.sort((a, b) => {
        const aPub = isBlogPostPublished(a) ? 1 : 0;
        const bPub = isBlogPostPublished(b) ? 1 : 0;
        if (aPub !== bPub) return bPub - aPub;
        if (a.featured !== b.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        return b.publishedAt.localeCompare(a.publishedAt);
      });
  }
}

export function filterBlogPosts(
  posts: readonly BlogIndexPost[],
  options: { category: string; query: string; publishedOnly: boolean },
): BlogIndexPost[] {
  const q = options.query.trim().toLowerCase();
  return posts.filter((post) => {
    if (options.category && post.category !== options.category) return false;
    if (options.publishedOnly && !isBlogPostPublished(post)) return false;
    if (!q) return true;
    return (
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.category.toLowerCase().includes(q)
    );
  });
}
