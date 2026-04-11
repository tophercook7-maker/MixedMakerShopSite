import { getActiveClient } from "../data/clients";
import { getNicheConfig } from "../data/niches";
import { getLocationDefinition } from "../data/locations";
import { getServiceCatalog, getServiceDefinition } from "../data/services";
import type { NicheKey } from "../types/niche";
import type { LocalPage } from "../types/local-seo";
import { EXPLICIT_LOCAL_PAGE_SETS } from "./explicit-local-pages";
import { buildLocalMetaDescription, buildLocalMetaTitle } from "./seo-meta";

function applyTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

function uniqFaq(pages: { question: string; answer: string }[]): { question: string; answer: string }[] {
  const seen = new Set<string>();
  const out: { question: string; answer: string }[] = [];
  for (const f of pages) {
    const k = f.question.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(f);
  }
  return out;
}

function generateLocalPages(): LocalPage[] {
  const client = getActiveClient();
  const niche = getNicheConfig(client.nicheKey);
  const catalog = getServiceCatalog(client.nicheKey);

  const locationIds = client.localSeoLocationIds ?? [...niche.defaultLocations];
  const serviceKeys = client.localSeoServiceKeys ?? [...niche.defaultServices];

  const pages: LocalPage[] = [];

  for (const locationId of locationIds) {
    const location = getLocationDefinition(locationId);
    for (const serviceKey of serviceKeys) {
      const service = getServiceDefinition(client.nicheKey, serviceKey);
      if (!service) continue;

      const slug = `${service.slug}-${location.slugSuffix}`;
      const vars = {
        businessName: client.businessName,
        city: location.city,
        stateAbbr: location.stateAbbr,
        serviceName: service.serviceName,
      };

      const introParts = [
        applyTemplate(niche.servicePageIntroTemplate, vars),
        service.longDescription,
        location.localNote ? `Local angle: ${location.localNote}` : "",
      ].filter(Boolean);

      const whatWeOffer = [
        service.shortDescription,
        ...niche.features.slice(0, 3),
        `Clear estimates — ${niche.pricingTiers[0]?.title.toLowerCase() ?? "scoped quotes"} for most properties`,
      ];

      const whyChooseUs = [...niche.trustPoints];
      const faq = uniqFaq([...niche.faqTemplates.slice(0, 2), ...service.faq]).slice(0, 5);

      const metaTitle = buildLocalMetaTitle(service.serviceName, location.city, location.stateAbbr, client.businessName);
      const metaDescription = buildLocalMetaDescription(
        service.serviceName.toLowerCase(),
        location.city,
        location.stateAbbr,
        client.businessName,
        service.seoVariants.descriptionHint,
      );

      pages.push({
        slug,
        serviceKey: service.serviceKey,
        nicheKey: client.nicheKey as NicheKey,
        serviceName: service.serviceName,
        city: location.city,
        state: location.state,
        stateAbbr: location.stateAbbr,
        locationId: location.id,
        nearbyAreas: [...location.nearbyAreas],
        intro: introParts.join(" "),
        metaTitle,
        metaDescription,
        whatWeOffer,
        whyChooseUs,
        commonJobs: service.commonJobs,
        faq,
        primaryCtaLabel: client.estimateCtaLabel ?? niche.defaultCtaLabel,
        primaryCtaHref: client.estimateCtaHref ?? niche.defaultCtaHref,
        secondaryCtaLabel: client.secondaryCtaLabel ?? "Pricing",
        secondaryCtaHref: client.secondaryCtaHref ?? "/pricing",
      });
    }
  }

  const seen = new Set<string>();
  for (const p of pages) {
    if (seen.has(p.slug)) throw new Error(`Duplicate generated slug: ${p.slug}`);
    seen.add(p.slug);
  }

  return pages;
}

function explicitLocalPages(): LocalPage[] {
  const client = getActiveClient();
  const key = client.explicitLocalPagesKey ?? client.key;
  const embedded = EXPLICIT_LOCAL_PAGE_SETS[key];
  if (!embedded) {
    throw new Error(`No explicit local pages registered for "${key}".`);
  }
  return embedded.map((p) => ({ ...p, nicheKey: client.nicheKey as NicheKey }));
}

/** Local SEO routes for the active client (explicit embedded sets or niche-aware generation). */
export function getLocalPagesForBuild(): LocalPage[] {
  const client = getActiveClient();
  if (client.localPagesMode === "explicit") {
    return explicitLocalPages();
  }
  return generateLocalPages();
}
