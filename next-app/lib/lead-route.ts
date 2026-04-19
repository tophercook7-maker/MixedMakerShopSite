export function slugifyLeadName(value: string | null | undefined): string {
  const raw = String(value || "")
    .trim()
    .toLowerCase();
  if (!raw) return "lead";
  const normalized = raw
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "lead";
}

export function shortLeadId(leadId: string | null | undefined, length = 6): string {
  const raw = String(leadId || "").trim().toLowerCase();
  if (!raw) return "";
  const compact = raw.replace(/-/g, "");
  return compact.slice(0, Math.max(4, Math.min(12, length)));
}

export function buildLeadRouteToken(
  leadId: string | null | undefined,
  businessName: string | null | undefined
): string {
  const id = String(leadId || "").trim();
  if (!id) return "";
  const slug = slugifyLeadName(businessName);
  const short = shortLeadId(id);
  return short ? `${slug}-${short}` : id;
}

export function buildLeadPath(
  leadId: string | null | undefined,
  businessName: string | null | undefined
): string {
  void businessName;
  const id = String(leadId || "").trim();
  if (!id) return "/admin/crm/web";
  return `/admin/crm/web/${encodeURIComponent(id)}`;
}

/** 3D print job workspace (same `leads` row, separate admin surface). */
export function buildPrintLeadPath(leadId: string | null | undefined, businessName: string | null | undefined) {
  void businessName;
  const id = String(leadId || "").trim();
  if (!id) return "/admin/crm/print";
  return `/admin/crm/print/${encodeURIComponent(id)}`;
}

export function isUuidLike(value: string | null | undefined): boolean {
  const raw = String(value || "").trim().toLowerCase();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(raw);
}

export function parseLeadRouteToken(token: string | null | undefined): {
  normalizedToken: string;
  slug: string;
  shortId: string | null;
} {
  const normalizedToken = String(token || "").trim().toLowerCase();
  if (!normalizedToken) return { normalizedToken: "", slug: "", shortId: null };
  const parts = normalizedToken.split("-").filter(Boolean);
  const tail = parts.length ? parts[parts.length - 1] : "";
  if (/^[0-9a-f]{4,12}$/.test(tail)) {
    return {
      normalizedToken,
      slug: parts.slice(0, -1).join("-"),
      shortId: tail,
    };
  }
  return {
    normalizedToken,
    slug: normalizedToken,
    shortId: null,
  };
}

export function leadRouteMatches(
  token: string | null | undefined,
  leadId: string | null | undefined,
  businessName: string | null | undefined
): boolean {
  const input = String(token || "").trim().toLowerCase();
  const id = String(leadId || "").trim().toLowerCase();
  if (!input || !id) return false;
  if (input === id) return true;

  const expectedSlug = slugifyLeadName(businessName);
  const expectedShort = shortLeadId(id);
  const parsed = parseLeadRouteToken(input);

  if (parsed.shortId) {
    const slugMatches = parsed.slug ? parsed.slug === expectedSlug : true;
    const shortMatches = expectedShort.startsWith(parsed.shortId) || parsed.shortId.startsWith(expectedShort);
    return slugMatches && shortMatches;
  }
  return parsed.slug === expectedSlug;
}
