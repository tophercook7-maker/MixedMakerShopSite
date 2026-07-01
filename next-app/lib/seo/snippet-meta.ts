/**
 * Approximate SERP snippet limits (Google/Bing).
 * Titles often truncate ~60 chars; descriptions ~155–160.
 */
export const META_TITLE_SOFT_MAX = 60;
export const META_DESC_MAX = 155;

export function metaDescription(text: string, max = META_DESC_MAX): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  const cut = normalized.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = (lastSpace > 48 ? cut.slice(0, lastSpace) : cut).trimEnd();
  return `${base}…`;
}

/** Blog/listing titles: keep primary keyword phrase; brand comes from root template. */
export function blogPostTitle(articleTitle: string, max = META_TITLE_SOFT_MAX): string {
  const t = articleTitle.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 24 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
