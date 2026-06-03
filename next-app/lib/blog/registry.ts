/** Published blog posts shown on `/blog`. */
export type BlogIndexPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  /** When set, the card links to a live article page. */
  href?: string;
};

export const FEATURED_BLOG_POST: BlogIndexPost = {
  slug: "mobile-friendly-website-design",
  title: "7 Mistakes You’re Making with Your Mobile Friendly Website Design",
  category: "Mobile Website Design",
  excerpt:
    "Just because your website fits on a phone does not mean it works on a phone. Here are seven common mobile design mistakes that quietly kill conversions.",
  readTime: "7 min read",
  href: "/blog/mobile-friendly-website-design",
};

/** Placeholder cards — article pages not built yet. */
export const MORE_BLOG_POSTS: readonly BlogIndexPost[] = [
  {
    slug: "small-business-website-tune-up",
    title: "Does Your Small Business Website Need a Tune-Up?",
    category: "Website Basics",
    excerpt:
      "A quick guide to spotting outdated design, confusing pages, weak calls-to-action, and other small problems that quietly cost you customers.",
    readTime: "4 min read",
  },
  {
    slug: "local-business-homepage",
    title: "What Should Be on a Local Business Homepage?",
    category: "Local SEO",
    excerpt:
      "Your homepage does not need to be complicated. It needs to clearly show what you do, where you serve, why people should trust you, and how to contact you.",
    readTime: "5 min read",
  },
  {
    slug: "landing-page-vs-full-website",
    title: "Why a Landing Page Can Beat a Full Website",
    category: "Lead Generation",
    excerpt:
      "For some businesses, one focused page with the right offer can do more than a bloated website with ten weak pages.",
    readTime: "3 min read",
  },
  {
    slug: "simple-website-fixes-professional",
    title: "Simple Website Fixes That Make You Look More Professional",
    category: "Web Design",
    excerpt:
      "Better spacing, clearer buttons, stronger photos, cleaner wording, and a faster path to contact can change how people see your business.",
    readTime: "4 min read",
  },
  {
    slug: "facebook-traffic-to-website-leads",
    title: "How to Turn Facebook Traffic Into Website Leads",
    category: "Marketing",
    excerpt:
      "Sharing your business on Facebook is good. Sending people to a page that actually captures interest is better.",
    readTime: "5 min read",
  },
] as const;
