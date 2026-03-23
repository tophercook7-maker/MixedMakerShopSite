/**
 * Primary CRM folders for /admin/leads — computed from stored fields only (no live Google).
 * One exclusive bucket per lead; priority order matches the folder strip.
 */
import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";
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
  return s === "won" || s === "lost";
}

function bcmIsFacebook(bcm: string): boolean {
  return trim(bcm).toLowerCase() === "facebook";
}

/** Best-contact hints that imply a concrete outreach path without extra digging */
function usableBestContactMethod(bcmRaw: string | null | undefined): boolean {
  const x = trim(bcmRaw).toLowerCase();
  return ["email", "phone", "facebook", "contact_form", "website", "contact_page"].includes(x);
}

export function leadHasContactPath(input: Pick<LeadFolderInput, "email" | "phone" | "contact_page" | "facebook_url">): boolean {
  return Boolean(trim(input.email) || trim(input.phone) || trim(input.contact_page) || trim(input.facebook_url));
}

export function computeContactReadiness(input: LeadFolderInput): ContactReadiness {
  if (trim(input.email) || trim(input.phone)) return "ready";
  if (trim(input.contact_page) || trim(input.facebook_url)) return "partial";
  return "missing";
}

/**
 * Single primary folder. Priority (first match wins after terminal → low):
 * ready_to_contact → has_email → has_phone → facebook_only → needs_research → low_priority
 */
export function computePrimaryLeadFolder(input: LeadFolderInput): LeadFolderBucket {
  if (terminalStage(input.status)) return "low_priority";

  const email = trim(input.email);
  const phone = trim(input.phone);
  const fb = trim(input.facebook_url);
  const cp = trim(input.contact_page);
  const bcm = trim(input.best_contact_method);
  const website = trim(input.website);
  const hasRealWebsite = leadHasStandaloneWebsite(website);
  const sc = scoreFrom(input);
  const hot = Boolean(input.is_hot_lead);
  const why = trim(input.why_this_lead_is_here);

  // Thin leads: no direct path and not worth a research lane
  const anySignal = email || phone || cp || fb || hasRealWebsite || why || hot;
  if (!anySignal && sc <= JUNK_MAX_SCORE) return "low_priority";
  if (!email && !phone && !cp && !(fb && bcmIsFacebook(bcm)) && sc <= JUNK_MAX_SCORE && !why && !hot && !fb) {
    return "low_priority";
  }

  const readyToContact =
    (email && (phone || cp || sc >= READY_EMAIL_SCORE || hot)) ||
    (phone && (email || sc >= READY_PHONE_SCORE || hot)) ||
    (fb && bcmIsFacebook(bcm)) ||
    (cp && !email && !phone && (sc >= 38 || hot));

  if (readyToContact) return "ready_to_contact";
  if (email) return "has_email";
  if (phone) return "has_phone";

  if (fb && !hasRealWebsite && !email && !phone && (sc >= FACEBOOK_ONLY_MIN_SCORE || hot || Boolean(why))) {
    return "facebook_only";
  }

  if (!email && !phone && !cp && !usableBestContactMethod(bcm)) {
    if (sc >= NEEDS_RESEARCH_MIN_SCORE || why || hasRealWebsite || fb) return "needs_research";
  }

  return "low_priority";
}

export function computeSimplifiedNextStep(bucket: LeadFolderBucket, input: LeadFolderInput): SimplifiedNextStep {
  const email = trim(input.email);
  const phone = trim(input.phone);
  const fb = trim(input.facebook_url);
  const bcm = trim(input.best_contact_method).toLowerCase();

  if (bucket === "low_priority") return "skip for now";
  if (bucket === "needs_research") return "research later";
  if (bucket === "facebook_only") return "message on facebook";
  if (bucket === "has_phone") return "call now";
  if (bucket === "has_email") return "contact now";

  // ready_to_contact
  if (bcm === "facebook" || (fb && !email && !phone)) return "message on facebook";
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
