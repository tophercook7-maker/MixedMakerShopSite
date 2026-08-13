import { getActiveClient } from "../data/clients";
import { getNicheConfig } from "../data/niches";
import type { ResolvedSite } from "../types/client";
import { deepMerge } from "./merge-content";

function defaultHomepage(
  businessName: string,
  niche: ReturnType<typeof getNicheConfig>,
  brandDescription: string,
) {
  return {
    heroHeadline: niche.heroHeadline,
    heroSubheadline: niche.heroSubheadline,
    coreOffer: niche.coreOffer,
    metaTitle: `${niche.siteTitle} | ${businessName}`,
    metaDescription: brandDescription,
    finalCtaTitle: `Ready to talk ${niche.businessTypeLabel}?`,
    finalCtaBody: niche.reviewPrompt,
  };
}

/** Merged niche defaults + active client — use across layouts and marketing pages. */
export function getResolvedSite(): ResolvedSite {
  const client = getActiveClient();
  const niche = getNicheConfig(client.nicheKey);

  const baseHome = defaultHomepage(client.businessName, niche, client.brandDescription);
  const homepage = deepMerge(baseHome, (client.homepage ?? {}) as Partial<typeof baseHome>);

  return {
    clientKey: client.key,
    nicheKey: client.nicheKey,
    niche,
    businessName: client.businessName,
    siteUrl: client.siteUrl,
    phone: client.phone,
    email: client.email,
    city: client.city,
    state: client.state,
    stateAbbr: client.stateAbbr,
    logoPath: client.logoPath,
    brandDescription: client.brandDescription,
    serviceAreaDescription: client.serviceAreaDescription,
    featuredServiceKeys: client.featuredServiceKeys ?? niche.defaultServices.slice(0, 3),
    socialLinks: client.socialLinks,
    estimateCtaLabel: client.estimateCtaLabel ?? niche.defaultCtaLabel,
    estimateCtaHref: client.estimateCtaHref ?? niche.defaultCtaHref,
    secondaryCtaLabel: client.secondaryCtaLabel ?? "Contact",
    secondaryCtaHref: client.secondaryCtaHref ?? "/contact",
    trustSellingPoints: client.trustSellingPoints ?? [...niche.trustPoints],
    homepage,
    colors: niche.primaryColorTheme,
  };
}

export function pageUrl(pathname: string): string {
  const base = getResolvedSite().siteUrl.replace(/\/$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}
