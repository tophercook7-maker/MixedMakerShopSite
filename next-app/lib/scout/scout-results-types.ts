import type { ScoutLead } from "@/lib/scout/types";

export type ScoutSourceTypeStored = "google" | "facebook" | "mixed" | "manual" | "unknown";

export type ScoutResultRow = {
  id: string;
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
  raw_source_payload: Record<string, unknown> | null;
  scout_notes: string | null;
  skipped: boolean;
  added_to_leads: boolean;
  linked_lead_id: string | null;
  discovered_at: string;
  created_at: string;
  updated_at: string;
};

/** Compact row for list UI — no raw JSON */
export type ScoutResultListItem = {
  id: string;
  business_name: string;
  city: string | null;
  state: string | null;
  category: string | null;
  source_type: ScoutSourceTypeStored;
  website_url: string | null;
  has_website: boolean | null;
  facebook_url: string | null;
  has_facebook: boolean | null;
  phone: string | null;
  has_phone: boolean | null;
  /** Best-effort from `raw_source_payload` (not a dedicated column on `scout_results`). */
  email?: string | null;
  opportunity_reason: string | null;
  opportunity_rank: number;
  source_url: string | null;
  skipped: boolean;
  added_to_leads: boolean;
  linked_lead_id: string | null;
  /** Opportunity id for create-lead API */
  source_external_id: string | null;
  scout_notes?: string | null;
  discovered_at?: string | null;
  marked_priority?: boolean | null;
  reviewed_at?: string | null;
  pulled_into_crm_at?: string | null;
};

/** After CRM dedupe + scoring (API response). */
export type EnrichedScoutResultListItem = ScoutResultListItem & {
  opportunity_score: number;
  opportunity_label: "hot" | "good" | "maybe" | "skip";
  reason_summary: string;
  crm_duplicate: boolean;
  duplicate_lead_id: string | null;
  scout_status: "new" | "reviewed" | "pulled" | "rejected" | "archived";
};

export type ScoutResultsCounts = {
  new_in_queue: number;
  saved_to_leads: number;
  skipped: number;
  no_website: number;
  facebook_only: number;
  /** All rows for this owner */
  total_all: number;
  hot_in_queue: number;
  good_in_queue: number;
  maybe_in_queue: number;
  skip_in_queue: number;
  rejected: number;
  archived: number;
};

export type ScoutResultsSyncBody = {
  opportunities?: ScoutLead[];
  leads?: ScoutLead[];
};
