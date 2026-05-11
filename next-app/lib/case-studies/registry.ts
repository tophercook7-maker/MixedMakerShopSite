export type CaseStudyRegistryEntry = {
  slug: string;
  title: string;
  subtitle: string;
  clientName: string;
  category: string;
  problem: string;
  approach: string;
  outcome: string;
  services: readonly string[];
  proofPoints: readonly string[];
  heroImageSrc: string;
  heroImageAlt: string;
  liveSiteUrl: string;
  liveSiteHostname: string;
};

export const CASE_STUDY_ENTRIES = [
  {
    slug: "fresh-cut-property-care",
    title: "A local landscaping site built for estimate requests",
    subtitle: "Clear structure, mobile-first layout, and CTAs that match how homeowners decide.",
    clientName: "Fresh Cut Property Care",
    category: "Local service · Landscaping",
    problem:
      "The business needed a credible first impression online — something that felt as intentional as the yards they maintain. Visitors had to understand services fast, trust the team on mobile, and know exactly how to request an estimate without hunting for contact info.",
    approach:
      "We prioritized a calm, service-forward layout: obvious navigation, scannable service sections, and contact paths repeated where decisions happen. Copy stayed plain-spoken and local. The experience was tuned for thumb-first browsing because most estimate requests start from a phone.",
    outcome:
      "The live site presents a polished, trustworthy face for the brand and guides visitors toward contacting for estimates — reducing friction between curiosity and a real conversation.",
    services: [
      "Small-business website structure",
      "Mobile-first layout and typography",
      "Service sections and trust cues",
      "Estimate-focused calls to action",
      "Local SEO foundations",
    ],
    proofPoints: [
      "Built for real estimate workflows — not generic brochureware.",
      "Designed around mobile discovery first.",
      "Clear pathway from services browse → contact.",
      "Live client site you can visit today.",
    ],
    heroImageSrc: "/images/freshcut-new.png",
    heroImageAlt: "Homepage preview of Fresh Cut Property Care — lawn care hero and services layout",
    liveSiteUrl: "https://freshcutpropertycare.com",
    liveSiteHostname: "freshcutpropertycare.com",
  },
] as const satisfies readonly CaseStudyRegistryEntry[];

const bySlug = new Map<string, CaseStudyRegistryEntry>(CASE_STUDY_ENTRIES.map((c) => [c.slug, c]));

export function getCaseStudyBySlug(slug: string): CaseStudyRegistryEntry | undefined {
  return bySlug.get(slug);
}

export function listCaseStudySlugs(): string[] {
  return CASE_STUDY_ENTRIES.map((c) => c.slug);
}
