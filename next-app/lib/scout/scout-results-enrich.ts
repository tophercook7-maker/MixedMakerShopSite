import { findDuplicateLeadIdForScoutRow, type LeadDedupRow } from "@/lib/scout/scout-crm-dedup-batch";
import {
  buildScoutReasonSummary,
  computeScoutOpportunityScore,
  opportunityLabelFromScore,
} from "@/lib/scout/scout-opportunity-score";
import type { EnrichedScoutResultListItem, ScoutResultListItem } from "@/lib/scout/scout-results-types";

export type ScoutResultListItemWithMeta = ScoutResultListItem & {
  scout_notes?: string | null;
  discovered_at?: string | null;
  reviewed_at?: string | null;
  marked_priority?: boolean | null;
  pulled_into_crm_at?: string | null;
};

export function isScoutRejectedNotes(scout_notes: string | null | undefined): boolean {
  const n = String(scout_notes || "").toLowerCase();
  return n.includes("not_useful");
}

export function isScoutArchivedNotes(scout_notes: string | null | undefined): boolean {
  const n = String(scout_notes || "").toLowerCase();
  return n.includes("archived");
}

export function deriveScoutStatus(row: ScoutResultListItemWithMeta): "new" | "reviewed" | "pulled" | "rejected" | "archived" {
  if (row.added_to_leads) return "pulled";
  if (row.skipped && isScoutRejectedNotes(row.scout_notes)) return "rejected";
  if (row.skipped && isScoutArchivedNotes(row.scout_notes)) return "archived";
  if (row.skipped) return "archived";
  if (row.reviewed_at || row.marked_priority) return "reviewed";
  return "new";
}

function toScoreInput(row: ScoutResultListItemWithMeta): Parameters<typeof computeScoutOpportunityScore>[0] {
  return {
    business_name: row.business_name,
    city: row.city,
    state: row.state,
    category: row.category,
    website_url: row.website_url,
    has_website: row.has_website,
    facebook_url: row.facebook_url,
    has_facebook: row.has_facebook,
    phone: row.phone,
    has_phone: row.has_phone,
    opportunity_reason: row.opportunity_reason,
    email: row.email,
    marked_priority: row.marked_priority,
  };
}

export function enrichScoutResultRow(row: ScoutResultListItemWithMeta, leadRows: LeadDedupRow[]): EnrichedScoutResultListItem {
  const dup = findDuplicateLeadIdForScoutRow(leadRows, {
    businessName: row.business_name,
    email: row.email,
    phone: row.phone,
    website: row.website_url,
    facebookUrl: row.facebook_url,
  });
  const scoutRejected = row.skipped && isScoutRejectedNotes(row.scout_notes);
  const flags = { crmDuplicate: dup.duplicate, scoutRejected };
  const input = toScoreInput(row);
  const score = computeScoutOpportunityScore(input, flags);
  const label = opportunityLabelFromScore(score);
  const reason_summary = buildScoutReasonSummary(input, flags, score);
  return {
    ...row,
    opportunity_score: score,
    opportunity_label: label,
    reason_summary,
    crm_duplicate: dup.duplicate,
    duplicate_lead_id: dup.leadId,
    scout_status: deriveScoutStatus(row),
  };
}

export function enrichScoutResultRows(rows: ScoutResultListItemWithMeta[], leadRows: LeadDedupRow[]): EnrichedScoutResultListItem[] {
  return rows.map((r) => enrichScoutResultRow(r, leadRows));
}
