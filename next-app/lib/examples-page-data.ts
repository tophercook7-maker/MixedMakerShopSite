/**
 * Examples page (/examples): conversion-focused — real client work vs concepts/demos.
 * Keeps portfolio samples, website-samples hub entries, and showcase assets in sync.
 */

import { PORTFOLIO_SAMPLES } from "@/lib/portfolio-samples";
import { HENRY_AI_SHOWCASE_PROJECT, LIVE_WEB_PROJECTS } from "@/lib/live-web-projects";
import type { ShowcaseProject } from "@/lib/live-web-projects";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";
import { SAMPLE_CATEGORIES, WEBSITE_SAMPLES, type SampleCategory } from "@/lib/website-samples";

/** Live client sites only (not demos or product concepts). */
export type ExamplesRealWorkEntry = {
  project: ShowcaseProject;
  badge: string;
  /** Shown next to badge — e.g. Service Business, Portfolio */
  industry?: string;
};

export const EXAMPLES_REAL_WORK: readonly ExamplesRealWorkEntry[] = [
  {
    project: LIVE_WEB_PROJECTS[0],
    badge: "Real Client Work",
    industry: "Service Business",
  },
  {
    project: LIVE_WEB_PROJECTS[1],
    badge: "Real Client Work",
    industry: "Portfolio / creative",
  },
];

export type ExamplesConceptCard = {
  id: string;
  title: string;
  tag: string;
  primaryLine: string;
  context?: string;
  proofLine?: string;
  previewSrc: string;
  previewAlt: string;
  href: string;
  isExternal: boolean;
  primaryCtaLabel: string;
  /** Second button — defaults to “Get My Free Preview” on /free-mockup */
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  objectPosition?: string;
  imageClassName?: string;
};

function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

function henryConcept(): ExamplesConceptCard {
  const p = HENRY_AI_SHOWCASE_PROJECT;
  return {
    id: p.analyticsId,
    title: p.title,
    tag: "Concept Build",
    primaryLine: p.primaryLine,
    context: p.context,
    previewSrc: p.previewSrc,
    previewAlt: p.previewAlt,
    href: p.url,
    isExternal: false,
    primaryCtaLabel: "View Example",
    secondaryCtaLabel: "Get My Version",
    secondaryCtaHref: publicFreeMockupFunnelHref,
    objectPosition: p.objectPosition,
    imageClassName: p.imageClassName,
  };
}

/** Product-style demo — framed as concept, not a paying client site. */
function strainspotterConcept(): ExamplesConceptCard {
  const p = LIVE_WEB_PROJECTS[2];
  return {
    id: p.analyticsId,
    title: p.title,
    tag: "Product Build",
    primaryLine: "Product-style app concept showing a clean path from question to useful answers.",
    context: "Built to show structured UX, clarity, and scalable interface thinking.",
    proofLine:
      "An app-style project with interactive flow, scanning-focused UX, and practical digital-tool structure.",
    previewSrc: p.previewSrc,
    previewAlt: p.previewAlt,
    href: p.url,
    isExternal: true,
    primaryCtaLabel: "Visit StrainSpotter",
    secondaryCtaLabel: "Ask About Something Similar",
    secondaryCtaHref: publicFreeMockupFunnelHref,
    objectPosition: p.objectPosition,
    imageClassName: p.imageClassName,
  };
}

function quoteCalculatorConcept(): ExamplesConceptCard {
  return {
    id: "quote-calculator-sample",
    title: "Instant quote & estimator-style tools",
    tag: "Concept Build",
    primaryLine: "Shows how quote flows and rough estimates can qualify leads before they call",
    context: "Walkthrough-style page — pairs well with service and trade sites.",
    previewSrc: "/images/mixedmaker-workspace-hero.png",
    previewAlt: "Concept — instant quote and estimator tools for local businesses",
    href: "/samples/quote-calculator",
    isExternal: false,
    primaryCtaLabel: "View sample",
    secondaryCtaLabel: "Get My Free Preview",
    secondaryCtaHref: publicFreeMockupFunnelHref,
    objectPosition: "center center",
    imageClassName: "object-cover",
  };
}

const NICHE_TOPIC_PAGES: ExamplesConceptCard[] = [
  {
    id: "coffee-shop-hot-springs",
    title: "Coffee shop websites — Hot Springs",
    tag: "Concept · Local topic",
    primaryLine: "How coffee shops get menu, hours, and vibe to convert mobile searchers",
    context: "Industry-focused guidance with paths into layout demos.",
    previewSrc: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
    previewAlt: "Coffee shop interior — local website topic page",
    href: "/coffee-shop-websites-hot-springs",
    isExternal: false,
    primaryCtaLabel: "Read page",
    secondaryCtaHref: publicFreeMockupFunnelHref,
    objectPosition: "center center",
    imageClassName: "object-cover",
  },
  {
    id: "restaurant-hot-springs",
    title: "Restaurant websites — Hot Springs",
    tag: "Concept · Local topic",
    primaryLine: "Reservations, menus, and catering paths built for real dinner-hour traffic",
    context: "Pairs with the restaurant layout demos in this section.",
    previewSrc: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
    previewAlt: "Restaurant dining — local website topic page",
    href: "/restaurant-websites-hot-springs",
    isExternal: false,
    primaryCtaLabel: "Read page",
    secondaryCtaHref: publicFreeMockupFunnelHref,
    objectPosition: "center center",
    imageClassName: "object-cover",
  },
  {
    id: "church-hot-springs",
    title: "Church websites — Hot Springs",
    tag: "Concept · Local topic",
    primaryLine: "Plan a visit, ministries, and clarity for first-time guests",
    context: "Works alongside the church layout concepts in the library.",
    previewSrc: "https://images.unsplash.com/photo-1465848059293-208e11dfea17?auto=format&fit=crop&w=900&q=80",
    previewAlt: "Church sanctuary — local website topic page",
    href: "/church-websites-hot-springs",
    isExternal: false,
    primaryCtaLabel: "Read page",
    secondaryCtaHref: publicFreeMockupFunnelHref,
    objectPosition: "center center",
    imageClassName: "object-cover",
  },
  {
    id: "small-business-hot-springs",
    title: "Small business websites — Hot Springs",
    tag: "Concept · Local topic",
    primaryLine: "Credible positioning and calls-to-action for local owners",
    context: "Entry point when industry-specific pages don’t fit yet.",
    previewSrc: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
    previewAlt: "Small business workspace — local website topic page",
    href: "/small-business-websites-hot-springs",
    isExternal: false,
    primaryCtaLabel: "Read page",
    secondaryCtaHref: publicFreeMockupFunnelHref,
    objectPosition: "center center",
    imageClassName: "object-cover",
  },
  {
    id: "web-design-hot-springs-ar",
    title: "Web design — Hot Springs, AR",
    tag: "Concept · Local topic",
    primaryLine: "What local businesses get when they need a site that actually performs",
    context: "SEO landing page — links out to examples and contact.",
    previewSrc: "/images/mixedmakershop-umbrella-brand-hero.png",
    previewAlt: "Web design services in Hot Springs Arkansas",
    href: "/web-design-hot-springs-ar",
    isExternal: false,
    primaryCtaLabel: "Read page",
    secondaryCtaHref: publicFreeMockupFunnelHref,
    objectPosition: "center center",
    imageClassName: "object-cover",
  },
];

function portfolioConcepts(): ExamplesConceptCard[] {
  return PORTFOLIO_SAMPLES.map((p) => ({
    id: `portfolio-${p.routeSlug}`,
    title: p.title,
    tag: `Concept Build · ${p.category}`,
    primaryLine: p.description,
    previewSrc: p.cardImageUrl,
    previewAlt: `${p.title} — layout demo thumbnail`,
    href: `/samples/${p.routeSlug}`,
    isExternal: false,
    primaryCtaLabel: "View layout demo",
    secondaryCtaLabel: "Get My Free Preview",
    secondaryCtaHref: publicFreeMockupFunnelHref,
    objectPosition: "center center",
    imageClassName: "object-cover",
  }));
}

function categoryLabel(cat: SampleCategory): string {
  return SAMPLE_CATEGORIES.find((c) => c.id === cat)?.label ?? "Samples";
}

function websiteSampleConcepts(): ExamplesConceptCard[] {
  return WEBSITE_SAMPLES.map((s) => {
    const href = s.externalHref ?? `/website-samples/${s.slug}`;
    const external = isExternalHref(href);
    return {
      id: `website-sample-${s.slug}`,
      title: s.name,
      tag: `Concept · ${categoryLabel(s.category)}`,
      primaryLine: s.desc,
      previewSrc: s.imageUrl ?? "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
      previewAlt: `${s.name} — website layout concept`,
      href,
      isExternal: external,
      primaryCtaLabel: external ? "Open link" : "View example",
      secondaryCtaLabel: "Get My Free Preview",
      secondaryCtaHref: publicFreeMockupFunnelHref,
      objectPosition: "center center",
      imageClassName: "object-cover",
    };
  });
}

/**
 * Concept builds: Henry → StrainSpotter → quote tool → trade layout demos → website-samples library → local topic pages.
 * (StrainSpotter is a live demo URL but framed as a product/concept build, not paid client web design.)
 */
export const EXAMPLES_CONCEPT_BUILDS: ExamplesConceptCard[] = [
  henryConcept(),
  strainspotterConcept(),
  quoteCalculatorConcept(),
  ...portfolioConcepts(),
  ...websiteSampleConcepts(),
  ...NICHE_TOPIC_PAGES,
];
