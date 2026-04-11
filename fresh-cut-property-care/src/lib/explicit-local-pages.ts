import type { LocalPage } from "../types/local-seo";
import { FRESH_CUT_LOCAL_PAGES } from "../data/local-pages/fresh-cut-embedded";

/** Embedded high-fidelity page sets keyed by `ClientConfig.explicitLocalPagesKey` / `client.key`. */
export const EXPLICIT_LOCAL_PAGE_SETS: Record<string, readonly LocalPage[]> = {
  "fresh-cut-property-care": FRESH_CUT_LOCAL_PAGES,
};
