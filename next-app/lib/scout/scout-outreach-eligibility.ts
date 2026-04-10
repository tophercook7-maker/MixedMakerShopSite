/**
 * Scout rows that are immediately usable for Facebook-first outreach:
 * real business name, a real Facebook URL, and no standalone website on file.
 */

export type OutreachEligibilityRow = {
  business_name?: string | null;
  website_url?: string | null;
  has_website?: boolean | null;
  facebook_url?: string | null;
};

/** True when `raw` parses (or clearly reads) as a Facebook / Meta profile or page URL. */
export function isValidFacebookOutreachUrl(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  if (!/facebook\.|fb\.com|fb\.me|\.facebook\.com/i.test(s)) return false;
  try {
    const href = s.startsWith("http://") || s.startsWith("https://") ? s : `https://${s}`;
    const u = new URL(href);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "facebook.com" || host === "fb.com" || host === "fb.me" || host === "m.facebook.com") return true;
    if (host.endsWith(".facebook.com")) return true;
    return false;
  } catch {
    return /facebook\.|fb\.com|fb\.me/i.test(s);
  }
}

/** No non-empty website URL and not flagged as having a site. */
export function hasNoWebsiteOnRecord(row: OutreachEligibilityRow): boolean {
  if (row.has_website === true) return false;
  const web = String(row.website_url ?? "").trim();
  return web.length === 0;
}

/**
 * High-quality outreach target: named business, valid Facebook URL, no website on record.
 * Excludes phone-only / low-data rows (no Facebook to message).
 */
export function isOutreachReadyScoutRow(row: OutreachEligibilityRow): boolean {
  const name = String(row.business_name ?? "").trim();
  if (!name) return false;
  if (!hasNoWebsiteOnRecord(row)) return false;
  const fb = String(row.facebook_url ?? "").trim();
  if (!fb) return false;
  if (!isValidFacebookOutreachUrl(fb)) return false;
  return true;
}
