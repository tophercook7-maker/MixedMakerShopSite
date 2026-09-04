import { MD_POSTS } from "@/lib/blog/md-posts.generated";

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
    slug: "seo-for-plumbers-hot-springs",
    title: "SEO for Plumbers in Hot Springs: Get Found When Homeowners Are Searching Fast",
    category: "Local SEO",
    excerpt:
      "When a pipe bursts, homeowners search fast. A working Google Business Profile, plain-language service pages, honest reviews, and a site that works on a wet phone.",
    readTime: "8 min read",
    readMinutes: 8,
    publishedAt: "2026-09-04",
    href: "/blog/seo-for-plumbers-hot-springs",
  },
  {
    slug: "cant-afford-new-computer-99-tune-up",
    title:
      "Can't Afford a New Computer? Here's How $99 and a Few Simple Fixes Can Bring Yours Back to Life",
    category: "Tech Repair",
    excerpt:
      "Before you drop $800 on a new machine, try a $99 clean-up and tune-up. Honest, local computer repair, SSD upgrades, and small-business help from Mixed Maker Shop in Hot Springs — no overhead, no upselling.",
    readTime: "7 min read",
    readMinutes: 7,
    publishedAt: "2026-08-04",
    href: "/blog/cant-afford-new-computer-99-tune-up",
  },
  {
    slug: "web-system-not-just-a-website",
    title: "Why Your Business Needs a Web System, Not Just a Website",
    category: "Web Design",
    excerpt:
      "A website just sits there. A web system works while you sleep — taking bookings, capturing leads, and automating busywork. Why your small business needs a digital employee, not a digital business card.",
    readTime: "7 min read",
    readMinutes: 7,
    publishedAt: "2026-06-25",
    href: "/blog/web-system-not-just-a-website",
  },
  {
    slug: "local-seo-for-hvac-companies",
    title: "Frozen Out: Why Your HVAC Business Needs a Local SEO Tune-Up",
    category: "Local SEO",
    excerpt:
      "Rank in Google's Local Pack for 'AC repair near me,' win reviews, and build a mobile site that turns frozen-furnace emergencies into phone calls — the digital tune-up for HVAC pros.",
    readTime: "8 min read",
    readMinutes: 8,
    publishedAt: "2026-06-29",
    href: "/blog/local-seo-for-hvac-companies",
  },
  {
    slug: "lead-response-automation-small-business",
    title: "While You Were Working: How to Stop Losing Leads When You Can't Pick Up the Phone",
    category: "AI & Automation",
    excerpt:
      "When you can't pick up, lead response automation texts callers back in 30 seconds, qualifies the lead, and stops customers from dialing your competitors — your digital sidekick for missed calls.",
    readTime: "8 min read",
    readMinutes: 8,
    publishedAt: "2026-06-28",
    href: "/blog/lead-response-automation-small-business",
  },
  {
    slug: "local-seo-for-electricians",
    title: "High Voltage Visibility: Why Local SEO is the Best Wire for Electricians",
    category: "Local SEO",
    excerpt:
      "Win Google's Local Pack when homeowners search 'emergency electrician near me' — service-area pages, reviews, and a mobile-first site that turns searches into calls.",
    readTime: "8 min read",
    readMinutes: 8,
    publishedAt: "2026-06-27",
    href: "/blog/local-seo-for-electricians",
  },
  {
    slug: "local-seo-for-plumbers",
    title: "Flushed Away: Why Plumbers Need Local SEO to Stay Above Water",
    category: "Local SEO",
    excerpt:
      "Win the map pack when homeowners search emergency plumber near me — Google Business Profile, reviews, and a mobile site that turns panic into phone calls.",
    readTime: "8 min read",
    readMinutes: 8,
    publishedAt: "2026-06-21",
    href: "/blog/local-seo-for-plumbers",
  },
  {
    slug: "local-seo-home-service-advantage",
    title: "The Local Advantage: Why SEO for Home Service Businesses is Your Secret Weapon",
    category: "Local SEO",
    excerpt:
      "Win the local 3-pack — Google Business Profile, service-area pages, reviews, and neighborhood content for landscapers, plumbers, cleaners, and contractors.",
    readTime: "8 min read",
    readMinutes: 8,
    publishedAt: "2026-06-19",
    href: "/blog/local-seo-home-service-advantage",
  },
  {
    slug: "clean-and-quick-pc-service",
    title: "Stop Fighting Your PC: Why our $99 ‘Clean & Quick’ Service is a Game Changer",
    category: "Tech Repair",
    excerpt:
      "Flat-rate $99 PC optimization and virus removal — in-home computer repair, bloatware cleanup, and honest pricing without big-box store headaches.",
    readTime: "8 min read",
    readMinutes: 8,
    publishedAt: "2026-06-17",
    href: "/blog/clean-and-quick-pc-service",
  },
  {
    slug: "local-seo-near-me-secret",
    title:
      'The "Near Me" Secret: How Local SEO Keeps Your Phone Ringing While Your Competitors Are Quiet',
    category: "Local SEO",
    excerpt:
      "Win the Local Pack — Google Business Profile, reviews, mobile-friendly websites, and practical local SEO so neighbors find you first.",
    readTime: "8 min read",
    readMinutes: 8,
    publishedAt: "2026-06-16",
    href: "/blog/local-seo-near-me-secret",
  },
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
    slug: "mixed-maker-shop-made-simple",
    title: "The Mixed Maker Shop Guide: Web Design, Custom Builds, and AI Automation Made Simple",
    category: "MixedMakerShop Guide",
    excerpt:
      "One lab for mobile friendly website design, custom tools and apps, local SEO, AI automation for small business, and the free homepage preview — without drowning in tabs.",
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
      "Topher's Web Design, the Lab, AI automation, free homepage previews, and straight-talk pricing — a glass-box guide to how MixedMakerShop works without agency fluff.",
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
      "From Cook's Computer Service since 2000 to Mixed Maker Shop — rebuilding after MS with in-home repair, AI tutoring, local SEO web design, and custom builds across Hot Springs and surrounding communities.",
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
      "Solar power, LoRa radio, custom Stevenson screens, and edge AI — a weather station build with no cloud rent and data you actually own.",
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
export const BLOG_POSTS: readonly BlogIndexPost[] = [
  ...posts,
  // Markdown posts published via BlogForge — hand-written TSX posts win on slug collision.
  ...MD_POSTS.filter((md) => !posts.some((p) => p.slug === md.slug)),
].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

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
