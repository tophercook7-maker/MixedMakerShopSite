/**
 * Showcase projects: live client sites + product builds for Builds / Examples;
 * homepage uses a conversion-focused subset (see HOME_PAGE_FEATURED_ANALYTICS_IDS).
 */

export type ShowcaseKind = "live" | "concept";

export type ShowcaseProject = {
  title: string;
  /** Result-focused line — what the site helps do. */
  primaryLine: string;
  /** Optional supporting sentence for clarity. */
  context?: string;
  /** Small label for quick scanning (e.g. Local Service Business). */
  tag: string;
  showcaseKind: ShowcaseKind;
  previewSrc: string;
  previewAlt: string;
  hostname: string;
  url: string;
  analyticsId: string;
  objectPosition: string;
  imageClassName: string;
  primaryCtaIsExternal: boolean;
  /** Overrides default label from `showcaseKind` (e.g. “View Live Demo”). */
  primaryCtaLabel?: string;
};

export const LIVE_WEB_PROJECTS = [
  {
    title: "Fresh Cut Property Care",
    tag: "Local Service Business",
    showcaseKind: "live",
    primaryLine: "Clean, local service site built to turn visitors into estimate requests",
    context: "Focused on simple navigation, strong service sections, and clear contact flow.",
    previewSrc: "/images/showcase/freshcut-property-care.jpg",
    previewAlt: "Homepage preview of Fresh Cut Property Care — lawn care hero and call-to-action",
    hostname: "freshcutpropertycare.com",
    url: "https://freshcutpropertycare.com",
    analyticsId: "fresh_cut_property_care",
    objectPosition: "center top",
    imageClassName: "object-cover md:object-contain",
    primaryCtaIsExternal: true,
  },
  {
    title: "Deep Well Audio",
    tag: "Portfolio Site",
    showcaseKind: "live",
    primaryLine: "Simple, focused site designed to showcase work and build credibility",
    context: "Clean layout with emphasis on portfolio and easy contact.",
    previewSrc: "/images/showcase/deep-well-audio.jpg",
    previewAlt:
      "Homepage preview of Deep Well Audio — typography and hero art from the live music site",
    hostname: "deepwellaudio.com",
    url: "https://deepwellaudio.com",
    analyticsId: "deep_well_audio",
    objectPosition: "center top",
    imageClassName: "object-cover md:object-contain",
    primaryCtaIsExternal: true,
  },
  {
    title: "StrainSpotter",
    tag: "Product Build",
    showcaseKind: "live",
    primaryLine: "Web app built for a clear path from question to useful answers",
    context: "Product-style UI with room to grow — see Builds for the full story.",
    previewSrc: "/images/mixedmakershop-umbrella-brand-hero.png",
    previewAlt: "StrainSpotter — product-style web app build by Topher (placeholder scene until a dedicated screenshot is added)",
    hostname: "strainspotter.app",
    url: "https://strainspotter.replit.app",
    analyticsId: "strainspotter",
    objectPosition: "center center",
    imageClassName: "object-cover md:object-cover",
    primaryCtaIsExternal: true,
    primaryCtaLabel: "View Live Demo",
  },
] as const satisfies readonly ShowcaseProject[];

/** Henry AI — homepage featured #3; full write-up on Builds. Not duplicated in LIVE_WEB_PROJECTS so Builds “Web projects” row stays three sites. */
export const HENRY_AI_SHOWCASE_PROJECT = {
  title: "Henry AI",
  tag: "Concept Build",
  showcaseKind: "concept",
  primaryLine:
    "Example layout showing how a service business can look clean and trustworthy online",
  context: "Built to demonstrate structure, flow, and conversion-focused design.",
  previewSrc: "/images/mixedmaker-workspace-hero.png",
  previewAlt: "Henry AI — workspace and tools concept by Topher",
  hostname: "mixedmakershop.com",
  url: "/builds#build-spotlight-henry",
  analyticsId: "henry_ai",
  objectPosition: "center center",
  imageClassName: "object-cover md:object-cover",
  primaryCtaIsExternal: false,
} as const satisfies ShowcaseProject;

export type LiveWebProject = (typeof LIVE_WEB_PROJECTS)[number];
export type HenryAiShowcaseProject = typeof HENRY_AI_SHOWCASE_PROJECT;
export type AnyShowcaseProject = LiveWebProject | HenryAiShowcaseProject;

const showcaseCatalog: Record<string, AnyShowcaseProject> = {
  fresh_cut_property_care: LIVE_WEB_PROJECTS[0],
  deep_well_audio: LIVE_WEB_PROJECTS[1],
  strainspotter: LIVE_WEB_PROJECTS[2],
  henry_ai: HENRY_AI_SHOWCASE_PROJECT,
};

/** Default label for the first CTA (solid) — live site, demo, or example. */
export function getShowcasePrimaryCtaLabel(project: ShowcaseProject): string {
  if (project.primaryCtaLabel) return project.primaryCtaLabel;
  return project.showcaseKind === "concept" ? "View Example" : "View Live Site";
}

/** Default label for the second CTA (outline) — lead capture. */
export function getShowcaseSecondaryCtaLabel(project: ShowcaseProject): string {
  return project.showcaseKind === "concept" ? "Get My Version" : "Request Something Similar";
}

/** Small-business homepage: two trust-building client sites + one tools/systems example (no niche app). */
export const HOME_PAGE_FEATURED_ANALYTICS_IDS = [
  "fresh_cut_property_care",
  "deep_well_audio",
  "henry_ai",
] as const;

export function getShowcaseProjectsByAnalyticsIds(ids: readonly string[]): AnyShowcaseProject[] {
  return ids.map((id) => showcaseCatalog[id]).filter((p): p is AnyShowcaseProject => p != null);
}
