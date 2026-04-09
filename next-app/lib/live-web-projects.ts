/**
 * Showcase projects: live client sites + product builds for Builds page;
 * homepage uses a conversion-focused subset (see HOME_PAGE_FEATURED_ANALYTICS_IDS).
 */

/** Client and public web projects shown on Builds (Web projects row) — includes StrainSpotter, not Henry (Henry has its own section on Builds). */
export const LIVE_WEB_PROJECTS = [
  {
    title: "Fresh Cut Property Care",
    pitch:
      "Local service business site built to earn trust quickly and turn visitors into calls and leads.",
    previewSrc: "/images/showcase/freshcut-property-care.jpg",
    previewAlt: "Homepage preview of Fresh Cut Property Care — lawn care hero and call-to-action",
    hostname: "freshcutpropertycare.com",
    url: "https://freshcutpropertycare.com",
    analyticsId: "fresh_cut_property_care",
    objectPosition: "center top",
    imageClassName: "object-cover md:object-contain",
    primaryCtaIsExternal: true,
    primaryCtaLabel: "View live site",
  },
  {
    title: "Deep Well Audio",
    pitch: "Strong branding and design polish so a music business looks as established as it sounds.",
    previewSrc: "/images/showcase/deep-well-audio.jpg",
    previewAlt:
      "Homepage preview of Deep Well Audio — typography and hero art from the live music site",
    hostname: "deepwellaudio.com",
    url: "https://deepwellaudio.com",
    analyticsId: "deep_well_audio",
    objectPosition: "center top",
    imageClassName: "object-cover md:object-contain",
    primaryCtaIsExternal: true,
    primaryCtaLabel: "View live site",
  },
  {
    title: "StrainSpotter",
    pitch: "AI-assisted identification and discovery — a product-style web app (demo may move; see Builds for detail).",
    previewSrc: "/images/mixedmakershop-umbrella-brand-hero.png",
    previewAlt: "StrainSpotter — product-style web app build by Topher (placeholder scene until a dedicated screenshot is added)",
    hostname: "strainspotter.app",
    url: "https://strainspotter.replit.app",
    analyticsId: "strainspotter",
    objectPosition: "center center",
    imageClassName: "object-cover md:object-cover",
    primaryCtaIsExternal: true,
    primaryCtaLabel: "View live demo",
  },
] as const;

/** Henry AI — homepage featured #3; full write-up on Builds. Not duplicated in LIVE_WEB_PROJECTS so Builds “Web projects” row stays three sites. */
export const HENRY_AI_SHOWCASE_PROJECT = {
  title: "Henry AI",
  pitch:
    "An AI workspace concept focused on tools, workflows, and systems — for when your business needs smart builds, not just pages.",
  previewSrc: "/images/mixedmaker-workspace-hero.png",
  previewAlt: "Henry AI — workspace and tools concept by Topher",
  hostname: "mixedmakershop.com",
  url: "/builds#build-spotlight-henry",
  analyticsId: "henry_ai",
  objectPosition: "center center",
  imageClassName: "object-cover md:object-cover",
  primaryCtaIsExternal: false,
  primaryCtaLabel: "See Henry AI on Builds",
} as const;

export type LiveWebProject = (typeof LIVE_WEB_PROJECTS)[number];
export type HenryAiShowcaseProject = typeof HENRY_AI_SHOWCASE_PROJECT;
export type ShowcaseProject = LiveWebProject | HenryAiShowcaseProject;

const showcaseCatalog: Record<string, ShowcaseProject> = {
  fresh_cut_property_care: LIVE_WEB_PROJECTS[0],
  deep_well_audio: LIVE_WEB_PROJECTS[1],
  strainspotter: LIVE_WEB_PROJECTS[2],
  henry_ai: HENRY_AI_SHOWCASE_PROJECT,
};

/** Small-business homepage: two trust-building client sites + one tools/systems example (no niche app). */
export const HOME_PAGE_FEATURED_ANALYTICS_IDS = [
  "fresh_cut_property_care",
  "deep_well_audio",
  "henry_ai",
] as const;

export function getShowcaseProjectsByAnalyticsIds(ids: readonly string[]): ShowcaseProject[] {
  return ids.map((id) => showcaseCatalog[id]).filter((p): p is ShowcaseProject => p != null);
}
