/**
 * Full source of website samples — from project website-samples/index.html
 * Categories: Coffee Shops, Restaurants, Churches, Redesign, Tools
 */

import type { SampleImageCategory } from "@/lib/sample-fallback-images";

export type SampleCategory = "coffee" | "restaurant" | "church" | "service" | "redesign" | "tool";

export type WebsiteSample = {
  slug: string;
  name: string;
  desc: string;
  category: SampleCategory;
  imageUrl?: string;
  /** If set, links to this route instead of /website-samples/[slug] */
  externalHref?: string;
};

export const SAMPLE_CATEGORIES: { id: SampleCategory; label: string }[] = [
  { id: "coffee", label: "Coffee Shops" },
  { id: "restaurant", label: "Restaurants" },
  { id: "church", label: "Churches" },
  { id: "service", label: "Service Businesses" },
  { id: "redesign", label: "Redesign Concepts" },
  { id: "tool", label: "Tools" },
];

export const WEBSITE_SAMPLES: WebsiteSample[] = [
  // Coffee shop samples
  {
    slug: "bean-bliss",
    name: "Bean Bliss",
    desc: "Neighborhood coffee shop layout: menu highlights, photos, and an easy path to visit or call.",
    category: "coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "bean-bliss-boho",
    name: "Bean Bliss Boho",
    desc: "Warm boho style with bakery-forward photos and reviews — feels local and trustworthy, not corporate.",
    category: "coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "noir-roast",
    name: "Noir Roast",
    desc: "Clean, upscale coffee look that reads well on phones — strong headline and easy-to-scan menu.",
    category: "coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "noir-roast-rustic",
    name: "Noir Roast Rustic",
    desc: "Cozy roastery vibe with wood tones, clear hours, and simple ways to order or get in touch.",
    category: "coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "sunrise-cafe",
    name: "Sunrise Café",
    desc: "Bold, friendly energy with photos of the bar and hours customers can’t miss.",
    category: "coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "sunrise-cafe-modern",
    name: "Sunrise Café Modern",
    desc: "Modern night-out cafe style — quick paths to call or order for a younger crowd.",
    category: "coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "route-66-coffee",
    name: "Route 66 Coffee",
    desc: "Classic diner-meets-espresso personality with tap-to-call and a menu that’s easy to skim.",
    category: "coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
  },
  // Service business samples
  {
    slug: "diamond-plumbing",
    name: "Diamond Plumbing Co.",
    desc: "Plumbing site built for emergencies, trust, and getting the phone to ring.",
    category: "service",
    imageUrl:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "greenridge-lawn-care",
    name: "Greenridge Lawn Care",
    desc: "Lawn care layout that sells recurring visits, seasonal work, and neighbor-level trust.",
    category: "service",
    imageUrl:
      "https://images.unsplash.com/photo-1458245201577-fc8a130b8829?auto=format&fit=crop&w=900&q=80",
  },
  // Restaurant samples
  {
    slug: "southern-diner-concept",
    name: "Southern Diner Concept",
    desc: "Southern kitchen story: breakfast-through-dinner cards, dining-room gallery, reserve and takeout CTAs.",
    category: "restaurant",
    imageUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  },
  // Church samples
  {
    slug: "grace-fellowship-church",
    name: "Grace Fellowship Church",
    desc: "Welcoming church flow: ministries, photos, and a clear plan-your-visit path.",
    category: "church",
    imageUrl:
      "https://images.unsplash.com/photo-1465848059293-208e11dfea17?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "riverstone-church",
    name: "Riverstone Church",
    desc: "Contemporary worship presentation with bright imagery, student ministry card, and clear next steps.",
    category: "church",
    imageUrl:
      "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "oak-hill-community-church",
    name: "Oak Hill Community Church",
    desc: "Small-town warmth: community photos, midweek groups, and easy ways to connect.",
    category: "church",
    imageUrl:
      "https://images.unsplash.com/photo-1531808012724-688c1de500b4?auto=format&fit=crop&w=900&q=80",
  },
  // Redesign concepts
  {
    slug: "restaurant-redesign-demo",
    name: "Restaurant Redesign Demo",
    desc: "See how a tighter menu and faster mobile flow can bring more orders — with links to live examples.",
    category: "redesign",
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
    externalHref: "/restaurant-website-redesign",
  },
  // Tools
  {
    slug: "website-teardown-tool",
    name: "Website Teardown Tool",
    desc: "Free check: send your URL and get a short, honest review with fixes you can act on.",
    category: "tool",
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
    externalHref: "/free-website-check",
  },
];

/** Resilient hub thumbnails: maps each sample row to a fallback image category. */
export function hubImageCategoryForWebsiteSample(sample: WebsiteSample): SampleImageCategory {
  if (sample.category === "coffee") return "coffee";
  if (sample.category === "restaurant" || sample.category === "redesign") return "restaurant";
  if (sample.category === "church") return "church";
  if (sample.category === "tool") return "default-service-business";
  const key = `${sample.slug} ${sample.name}`.toLowerCase();
  if (key.includes("plumb")) return "plumbing";
  if (key.includes("lawn")) return "landscaping";
  return "landscaping";
}

export function getSampleBySlug(slug: string): WebsiteSample | undefined {
  return WEBSITE_SAMPLES.find((s) => s.slug === slug);
}
