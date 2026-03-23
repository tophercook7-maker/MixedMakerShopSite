/**
 * Target-market preset: Facebook-origin leads with no standalone website and a reachable contact path.
 * Deterministic from stored fields only (no live Google).
 */
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import type { LeadRowForWorkflow } from "@/lib/crm/workflow-lead-mapper";
import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";
import { extensionCaptureLabelFromUrl, normalizeLeadSourceValue, resolvedCaptureSource } from "@/lib/crm/lead-source";
import { normalizeWorkflowLeadStatus } from "@/lib/crm/stage-normalize";

/** Use with `?target=facebook_no_website_reachable` on /admin/leads */
export const FACEBOOK_NO_WEBSITE_REACHABLE_TARGET_PARAM = "facebook_no_website_reachable";

function trim(s: string | null | undefined): string {
  return String(s ?? "").trim();
}

function rawStatusLower(lead: Pick<WorkflowLead, "status">): string {
  return String(lead.status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

/** Won, lost, or any closed / terminal pipeline stage we should hide in this preset. */
export function isTerminalForTargetPreset(lead: Pick<WorkflowLead, "status">): boolean {
  const stage = normalizeWorkflowLeadStatus(lead.status);
  if (stage === "won" || stage === "lost") return true;
  const raw = rawStatusLower(lead);
  if (raw === "closed" || raw.startsWith("closed_")) return true;
  return false;
}

function facebookHintInText(s: string): boolean {
  const t = s.toLowerCase();
  return t.includes("facebook") || t.includes("fb.com") || /\bfb\b/.test(t);
}

/** DB rows and workflow leads — `source` is capture channel on rows, not `WorkflowLead["source"]`. */
export type FacebookSourcePick = {
  facebook_url?: string | null;
  source?: string | null;
  lead_source?: string | null;
  source_label?: string | null;
  source_url?: string | null;
};

/**
 * Facebook-based: `facebook_url`; extension capture from Facebook; `scout_facebook`;
 * `scout_mixed` with `facebook_url` (same as first check); normalized/raw source mentions Facebook.
 */
export function isFacebookBasedLead(lead: FacebookSourcePick): boolean {
  if (trim(lead.facebook_url)) return true;

  const canon = normalizeLeadSourceValue(resolvedCaptureSource(lead));
  if (canon === "scout_facebook") return true;
  if (canon === "facebook") return true;

  if (canon === "extension") {
    const lab = trim(lead.source_label).toLowerCase();
    if (lab && facebookHintInText(lab)) return true;
    if (extensionCaptureLabelFromUrl(lead.source_url) === "Facebook") return true;
  }

  const combined = `${resolvedCaptureSource(lead)} ${trim(lead.lead_source)}`.toLowerCase();
  if (facebookHintInText(combined)) return true;

  return false;
}

/**
 * No real standalone website: `leadHasStandaloneWebsite` is false and `has_website` is not explicitly true.
 * Facebook URLs are never treated as a business website (handled inside `leadHasStandaloneWebsite`).
 */
export function hasNoRealWebsiteForTargetPreset(lead: {
  website?: string | null;
  has_website?: boolean | null;
}): boolean {
  if (lead.has_website === true) return false;
  return !leadHasStandaloneWebsite(trim(lead.website));
}

export function hasReachableContactForTargetPreset(
  lead: Pick<WorkflowLead, "email" | "phone_from_site" | "facebook_url" | "contact_page">
): boolean {
  return Boolean(
    trim(lead.email) || trim(lead.phone_from_site) || trim(lead.facebook_url) || trim(lead.contact_page)
  );
}

/** DB / server rows use `phone`; UI leads use `phone_from_site`. */
export function hasReachableContactForTargetRow(
  row: Pick<LeadRowForWorkflow, "email" | "phone" | "facebook_url" | "contact_page">
): boolean {
  return Boolean(
    trim(row.email) || trim(row.phone) || trim(row.facebook_url) || trim(row.contact_page)
  );
}

export function isFacebookNoWebsiteReachableLead(lead: WorkflowLead): boolean {
  if (isTerminalForTargetPreset(lead)) return false;
  if (!isFacebookBasedLead(lead)) return false;
  if (!hasNoRealWebsiteForTargetPreset(lead)) return false;
  if (!hasReachableContactForTargetPreset(lead)) return false;
  return true;
}

/** Same rules as `isFacebookNoWebsiteReachableLead`, for Supabase rows / `LeadRowForWorkflow`. */
export function matchesFacebookNoWebsiteReachableFromRow(row: LeadRowForWorkflow): boolean {
  if (isTerminalForTargetPreset({ status: row.status as WorkflowLead["status"] })) return false;
  if (!isFacebookBasedLead(row)) return false;
  if (!hasNoRealWebsiteForTargetPreset({ website: row.website, has_website: row.has_website })) return false;
  if (!hasReachableContactForTargetRow(row)) return false;
  return true;
}

/** Product name for the predicate (alias of `isFacebookNoWebsiteReachableLead`). */
export function matchesFacebookNoWebsiteReachable(lead: WorkflowLead): boolean {
  return isFacebookNoWebsiteReachableLead(lead);
}

/** Short trust line for cards when the preset is active. */
export function facebookNoWebsiteReachableMatchLine(lead: WorkflowLead): string {
  if (trim(lead.email)) return "No website · Has email";
  if (trim(lead.phone_from_site)) return "No website · Has phone";
  if (trim(lead.contact_page)) return "No website · Contact form";
  if (trim(lead.facebook_url)) return "Facebook only · Reachable";
  return "Facebook lead · Has contact path";
}
