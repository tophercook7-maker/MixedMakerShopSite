/**
 * Full source of website samples — from project website-samples/index.html
 * Categories: Coffee Shops, Restaurants, Churches, Redesign, Tools
 */

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
    desc: "Cozy modern build with hero, menu, about, and visit.",
    category: "coffee",
    imageUrl: "https://picsum.photos/id/1015/1200/700",
  },
  {
    slug: "bean-bliss-boho",
    name: "Bean Bliss Boho",
    desc: "Earthy, laid-back boho styling with warm tones and cozy sections.",
    category: "coffee",
    imageUrl: "https://picsum.photos/id/1060/1200/700",
  },
  {
    slug: "noir-roast",
    name: "Noir Roast",
    desc: "Upscale, minimal editorial style. Typography-forward layout.",
    category: "coffee",
    imageUrl: "https://picsum.photos/id/1061/1200/700",
  },
  {
    slug: "noir-roast-rustic",
    name: "Noir Roast Rustic",
    desc: "Cabin roastery look with wood tones, pine accents, and cozy sections.",
    category: "coffee",
    imageUrl: "https://picsum.photos/id/1018/1200/700",
  },
  {
    slug: "sunrise-cafe",
    name: "Sunrise Café",
    desc: "Playful retro vibes with pure CSS.",
    category: "coffee",
    imageUrl: "https://picsum.photos/id/1066/1200/700",
  },
  {
    slug: "sunrise-cafe-modern",
    name: "Sunrise Café Modern",
    desc: "Neon-forward modern concept with glass effects and nightlife energy.",
    category: "coffee",
    imageUrl: "https://picsum.photos/id/1050/1200/700",
  },
  {
    slug: "route-66-coffee",
    name: "Route 66 Coffee",
    desc: "Vintage diner concept with bold type, checkerboard energy, and shake bar sections.",
    category: "coffee",
    imageUrl: "https://picsum.photos/id/1040/1200/700",
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
    desc: "Local lawn care homepage with quick quote flow, service list, and seasonal messaging.",
    category: "service",
    imageUrl:
      "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=900&q=80",
  },
  // Restaurant samples
  {
    slug: "southern-diner-concept",
    name: "Southern Diner Concept",
    desc: "Clean southern charm — mobile-friendly menu, tap-to-call, hours & location.",
    category: "restaurant",
    imageUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  },
  // Church samples
  {
    slug: "grace-fellowship-church",
    name: "Grace Fellowship Church",
    desc: "Traditional / Established — clear service times, ministries, giving.",
    category: "church",
    imageUrl:
      "https://images.unsplash.com/photo-1465848059293-208e11dfea17?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "riverstone-church",
    name: "Riverstone Church",
    desc: "Modern / Contemporary — next steps, events, clean design.",
    category: "church",
    imageUrl:
      "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "oak-hill-community-church",
    name: "Oak Hill Community Church",
    desc: "Warm / Community — small-town feel, what to expect, welcoming.",
    category: "church",
    imageUrl:
      "https://images.unsplash.com/photo-1531808012724-688c1de500b4?auto=format&fit=crop&w=900&q=80",
  },
  // Redesign concepts
  {
    slug: "restaurant-redesign-demo",
    name: "Restaurant Redesign Demo",
    desc: "Before/after homepage makeover: mobile-first, faster, menu-focused.",
    category: "redesign",
    imageUrl: "https://picsum.photos/id/292/1200/700",
    externalHref: "/restaurant-website-redesign",
  },
  // Tools
  {
    slug: "website-teardown-tool",
    name: "Website Teardown Tool",
    desc: "Free website check — I'll review your site and reply by email with improvements.",
    category: "tool",
    imageUrl: "https://picsum.photos/id/119/1200/700",
    externalHref: "/free-website-check",
  },
];

export function getSampleBySlug(slug: string): WebsiteSample | undefined {
  return WEBSITE_SAMPLES.find((s) => s.slug === slug);
}
