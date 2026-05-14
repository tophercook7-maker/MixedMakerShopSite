/**
 * Public pricing tiers — /pricing (full cards) and shared summaries elsewhere.
 */

import { publicFreeMockupFunnelHref } from "@/lib/public-brand";

export type PricingTier = {
  id: "starter" | "growth" | "custom";
  title: string;
  priceLabel: string;
  description: string;
  includes: readonly string[];
  strongRecommendation?: {
    title: string;
    price: string;
  };
  bestNextStep?: string;
  ctaLabel: string;
  ctaHref: string;
  /** Middle tier — “Most Common” */
  featured?: boolean;
  badge?: string;
};

export const PRICING_TIERS: readonly PricingTier[] = [
  {
    id: "starter",
    title: "Starter SEO Site",
    priceLabel: "Starting at $400",
    description:
      "A clean 3-page basic SEO website for small businesses that need to look legitimate, explain their services, and make it easy for customers to contact them.",
    includes: [
      "3-page basic SEO website",
      "Mobile-friendly design",
      "Basic on-page SEO setup",
      "Contact form or contact section",
      "Clear service/contact structure",
    ],
    strongRecommendation: {
      title: "Google Business Profile setup",
      price: "$150 one-time",
    },
    bestNextStep:
      "Add monthly support so the website and Google Business Profile stay active, updated, and keep improving over time.",
    ctaLabel: "Get My Free Preview",
    ctaHref: publicFreeMockupFunnelHref,
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
    ctaHref: publicFreeMockupFunnelHref,
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
    ctaHref: publicFreeMockupFunnelHref,
  },
] as const;
