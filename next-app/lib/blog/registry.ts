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
    slug: "automate-small-business-workflow",
    title: "Stop Chasing Paperwork: 5 Practical Ways to Automate Your Small Business Workflow",
    category: "AI & Automation",
    excerpt:
      "Five no-nonsense ways to use small business workflow automation — instant lead replies, auto-invoices, scheduling, smart routing, and tools that actually work.",
    readTime: "8 min read",
    readMinutes: 8,
    publishedAt: "2026-06-15",
    href: "/blog/automate-small-business-workflow",
  },
  {
    slug: "hollow-gate",
    title: "Step Beyond the Threshold: Unlocking The Hollow Gate",
    category: "Idea Lab",
    excerpt:
      "A sensory storytelling experiment from Mixed Maker Shop — digital atmosphere, curated sound, and a threshold you step into, not scroll past.",
    readTime: "8 min read",
    readMinutes: 8,
    publishedAt: "2026-06-14",
    href: "/blog/hollow-gate",
  },
  {
    slug: "business-card-3d-printed-keychain",
    title: "Why Your Business Card Should Be a 3D Printed Keychain (and Why Bulk Matters)",
    category: "3D Printing",
    excerpt:
      "Pocket-sized billboards on keys — why bulk 3D printed keychains beat paper business cards for daily impressions, durability, and local brand saturation.",
    readTime: "9 min read",
    readMinutes: 9,
    publishedAt: "2026-06-13",
    href: "/blog/business-card-3d-printed-keychain",
  },
  {
    slug: "custom-3d-printed-bookmarks",
    title: "Why Custom 3D Printed Bookmarks Stand Out",
    category: "3D Printing",
    excerpt:
      "25+ creative custom 3D printed bookmark ideas for schools, libraries, businesses, and book lovers — durable, tactile keepsakes from GiGi's Print Shop.",
    readTime: "10 min read",
    readMinutes: 10,
    publishedAt: "2026-06-07",
    href: "/blog/custom-3d-printed-bookmarks",
  },
  {
    slug: "3d-printed-keychains-bulk-marketing",
    title: "Why 3D Printed Keychains in Bulk Will Change the Way You Market Your Local Business",
    category: "3D Printing",
    excerpt:
      "Ditch catalog swag — how bulk 3D printed keychains, QR lead magnets, lumpy mail, and loyalty tokens help local businesses market smarter with small MOQs from GiGi's Print Shop.",
    readTime: "8 min read",
    readMinutes: 8,
    publishedAt: "2026-06-12",
    href: "/blog/3d-printed-keychains-bulk-marketing",
  },
  {
    slug: "mixed-maker-shop-made-simple",
    title: "The Mixed Maker Shop Guide: Web Design, 3D Printing, and AI Automation Made Simple",
    category: "MixedMakerShop Guide",
    excerpt:
      "One umbrella for mobile friendly website design, bulk 3D printed keychains, local SEO, AI automation for small business, and Captain Maker — without drowning in tabs.",
    readTime: "9 min read",
    readMinutes: 9,
    publishedAt: "2026-06-11",
    href: "/blog/mixed-maker-shop-made-simple",
  },
  {
    slug: "mixed-maker-shop-guide",
    title: "The Mixed Maker Shop Guide: No-Nonsense Tech, Print, and AI Solutions",
    category: "MixedMakerShop Guide",
    excerpt:
      "Captain Maker, Topher's Web Design, GiGi's Print Shop, AI automation, and straight-talk pricing — a glass-box guide to how MixedMakerShop works without agency fluff.",
    readTime: "8 min read",
    readMinutes: 8,
    publishedAt: "2026-06-10",
    href: "/blog/mixed-maker-shop-guide",
  },
  {
    slug: "mixed-maker-shop-comeback",
    title: "The Comeback: From Cook's Computer Service to the Mixed Maker Shop Revolution",
    category: "Our Story",
    excerpt:
      "From Cook's Computer Service since 2000 to Mixed Maker Shop — rebuilding after MS with in-home repair, AI tutoring, local SEO web design, and custom 3D printing across Hot Springs and surrounding communities.",
    readTime: "9 min read",
    readMinutes: 9,
    publishedAt: "2026-06-09",
    featured: true,
    href: "/blog/mixed-maker-shop-comeback",
  },
  {
    slug: "weekend-reclaimer-ai-automation",
    title: "The Weekend Reclaimer: How AI Automation Stops Your Inbox from Running Your Life",
    category: "AI & Automation",
    excerpt:
      "Small business workflow automation for owners tired of inbox interruptions — filter noise, qualify leads, and reclaim your weekends without enterprise fluff.",
    readTime: "7 min read",
    readMinutes: 7,
    publishedAt: "2026-06-08",
    href: "/blog/weekend-reclaimer-ai-automation",
  },
  {
    slug: "local-seo-home-services-mistakes",
    title: "7 Mistakes You’re Making with Local SEO (and Why They’re Killing Your “Near Me” Traffic)",
    category: "Local SEO",
    excerpt:
      "One-page services, stale Google profiles, review silence, and mobile speed — seven local SEO mistakes home service businesses make and how to fix them.",
    readTime: "7 min read",
    readMinutes: 7,
    publishedAt: "2026-06-07",
    href: "/blog/local-seo-home-services-mistakes",
  },
  {
    slug: "off-grid-lora-weather-station",
    title: "The Off-Grid Brain: Why We’re Building a Solar-Powered LoRa Weather Station",
    category: "Maker Builds",
    excerpt:
      "Solar power, LoRa radio, 3D-printed Stevenson screens, and edge AI — a weather station build with no cloud rent and data you actually own.",
    readTime: "8 min read",
    readMinutes: 8,
    publishedAt: "2026-06-06",
    href: "/blog/off-grid-lora-weather-station",
  },
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
