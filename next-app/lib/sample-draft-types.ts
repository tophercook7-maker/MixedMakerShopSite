import type { SampleImageCategory } from "@/lib/sample-fallback-images";

export type SampleDraft = {
  businessName: string;
  tagline: string;
  localPositioning: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  heroHeadline: string;
  heroSub: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  offeringsTitle: string;
  offerings: Array<{ name: string; text: string; image?: string; imageAlt?: string }>;
  /** Extra photos for a dedicated gallery band */
  gallerySectionTitle?: string;
  galleryImages?: string[];
  /** Parallel to galleryImages — specific alt text when provided */
  galleryImageAlts?: string[];
  whyChooseTitle?: string;
  whyChooseBullets?: string[];
  aboutTitle: string;
  aboutText: string;
  trustTitle: string;
  trustQuotes: Array<{ quote: string; by: string }>;
  locationTitle: string;
  locationName: string;
  address: string;
  phone: string;
  hours: string[];
  contactEmail?: string;
  contactFacebookUrl?: string;
  /** Prominent contact / quote strip above footer */
  contactBandTitle?: string;
  contactBandSub?: string;
  /** Intro under offerings title — omit to use niche inference */
  servicesSectionLead?: string;
  /** Intro under gallery title */
  gallerySectionLead?: string;
  /** Top nav label for #services (e.g. Ministries for churches) */
  servicesNavLabel?: string;
  /** Church-style: link service cards to #contact instead of tel: */
  serviceCardsLinkToContact?: boolean;
  /** CTA label on service cards when serviceCardsLinkToContact */
  serviceCardContactCtaLabel?: string;
  finalTitle: string;
  finalSub: string;
  finalCta: string;
  /** Optional CTA under the about section (e.g. wellness booking). */
  aboutCtaLabel?: string;
};

export type SampleDraftStylePreset = "clean-modern" | "bold-premium" | "friendly-local" | "minimal-elegant";
export type SampleDraftColorPreset = "blue" | "green" | "dark" | "warm-neutral" | "bold-accent" | "wellness";

export type SampleDraftEmbedOptions = {
  /** Hide edit UI; keep presentation-only (e.g. public portfolio pages). */
  lockPresentation?: boolean;
  initialStylePreset?: SampleDraftStylePreset;
  initialColorPreset?: SampleDraftColorPreset;
  /** Hero secondary CTA target (e.g. `#services`, `/website-samples`). Default `/website-samples`. */
  secondaryHref?: string;
  /** Footer attribution line for portfolio samples. */
  portfolioFooter?: boolean;
  /** When `portfolioFooter` is true, overrides the default footer sentence. */
  portfolioFooterMessage?: string;
  /** Wider `.container` and hero layout (funnel + shareable mockups). */
  wideLayout?: boolean;
  /** Render About before testimonials / trust band (wellness-style story flow). */
  aboutBeforeTrust?: boolean;
  /** When true, show testimonial quotes above the numbered trust / support points. */
  testimonialsBeforeTrustBullets?: boolean;
  /** Hero → services → why us → CTA only (no gallery, about, testimonials band, or contact block). */
  simpleConversionLayout?: boolean;
  /** Replace internal “demo” helper copy with sendable portfolio tone. */
  portfolioCopy?: boolean;
  /** Explicit image fallback category (portfolio routes). Otherwise inferred from draft copy. */
  imageCategoryKey?: SampleImageCategory;
};
