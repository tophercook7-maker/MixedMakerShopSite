/** Anchor id for the inline quote form on /3d-printing — use for deep links and scroll CTAs. */
export const PRINTING_QUOTE_FORM_ID = "printing-quote-form";

export function printingQuoteHref(): string {
  return `#${PRINTING_QUOTE_FORM_ID}`;
}
