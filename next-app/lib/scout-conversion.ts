type ConversionInput = {
  business_name?: string | null;
  category?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  review_count?: number | null;
  issue_texts?: string[] | null;
  website_status?: string | null;
};

export type ConversionResult = {
  lead_score: number;
  has_website: boolean;
  website_quality: "good" | "bad";
  has_phone: boolean;
  has_email: boolean;
  visual_business: boolean;
  is_local_service: boolean;
  prioritized_category: boolean;
  why_this_lead: string;
  excluded: boolean;
  excluded_reason: string | null;
};

export const PRIORITY_CATEGORY_KEYWORDS = [
  "pressure wash",
  "pressure washing",
  "car detailing",
  "auto detail",
  "detailing",
  "landscap",
  "roof",
  "roofing",
  "hvac",
  "plumb",
  "plumbing",
];

const VISUAL_CATEGORY_KEYWORDS = [
  "pressure wash",
  "pressure washing",
  "detailing",
  "landscap",
];

const LOCAL_SERVICE_KEYWORDS = [
  "service",
  "repair",
  "contractor",
  "plumb",
  "hvac",
  "roof",
  "landscap",
  "detail",
  "washing",
  "cleaning",
  "lawn",
  "home",
  "local",
  "salon",
  "barber",
  "spa",
  "pet",
  "groom",
  "dentist",
  "chiropr",
  "bakery",
  "restaurant",
  "cafe",
  "boutique",
  "florist",
  "moving",
  "junk",
  "pest",
  "electric",
  "handyman",
  "flooring",
  "painting",
  "tree",
  "pool",
  "towing",
  "auto repair",
  "mechanic",
];

const ONLINE_ONLY_KEYWORDS = [
  "online only",
  "ecommerce",
  "e-commerce",
  "dropshipping",
  "saas",
  "software",
  "digital product",
  "online course",
];

const LARGE_BRAND_KEYWORDS = [
  "walmart",
  "target",
  "amazon",
  "mcdonald",
  "starbucks",
  "home depot",
  "lowe",
  "costco",
  "kroger",
  "corporate",
  "franchise",
  "chain",
];

const SMALL_BUSINESS_EXCLUDE_KEYWORDS = [
  "enterprise",
  "corporate",
  "franchise",
  "chain",
  "national brand",
  "big box",
  "amazon",
  "walmart",
  "target",
  "costco",
  "mcdonald",
  "starbucks",
  "home depot",
  "lowe",
  "saas",
  "software",
  "ecommerce",
  "e-commerce",
  "dropshipping",
  "online only",
  "digital product",
  "online course",
];

function hasAny(haystack: string, tokens: string[]): boolean {
  return tokens.some((token) => haystack.includes(token));
}

function normalizeText(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

function looksLikeSmallBusiness(category: string, businessName: string): boolean {
  const text = `${category} | ${businessName}`;
  if (!text.trim()) return true;
  return !hasAny(text, SMALL_BUSINESS_EXCLUDE_KEYWORDS);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreScoutLead(input: ConversionInput): ConversionResult {
  const businessName = normalizeText(input.business_name);
  const category = normalizeText(input.category);
  const website = String(input.website || "").trim();
  const websiteStatus = normalizeText(input.website_status);
  const issueText = (input.issue_texts || []).map((item) => normalizeText(item)).join(" | ");
  const reviewCount = Number(input.review_count || 0);
  const has_phone = Boolean(String(input.phone || "").trim());
  const has_email = Boolean(String(input.email || "").trim());
  const has_website = Boolean(website);
  const prioritized_category = hasAny(category, PRIORITY_CATEGORY_KEYWORDS);
  const visual_business = hasAny(category, VISUAL_CATEGORY_KEYWORDS);
  const is_local_service = hasAny(category, LOCAL_SERVICE_KEYWORDS);
  const onlineOnly = hasAny(`${category} | ${businessName}`, ONLINE_ONLY_KEYWORDS);
  const largeCorporate =
    hasAny(`${category} | ${businessName}`, LARGE_BRAND_KEYWORDS) || reviewCount > 500;
  const smallBusinessLike = looksLikeSmallBusiness(category, businessName);

  const hasBadWebsiteSignals =
    websiteStatus === "broken_website" ||
    websiteStatus === "outdated_website" ||
    websiteStatus === "mobile_layout_issue" ||
    websiteStatus === "missing_contact_page" ||
    websiteStatus === "facebook_only" ||
    issueText.includes("no clear cta") ||
    issueText.includes("missing call-to-action") ||
    issueText.includes("outdated") ||
    issueText.includes("not mobile") ||
    issueText.includes("mobile") ||
    issueText.includes("missing contact");

  const website_quality: "good" | "bad" = !has_website || hasBadWebsiteSignals ? "bad" : "good";

  let lead_score = 0;
  if (!has_website) lead_score += 30;
  if (has_website && website_quality === "bad") lead_score += 25;
  if (has_phone) lead_score += 20;
  if (has_email) lead_score += 10;
  if (reviewCount >= 5 && reviewCount <= 100) lead_score += 15;
  if (prioritized_category) lead_score += 10;
  if (is_local_service) lead_score += 10;
  if (smallBusinessLike) lead_score += 10;

  const whyParts: string[] = [];
  if (!has_website) whyParts.push("No website");
  else if (website_quality === "bad") whyParts.push("Outdated/weak website");
  if (reviewCount > 0) whyParts.push(`${reviewCount} reviews`);
  if (has_phone) whyParts.push("has phone");
  if (has_email) whyParts.push("has email");
  if (prioritized_category) whyParts.push("target category");
  if (is_local_service) whyParts.push("local service");
  if (smallBusinessLike) whyParts.push("small business");

  const why_this_lead =
    whyParts.length > 0 ? whyParts.join(" + ") : "Contactable small business opportunity";

  const excluded = onlineOnly || largeCorporate || !smallBusinessLike;
  const excluded_reason = onlineOnly
    ? "online_only"
    : largeCorporate
      ? "large_corporate"
      : !smallBusinessLike
        ? "not_small_business"
        : null;

  return {
    lead_score: clampScore(lead_score),
    has_website,
    website_quality,
    has_phone,
    has_email,
    visual_business,
    is_local_service,
    prioritized_category,
    why_this_lead,
    excluded,
    excluded_reason,
  };
}

function isFacebookHost(host: string): boolean {
  const h = host.toLowerCase();
  return h.includes("facebook.") || h.endsWith("fb.com") || h.includes("fb.com");
}

/**
 * Scout intake: targets local small businesses with no standalone website
 * (or Facebook-only presence), plus phone/email.
 * Priority trade/service categories still score higher, but are no longer required.
 */
export function evaluateScoutIntakeTarget(input: {
  category?: string | null;
  business_name?: string | null;
  website?: string | null;
  facebookUrl?: string | null;
  phone?: string | null;
  email?: string | null;
}): {
  ok: boolean;
  skipReason: string | null;
  intakeReason: string | null;
  prioritized_category: boolean;
} {
  const category = normalizeText(input.category);
  const businessName = normalizeText(input.business_name);
  const smallBusinessLike = looksLikeSmallBusiness(category, businessName);
  const onlineOnlyCategory = hasAny(`${category} | ${businessName}`, ONLINE_ONLY_KEYWORDS);
  const clearlyLargeBrandCategory = hasAny(`${category} | ${businessName}`, LARGE_BRAND_KEYWORDS);
  const prioritized_category = hasAny(category, PRIORITY_CATEGORY_KEYWORDS);
  const has_phone = Boolean(String(input.phone || "").trim());
  const has_email = Boolean(String(input.email || "").trim());

  if (!has_phone && !has_email) {
    return { ok: false, skipReason: "missing_contact", intakeReason: null, prioritized_category };
  }

  if (onlineOnlyCategory) {
    return { ok: false, skipReason: "online_only", intakeReason: null, prioritized_category };
  }

  if (clearlyLargeBrandCategory || !smallBusinessLike) {
    return { ok: false, skipReason: "not_small_business", intakeReason: null, prioritized_category };
  }

  const fbRaw = String(input.facebookUrl || "").trim();
  const webRaw = String(input.website || "").trim().toLowerCase();
  let websiteIsOnlyFacebook = false;

  if (webRaw) {
    try {
      const u = new URL(webRaw.startsWith("http") ? webRaw : `https://${webRaw}`);
      websiteIsOnlyFacebook = isFacebookHost(u.hostname);
    } catch {
      websiteIsOnlyFacebook = webRaw.includes("facebook.") || webRaw.includes("fb.com");
    }
  }

  const hasStandaloneWebsite = Boolean(webRaw) && !websiteIsOnlyFacebook;
  if (hasStandaloneWebsite) {
    return {
      ok: false,
      skipReason: "has_standalone_website",
      intakeReason: null,
      prioritized_category,
    };
  }

  let intakeReason: string | null = null;
  if (!webRaw && !fbRaw) {
    intakeReason = "No website found";
  } else if (websiteIsOnlyFacebook || fbRaw) {
    intakeReason = fbRaw && !webRaw ? "Facebook only" : "Facebook only / no real site";
  } else {
    intakeReason = "No website found";
  }

  return { ok: true, skipReason: null, intakeReason, prioritized_category };
}
