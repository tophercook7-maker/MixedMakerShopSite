import type { ResolvedSite } from "../types/client";

/** Local service landing: `[Service] in [City, ST] | [Business]` */
export function buildLocalMetaTitle(serviceName: string, city: string, stateAbbr: string, businessName: string): string {
  return `${serviceName} in ${city}, ${stateAbbr} | ${businessName}`;
}

/** Default local meta description pattern — override per page when you need uniqueness. */
export function buildLocalMetaDescription(
  serviceNameLower: string,
  city: string,
  stateAbbr: string,
  businessName: string,
  hint?: string,
): string {
  const core = `Reliable ${serviceNameLower} in ${city}, ${stateAbbr}. ${businessName} provides practical, professional work with easy estimate requests.`;
  return hint ? `${core} ${hint}` : core;
}

export function buildHomeMeta(site: ResolvedSite): { title: string; description: string } {
  return {
    title: site.homepage.metaTitle,
    description: site.homepage.metaDescription,
  };
}
