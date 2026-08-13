import type { NicheConfig } from "../types/niche";
import type { ResolvedSite } from "../types/client";

export type NicheHighlight = { title: string; body: string };

/** Optional blocks + proof emphasis for niche-specific marketing sections. */
export function getNicheHighlights(niche: NicheConfig): NicheHighlight[] {
  const notes = niche.nicheNotes ?? [];
  return notes.map((n) => ({ title: n.title, body: n.body }));
}

export function getProofSectionCopy(site: ResolvedSite): { title: string; body: string; labels: { before: string; after: string } } {
  const { niche } = site;
  return {
    title: niche.proofSectionTitle,
    body: niche.proofSectionBody,
    labels: niche.beforeAfterLabels,
  };
}

export function nicheProofEmphasis(niche: NicheConfig): NicheConfig["proofEmphasis"] {
  return niche.proofEmphasis;
}
