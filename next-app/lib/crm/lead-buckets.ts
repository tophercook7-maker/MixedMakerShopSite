/**
 * Primary CRM folders for /admin/leads — computed from stored fields only (no live Google).
 * One exclusive bucket per lead; priority order matches the folder strip.
 */
import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";
import { isValidFacebookBusinessUrl } from "@/lib/crm/facebook-no-website-reachable";
import { normalizeWorkflowLeadStatus } from "@/lib/crm/stage-normalize";

export const LEAD_FOLDER_BUCKETS = [
  "ready_to_contact",
  "has_email",
  "has_phone",
  "facebook_only",
  "needs_research",
  "low_priority",
] as const;

export type LeadFolderBucket = (typeof LEAD_FOLDER_BUCKETS)[number];

export const FOLDER_LABELS: Record<LeadFolderBucket, string> = {
  ready_to_contact: "Ready to Contact",
  has_email: "Has Email",
  has_phone: "Has Phone",
  facebook_only: "Facebook Only",
  needs_research: "Needs Research",
  low_priority: "Low Priority",
};

/** Calm empty copy when a folder filter has zero rows */
export const FOLDER_EMPTY_MESSAGES: Record<LeadFolderBucket, string> = {
  ready_to_contact: "Nothing ready right now.",
  has_email: "No email-only leads right now.",
  has_phone: "No phone-only leads right now.",
  facebook_only: "No Facebook-only leads right now.",
  needs_research: "No research-only leads right now.",
  low_priority: "No low-priority leads in this view right now.",
};

export type ContactReadiness = "ready" | "partial" | "missing";

export type SimplifiedNextStep =
  | "contact now"
  | "message on facebook"
  | "call now"
  | "research later"
  | "skip for now";

export type LeadFolderInput = {
  status?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  facebook_url?: string | null;
  contact_page?: string | null;
  best_contact_method?: string | null;
  conversion_score?: number | null;
  opportunity_score?: number | null;
  why_this_lead_is_here?: string | null;
  is_hot_lead?: boolean | null;
  /** DB `has_website` when URL parsing is ambiguous */
  has_website?: boolean | null;
  /** CRM tags e.g. `no_website_opportunity`, `weak_website` */
  lead_tags?: string[] | null;
  opportunity_reason?: string | null;
};

const READY_EMAIL_SCORE = 40;
const READY_PHONE_SCORE = 42;
const FACEBOOK_ONLY_MIN_SCORE = 32;
const NEEDS_RESEARCH_MIN_SCORE = 22;
const JUNK_MAX_SCORE = 19;

function trim(s: string | null | undefined): string {
  return String(s ?? "").trim();
}

function scoreFrom(input: LeadFolderInput): number {
  const c = input.conversion_score;
  if (c != null && Number.isFinite(Number(c))) return Number(c);
  const o = input.opportunity_score;
  if (o != null && Number.isFinite(Number(o))) return Number(o);
  return 0;
}

function terminalStage(status: string | null | undefined): boolean {
  const s = normalizeWorkflowLeadStatus(status);
  return s === "won" || s === "archived" || s === "no_response" || s === "not_interested";
}

function bcmIsFacebook(bcm: string): boolean {
  return trim(bcm).toLowerCase() === "facebook";
}

/** Best-contact hints that imply a concrete outreach path without extra digging */
function usableBestContactMethod(bcmRaw: string | null | undefined): boolean {
  const x = trim(bcmRaw).toLowerCase();
  return ["email", "phone", "facebook", "contact_form", "website", "contact_page"].includes(x);
}

const WEAK_WEBSITE_TAGS = new Set([
  "no_website_opportunity",
  "weak_website",
  "website_weak",
  "broken_website",
  "manual_low_priority",
]);

/** Owner-marked queue-low — forces `low_priority` folder (see `computePrimaryLeadFolder`). */
export const CRM_QUEUE_LOW_TAG = "crm_queue_low";

function hasCrmQueueLowTag(input: LeadFolderInput): boolean {
  const tags = input.lead_tags;
  if (!Array.isArray(tags)) return false;
  return tags.some((t) => String(t || "").trim().toLowerCase() === CRM_QUEUE_LOW_TAG);
}

function weakWebsiteKeywords(text: string): boolean {
  const t = text.toLowerCase();
  return /no website|weak site|weak website|outdated site|broken site|needs (a |)website|facebook only|no site\b|http only/.test(
    t
  );
}

/** Explicit weak / no-site signals from tags or opportunity text */
export function hasWeakWebsiteSignal(input: LeadFolderInput): boolean {
  const tags = input.lead_tags;
  if (Array.isArray(tags)) {
    for (const t of tags) {
      const x = String(t || "").trim().toLowerCase();
      if (WEAK_WEBSITE_TAGS.has(x)) return true;
    }
  }
  const reason = trim(input.opportunity_reason).toLowerCase();
  if (reason && weakWebsiteKeywords(reason)) return true;
  return false;
}

export function hasStandaloneSiteSignal(input: LeadFolderInput): boolean {
  if (leadHasStandaloneWebsite(trim(input.website))) return true;
  if (input.has_website === true) return true;
  return false;
}

/** Strong enough reason to keep a lead in “act now” lanes despite a decent site */
export function hasStrongOpportunitySignal(input: LeadFolderInput): boolean {
  if (Boolean(input.is_hot_lead)) return true;
  if (trim(input.why_this_lead_is_here).length >= 28) return true;
  const sc = scoreFrom(input);
  if (sc >= 52) return true;
  return false;
}

/**
 * Standalone website present, no weak-site tag/reason, and no strong override — not a top outreach target.
 */
export function isGoodWebsiteSansClearOpportunity(input: LeadFolderInput): boolean {
  if (!hasStandaloneSiteSignal(input)) return false;
  if (hasWeakWebsiteSignal(input)) return false;
  if (hasStrongOpportunitySignal(input)) return false;
  return true;
}

function demoteBucketForGoodWebsite(bucket: LeadFolderBucket, input: LeadFolderInput): LeadFolderBucket {
  if (!isGoodWebsiteSansClearOpportunity(input)) return bucket;
  if (bucket === "ready_to_contact") {
    if (trim(input.email)) bucket = "has_email";
    else if (trim(input.phone)) bucket = "has_phone";
    else bucket = "low_priority";
  }
  if (bucket === "has_email" || bucket === "has_phone") {
    return "low_priority";
  }
  return bucket;
}

function usableFacebookUrl(facebook_url: string | null | undefined): boolean {
  const fb = trim(facebook_url);
  return Boolean(fb && isValidFacebookBusinessUrl(fb));
}

export function leadHasContactPath(input: Pick<LeadFolderInput, "email" | "phone" | "contact_page" | "facebook_url">): boolean {
  return Boolean(trim(input.email) || trim(input.phone) || trim(input.contact_page) || usableFacebookUrl(input.facebook_url));
}

export function computeContactReadiness(input: LeadFolderInput): ContactReadiness {
  if (trim(input.email) || trim(input.phone)) return "ready";
  if (trim(input.contact_page) || usableFacebookUrl(input.facebook_url)) return "partial";
  return "missing";
}

/**
 * Single primary folder. Priority (first match wins after terminal → low):
 * ready_to_contact → has_email → has_phone → facebook_only → needs_research → low_priority
 */
export function computePrimaryLeadFolder(input: LeadFolderInput): LeadFolderBucket {
  if (terminalStage(input.status)) return "low_priority";
  if (hasCrmQueueLowTag(input)) return "low_priority";

  const email = trim(input.email);
  const phone = trim(input.phone);
  const fb = trim(input.facebook_url);
  const fbOk = usableFacebookUrl(input.facebook_url);
  const cp = trim(input.contact_page);
  const bcm = trim(input.best_contact_method);
  const website = trim(input.website);
  const hasRealWebsite = leadHasStandaloneWebsite(website);
  const sc = scoreFrom(input);
  const hot = Boolean(input.is_hot_lead);
  const why = trim(input.why_this_lead_is_here);

  // Thin leads: no direct path and not worth a research lane
  const anySignal = email || phone || cp || fbOk || hasRealWebsite || why || hot;
  if (!anySignal && sc <= JUNK_MAX_SCORE) return "low_priority";
  if (!email && !phone && !cp && !(fbOk && bcmIsFacebook(bcm)) && sc <= JUNK_MAX_SCORE && !why && !hot && !fbOk) {
    return "low_priority";
  }

  const readyToContact =
    (email && (phone || cp || sc >= READY_EMAIL_SCORE || hot)) ||
    (phone && (email || sc >= READY_PHONE_SCORE || hot)) ||
    (fbOk && bcmIsFacebook(bcm)) ||
    (cp && !email && !phone && (sc >= 38 || hot));

  let bucket: LeadFolderBucket;
  if (readyToContact) bucket = "ready_to_contact";
  else if (email) bucket = "has_email";
  else if (phone) bucket = "has_phone";
  else if (fbOk && !hasRealWebsite && !email && !phone && (sc >= FACEBOOK_ONLY_MIN_SCORE || hot || Boolean(why))) {
    bucket = "facebook_only";
  } else if (!email && !phone && !cp && !usableBestContactMethod(bcm) && (sc >= NEEDS_RESEARCH_MIN_SCORE || why || hasRealWebsite || fbOk)) {
    bucket = "needs_research";
  } else {
    bucket = "low_priority";
  }

  return demoteBucketForGoodWebsite(bucket, input);
}

export function computeSimplifiedNextStep(bucket: LeadFolderBucket, input: LeadFolderInput): SimplifiedNextStep {
  const email = trim(input.email);
  const phone = trim(input.phone);
  const fb = trim(input.facebook_url);
  const fbOk = usableFacebookUrl(input.facebook_url);
  const bcm = trim(input.best_contact_method).toLowerCase();

  if (bucket === "low_priority") return "skip for now";
  if (bucket === "needs_research") return "research later";
  if (bucket === "facebook_only") return "message on facebook";
  if (bucket === "has_phone") return "call now";
  if (bucket === "has_email") return "contact now";

  // ready_to_contact
  if (bcm === "facebook" || (fbOk && !email && !phone)) return "message on facebook";
  if (bcm === "phone" || (phone && !email)) return "call now";
  return "contact now";
}

function capitalizeStep(s: SimplifiedNextStep): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function computeLeadFolderBundle(input: LeadFolderInput): {
  lead_bucket: LeadFolderBucket;
  contact_readiness: ContactReadiness;
  simplified_next_step: SimplifiedNextStep;
  has_contact_path: boolean;
  summary_line: string;
  honest_headline: string;
} {
  const bucket = computePrimaryLeadFolder(input);
  const contact_readiness = computeContactReadiness(input);
  const simplified_next_step = computeSimplifiedNextStep(bucket, input);
  const has_contact_path = leadHasContactPath(input);
  const why = trim(input.why_this_lead_is_here);
  const hasSite = leadHasStandaloneWebsite(trim(input.website));

  let honest_headline = why;
  if (!has_contact_path) {
    honest_headline = "Contact info has not been found yet.";
  } else if (!hasSite) {
    honest_headline = "No website. Strong opportunity.";
  }
  if (!honest_headline) {
    honest_headline =
      bucket === "ready_to_contact"
        ? "Ready to reach out — you have a clear contact path."
        : `${FOLDER_LABELS[bucket]}.`;
  }

  const summary_line = `Next: ${capitalizeStep(simplified_next_step)}`;

  return {
    lead_bucket: bucket,
    contact_readiness,
    simplified_next_step,
    has_contact_path,
    summary_line,
    honest_headline,
  };
}

export function workflowLeadToFolderInput(lead: {
  status?: string | null;
  email?: string | null;
  phone_from_site?: string | null;
  website?: string | null;
  facebook_url?: string | null;
  contact_page?: string | null;
  best_contact_method?: string | null;
  conversion_score?: number | null;
  opportunity_score?: number | null;
  why_this_lead_is_here?: string | null;
  is_hot_lead?: boolean | null;
  has_website?: boolean | null;
  lead_tags?: string[] | null;
  opportunity_reason?: string | null;
}): LeadFolderInput {
  return {
    status: lead.status,
    email: lead.email,
    phone: lead.phone_from_site,
    website: lead.website,
    facebook_url: lead.facebook_url,
    contact_page: lead.contact_page,
    best_contact_method: lead.best_contact_method,
    conversion_score: lead.conversion_score,
    opportunity_score: lead.opportunity_score,
    why_this_lead_is_here: lead.why_this_lead_is_here,
    is_hot_lead: lead.is_hot_lead,
    has_website: lead.has_website,
    lead_tags: lead.lead_tags,
    opportunity_reason: lead.opportunity_reason,
  };
}

/** Map legacy ?lane=no_website to needs_research */
export function parseFolderFromUrlParam(raw: string | null | undefined): LeadFolderBucket | "all" {
  const x = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  if (!x) return "all";
  if (x === "no_website") return "needs_research";
  if ((LEAD_FOLDER_BUCKETS as readonly string[]).includes(x)) return x as LeadFolderBucket;
  return "all";
}
