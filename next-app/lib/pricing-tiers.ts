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
    title: "Starter Setup",
    priceLabel: "Starting at $400",
    description:
      "A clean 1-page mobile-friendly website with click-to-call, a contact form, and basic Google setup — built to bring in calls.",
    includes: [
      "1-page clean website",
      "Mobile-friendly design",
      "Click-to-call button",
      "Contact / quote form",
      "Basic Google setup",
      "Live within 5 business days",
      "Monthly Hosting & Support from $89/mo",
    ],
    strongRecommendation: {
      title: "Google Business Profile setup",
      price: "$250 one-time",
    },
    bestNextStep:
      "Pair it with Starter Visibility Support so the site and Google Business Profile do not sit untouched after launch.",
    ctaLabel: "Get My Free Preview",
    ctaHref: publicFreeMockupFunnelHref,
  },
  {
    id: "growth",
    title: "Growth Site",
    priceLabel: "$900 – $1,800",
    description:
      "For businesses that want a stronger site plus a practical local growth foundation: clearer services, better lead paths, and more room to build trust.",
    includes: [
      "Multi-page website",
      "Service-focused pages",
      "Conversion-focused structure",
      "Local SEO basics",
      "Contact/lead path setup",
      "Google Business Profile guidance",
      "Faster performance basics",
      "Best paired with $89/mo Hosting & Support",
    ],
    bestNextStep:
      "Choose this when the site needs to do more than exist: explain services clearly, support local visibility, and guide visitors toward contacting you.",
    ctaLabel: "Get My Free Preview",
    ctaHref: publicFreeMockupFunnelHref,
    featured: true,
    badge: "Most Common",
  },
  {
    id: "custom",
    title: "Custom Build",
    priceLabel: "Custom Quote",
    description:
      "For advanced sites, tools, automations, forms, client portals, AI helpers, or custom workflows that need planning before a real quote.",
    includes: [
      "Custom page structure",
      "Advanced forms or quote flows",
      "AI helper/bot options",
      "Integrations or automation planning",
      "Custom lead capture paths",
      "Ongoing support options",
      "Scalable structure for future additions",
    ],
    bestNextStep:
      "Start with a preview or conversation so Topher can map the real workflow, estimate the moving parts, and avoid guessing.",
    ctaLabel: "Start With a Preview",
    ctaHref: publicFreeMockupFunnelHref,
  },
] as const;
