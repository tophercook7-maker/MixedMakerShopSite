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

const ALLOWED_FB_HOSTS = new Set([
  "facebook.com",
  "m.facebook.com",
  "mbasic.facebook.com",
  "web.facebook.com",
  "business.facebook.com",
  "fb.com",
  "m.fb.com",
]);

/**
 * True for a likely business/page URL — excludes search, groups, marketplace, and other junk.
 * Kept in sync with Scout Brain `is_valid_facebook_business_url`.
 */
export function isValidFacebookBusinessUrl(url: string): boolean {
  const u = String(url || "").trim();
  if (!u) return false;
  let low: string;
  try {
    low = decodeURIComponent(u).toLowerCase();
  } catch {
    low = u.toLowerCase();
  }
  const junk = [
    "/search/",
    "/groups/",
    "/events/",
    "/marketplace/",
    "/watch/",
    "?q=",
    "&q=",
    "/search/top",
    "/search/posts",
    "/search/pages",
  ];
  if (junk.some((j) => low.includes(j))) return false;
  try {
    const raw = u.startsWith("http://") || u.startsWith("https://") ? u : `https://${u}`;
    const parsed = new URL(raw);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    if (!ALLOWED_FB_HOSTS.has(host)) return false;
    const pathRaw = parsed.pathname || "";
    const pathNorm = pathRaw.endsWith("/") && pathRaw.length > 1 ? pathRaw.slice(0, -1) : pathRaw;
    if (!pathNorm || pathNorm === "/") return false;
    const pl = pathNorm.toLowerCase();
    const badPath = ["/dialog/", "/plugins/", "/login", "/recover", "/legal", "/policy", "/help/"];
    if (badPath.some((b) => pl.includes(b))) return false;
    const segments = pathNorm.split("/").filter(Boolean);
    if (segments.length === 0) return false;
    const head = segments[0].toLowerCase();
    const q = parsed.search.toLowerCase();
    if (head === "profile.php" && q.includes("id=")) return true;
    if (head === "share" || pl.includes("/share/")) return true;
    if (head === "pages" && segments.length >= 2) return true;
    if (head === "pg" && segments.length >= 2) return true;
    const badHead = new Set(["photo.php", "video.php", "stories", "reel", "reels", "watch"]);
    if (badHead.has(head)) return false;
    if (segments.length === 1 && /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,120}$/.test(segments[0])) return true;
    return false;
  } catch {
    return false;
  }
}

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
  const fb = trim(lead.facebook_url);
  if (fb && isValidFacebookBusinessUrl(fb)) return true;

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
  if (trim(lead.email) || trim(lead.phone_from_site) || trim(lead.contact_page)) return true;
  const fb = trim(lead.facebook_url);
  if (fb && isValidFacebookBusinessUrl(fb)) return true;
  return false;
}

/** DB / server rows use `phone`; UI leads use `phone_from_site`. */
export function hasReachableContactForTargetRow(
  row: Pick<LeadRowForWorkflow, "email" | "phone" | "facebook_url" | "contact_page">
): boolean {
  if (trim(row.email) || trim(row.phone) || trim(row.contact_page)) return true;
  const fb = trim(row.facebook_url);
  if (fb && isValidFacebookBusinessUrl(fb)) return true;
  return false;
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
  if (trim(lead.facebook_url) && isValidFacebookBusinessUrl(trim(lead.facebook_url)))
    return "Facebook only · Reachable";
  return "Facebook lead · Has contact path";
}
