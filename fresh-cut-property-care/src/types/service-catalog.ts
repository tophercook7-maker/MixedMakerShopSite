import type { FaqItem } from "./local-seo";

/** Per-niche service line item — used for homepage cards + local page generation. */
export type NicheServiceDefinition = {
  serviceKey: string;
  serviceName: string;
  /** URL segment before location suffix */
  slug: string;
  shortDescription: string;
  longDescription: string;
  commonJobs: string[];
  faq: FaqItem[];
  seoVariants: {
    titleVerb?: string;
    descriptionHint?: string;
  };
  ctaLabel: string;
};
