/**
 * Canonical `leads.lead_source` values and UI/filter helpers.
 * Optional `source_url` / `source_label` on the row for display.
 */

export type SourceFilterTab =
  | "all"
  | "extension"
  | "quick_add"
  | "scout"
  | "google"
  | "facebook"
  | "manual"
  | "three_d_printing";

export const SOURCE_FILTER_OPTIONS: { id: SourceFilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "three_d_printing", label: "3D print requests" },
  { id: "extension", label: "Extension captures" },
  { id: "quick_add", label: "Quick Add" },
  { id: "scout", label: "Scout" },
  { id: "google", label: "Google" },
  { id: "facebook", label: "Facebook" },
  { id: "manual", label: "Manual" },
];

/**
 * Prefer DB `leads.source` when it holds a capture channel (extension, quick_add, …).
 * For local/optimistic client rows, falls back to `lead_source`.
 */
export function resolvedCaptureSource(lead: {
  source?: string | null;
  record_origin?: string | null;
  lead_source?: string | null;
}): string {
  const l = String(lead.lead_source || "").trim();
  const db = String(lead.source || "").trim();
  const ro = String(lead.record_origin || "").trim();
  if (ro === "local" || ro === "optimistic") return l || db;
  if (db) return db;
  return l;
}

/** Normalize legacy and alias values to comparison tokens. */
export function normalizeLeadSourceValue(raw: string | null | undefined): string {
  const s = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  if (!s) return "";
  if (s === "bookmarklet") return "quick_add";
  if (s === "manual_local") return "manual";
  if (s === "print_quote" || s === "print_request") return "3d_printing";
  if (s === "scout_simple_intake" || s === "scoutsimpleintake") return "scout_mixed";
  if (s === "opportunity_sync" || s === "opportunitysync") return "scout_mixed";
  return s;
}

export function mapScoutSourceTypeToLeadSource(sourceType: string | null | undefined): string {
  const t = String(sourceType || "").toLowerCase();
  if (t === "google") return "scout_google";
  if (t === "facebook") return "scout_facebook";
  if (t === "mixed" || t === "manual" || t === "unknown" || !t) return "scout_mixed";
  return "scout_mixed";
}

/** Map bookmarklet → quick_add; normalize known tokens to lowercase. */
export function normalizeQuickAddRequestSource(raw: string | null | undefined): string {
  const s = String(raw || "").trim();
  const low = s.toLowerCase();
  if (low === "bookmarklet") return "quick_add";
  if (!low) return "quick_add";
  const known = ["extension", "quick_add", "scout_google", "scout_facebook", "scout_mixed", "manual"];
  if (known.includes(low)) return low;
  return low;
}

/** Default `source_label` for extension captures from capture/page URL. */
export function extensionCaptureLabelFromUrl(rawUrl: string | null | undefined): "Facebook" | "Website" {
  const u = String(rawUrl || "").toLowerCase();
  if (u.includes("facebook.com") || u.includes("fb.com")) return "Facebook";
  return "Website";
}

export function inferCaptureLabelFromUrl(rawUrl: string): string | null {
  const u = String(rawUrl || "").trim();
  if (!u) return null;
  try {
    const url = new URL(u.startsWith("http") ? u : `https://${u}`);
    const h = url.hostname.toLowerCase();
    if (h.includes("facebook.") || h.endsWith("fb.com")) return "Captured from Facebook";
    if (h.includes("google.") && (url.pathname.includes("/maps") || url.search.includes("maps"))) {
      return "Captured from Google Maps";
    }
    if (h.includes("google.")) return "Captured from Google";
    return "Captured from the web";
  } catch {
    return null;
  }
}

function humanizeLegacyToken(raw: string | null | undefined): string {
  const x = String(raw || "")
    .replace(/_/g, " ")
    .trim();
  if (!x) return "Unknown";
  return x.replace(/\b\w/g, (c) => c.toUpperCase());
}

const SOURCE_BADGE_BY_CANONICAL: Record<string, string> = {
  extension: "Extension",
  quick_add: "Quick Add",
  scout_google: "Scout (Google)",
  scout_facebook: "Scout (Facebook)",
  scout_mixed: "Scout",
  manual: "Manual",
  manual_pick: "Top Picks",
  "3d_printing": "3D printing",
};

/** Small card line: canonical map + Extension (Label) when `source_label` is set. */
export function formatLeadSourceBadge(lead: {
  source?: string | null;
  lead_source?: string | null;
  source_label?: string | null;
  source_url?: string | null;
  website?: string | null;
}): string {
  const c = normalizeLeadSourceValue(resolvedCaptureSource(lead));
  const label = String(lead.source_label || "").trim();
  if (c === "extension" && label) {
    return `Source: Extension (${label})`;
  }
  if (c === "extension") {
    return "Source: Extension";
  }
  const mapped = SOURCE_BADGE_BY_CANONICAL[c];
  if (mapped) return `Source: ${mapped}`;
  if (c.startsWith("scout_")) return "Source: Scout";
  const raw = resolvedCaptureSource(lead).trim();
  if (!raw) return "Source: Not set";
  return `Source: ${humanizeLegacyToken(raw)}`;
}

/** Search / legacy: plain line including inferred extension context. */
export function formatLeadSourceLine(lead: {
  source?: string | null;
  lead_source?: string | null;
  source_label?: string | null;
  source_url?: string | null;
  website?: string | null;
}): string {
  return formatLeadSourceBadge(lead);
}

export function leadMatchesSourceFilter(
  lead: {
    source?: string | null;
    lead_source?: string | null;
    source_label?: string | null;
    source_url?: string | null;
    website?: string | null;
  },
  tab: SourceFilterTab
): boolean {
  if (tab === "all") return true;
  const raw = resolvedCaptureSource(lead);
  const c = normalizeLeadSourceValue(raw);

  switch (tab) {
    case "extension":
      return c === "extension";
    case "quick_add":
      return c === "quick_add";
    case "manual":
      return c === "manual";
    case "scout":
      return c.startsWith("scout_");
    case "google":
      return c === "scout_google";
    case "facebook":
      return c === "scout_facebook";
    case "three_d_printing":
      return c === "3d_printing";
    default:
      return true;
  }
}
