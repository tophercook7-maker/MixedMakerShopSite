import type { NicheConfig, NicheKey } from "./niche";

/** Per-deploy business identity + overrides (see `src/data/clients/`). */
export type ClientConfig = {
  key: string;
  nicheKey: NicheKey;
  businessName: string;
  siteUrl: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  stateAbbr: string;
  logoPath?: string;
  brandDescription: string;
  /** Human-readable service area blurb for footers + contact meta */
  serviceAreaDescription: string;
  featuredServiceKeys?: string[];
  socialLinks?: { label: string; href: string }[];
  estimateCtaLabel?: string;
  estimateCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  trustSellingPoints?: string[];
  /** Shallow merge over niche homepage + SEO defaults */
  homepage?: Partial<HomepageOverrides>;
  localPagesMode: "explicit" | "generated";
  /** When mode === `generated` */
  localSeoLocationIds?: string[];
  localSeoServiceKeys?: string[];
  /** When mode === `explicit`, key into registry of embedded page arrays */
  explicitLocalPagesKey?: string;
};

export type HomepageOverrides = {
  heroHeadline?: string;
  heroSubheadline?: string;
  coreOffer?: string;
  metaTitle?: string;
  metaDescription?: string;
  finalCtaTitle?: string;
  finalCtaBody?: string;
};

/** Fully merged model for layouts + pages (niche defaults + client). */
export type ResolvedSite = {
  clientKey: string;
  nicheKey: NicheKey;
  niche: NicheConfig;
  businessName: string;
  siteUrl: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  stateAbbr: string;
  logoPath?: string;
  brandDescription: string;
  serviceAreaDescription: string;
  featuredServiceKeys?: string[];
  socialLinks?: { label: string; href: string }[];
  estimateCtaLabel: string;
  estimateCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  trustSellingPoints: string[];
  homepage: {
    heroHeadline: string;
    heroSubheadline: string;
    coreOffer: string;
    metaTitle: string;
    metaDescription: string;
    finalCtaTitle: string;
    finalCtaBody: string;
  };
  colors: NicheConfig["primaryColorTheme"];
};
