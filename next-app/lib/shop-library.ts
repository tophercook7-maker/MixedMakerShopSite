import raw from "./shop-library.json";

/**
 * The browsable library — everything a customer can order.
 *
 * Print-on-demand: nothing is printed until someone has paid for it. That means
 * the library can be far larger than anything held in stock, and no filament is
 * spent on a design that turns out not to sell.
 *
 * ── Licence, and why it's confirmed on demand ───────────────────────────────
 * Every item here came through the commercial-use filter, so it is CC0, CC-BY
 * or CC-BY-SA. Printables' Terms of Service put that licence on the whole
 * upload — the model files AND the photos — so the creator's photo can be shown
 * on the listing, with credit.
 *
 * What we do NOT know until someone checks the page is WHICH of the three it is,
 * and CC-BY / CC-BY-SA require naming the creator. So:
 *
 *   confirmed  → exact licence + creator recorded → orderable, buy button
 *   unconfirmed → shown in the library, but "ask me" instead of a buy button
 *
 * Confirming takes about thirty seconds on the model page. Doing it when a
 * customer actually wants the thing — rather than for 58 models up front — is
 * the same logic as not printing stock nobody has ordered.
 */

export type LibraryItem = {
  code: string;
  name: string;
  /** Creator and/or a short note. Free text as harvested. */
  by: string;
  /** Display price, e.g. "$29" or "$36 / 4". */
  price: string;
  cat: string;
  /** Source model page — the authority on licence and creator. */
  url: string;
  /** Creator's own photo. Empty when none was captured. */
  img: string;
  /** Exact licence, e.g. "CC BY 4.0". Confirmed against the Printables API. */
  lic: string;
  /** Canonical licence deed. */
  licUrl: string;
  /** Creator's public username — required by CC-BY and CC-BY-SA. */
  designer: string;
  /** Printables numeric model id. */
  modelId: string;
  /** False only for CC0, where credit is courtesy rather than obligation. */
  needsCredit: boolean;
  /** Integer cents. Sets are priced as the set. */
  priceCents: number;
  /** Ready-made credit line rendered on the product page. */
  attribution: string;
  /** True once the licence was confirmed. */
  ver: boolean;
};

export const LIBRARY: LibraryItem[] = raw as LibraryItem[];

export const LIBRARY_CATEGORIES: string[] = Array.from(
  new Set(LIBRARY.map((i) => i.cat))
);

export function libraryByCategory(): { cat: string; items: LibraryItem[] }[] {
  return LIBRARY_CATEGORIES.map((cat) => ({
    cat,
    items: LIBRARY.filter((i) => i.cat === cat),
  }));
}

export function findLibraryItem(code: string): LibraryItem | null {
  const key = String(code || "").trim().toUpperCase();
  if (!key) return null;
  return LIBRARY.find((i) => i.code.toUpperCase() === key) ?? null;
}

/** Orderable — licence, creator and price are all on file. */
export function isOrderable(item: LibraryItem): boolean {
  return Boolean(item.ver && item.lic && item.designer && item.priceCents > 0);
}

/** URL-safe slug for a library item, e.g. "va-01-spiral-vase-rose". */
export function itemSlug(item: LibraryItem): string {
  const name = item.name
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${item.code.toLowerCase()}-${name}`;
}

/** Accepts a full slug or a bare code ("VA-01"). */
export function findBySlugOrCode(value: string): LibraryItem | null {
  const v = String(value || "").trim().toLowerCase();
  if (!v) return null;
  const byCode = LIBRARY.find((i) => i.code.toLowerCase() === v);
  if (byCode) return byCode;
  return LIBRARY.find((i) => itemSlug(i) === v) ?? null;
}

export const LIBRARY_COUNT = LIBRARY.length;
export const ORDERABLE_COUNT = LIBRARY.filter(isOrderable).length;
