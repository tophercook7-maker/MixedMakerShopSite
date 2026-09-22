/**
 * Showcase projects: live client sites + product builds for Builds / Examples;
 * homepage uses a conversion-focused subset (see HOME_PAGE_FEATURED_ANALYTICS_IDS).
 */

import { publicFreeMockupFunnelHref, publicFreeMockupFunnelHrefFreshCut } from "@/lib/public-brand";

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
  /** Who the work was for — mini case study, shown under the title. */
  audienceLine?: string;
  /** Pain / goal before the main result line. */
  problemLine?: string;
  /** Short “why it works” line after `context`. */
  whyItWorksLine?: string;
  /** Portfolio proof statement shown on examples/proof cards. */
  proofLine?: string;
  /** Invite exploration / live demo after description (e.g. portfolio sites). */
  engagementLine?: string;
  /** Bullets inside “See how this was built” on case study cards. */
  buildHighlights?: readonly string[];
  /** Extra pill (e.g. Featured Project). */
  featuredBadge?: string;
  /** Ring / shadow emphasis on featured grids. */
  emphasizeCard?: boolean;
  /** Overrides second CTA label (e.g. Get My Version of This). */
  secondaryCtaLabel?: string;
  /** Overrides second CTA href (e.g. funnel with Fresh Cut query + `#free-mockup-start`). */
  secondaryCtaHref?: string;
};

export const LIVE_WEB_PROJECTS = [
  {
    title: "Fresh Cut Property Care",
    tag: "Local landscaping",
    showcaseKind: "live",
    audienceLine: "Built for a lawn care business in Hot Springs, Arkansas",
    problemLine: "They needed a clean, trustworthy site that made it easy for customers to request an estimate.",
    primaryLine: "Clean, local service site built to turn visitors into estimate requests",
    context: "Focused on simple navigation, strong service sections, and clear contact flow.",
    whyItWorksLine: "Designed to guide visitors toward contacting without confusion or clutter.",
    proofLine: "A real local service website built to turn visitors into estimate requests.",
    buildHighlights: [
      "Clear service sections",
      "Strong call-to-action placement",
      "Mobile-first layout",
      "Built for local search visibility",
    ],
    featuredBadge: "Featured Project",
    emphasizeCard: true,
    secondaryCtaLabel: "Get My Version of This",
    secondaryCtaHref: publicFreeMockupFunnelHrefFreshCut,
    previewSrc: "/images/freshcut-new.png",
    previewAlt: "Homepage preview of Fresh Cut Property Care — full lawn care website hero",
    hostname: "freshcutpropertycare.com",
    url: "https://freshcutpropertycare.com",
    analyticsId: "fresh_cut_property_care",
    objectPosition: "center center",
    imageClassName: "object-contain",
    primaryCtaIsExternal: true,
    primaryCtaLabel: "Visit Fresh Cut",
  },
  {
    title: "Let's Talk with Dee",
    tag: "Coaching & listening service",
    showcaseKind: "live",
    audienceLine: "Built for Deanna Kramar, a career coach and listener",
    problemLine: "She needed a warm, private place for people to book a conversation and pay without friction.",
    primaryLine: "A calm, friendly site that takes bookings and payments on its own",
    context: "Sessions from $25 to a monthly plan, Stripe checkout, and a booking flow that works from a phone.",
    whyItWorksLine: "The whole page is a conversation starter — one clear button, no clutter, and the offer is understood in five seconds.",
    proofLine: "A paid client site, live and taking bookings today.",
    buildHighlights: [
      "Booking and Stripe payments built in",
      "Mobile-first, one-thumb navigation",
      "Her own voice, not template copy",
      "Delivered and paid in full",
    ],
    secondaryCtaLabel: "Get My Version of This",
    previewSrc: "/images/showcase/lets-talk.jpg",
    previewAlt: "Homepage of lets-talk2.me — 'Tell me what's on your mind. I'm listening.' with a live chat preview",
    hostname: "lets-talk2.me",
    url: "https://lets-talk2.me",
    analyticsId: "lets_talk_dee",
    objectPosition: "center top",
    imageClassName: "object-cover md:object-contain",
    primaryCtaIsExternal: true,
    primaryCtaLabel: "Visit Let's Talk",
  },
  {
    title: "Maureen A. Cahill — Author & Executive Coach",
    tag: "Author & speaker site",
    showcaseKind: "live",
    audienceLine: "Built for a leadership author ahead of her October 2026 book launch",
    problemLine: "She needed a site that sells the book, captures readers' emails, and books speaking and coaching work.",
    primaryLine: "A five-page author site with a reader library, launch list, and speaker kit",
    context: "MailerLite email capture, reader resources gated behind a signup, FAQ and book markup so search engines and AI answers know who she is.",
    whyItWorksLine: "Ask a web-connected AI about a leadership book that uses Mahjong and it names her and cites this site.",
    proofLine: "A paid client site with email capture, analytics, and search markup built for a real launch.",
    buildHighlights: [
      "Reader resource library and free chapter capture",
      "MailerLite connected with her own domain authenticated",
      "Book, author and FAQ schema for search and AI answers",
      "Speaker kit with bio and press headshots",
    ],
    secondaryCtaLabel: "Get My Version of This",
    previewSrc: "/images/showcase/maureen-cahill.jpg",
    previewAlt: "Homepage of maureenacahill.com — 'Ancient Game. Modern Leadership.' over a dark green Mahjong-tile design",
    hostname: "maureenacahill.com",
    url: "https://maureenacahill.com",
    analyticsId: "maureen_cahill",
    objectPosition: "center top",
    imageClassName: "object-cover md:object-contain",
    primaryCtaIsExternal: true,
    primaryCtaLabel: "Visit Maureen's site",
  },
  {
    title: "Deep Well Audio",
    tag: "Portfolio Site",
    showcaseKind: "live",
    audienceLine: "Creative audio platform and portfolio experience",
    primaryLine: "Simple, focused site designed to showcase content and build credibility.",
    context: "Structured to make exploration easy and keep users engaged.",
    proofLine: "A clean content-driven experience with organized navigation and a polished creative feel.",
    engagementLine: "Explore the live experience to see how content and layout work together.",
    primaryCtaLabel: "Visit Deep Well Audio",
    secondaryCtaLabel: "Get My Version of This",
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
    previewSrc: "/images/showcase/strainspotter-scanner.png",
    previewAlt:
      "StrainSpotter — Scanner upload flow with photo tips and Garden tools section (product screenshot)",
    hostname: "strainspotter.app",
    url: "https://strainspotter.app",
    analyticsId: "strainspotter",
    objectPosition: "center center",
    imageClassName: "object-cover md:object-cover",
    primaryCtaIsExternal: true,
    primaryCtaLabel: "View Live Demo",
  },
] satisfies readonly ShowcaseProject[];

/** Henry AI — homepage featured #3; full write-up on Builds. Not duplicated in LIVE_WEB_PROJECTS so Builds “Web projects” row stays three sites. */
export const HENRY_AI_SHOWCASE_PROJECT = {
  title: "Henry AI",
  tag: "Concept Build",
  showcaseKind: "concept",
  primaryLine:
    "Example layout showing how a service business can look clean and trustworthy online",
  context: "Built to demonstrate structure, flow, and conversion-focused design.",
  previewSrc: "/images/showcase/henry-ai-home.png",
  previewAlt:
    "Henry AI — home screen with starter actions, modes, and workspace tools (product screenshot)",
  hostname: "mixedmakershop.com",
  url: "/builds#build-spotlight-henry",
  analyticsId: "henry_ai",
  objectPosition: "center center",
  imageClassName: "object-cover md:object-cover",
  primaryCtaIsExternal: false,
} satisfies ShowcaseProject;

export type LiveWebProject = ShowcaseProject;
export type HenryAiShowcaseProject = ShowcaseProject;
export type AnyShowcaseProject = ShowcaseProject;

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
  if (project.secondaryCtaLabel) return project.secondaryCtaLabel;
  return project.showcaseKind === "concept" ? "Get My Version" : "Request Something Similar";
}

/** Second CTA destination — Fresh Cut and other funnels can override. */
export function getShowcaseSecondaryCtaHref(project: ShowcaseProject): string {
  return project.secondaryCtaHref ?? publicFreeMockupFunnelHref;
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
