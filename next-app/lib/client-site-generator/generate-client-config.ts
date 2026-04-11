import { LOCATIONS } from "@astro-niche-pack/data/locations";
import { getNicheConfig, NICHE_BY_KEY } from "@astro-niche-pack/data/niches";
import { getServiceCatalog } from "@astro-niche-pack/data/services";
import type { ClientConfig } from "@astro-niche-pack/types/client";
import type { NicheKey } from "@astro-niche-pack/types/niche";
import type { ClientIntake, IntakeValidationIssue, PricingStyle } from "./intake-schema";
import { validateIntakePartial } from "./intake-schema";

export type GeneratedClientResult = {
  config: ClientConfig;
  exportName: string;
  localPageSlugs: string[];
  locationIds: string[];
  homepagePreview: {
    metaTitle: string;
    metaDescription: string;
    heroHeadline: string;
    heroSubheadline: string;
    coreOffer: string;
    finalCtaTitle: string;
    finalCtaBody: string;
  };
  selectedServicesResolved: { key: string; name: string }[];
  checklist: { done: string[]; todo: string[] };
  registerClientSnippet: string;
};

function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ");
}

export function resolveLocationIdsFromServiceAreas(intake: ClientIntake): { ids: string[]; unmatched: string[] } {
  const candidates = [intake.city, ...intake.serviceAreas];
  const seen = new Set<string>();
  const unmatched: string[] = [];

  const locByNorm = new Map<string, (typeof LOCATIONS)[number]>();
  for (const loc of LOCATIONS) {
    locByNorm.set(norm(loc.city), loc);
    locByNorm.set(norm(loc.id.replace(/-/g, " ")), loc);
  }

  for (const c of candidates) {
    const n = norm(c);
    if (!n) continue;
    const hit = locByNorm.get(n);
    if (hit) {
      seen.add(hit.id);
    } else {
      if (!unmatched.includes(c.trim())) unmatched.push(c.trim());
    }
  }

  return { ids: Array.from(seen), unmatched };
}

function escapeTsString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, "\\n");
}

function pricingStyleNote(style: PricingStyle, _nicheKey: NicheKey): string {
  const map: Record<PricingStyle, string> = {
    recurring: "Pricing is usually recurring or cadence-based — final numbers after a quick walkthrough.",
    volume: "Quotes are volume- and access-based — photos help us quote accurately.",
    inspection: "Starts with an inspection or walkthrough — scope before price.",
    bundle: "Common bundles available — we’ll align add-ons to your priorities.",
    estimate: "Estimate-driven — scope and surfaces determine the quote.",
    mixed: "Pricing depends on scope — we’ll recommend the simplest path after photos or a visit.",
  };
  return map[style] ?? map.mixed;
}

export function buildClientConfigFromIntake(intake: ClientIntake): GeneratedClientResult {
  const niche = getNicheConfig(intake.nicheKey);
  const catalog = getServiceCatalog(intake.nicheKey);

  for (const k of intake.selectedServices) {
    if (!catalog[k]) {
      throw new Error(`Unknown service key "${k}" for niche "${intake.nicheKey}". Check fresh-cut-property-care/src/data/services.`);
    }
  }

  const { ids: locationIds, unmatched } = resolveLocationIdsFromServiceAreas(intake);
  if (locationIds.length === 0) {
    throw new Error(
      `Could not map city/service areas to known locations. Unmatched: ${unmatched.join(", ") || "(none)"}. Use: ${LOCATIONS.map((l) => l.city).join(", ")}`,
    );
  }

  const featured = (intake.featuredServices.length ? intake.featuredServices : intake.selectedServices).filter((k) => catalog[k]);
  const socialLinks: { label: string; href: string }[] = [];
  if (intake.facebookUrl?.trim()) socialLinks.push({ label: "Facebook", href: intake.facebookUrl.trim() });
  if (intake.instagramUrl?.trim()) socialLinks.push({ label: "Instagram", href: intake.instagramUrl.trim() });
  if (intake.hasGoogleReviews && intake.googleReviewLink?.trim()) {
    socialLinks.push({ label: "Google reviews", href: intake.googleReviewLink.trim() });
  }

  const serviceAreaDescription =
    [intake.city, ...intake.serviceAreas.filter(Boolean)].join(", ") +
    (intake.stateAbbr ? `, ${intake.stateAbbr}` : "") +
    (unmatched.length ? ` (also: ${unmatched.join(", ")})` : "");

  const metaTitle = `${intake.businessName} | ${intake.city}, ${intake.stateAbbr}`;
  const metaDescription = `${intake.brandDescription} ${pricingStyleNote(intake.pricingStyle, intake.nicheKey)}`.trim();

  const config: ClientConfig = {
    key: intake.clientKey,
    nicheKey: intake.nicheKey,
    businessName: intake.businessName,
    siteUrl: intake.domain.replace(/\/$/, ""),
    phone: intake.primaryPhone,
    email: intake.primaryEmail,
    city: intake.city,
    state: intake.state,
    stateAbbr: intake.stateAbbr,
    logoPath: intake.logoPath,
    brandDescription: intake.brandDescription,
    serviceAreaDescription,
    featuredServiceKeys: featured.slice(0, 8),
    socialLinks: socialLinks.length ? socialLinks : undefined,
    estimateCtaLabel: intake.primaryCtaLabel,
    estimateCtaHref: intake.primaryCtaHref,
    secondaryCtaLabel: intake.secondaryCtaLabel,
    secondaryCtaHref: intake.secondaryCtaHref,
    trustSellingPoints: intake.trustPoints.length ? intake.trustPoints : [...niche.trustPoints],
    homepage: {
      heroHeadline: intake.heroHeadline || niche.heroHeadline,
      heroSubheadline: intake.heroSubheadline || niche.heroSubheadline,
      coreOffer: intake.offerText || niche.coreOffer,
      metaTitle,
      metaDescription,
      finalCtaTitle: `Ready to work with ${intake.businessName}?`,
      finalCtaBody: intake.reviewPrompt || niche.reviewPrompt,
    },
    localPagesMode: "generated",
    localSeoLocationIds: locationIds,
    localSeoServiceKeys: [...intake.selectedServices],
  };

  const localPageSlugs: string[] = [];
  for (const locId of locationIds) {
    const loc = LOCATIONS.find((l) => l.id === locId);
    if (!loc) continue;
    for (const sk of intake.selectedServices) {
      const svc = catalog[sk];
      if (!svc) continue;
      localPageSlugs.push(`${svc.slug}-${loc.slugSuffix}`);
    }
  }

  const selectedServicesResolved = intake.selectedServices
    .filter((k) => catalog[k])
    .map((k) => ({ key: k, name: catalog[k]!.serviceName }));

  const exportName = toCamelExportName(intake.clientKey);

  const checklist: GeneratedClientResult["checklist"] = {
    done: [
      "Client config object prepared",
      `Local SEO matrix: ${locationIds.length} location(s) × ${intake.selectedServices.length} service(s) = ${localPageSlugs.length} page(s)`,
      "Homepage hero + meta defaults prepared",
      "Service list + CTAs prepared",
    ],
    todo: [
      ...(intake.logoPath ? [] : ["Add real logo asset + logoPath"]),
      "Replace placeholder phone/email if needed",
      "Verify domain + DNS + SSL",
      "Add real project photos / before-afters",
      intake.hasGoogleReviews ? "Confirm Google review link works" : "Set up and link reviews when ready",
      "Finalize pricing copy on /pricing",
      "Embed contact form on /contact",
      `Generator notes: ${intake.notes?.trim() || "(none)"}`,
    ],
  };

  const registerClientSnippet = `// In fresh-cut-property-care/src/data/clients/index.ts — add:
import { ${exportName} } from "./${intake.clientKey}";
// inside CLIENTS:
  "${intake.clientKey}": ${exportName},`;

  return {
    config,
    exportName,
    localPageSlugs: Array.from(new Set(localPageSlugs)).sort(),
    locationIds,
    homepagePreview: {
      metaTitle,
      metaDescription,
      heroHeadline: config.homepage?.heroHeadline ?? "",
      heroSubheadline: config.homepage?.heroSubheadline ?? "",
      coreOffer: config.homepage?.coreOffer ?? "",
      finalCtaTitle: config.homepage?.finalCtaTitle ?? "",
      finalCtaBody: config.homepage?.finalCtaBody ?? "",
    },
    selectedServicesResolved,
    checklist,
    registerClientSnippet,
  };
}

function toCamelExportName(clientKey: string): string {
  return clientKey.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()).replace(/^(.)/, (m) => m.toLowerCase());
}

/** Emits a .ts file for `fresh-cut-property-care/src/data/clients/<clientKey>.ts`. */
export function formatClientConfigTsFile(intake: ClientIntake, result: GeneratedClientResult): string {
  const c = result.config;
  const lines: string[] = [];
  lines.push(`import type { ClientConfig } from "../../types/client";`);
  lines.push(``);
  lines.push(`/** Auto-generated by MixedMakerShop client-site generator — ${new Date().toISOString().slice(0, 10)} */`);
  if (intake.notes?.trim()) {
    lines.push(`/** Notes: ${escapeTsString(intake.notes.trim())} */`);
  }
  lines.push(`export const ${result.exportName}: ClientConfig = {`);
  lines.push(`  key: "${escapeTsString(c.key)}",`);
  lines.push(`  nicheKey: "${c.nicheKey}",`);
  lines.push(`  businessName: "${escapeTsString(c.businessName)}",`);
  lines.push(`  siteUrl: "${escapeTsString(c.siteUrl)}",`);
  lines.push(`  phone: "${escapeTsString(c.phone)}",`);
  lines.push(`  email: "${escapeTsString(c.email)}",`);
  lines.push(`  city: "${escapeTsString(c.city)}",`);
  lines.push(`  state: "${escapeTsString(c.state)}",`);
  lines.push(`  stateAbbr: "${escapeTsString(c.stateAbbr)}",`);
  if (c.logoPath) lines.push(`  logoPath: "${escapeTsString(c.logoPath)}",`);
  lines.push(`  brandDescription:`);
  lines.push(`    "${escapeTsString(c.brandDescription)}",`);
  lines.push(`  serviceAreaDescription:`);
  lines.push(`    "${escapeTsString(c.serviceAreaDescription)}",`);
  if (c.featuredServiceKeys?.length) {
    lines.push(`  featuredServiceKeys: [${c.featuredServiceKeys.map((k) => `"${escapeTsString(k)}"`).join(", ")}],`);
  }
  if (c.socialLinks?.length) {
    lines.push(`  socialLinks: [`);
    for (const s of c.socialLinks) {
      lines.push(`    { label: "${escapeTsString(s.label)}", href: "${escapeTsString(s.href)}" },`);
    }
    lines.push(`  ],`);
  }
  lines.push(`  estimateCtaLabel: "${escapeTsString(c.estimateCtaLabel ?? "")}",`);
  lines.push(`  estimateCtaHref: "${escapeTsString(c.estimateCtaHref ?? "")}",`);
  lines.push(`  secondaryCtaLabel: "${escapeTsString(c.secondaryCtaLabel ?? "")}",`);
  lines.push(`  secondaryCtaHref: "${escapeTsString(c.secondaryCtaHref ?? "")}",`);
  lines.push(`  trustSellingPoints: [`);
  for (const t of c.trustSellingPoints ?? []) lines.push(`    "${escapeTsString(t)}",`);
  lines.push(`  ],`);
  lines.push(`  homepage: {`);
  if (c.homepage?.heroHeadline) lines.push(`    heroHeadline: "${escapeTsString(c.homepage.heroHeadline)}",`);
  if (c.homepage?.heroSubheadline) lines.push(`    heroSubheadline: "${escapeTsString(c.homepage.heroSubheadline)}",`);
  if (c.homepage?.coreOffer) lines.push(`    coreOffer: "${escapeTsString(c.homepage.coreOffer)}",`);
  if (c.homepage?.metaTitle) lines.push(`    metaTitle: "${escapeTsString(c.homepage.metaTitle)}",`);
  if (c.homepage?.metaDescription) lines.push(`    metaDescription: "${escapeTsString(c.homepage.metaDescription)}",`);
  if (c.homepage?.finalCtaTitle) lines.push(`    finalCtaTitle: "${escapeTsString(c.homepage.finalCtaTitle)}",`);
  if (c.homepage?.finalCtaBody) lines.push(`    finalCtaBody: "${escapeTsString(c.homepage.finalCtaBody)}",`);
  lines.push(`  },`);
  lines.push(`  localPagesMode: "generated",`);
  lines.push(`  localSeoLocationIds: [${(c.localSeoLocationIds ?? []).map((id) => `"${id}"`).join(", ")}],`);
  lines.push(`  localSeoServiceKeys: [${(c.localSeoServiceKeys ?? []).map((k) => `"${k}"`).join(", ")}],`);
  lines.push(`};`);
  lines.push(``);
  return lines.join("\n");
}

export function buildIntakeFromNicheDefaults(partial: Partial<ClientIntake> & { nicheKey: NicheKey }): ClientIntake {
  const niche = getNicheConfig(partial.nicheKey);
  const catalog = getServiceCatalog(partial.nicheKey);
  const defaultServices = niche.defaultServices.filter((k) => catalog[k]).slice(0, 4);
  const city = partial.city ?? "Hot Springs";
  const state = partial.state ?? "Arkansas";
  const stateAbbr = partial.stateAbbr ?? "AR";

  const selected =
    partial.selectedServices && partial.selectedServices.length > 0 ? partial.selectedServices : defaultServices;
  const featured =
    partial.featuredServices && partial.featuredServices.length > 0 ? partial.featuredServices : selected;

  return {
    clientKey: partial.clientKey ?? "new-client",
    businessName: partial.businessName ?? "Your Business Name",
    domain: partial.domain ?? "https://example.com",
    nicheKey: partial.nicheKey,
    primaryPhone: partial.primaryPhone ?? "(501) 555-0000",
    primaryEmail: partial.primaryEmail ?? "hello@example.com",
    city,
    state,
    stateAbbr,
    serviceAreas: partial.serviceAreas?.length ? partial.serviceAreas : ["Hot Springs Village", "Lake Hamilton"],
    featuredServices: featured,
    selectedServices: selected,
    primaryCtaLabel: partial.primaryCtaLabel ?? niche.defaultCtaLabel,
    primaryCtaHref: partial.primaryCtaHref ?? niche.defaultCtaHref,
    secondaryCtaLabel: partial.secondaryCtaLabel ?? "Pricing",
    secondaryCtaHref: partial.secondaryCtaHref ?? "/pricing",
    heroHeadline: partial.heroHeadline ?? niche.heroHeadline,
    heroSubheadline: partial.heroSubheadline ?? niche.heroSubheadline,
    brandDescription:
      partial.brandDescription ??
      `${partial.businessName ?? "We"} provide ${niche.businessTypeLabel} in ${city}, ${stateAbbr} with clear scopes and easy estimate requests.`,
    trustPoints: partial.trustPoints?.length ? partial.trustPoints : [...niche.trustPoints],
    reviewPrompt: partial.reviewPrompt ?? niche.reviewPrompt,
    offerText: partial.offerText ?? niche.coreOffer,
    pricingStyle: partial.pricingStyle ?? inferPricingStyleFromNiche(partial.nicheKey),
    hasGoogleReviews: partial.hasGoogleReviews ?? false,
    googleReviewLink: partial.googleReviewLink,
    facebookUrl: partial.facebookUrl,
    instagramUrl: partial.instagramUrl,
    logoPath: partial.logoPath,
    notes: partial.notes,
  };
}

function inferPricingStyleFromNiche(key: NicheKey): PricingStyle {
  const n = NICHE_BY_KEY[key];
  const e = n.pricingTiers[0]?.emphasis;
  if (e === "volume" || e === "inspection" || e === "bundle" || e === "recurring" || e === "estimate") return e;
  return "estimate";
}

export function validateFullIntake(intake: ClientIntake): IntakeValidationIssue[] {
  const issues = validateIntakePartial(intake);
  if (!NICHE_BY_KEY[intake.nicheKey]) {
    issues.push({ path: "nicheKey", message: `Unknown niche "${intake.nicheKey}"` });
  }
  const { ids } = resolveLocationIdsFromServiceAreas(intake);
  if (ids.length === 0) {
    issues.push({
      path: "city",
      message: `Could not map city/service areas to known locations. Use: ${LOCATIONS.map((l) => l.city).join(", ")}`,
    });
  }
  return issues;
}
