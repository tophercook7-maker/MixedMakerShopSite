/**
 * Deterministic CRM lanes for existing leads — no live Google required.
 * Mirrors Scout Brain `lead_bucket_classifier.py` (keep rules in sync).
 */
import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";

export const CRM_LEAD_LANES = [
  "ready_to_contact",
  "has_email",
  "has_phone",
  "facebook_only",
  "no_website",
  "needs_research",
  "low_priority",
] as const;

export type CrmLeadLane = (typeof CRM_LEAD_LANES)[number];

export const CRM_LANE_LABELS: Record<CrmLeadLane, string> = {
  ready_to_contact: "Ready to Contact",
  has_email: "Has Email",
  has_phone: "Has Phone",
  facebook_only: "Facebook Only",
  no_website: "No Website",
  needs_research: "Needs Research",
  low_priority: "Low Priority",
};

export type ContactReadiness = "ready" | "partial" | "missing";

export type SimplifiedNextStep =
  | "contact now"
  | "message on facebook"
  | "call now"
  | "research later"
  | "skip for now";

export type LeadLaneInput = {
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  facebook_url?: string | null;
  contact_page?: string | null;
  conversion_score?: number | null;
  opportunity_score?: number | null;
  why_this_lead_is_here?: string | null;
};

const READY_SCORE = 58;
const LOW_SCORE = 38;

function trim(s: string | null | undefined): string {
  return String(s ?? "").trim();
}

function scoreFrom(input: LeadLaneInput): number {
  const c = input.conversion_score;
  if (c != null && Number.isFinite(Number(c))) return Number(c);
  const o = input.opportunity_score;
  if (o != null && Number.isFinite(Number(o))) return Number(o);
  return 0;
}

/** Ways you can actually reach out (website alone is not enough). */
export function leadHasContactPath(input: LeadLaneInput): boolean {
  return Boolean(
    trim(input.email) ||
      trim(input.phone) ||
      trim(input.contact_page) ||
      trim(input.facebook_url)
  );
}

export function computeContactReadiness(input: LeadLaneInput): ContactReadiness {
  if (trim(input.email) || trim(input.phone)) return "ready";
  if (trim(input.contact_page) || trim(input.facebook_url)) return "partial";
  return "missing";
}

export function computeSimplifiedNextStep(lane: CrmLeadLane, input: LeadLaneInput): SimplifiedNextStep {
  const hasPath = leadHasContactPath(input);
  const email = trim(input.email);
  const phone = trim(input.phone);
  const fb = trim(input.facebook_url);

  if (lane === "needs_research" || (!hasPath && lane === "low_priority")) return "research later";
  if (lane === "low_priority") return "skip for now";
  if (lane === "facebook_only" || (fb && !email && !phone)) return "message on facebook";
  if (email || lane === "has_email" || lane === "ready_to_contact") {
    if (email || lane === "has_email") return "contact now";
  }
  if (phone) return "call now";
  if (lane === "ready_to_contact" && phone) return "call now";
  if (fb) return "message on facebook";
  return "research later";
}

/**
 * Single primary lane per lead. Priority:
 * 1 ready_to_contact 2 has_email 3 has_phone 4 facebook_only 5 no_website 6 needs_research 7 low_priority
 */
export function computePrimaryLeadLane(input: LeadLaneInput): CrmLeadLane {
  const email = trim(input.email);
  const phone = trim(input.phone);
  const fb = trim(input.facebook_url);
  const contactPage = trim(input.contact_page);
  const website = trim(input.website);
  const hasRealWebsite = leadHasStandaloneWebsite(website);
  const contactPath = leadHasContactPath(input);
  const score = scoreFrom(input);

  const readyToContact = score >= READY_SCORE && contactPath;
  if (readyToContact) return "ready_to_contact";
  if (email) return "has_email";
  if (phone) return "has_phone";
  if (fb && !hasRealWebsite) return "facebook_only";
  if (!hasRealWebsite) return "no_website";
  if (!contactPath) return "needs_research";
  if (score < LOW_SCORE) return "low_priority";
  return "low_priority";
}

export function computeLeadLaneBundle(input: LeadLaneInput): {
  lead_bucket: CrmLeadLane;
  contact_readiness: ContactReadiness;
  simplified_next_step: SimplifiedNextStep;
  has_contact_path: boolean;
  /** One-line for list cards */
  summary_line: string;
  /** Short honest line for detail header when data is thin */
  honest_headline: string;
} {
  const lane = computePrimaryLeadLane(input);
  const contact_readiness = computeContactReadiness(input);
  const simplified_next_step = computeSimplifiedNextStep(lane, input);
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
      lane === "ready_to_contact"
        ? "Ready to reach out — you have a clear contact path."
        : `${CRM_LANE_LABELS[lane]}.`;
  }

  const summary_line = `${CRM_LANE_LABELS[lane]} · Next: ${capitalizeStep(simplified_next_step)}`;

  return {
    lead_bucket: lane,
    contact_readiness,
    simplified_next_step,
    has_contact_path,
    summary_line,
    honest_headline,
  };
}

function capitalizeStep(s: SimplifiedNextStep): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Compact contact signal chips for list cards (order: email, Facebook, phone, website). */
export function formatContactSignalsLine(input: LeadLaneInput): string {
  const parts: string[] = [];
  parts.push(trim(input.email) ? "Has email" : "No email");
  parts.push(trim(input.facebook_url) ? "Has Facebook" : "No Facebook");
  parts.push(trim(input.phone) ? "Has phone" : "No phone");
  parts.push(leadHasStandaloneWebsite(trim(input.website)) ? "Has website" : "No website");
  if (!leadHasContactPath(input)) return "No contact info yet · " + parts.join(" · ");
  return parts.join(" · ");
}
