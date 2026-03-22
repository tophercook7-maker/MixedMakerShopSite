import type { ScoutResultListItem } from "@/lib/scout/scout-results-types";

export function sourceTypeLabel(source_type: string): "Google" | "Facebook" | "Both" | "Unknown" | "Manual" {
  const s = String(source_type || "").toLowerCase();
  if (s === "mixed") return "Both";
  if (s === "facebook") return "Facebook";
  if (s === "google") return "Google";
  if (s === "manual") return "Manual";
  return "Unknown";
}

export function labelWebsiteFromRow(row: ScoutResultListItem): "Website" | "No website" | "Unknown" {
  if (row.has_website === true) return "Website";
  if (row.has_website === false) return "No website";
  return "Unknown";
}

export function labelFacebookFromRow(row: ScoutResultListItem): "Facebook found" | "None" {
  if (row.has_facebook || String(row.facebook_url || "").trim()) return "Facebook found";
  return "None";
}

export function labelPhoneFromRow(row: ScoutResultListItem): "Has phone" | "None" {
  return row.has_phone ? "Has phone" : "None";
}

export function compactOpportunityLineFromRow(row: ScoutResultListItem): string {
  const web = String(row.website_url || "").trim();
  const fb = row.has_facebook || String(row.facebook_url || "").trim();
  const isFbDomain = /facebook\.|fb\.com/i.test(web);
  if (row.has_website === false && fb) return "Facebook page only";
  if (row.has_website === false || (!web && row.has_website !== true)) return "No website found";
  if (row.has_website == null && !web) return "Website unclear";
  const reason = String(row.opportunity_reason || "").toLowerCase();
  if (reason.includes("weak") || reason.includes("outdated") || reason.includes("broken")) {
    return "Has website but weak presence";
  }
  if (reason.includes("contact")) return "No contact page";
  return "Worth a look";
}

/** One-line contact signals for compact cards: Facebook → phone → website (email not stored on scout_results). */
export function compactContactScanLine(row: ScoutResultListItem): string {
  const fb = row.has_facebook || String(row.facebook_url || "").trim() ? "Has Facebook" : "No Facebook";
  const ph = row.has_phone ? "Has phone" : "No phone";
  const web =
    row.has_website === false
      ? "No website"
      : row.has_website === true
        ? "Has website"
        : labelWebsiteFromRow(row);
  return `${fb} · ${ph} · ${web}`;
}

export function openSourceHrefFromRow(row: ScoutResultListItem): string | null {
  const u = String(row.source_url || "").trim();
  if (u) return u;
  const web = String(row.website_url || "").trim();
  if (web && !/facebook\.|fb\.com/i.test(web)) return web;
  const fb = String(row.facebook_url || "").trim();
  if (fb) return fb;
  const name = String(row.business_name || "").trim();
  const city = String(row.city || "").trim();
  if (name) return `https://www.google.com/search?q=${encodeURIComponent([name, city].filter(Boolean).join(" "))}`;
  return null;
}
