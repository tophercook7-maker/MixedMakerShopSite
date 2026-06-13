/** External partner / affiliate resources surfaced on the resource library. */
export type PartnerResourceEntry = {
  id: string;
  slug: string;
  title: string;
  description: string;
  whoItHelps: string;
  buttonText: string;
  /** Outbound partner URL (opens in a new tab). */
  href: string;
  disclosure: string;
};

export const PARTNER_RESOURCE_ENTRIES = [
  {
    id: "lendtrack-ai",
    slug: "lendtrack-ai-funding-portal",
    title: "LendTrack AI Funding Portal",
    description:
      "Need funding for the right project, business move, or opportunity? LendTrack AI helps connect qualified people with investors who are ready to fund the right deal.",
    whoItHelps:
      "Business owners, founders, and operators exploring funding for a specific project, expansion, or opportunity — not a generic loan tracker.",
    buttonText: "Explore Funding Options",
    href: "https://lendtrack.ai/partner/topher",
    disclosure:
      "This is a partner link. I may receive a referral payout when a completed transaction qualifies.",
  },
] as const satisfies readonly PartnerResourceEntry[];

const bySlug = new Map<string, PartnerResourceEntry>(
  PARTNER_RESOURCE_ENTRIES.map((entry) => [entry.slug, entry]),
);

export function getPartnerResourceBySlug(slug: string): PartnerResourceEntry | undefined {
  return bySlug.get(slug);
}

export function listPartnerResourceSlugs(): string[] {
  return PARTNER_RESOURCE_ENTRIES.map((entry) => entry.slug);
}

export function getPartnerResourceById(id: string): PartnerResourceEntry | undefined {
  return PARTNER_RESOURCE_ENTRIES.find((entry) => entry.id === id);
}

export function partnerResourcePath(slug: string): string {
  return `/resources/${slug}`;
}

/** Primary LendTrack partner page — linked from nav as “Get a Loan”. */
export const LENDTRACK_FUNDING_PORTAL_PATH = partnerResourcePath(PARTNER_RESOURCE_ENTRIES[0].slug);
