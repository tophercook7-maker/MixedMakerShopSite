/**
 * Single source of truth for CRM lead fields & statuses (aligned with Supabase `public.leads`).
 * Use whitelists on all server writes to prevent schema drift / PostgREST errors.
 */

export const CANONICAL_LEAD_STATUSES = [
  "new",
  "contacted",
  "replied",
  "qualified",
  "proposal_sent",
  "won",
  "lost",
] as const;

export type CanonicalLeadStatus = (typeof CANONICAL_LEAD_STATUSES)[number];

/** True if the business has a non–social-web URL (Facebook-only counts as no real website). */
export function leadHasStandaloneWebsite(websiteRaw: string | undefined | null): boolean {
  const w = String(websiteRaw || "").trim();
  if (!w) return false;
  try {
    const u = new URL(w.startsWith("http") ? w : `https://${w}`);
    const h = u.hostname.toLowerCase();
    if (h.includes("facebook.") || h.endsWith("fb.com")) return false;
    return true;
  } catch {
    const l = w.toLowerCase();
    return !(l.includes("facebook.") || l.includes("fb.com"));
  }
}

const LEGACY_STATUS_MAP: Record<string, CanonicalLeadStatus> = {
  follow_up_due: "contacted",
  follow_up: "contacted",
  closed_won: "won",
  closed_lost: "lost",
  closed: "lost",
  do_not_contact: "lost",
  research_later: "lost",
  no_response: "lost",
  not_interested: "lost",
  archived: "lost",
  interested: "qualified",
};

/** Normalize any legacy/client status string to a DB-safe canonical status. */
export function canonicalizeLeadStatus(raw: unknown): CanonicalLeadStatus {
  const key = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (!key) return "new";
  if ((CANONICAL_LEAD_STATUSES as readonly string[]).includes(key)) {
    return key as CanonicalLeadStatus;
  }
  return LEGACY_STATUS_MAP[key] ?? "new";
}

/**
 * Columns that may be set on INSERT (excluding id — server-generated unless legacy sync).
 * Must match migrations under supabase/migrations/*leads*.
 */
export const LEAD_INSERT_COLUMN_WHITELIST = [
  "business_name",
  "contact_name",
  "email",
  "phone",
  "website",
  "facebook_url",
  "has_website",
  "normalized_website",
  "normalized_facebook_url",
  "industry",
  "category",
  "city",
  "state",
  "contact_page",
  "email_source",
  "source",
  "lead_source",
  "source_url",
  "source_label",
  "status",
  "notes",
  "scout_intake_reason",
  "why_this_lead_is_here",
  "visual_business",
  "follow_up_date",
  "owner_id",
  "workspace_id",
  "linked_opportunity_id",
  "address",
  "place_id",
  "google_business_url",
  "advertising_page_url",
  "advertising_page_label",
  "best_contact_method",
  "best_contact_value",
  "suggested_template_key",
  "suggested_response",
  "opportunity_score",
  "conversion_score",
  "score_breakdown",
  "auto_intake",
  "deal_status",
  "deal_stage",
  "deal_value",
  "closed_at",
  "replied_at",
  "reply_note",
  "outreach_sent_at",
  "contact_method",
  "last_contacted_at",
  "next_follow_up_at",
  "follow_up_count",
  "follow_up_stage",
  "follow_up_status",
  "sequence_step",
  "sequence_active",
  "outreach_sent",
  "preview_url",
  "follow_up_1",
  "follow_up_2",
  "follow_up_3",
  "follow_up_1_sent",
  "follow_up_2_sent",
  "follow_up_3_sent",
  "is_manual",
  "known_owner_name",
  "known_context",
  "door_status",
  "real_world_why_target",
  "real_world_walk_in_pitch",
  "best_time_to_visit",
  "last_updated_at",
  "is_recurring_client",
  "monthly_value",
  "subscription_started_at",
  "referred_by",
  "referral_source",
  "is_referred_client",
  "is_hot_lead",
  "recommended_next_action",
  "primary_contact_name",
  "lead_tags",
  "unread_reply_count",
  "automation_paused",
  "last_reply_at",
  "last_reply_preview",
  "last_outreach_channel",
  "last_outreach_status",
  "last_outreach_sent_at",
  "preview_sent",
  "email_sent",
  "facebook_sent",
  "text_sent",
  "created_at",
] as const;

/**
 * Columns allowed on PATCH (client/server). Never id or owner_id.
 */
export const LEAD_PATCH_COLUMN_WHITELIST = LEAD_INSERT_COLUMN_WHITELIST.filter(
  (c) => c !== "owner_id"
) as readonly string[];

const INSERT_SET = new Set<string>(LEAD_INSERT_COLUMN_WHITELIST);
const PATCH_SET = new Set<string>(LEAD_PATCH_COLUMN_WHITELIST);

export function pickLeadInsertFields(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (!INSERT_SET.has(k)) continue;
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

export function pickLeadPatchFields(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (k === "id" || k === "owner_id") continue;
    if (!PATCH_SET.has(k)) continue;
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

/** Optional dedup fingerprint columns (may not exist on older DBs). */
export const LEAD_FINGERPRINT_OPTIONAL_COLUMNS = [
  "normalized_business_name",
  "normalized_email",
  "normalized_phone",
] as const;
