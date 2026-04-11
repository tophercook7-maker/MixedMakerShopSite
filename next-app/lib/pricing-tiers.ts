/**
 * Public pricing tiers — /pricing (full cards) and shared summaries elsewhere.
 */

export type PricingTier = {
  id: "starter" | "growth" | "custom";
  title: string;
  priceLabel: string;
  description: string;
  includes: readonly string[];
  ctaLabel: string;
  ctaHref: string;
  /** Middle tier — “Most Common” */
  featured?: boolean;
  badge?: string;
};

export const PRICING_TIERS: readonly PricingTier[] = [
  {
    id: "starter",
    title: "Starter Site",
    priceLabel: "$500 – $1,000",
    description: "A clean, simple website for businesses that just need to look legit and be easy to contact.",
    includes: ["1–3 pages", "Mobile-friendly design", "Basic SEO setup", "Contact form"],
    ctaLabel: "Get My Free Preview",
    ctaHref: "/free-mockup",
  },
  {
    id: "growth",
    title: "Growth Site",
    priceLabel: "$1,000 – $2,500",
    description: "Built for businesses that want a strong online presence and more consistent leads.",
    includes: [
      "Multi-page site",
      "Service-focused layout",
      "Conversion-focused structure",
      "Local SEO basics",
      "Faster performance",
    ],
    ctaLabel: "Get My Free Preview",
    ctaHref: "/free-mockup",
    featured: true,
    badge: "Most Common",
  },
  {
    id: "custom",
    title: "Custom Build",
    priceLabel: "Custom Quote",
    description: "For businesses that need something more tailored, automated, or unique.",
    includes: ["Advanced features", "Custom integrations", "Ongoing support options", "Scalable structure"],
    ctaLabel: "Start With a Preview",
    ctaHref: "/free-mockup",
  },
] as const;
