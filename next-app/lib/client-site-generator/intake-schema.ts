import type { NicheKey } from "@astro-niche-pack/types/niche";

/**
 * Intake model for the MixedMakerShop client-site generator (outputs Astro niche-pack `ClientConfig`).
 */
export type PricingStyle = "recurring" | "volume" | "inspection" | "bundle" | "estimate" | "mixed";

export type ClientIntake = {
  clientKey: string;
  businessName: string;
  domain: string;
  nicheKey: NicheKey;
  primaryPhone: string;
  primaryEmail: string;
  city: string;
  state: string;
  stateAbbr: string;
  serviceAreas: string[];
  featuredServices: string[];
  selectedServices: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  heroHeadline: string;
  heroSubheadline: string;
  brandDescription: string;
  trustPoints: string[];
  reviewPrompt: string;
  offerText: string;
  pricingStyle: PricingStyle;
  hasGoogleReviews: boolean;
  googleReviewLink?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  logoPath?: string;
  notes?: string;
};

export type IntakeValidationIssue = { path: string; message: string };

export function validateIntakePartial(raw: Partial<ClientIntake>): IntakeValidationIssue[] {
  const issues: IntakeValidationIssue[] = [];
  const req = ["clientKey", "businessName", "domain", "nicheKey", "primaryPhone", "primaryEmail", "city", "state", "stateAbbr"] as const;
  for (const k of req) {
    const v = raw[k];
    if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) {
      issues.push({ path: k, message: "Required" });
    }
  }
  if (raw.clientKey && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.clientKey)) {
    issues.push({ path: "clientKey", message: "Use lowercase kebab-case (letters, numbers, hyphens)" });
  }
  if (raw.domain && !/^https?:\/\//i.test(raw.domain)) {
    issues.push({ path: "domain", message: "Include scheme, e.g. https://example.com" });
  }
  if (raw.selectedServices && raw.selectedServices.length === 0) {
    issues.push({ path: "selectedServices", message: "Pick at least one service" });
  }
  if (raw.serviceAreas !== undefined && !Array.isArray(raw.serviceAreas)) {
    issues.push({ path: "serviceAreas", message: "Must be an array of strings" });
  }
  return issues;
}
