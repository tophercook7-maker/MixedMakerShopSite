import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";
import {
  normalizeBusinessName,
  normalizeFacebookUrl,
  normalizePhone,
  normalizeWebsiteUrl,
} from "@/lib/leads-dedup";
import type { ScoutLead } from "@/lib/scout/types";
import { rankScoreForSort } from "@/lib/scout/scout-lite";
import type { ScoutSourceTypeStored } from "@/lib/scout/scout-results-types";

const SOURCE_TYPES = new Set(["google", "facebook", "mixed", "manual", "unknown"]);

function isGoogleMapsUrl(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.includes("google.com/maps") ||
    u.includes("maps.google") ||
    u.includes("goo.gl/maps") ||
    u.includes("business.google") ||
    u.includes("google.com/search") ||
    /\bmaps\.app\.goo\.gl\b/.test(u)
  );
}

function isFacebookUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes("facebook.") || u.includes("fb.com") || u.includes("fb.me");
}

/**
 * Single normalization pass from upstream payload → stored source_type + URLs.
 * Call only at sync time; do not re-infer on read.
 */
export function resolveStoredSourceType(lead: ScoutLead): {
  source_type: ScoutSourceTypeStored;
  source_url: string | null;
  website_url: string | null;
  facebook_url: string | null;
} {
  const explicit = String(lead.source_type || "")
    .toLowerCase()
    .trim();
  if (SOURCE_TYPES.has(explicit)) {
    return {
      source_type: explicit as ScoutSourceTypeStored,
      source_url: String(lead.source_url || "").trim() || null,
      website_url: String(lead.website || "").trim() || null,
      facebook_url: String(lead.facebook_url || "").trim() || null,
    };
  }

  const source_url = String(lead.source_url || "").trim() || null;
  const website_url = String(lead.website || "").trim() || null;
  const facebook_url = String(lead.facebook_url || "").trim() || null;

  let googleSignal = false;
  let fbSignal = false;

  if (source_url && isGoogleMapsUrl(source_url)) googleSignal = true;
  if (source_url && isFacebookUrl(source_url)) fbSignal = true;
  if (website_url && isFacebookUrl(website_url)) fbSignal = true;
  if (facebook_url) fbSignal = true;

  const contact = String(lead.best_contact_method || "").toLowerCase();
  if (contact === "facebook") fbSignal = true;

  const reason = String(lead.opportunity_reason || "").toLowerCase();
  const signals = (lead.opportunity_signals || []).map((s) => String(s || "").toLowerCase()).join(" ");
  const hay = `${reason} ${signals}`;
  if (hay.includes("facebook") || hay.includes("fb.com")) fbSignal = true;
  if (hay.includes("google") || hay.includes("maps") || hay.includes("places") || hay.includes("gmb")) googleSignal = true;

  const standaloneSite = website_url && leadHasStandaloneWebsite(website_url);

  if (googleSignal && fbSignal) {
    return { source_type: "mixed", source_url, website_url: standaloneSite ? website_url : website_url || null, facebook_url: facebook_url || null };
  }
  if (googleSignal) {
    return { source_type: "google", source_url, website_url: standaloneSite ? website_url : website_url || null, facebook_url: facebook_url || null };
  }
  if (fbSignal) {
    return { source_type: "facebook", source_url, website_url: website_url || null, facebook_url: facebook_url || null };
  }

  return {
    source_type: "unknown",
    source_url,
    website_url: website_url || null,
    facebook_url: facebook_url || null,
  };
}

export function computeDedupeKey(args: {
  website_url: string | null;
  facebook_url: string | null;
  phone: string | null;
  business_name: string;
  city: string | null;
  category: string | null;
  source_external_id: string | null;
}): string {
  const w = normalizeWebsiteUrl(args.website_url);
  if (w) return `w:${w}`;
  const f = normalizeFacebookUrl(args.facebook_url);
  if (f) return `f:${f}`;
  const p = normalizePhone(args.phone);
  if (p && p.length >= 10) return `p:${p}`;
  const ext = String(args.source_external_id || "").trim();
  if (ext) return `o:${ext}`;
  const nb = normalizeBusinessName(args.business_name);
  const city = normalizeBusinessName(args.city);
  const cat = normalizeBusinessName(args.category);
  return `n:${nb}|${city}|${cat}`;
}

function phoneFromLead(lead: ScoutLead): string | null {
  const p = String(lead.phone || "").trim();
  if (p) return p;
  const c = String(lead.best_contact_method || "").toLowerCase();
  if (c === "phone") return "present";
  return null;
}

function hasPhoneFromLead(lead: ScoutLead): boolean {
  if (String(lead.phone || "").trim().length > 0) return true;
  const c = String(lead.best_contact_method || "").toLowerCase();
  if (c === "phone") return true;
  const reason = String(lead.opportunity_reason || "").toLowerCase();
  return reason.includes("phone");
}

function hasFacebookFromUrls(facebook_url: string | null, website_url: string | null, lead: ScoutLead): boolean {
  if (String(facebook_url || "").trim()) return true;
  if (website_url && isFacebookUrl(website_url)) return true;
  const c = String(lead.best_contact_method || "").toLowerCase();
  if (c === "facebook") return true;
  const reason = String(lead.opportunity_reason || "").toLowerCase();
  const signals = (lead.opportunity_signals || []).map((s) => String(s || "").toLowerCase()).join(" ");
  return reason.includes("facebook") || signals.includes("facebook");
}

export type NormalizedScoutResultInsert = {
  owner_id: string;
  dedupe_key: string;
  source_type: ScoutSourceTypeStored;
  source_url: string | null;
  source_external_id: string | null;
  business_name: string;
  city: string | null;
  state: string | null;
  category: string | null;
  website_url: string | null;
  has_website: boolean | null;
  facebook_url: string | null;
  has_facebook: boolean | null;
  phone: string | null;
  has_phone: boolean | null;
  opportunity_reason: string | null;
  opportunity_rank: number;
  raw_source_payload: Record<string, unknown>;
};

export function normalizeScoutLeadToResultRow(lead: ScoutLead, ownerId: string): NormalizedScoutResultInsert | null {
  const business_name = String(lead.business_name || "").trim();
  if (!business_name) return null;

  const { source_type, source_url, website_url, facebook_url } = resolveStoredSourceType(lead);
  const phone = phoneFromLead(lead);
  const has_phone = hasPhoneFromLead(lead);
  const has_facebook = hasFacebookFromUrls(facebook_url, website_url, lead);
  const standalone = website_url ? leadHasStandaloneWebsite(website_url) : false;
  const reason = String(lead.opportunity_reason || "").trim();
  const reasonLower = reason.toLowerCase();
  const signals = (lead.opportunity_signals || []).map((s) => String(s || "").toLowerCase()).join(" ");

  let has_website: boolean | null;
  if (!website_url || isFacebookUrl(website_url)) {
    has_website = false;
  } else if (standalone) {
    has_website = true;
  } else if (reasonLower.includes("no website") || signals.includes("no_website")) {
    has_website = false;
  } else {
    has_website = null;
  }

  const source_external_id = String(lead.id || lead.slug || "").trim() || null;
  const dedupe_key = computeDedupeKey({
    website_url,
    facebook_url,
    phone: phone === "present" ? null : phone,
    business_name,
    city: String(lead.city || "").trim() || null,
    category: String(lead.category || "").trim() || null,
    source_external_id,
  });

  const opportunity_rank = Math.round(rankScoreForSort(lead));

  const raw_source_payload: Record<string, unknown> = { ...lead };

  return {
    owner_id: ownerId,
    dedupe_key,
    source_type,
    source_url,
    source_external_id,
    business_name,
    city: String(lead.city || "").trim() || null,
    state: null,
    category: String(lead.category || "").trim() || null,
    website_url,
    has_website,
    facebook_url: facebook_url || null,
    has_facebook,
    phone: phone && phone !== "present" ? phone : null,
    has_phone,
    opportunity_reason: reason || null,
    opportunity_rank,
    raw_source_payload,
  };
}

/** Prefer local service businesses for ranking bonus (non-blocking). */
const SERVICE_CATEGORY_HINTS =
  /\b(roof|hvac|plumb|landscap|paint|clean|auto|contractor|clinic|salon|barber|spa|electric|fence|pest|tow|garage|remodel|concrete|mason|drywall|flooring)\b/i;

export function serviceCategoryBonus(category: string | null | undefined): number {
  const c = String(category || "").trim();
  if (!c) return 0;
  return SERVICE_CATEGORY_HINTS.test(c) ? 15 : 0;
}

export function activeSignalsBonus(payload: Record<string, unknown> | null | undefined): number {
  if (!payload || typeof payload !== "object") return 0;
  const review = Number((payload as { google_review_count?: unknown }).google_review_count ?? 0);
  if (review >= 5) return 8;
  if (review >= 1) return 4;
  return 0;
}

/**
 * Best web design targets: queue items that match outreach fit (evaluated on stored row).
 */
export function matchesBestWebDesignPreset(row: {
  skipped: boolean;
  added_to_leads: boolean;
  has_website: boolean | null;
  website_url: string | null;
  has_facebook: boolean | null;
  facebook_url: string | null;
  opportunity_reason: string | null;
}): boolean {
  if (row.skipped || row.added_to_leads) return false;
  const web = String(row.website_url || "").trim();
  const fbOnly =
    (row.has_facebook || Boolean(String(row.facebook_url || "").trim())) &&
    (!web || isFacebookUrl(web) || row.has_website === false);
  const noSite = row.has_website === false || (!web && row.has_website !== true);
  const unknownSite = row.has_website == null && !web;
  const reason = String(row.opportunity_reason || "").toLowerCase();
  const weak =
    row.has_website === true &&
    (reason.includes("weak") || reason.includes("outdated") || reason.includes("broken") || reason.includes("cta"));
  return Boolean(noSite || fbOnly || unknownSite || weak);
}

export function bestWebDesignSortScore(row: {
  opportunity_rank: number;
  has_phone: boolean | null;
  category: string | null;
  raw_source_payload?: Record<string, unknown> | null;
  has_website: boolean | null;
  website_url: string | null;
  has_facebook: boolean | null;
  facebook_url: string | null;
  opportunity_reason: string | null;
}): number {
  let tier = 0;
  const web = String(row.website_url || "").trim();
  const fbOnly =
    (row.has_facebook || Boolean(String(row.facebook_url || "").trim())) &&
    (!web || isFacebookUrl(web) || row.has_website === false);
  const noSite = row.has_website === false || (!web && row.has_website !== true);
  const unknownSite = row.has_website == null && !web;
  const reason = String(row.opportunity_reason || "").toLowerCase();
  const weak =
    row.has_website === true &&
    (reason.includes("weak") || reason.includes("outdated") || reason.includes("broken") || reason.includes("cta"));

  if (noSite && !fbOnly) tier = 1_000_000;
  else if (fbOnly) tier = 800_000;
  else if (weak) tier = 600_000;
  else if (unknownSite) tier = 400_000;
  else tier = 200_000;

  const phoneBoost = row.has_phone ? 25 : 0;
  const catBoost = serviceCategoryBonus(row.category);
  const activeBoost = activeSignalsBonus(row.raw_source_payload ?? null);

  return tier + row.opportunity_rank + phoneBoost + catBoost + activeBoost;
}
