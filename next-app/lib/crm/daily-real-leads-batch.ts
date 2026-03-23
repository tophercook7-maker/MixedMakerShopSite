/**
 * Curated "Daily 10" batch: best Facebook / no-website / reachable leads from the loaded set.
 * Client-side only; deterministic from stored fields (mirrors Brain rules loosely).
 */
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { isValidFacebookBusinessUrl, matchesFacebookNoWebsiteReachable } from "@/lib/crm/facebook-no-website-reachable";
import { isTopPickLead } from "@/lib/crm/manual-pick-leads";

const SERVICE_KEYWORDS = [
  "roofing",
  "roofer",
  "plumber",
  "plumbing",
  "hvac",
  "heating",
  "cooling",
  "electrician",
  "electrical",
  "lawn",
  "landscaping",
  "landscape",
  "cleaning",
  "pressure washing",
  "power washing",
  "handyman",
  "contractor",
  "tree service",
  "arborist",
  "mobile detailing",
  "detailing",
  "mechanic",
  "auto repair",
  "automotive repair",
  "salon",
  "barber",
  "beauty",
];

function haystack(lead: WorkflowLead): string {
  const notes = Array.isArray(lead.notes) ? lead.notes.join(" ") : "";
  return [
    lead.business_name,
    lead.category,
    lead.why_this_lead_is_here,
    lead.detected_issue_summary,
    lead.primary_problem,
    notes,
  ]
    .map((x) => String(x || "").toLowerCase())
    .join(" ");
}

export function isLocalServiceBusinessHeuristic(lead: WorkflowLead): boolean {
  const h = haystack(lead);
  return SERVICE_KEYWORDS.some((k) => h.includes(k));
}

export function computeContactConfidenceForLead(lead: WorkflowLead): { score: number; label: "high" | "medium" | "low" } {
  let s = 0;
  if (String(lead.email || "").trim()) s += 40;
  if (String(lead.phone_from_site || "").trim()) s += 30;
  const fb = String(lead.facebook_url || "").trim();
  if (fb && isValidFacebookBusinessUrl(fb)) s += 20;
  if (String(lead.contact_page || "").trim()) s += 15;
  s = Math.min(100, s);
  const label = s >= 70 ? "high" : s >= 40 ? "medium" : "low";
  return { score: s, label };
}

function hasStrongNonLocalSignals(lead: WorkflowLead): boolean {
  if (String(lead.category || "").trim()) return true;
  if (String(lead.city || "").trim()) return true;
  if (Number(lead.opportunity_score ?? 0) >= 45) return true;
  if (Number(lead.conversion_score ?? 0) >= 45) return true;
  if (String(lead.why_this_lead_is_here || "").trim().length >= 24) return true;
  return false;
}

/** Stricter than the target preset: drop Top Picks, weak contact + non-service + no strong signals. */
export function qualifiesForDailyTenBatch(lead: WorkflowLead): boolean {
  if (isTopPickLead(lead)) return false;
  if (!matchesFacebookNoWebsiteReachable(lead)) return false;
  const { label } = computeContactConfidenceForLead(lead);
  const local = isLocalServiceBusinessHeuristic(lead);
  const strong = hasStrongNonLocalSignals(lead);
  if (label === "low" && !local && !strong) return false;
  return true;
}

export function getTopDailyLeadBatch(leads: WorkflowLead[], limit = 10): WorkflowLead[] {
  const pool = leads.filter(qualifiesForDailyTenBatch);
  return [...pool]
    .sort((a, b) => {
      const sa = Number(a.conversion_score ?? a.opportunity_score ?? 0);
      const sb = Number(b.conversion_score ?? b.opportunity_score ?? 0);
      if (sb !== sa) return sb - sa;
      const ca = computeContactConfidenceForLead(a).score;
      const cb = computeContactConfidenceForLead(b).score;
      if (cb !== ca) return cb - ca;
      const la = isLocalServiceBusinessHeuristic(a) ? 1 : 0;
      const lb = isLocalServiceBusinessHeuristic(b) ? 1 : 0;
      if (lb !== la) return lb - la;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    })
    .slice(0, limit);
}
