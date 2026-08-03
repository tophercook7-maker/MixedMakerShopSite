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

/**
 * No partner/affiliate resources are listed. The LendTrack AI funding-portal
 * referral was removed 2026-08-02 at Topher's request: we don't send people to
 * a lender for a payout. The plumbing stays so a genuinely useful partner could
 * be added later — but the bar is "I'd recommend this with no cut."
 */
export const PARTNER_RESOURCE_ENTRIES: readonly PartnerResourceEntry[] = [];

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
