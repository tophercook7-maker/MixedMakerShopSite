import type { NicheKey } from "./niche";

export type FaqItem = {
  question: string;
  answer: string;
};

/**
 * One local SEO landing page. `serviceKey` / `locationId` are strings so the same engine
 * can serve every niche catalog.
 */
export type LocalPage = {
  slug: string;
  serviceKey: string;
  nicheKey?: NicheKey;
  /** Display name, e.g. "Lawn care" */
  serviceName: string;
  city: string;
  state: string;
  stateAbbr: string;
  locationId: string;
  /** Areas to mention under “Serving …” */
  nearbyAreas: string[];
  /** Defaults to “[ServiceName] in [City, ST]” if omitted */
  heroTitle?: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  whatWeOffer: string[];
  whyChooseUs: string[];
  commonJobs: string[];
  faq?: FaqItem[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};
