import type { ScoutLead } from "@/lib/scout/types";

export type DiscoverySource = "google" | "facebook" | "mixed" | "manual";

export type WebsiteBucket = "has" | "none" | "unknown";

/** Heuristic: backend may send source later; until then infer from signals and contact path. */
export function inferDiscoverySource(lead: ScoutLead): DiscoverySource {
  const explicit = String(lead.source_type || "").toLowerCase().trim();
  if (explicit === "google" || explicit === "facebook" || explicit === "manual" || explicit === "mixed") {
    return explicit;
  }
  const reason = String(lead.opportunity_reason || "").toLowerCase();
  const signals = (lead.opportunity_signals || []).map((s) => String(s || "").toLowerCase()).join(" ");
  const hay = `${reason} ${signals}`;
  const contact = String(lead.best_contact_method || "").toLowerCase();
  const googleHit =
    hay.includes("google") || hay.includes("maps") || hay.includes("places") || hay.includes("gmb");
  const fbHit = hay.includes("facebook") || hay.includes("fb.com") || contact === "facebook";
  if (googleHit && fbHit) return "mixed";
  if (fbHit) return "facebook";
  if (googleHit) return "google";
  if (contact === "facebook") return "facebook";
  return "google";
}

export function sourceLabel(src: DiscoverySource): "Google" | "Facebook" | "Both" {
  if (src === "mixed") return "Both";
  if (src === "facebook") return "Facebook";
  return "Google";
}

export function websiteBucket(lead: ScoutLead): WebsiteBucket {
  const w = String(lead.website || "").trim();
  if (!w) {
    const reason = String(lead.opportunity_reason || "").toLowerCase();
    const signals = (lead.opportunity_signals || []).map((s) => String(s || "").toLowerCase()).join(" ");
    if (reason.includes("no website") || signals.includes("no_website")) return "none";
    return "unknown";
  }
  const lower = w.toLowerCase();
  if (lower.includes("facebook.") || lower.includes("fb.com")) return "none";
  return "has";
}

export function hasFacebookPresence(lead: ScoutLead): boolean {
  const contact = String(lead.best_contact_method || "").toLowerCase();
  const reason = String(lead.opportunity_reason || "").toLowerCase();
  const signals = (lead.opportunity_signals || []).map((s) => String(s || "").toLowerCase()).join(" ");
  return contact === "facebook" || reason.includes("facebook") || signals.includes("facebook");
}

export function hasPhonePresence(lead: ScoutLead): boolean {
  if (String(lead.phone || "").trim().length > 0) return true;
  const c = String(lead.best_contact_method || "").toLowerCase();
  if (c === "phone") return true;
  const reason = String(lead.opportunity_reason || "").toLowerCase();
  return reason.includes("phone");
}

export function facebookOnlyBusiness(lead: ScoutLead): boolean {
  return websiteBucket(lead) === "none" && hasFacebookPresence(lead);
}

/** Single line for compact card — plain English. */
export function compactOpportunityLine(lead: ScoutLead): string {
  if (websiteBucket(lead) === "none" && hasFacebookPresence(lead)) return "Facebook page only";
  if (websiteBucket(lead) === "none") return "No website found";
  if (websiteBucket(lead) === "unknown") return "Website unclear";
  const reason = String(lead.opportunity_reason || "").toLowerCase();
  if (reason.includes("weak") || reason.includes("outdated") || reason.includes("broken")) {
    return "Has website but weak presence";
  }
  if (reason.includes("contact")) return "No contact page";
  return "Worth a look";
}

export function rankScoreForSort(lead: ScoutLead): number {
  const wb = websiteBucket(lead);
  let base = 0;
  if (facebookOnlyBusiness(lead)) base = 800_000;
  else if (wb === "none") base = 1_000_000;
  else if (wb === "unknown") base = 400_000;
  else if (reasonWeak(lead)) base = 600_000;
  else base = 200_000;
  const score = Number(lead.opportunity_score ?? lead.score ?? 0);
  return base + Math.min(99_999, Math.max(0, score));
}

function reasonWeak(lead: ScoutLead): boolean {
  const r = String(lead.opportunity_reason || "").toLowerCase();
  return r.includes("weak") || r.includes("outdated") || r.includes("broken") || r.includes("cta");
}

export function opportunityId(lead: ScoutLead): string {
  return String(lead.id || lead.slug || "").trim();
}

export function labelWebsiteStatus(lead: ScoutLead): "Website" | "No website" | "Unknown" {
  const b = websiteBucket(lead);
  if (b === "has") return "Website";
  if (b === "none") return "No website";
  return "Unknown";
}

export function labelFacebookStatus(lead: ScoutLead): "Facebook found" | "None" | "Unknown" {
  if (String(lead.facebook_url || "").trim()) return "Facebook found";
  if (hasFacebookPresence(lead)) return "Facebook found";
  const contact = String(lead.best_contact_method || "").toLowerCase();
  if (contact === "facebook") return "Facebook found";
  return "None";
}

export function labelPhoneStatus(lead: ScoutLead): "Phone found" | "None" {
  return hasPhonePresence(lead) ? "Phone found" : "None";
}

export function openSourceHref(lead: ScoutLead): string | null {
  const u = String(lead.source_url || "").trim();
  if (u) return u;
  const web = String(lead.website || "").trim();
  if (web && !web.toLowerCase().includes("facebook.")) return web;
  const fb = String(lead.facebook_url || "").trim();
  if (fb) return fb;
  const name = String(lead.business_name || "").trim();
  const city = String(lead.city || "").trim();
  if (name) {
    const q = [name, city].filter(Boolean).join(" ");
    return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  }
  return null;
}
