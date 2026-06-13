/**
 * Shared short summaries for /web-design “Pricing / packages” (links to full /pricing).
 * Prices and tier names must match the canonical source of truth in lib/pricing-tiers.ts
 * (Starter $400, Growth $900–$1,800, Custom quote). Do not drift these independently.
 */
export const WEB_DESIGN_PACKAGES = [
  {
    name: "Starter Setup",
    price: "Starting at $400",
    blurb: "A clean, simple site to look legit and make contact easy.",
  },
  {
    name: "Growth Site",
    price: "$900 – $1,800",
    blurb: "Stronger presence, service-focused pages, and structure built for leads.",
  },
  {
    name: "Custom Build",
    price: "Custom quote",
    blurb: "Tailored features, integrations, and support when you need more than a brochure site.",
  },
] as const;
