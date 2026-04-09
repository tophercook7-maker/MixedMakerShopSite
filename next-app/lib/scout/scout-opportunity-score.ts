import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";
import {
  categoryMatchesTarget,
  cityMatchesTargetArea,
  stateMatchesTargetArea,
} from "@/lib/scout/scout-target-preferences";

export type OpportunityBand = "hot" | "good" | "maybe" | "skip";

export type ScoutOpportunityInput = {
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
  email: string | null | undefined;
  marked_priority?: boolean | null;
};

export type ScoutOpportunityFlags = {
  crmDuplicate: boolean;
  scoutRejected: boolean;
};

const WEAK_SITE =
  /\b(weak|outdated|broken|incomplete|no contact|missing cta|template|wix|squarespace free|slow|not mobile|ugly)\b/i;

function isFacebookOnlyUrl(url: string): boolean {
  const u = String(url || "").toLowerCase();
  return u.includes("facebook.") || u.includes("fb.com");
}

/** True when the business has a standalone (non–social-only) site we treat as a real website. */
export function hasStandaloneSite(row: ScoutOpportunityInput): boolean {
  const w = String(row.website_url || "").trim();
  if (!w) return false;
  if (isFacebookOnlyUrl(w)) return false;
  return leadHasStandaloneWebsite(w);
}

export function hasFacebookPresence(row: ScoutOpportunityInput): boolean {
  if (row.has_facebook === true) return true;
  const f = String(row.facebook_url || "").trim();
  if (f) return true;
  const reason = String(row.opportunity_reason || "").toLowerCase();
  return reason.includes("facebook") || reason.includes("fb.com");
}

export function weakSiteSignal(row: ScoutOpportunityInput): boolean {
  const reason = String(row.opportunity_reason || "").trim();
  return WEAK_SITE.test(reason);
}

/** Strong standalone site without weak signals → lower outreach priority. */
export function hasDecentStandaloneSite(row: ScoutOpportunityInput): boolean {
  if (!hasStandaloneSite(row)) return false;
  const reason = String(row.opportunity_reason || "").toLowerCase();
  if (reason.includes("no website")) return false;
  if (WEAK_SITE.test(String(row.opportunity_reason || ""))) return false;
  return true;
}

export function opportunityLabelFromScore(score: number): OpportunityBand {
  if (score >= 60) return "hot";
  if (score >= 40) return "good";
  if (score >= 20) return "maybe";
  return "skip";
}

export function computeScoutOpportunityScore(row: ScoutOpportunityInput, flags: ScoutOpportunityFlags): number {
  let score = 0;

  const standalone = hasStandaloneSite(row);
  const fb = hasFacebookPresence(row);
  const emailPresent = String(row.email || "").trim();
  const phone = String(row.phone || "").trim();
  const hasPhone = Boolean(phone) || row.has_phone === true;

  if (!standalone) {
    score += 35;
    if (fb) {
      score += 25;
    }
  } else {
    if (weakSiteSignal(row)) {
      score += 20;
    }
    if (hasDecentStandaloneSite(row)) {
      score -= 20;
    }
  }

  if (emailPresent) {
    score += 10;
  }
  if (hasPhone) {
    score += 10;
  }

  if (cityMatchesTargetArea(row.city) || stateMatchesTargetArea(row.state)) {
    score += 10;
  }
  if (categoryMatchesTarget(row.category)) {
    score += 10;
  }

  if (row.marked_priority) {
    score += 15;
  }

  if (flags.scoutRejected) {
    score -= 100;
  }
  if (flags.crmDuplicate) {
    score -= 100;
  }

  return score;
}

export function buildScoutReasonSummary(
  row: ScoutOpportunityInput,
  flags: ScoutOpportunityFlags,
  score: number
): string {
  if (flags.crmDuplicate) return "Already in CRM — link or skip.";
  if (flags.scoutRejected) return "Previously marked not useful in Scout.";

  const bits: string[] = [];
  const standalone = hasStandaloneSite(row);
  const fb = hasFacebookPresence(row);

  if (!standalone && fb) bits.push("Facebook-only / no real website");
  else if (!standalone) bits.push("No website found");
  else if (weakSiteSignal(row)) bits.push("Website exists but looks weak");
  else if (hasDecentStandaloneSite(row)) bits.push("Has a decent site — lower priority");

  if (String(row.email || "").trim()) bits.push("email");
  if (String(row.phone || "").trim() || row.has_phone) bits.push("phone");
  if (cityMatchesTargetArea(row.city) || stateMatchesTargetArea(row.state)) bits.push("target area");
  if (categoryMatchesTarget(row.category)) bits.push("local service fit");

  const tail = bits.length ? bits.join(", ") : "Review manually";
  const band = opportunityLabelFromScore(score);
  return `${tail} · ${band} (${score})`;
}
