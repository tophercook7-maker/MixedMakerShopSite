/**
 * Deterministic normalization for capture platform labels (stored + display).
 */

export const WEB_SOURCE_PLATFORMS = [
  "google_maps",
  "google_search",
  "facebook",
  "manual",
  "extension",
  "quick_add",
  "import",
  "unknown",
] as const;

export type WebSourcePlatform = (typeof WEB_SOURCE_PLATFORMS)[number];

const PLATFORM_SET = new Set<string>(WEB_SOURCE_PLATFORMS);

function trimLower(s: string | null | undefined): string {
  return String(s ?? "").trim().toLowerCase();
}

/** Map DB / legacy strings to a canonical platform key. */
export function normalizeSourcePlatform(
  raw: string | null | undefined,
  hints?: { source?: string | null; lead_source?: string | null }
): WebSourcePlatform {
  const direct = trimLower(raw);
  if (direct && PLATFORM_SET.has(direct)) return direct as WebSourcePlatform;

  const blob = [raw, hints?.source, hints?.lead_source].map(trimLower).join(" ");

  if (blob.includes("google_maps") || blob.includes("google maps") || blob === "gmb" || blob.includes("maps.google")) {
    return "google_maps";
  }
  if (blob.includes("google_search") || blob.includes("google search") || blob.includes("serp")) {
    return "google_search";
  }
  if (blob.includes("facebook") || blob.includes("fb.com")) return "facebook";
  if (blob.includes("extension") || blob.includes("chrome")) return "extension";
  if (blob.includes("quick") && blob.includes("add")) return "quick_add";
  if (blob.includes("import")) return "import";
  if (blob.includes("manual") || blob === "scout" || blob.includes("hand")) return "manual";

  if (direct) return "unknown";
  return "unknown";
}

export function sourcePlatformLabel(p: WebSourcePlatform): string {
  switch (p) {
    case "google_maps":
      return "Google Maps";
    case "google_search":
      return "Google Search";
    case "facebook":
      return "Facebook";
    case "manual":
      return "Manual";
    case "extension":
      return "Extension";
    case "quick_add":
      return "Quick add";
    case "import":
      return "Import";
    default:
      return "Unknown";
  }
}
