import type { FaqItem } from "./local-seo";

export type NicheKey =
  | "lawn-care"
  | "pressure-washing"
  | "landscaping"
  | "junk-removal"
  | "painting"
  | "roofing";

export type NicheColorTheme = {
  accent: string;
  accentDark: string;
  bg: string;
  ink: string;
  muted: string;
};

export type NichePricingTier = {
  title: string;
  description: string;
  emphasis?: "estimate" | "volume" | "inspection" | "bundle" | "recurring";
};

export type NicheProofEmphasis = "gallery" | "storm-insurance" | "speed" | "maintenance" | "results";

export type NicheConfig = {
  key: NicheKey;
  name: string;
  siteTitle: string;
  tagline: string;
  primaryColorTheme: NicheColorTheme;
  defaultCtaLabel: string;
  defaultCtaHref: string;
  contactGoalLabel: string;
  heroHeadline: string;
  heroSubheadline: string;
  coreOffer: string;
  reviewPrompt: string;
  /** Template for local service intros — supports {{serviceName}}, {{city}}, {{stateAbbr}}, {{businessName}} */
  servicePageIntroTemplate: string;
  faqTemplates: FaqItem[];
  commonProblems: string[];
  trustPoints: string[];
  beforeAfterLabels: { before: string; after: string };
  photoCategories: string[];
  defaultServices: string[];
  defaultLocations: string[];
  pricingTiers: NichePricingTier[];
  features: string[];
  businessTypeLabel: string;
  howItWorksSteps: string[];
  /** Homepage “services” grid — title + blurb */
  homepageServices: { title: string; description: string }[];
  proofEmphasis: NicheProofEmphasis;
  proofSectionTitle: string;
  proofSectionBody: string;
  /** Optional callouts surfaced by niche highlight sections */
  nicheNotes?: { title: string; body: string }[];
};
