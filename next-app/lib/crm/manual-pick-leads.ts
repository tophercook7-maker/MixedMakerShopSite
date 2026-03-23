import { normalizeLeadSourceValue, resolvedCaptureSource } from "@/lib/crm/lead-source";

/** DB `source` / `lead_source` for owner hand-picked priority leads (never scout_*). */
export const MANUAL_PICK_SOURCE = "manual_pick";

/** Tags applied to manual priority list rows. */
export const MANUAL_PICK_TAG = "manual_pick";
export const PRIORITY_LIST_TAG = "priority_list";

export const DEFAULT_MANUAL_PICK_TAGS = [MANUAL_PICK_TAG, PRIORITY_LIST_TAG] as const;

export type LeadPoolTab = "all" | "top_picks" | "scout";

export function parseLeadPoolTab(raw: string | null | undefined): LeadPoolTab {
  const v = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  if (v === "top_picks" || v === "toppicks" || v === "my_leads" || v === "myleads") return "top_picks";
  if (v === "scout" || v === "scout_leads") return "scout";
  return "all";
}

function tagsArray(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags.map((t) => String(t || "").trim()).filter(Boolean);
}

/** True if this row is the owner's Top Picks lane (not generic Scout). */
export function isTopPickLead(lead: {
  source?: string | null;
  lead_source?: string | null;
  lead_tags?: string[] | null;
}): boolean {
  const cap = normalizeLeadSourceValue(resolvedCaptureSource(lead));
  if (cap === MANUAL_PICK_SOURCE) return true;
  const lowerTags = tagsArray(lead.lead_tags).map((t) => t.toLowerCase());
  return lowerTags.includes(MANUAL_PICK_SOURCE);
}

/** Scout-sourced leads (synced / discovered), excluding the Top Picks lane. */
export function isScoutSourceLead(lead: {
  source?: string | null;
  lead_source?: string | null;
}): boolean {
  if (isTopPickLead(lead)) return false;
  const cap = normalizeLeadSourceValue(resolvedCaptureSource(lead));
  return cap.startsWith("scout_");
}

export function matchesLeadPoolTab(
  lead: { source?: string | null; lead_source?: string | null; lead_tags?: string[] | null },
  tab: LeadPoolTab
): boolean {
  if (tab === "all") return true;
  if (tab === "top_picks") return isTopPickLead(lead);
  if (tab === "scout") return isScoutSourceLead(lead);
  return true;
}

/** Merge Top Picks tags into an existing tag list (deduped, case-insensitive for manual_pick / priority_list). */
export function mergeTopPickTags(existing: string[] | null | undefined): string[] {
  const out = new Map<string, string>();
  for (const t of tagsArray(existing)) {
    const key = t.toLowerCase();
    if (!out.has(key)) out.set(key, t);
  }
  for (const t of DEFAULT_MANUAL_PICK_TAGS) {
    const key = t.toLowerCase();
    if (!out.has(key)) out.set(key, t);
  }
  return Array.from(out.values());
}
