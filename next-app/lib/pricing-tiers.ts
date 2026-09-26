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
    title: "Website — Everything Included",
    priceLabel: "$850",  // 2026-09-25: raised from $400; now bundles the promo video + GBP setup + setup help
    description:
      "A clean mobile-friendly website with click-to-call and a contact form, plus the promo video, full Google Business Profile setup, and account setup help — all in one flat price.",
    includes: [
      "Custom website, built for calls and leads",
      "Mobile-friendly design",
      "Click-to-call button",
      "Contact / quote form",
      "Promo video included",
      "Full Google Business Profile setup included",
      "Account setup help included",
      "Live within 5 business days",
      "Monthly Hosting & Support from $89/mo",
    ],
    bestNextStep:
      "Everything most small businesses need in one price — no add-ons to piece together.",
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
