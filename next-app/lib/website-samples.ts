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
    desc: "Warm neighborhood bar with hero, menu favorites, gallery, and visit block — ready to swap in your photos.",
    category: "coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "bean-bliss-boho",
    name: "Bean Bliss Boho",
    desc: "Earthy boho palette with bakery-forward imagery, trust quotes, and soft CTAs that feel boutique, not corporate.",
    category: "coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "noir-roast",
    name: "Noir Roast",
    desc: "Editorial minimal layout: strong headline, restrained color, and menu cards that read upscale on mobile.",
    category: "coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "noir-roast-rustic",
    name: "Noir Roast Rustic",
    desc: "Cabin-roastery mood with wood-toned hero, cozy sections, and pickup-friendly primary actions.",
    category: "coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "sunrise-cafe",
    name: "Sunrise Café",
    desc: "Retro-playful energy: bold type, gallery of the bar, and hours that are impossible to miss.",
    category: "coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "sunrise-cafe-modern",
    name: "Sunrise Café Modern",
    desc: "Night-out cafe concept — glassy surfaces, contrast, and order-first CTAs for a younger crowd.",
    category: "coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "route-66-coffee",
    name: "Route 66 Coffee",
    desc: "Diner-meets-espresso-bar: vintage personality with practical tap-to-call and menu scan layout.",
    category: "coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
  },
  // Service business samples
  {
    slug: "diamond-plumbing",
    name: "Diamond Plumbing Co.",
    desc: "Emergency-ready plumbing site with service pages, trust proof, and call-first actions.",
    category: "service",
    imageUrl:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "greenridge-lawn-care",
    name: "Greenridge Lawn Care",
    desc: "Route-based lawn care: mowing, seasonal cleanups, and fertilization blocks with neighbor-trust tone.",
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
    desc: "Established church flow: sanctuary hero, ministries as services, gallery, and plan-your-visit CTAs.",
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
    desc: "Small-town warmth: community gallery, midweek groups, and contact-first ministry cards.",
    category: "church",
    imageUrl:
      "https://images.unsplash.com/photo-1531808012724-688c1de500b4?auto=format&fit=crop&w=900&q=80",
  },
  // Redesign concepts
  {
    slug: "restaurant-redesign-demo",
    name: "Restaurant Redesign Demo",
    desc: "How we tighten menus, speed, and mobile UX — plus links to live restaurant samples you can send.",
    category: "redesign",
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
    externalHref: "/restaurant-website-redesign",
  },
  // Tools
  {
    slug: "website-teardown-tool",
    name: "Website Teardown Tool",
    desc: "Free website check: submit your URL and get a concise review with actionable fixes.",
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
