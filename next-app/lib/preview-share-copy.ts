/**
 * Single outward-facing template for preview links (admin copy, email, outreach).
 * Apostrophe: Unicode right single quotation mark in "I'd" for polish in UI/email.
 */

const APOSTROPHE = "\u2019";

function normalizePreviewUrl(url: string): string {
  return String(url || "")
    .trim()
    .replace(/\/mockup\//g, "/preview/");
}

/** Short plain body: link + one follow-up line (no signature). */
export function buildPreviewShareCoreBody(previewUrl: string): string {
  const link = normalizePreviewUrl(previewUrl);
  return [
    "I put together a custom website preview for your business:",
    "",
    link,
    "",
    `This gives you a real look at the direction I${APOSTROPHE}d take before you commit to anything.`,
  ].join("\n");
}

/** Email-friendly: core + light closing + signature. */
export function buildPreviewShareEmailBody(previewUrl: string): string {
  return [
    buildPreviewShareCoreBody(previewUrl),
    "",
    `Happy to walk through it whenever works for you.`,
    "",
    "Topher",
    "MixedMakerShop",
  ].join("\n");
}

/** Optional greeting line prepended (e.g. Hey {name},). */
export function buildPreviewShareEmailBodyWithGreeting(previewUrl: string, contactName: string): string {
  const name = String(contactName || "").trim() || "there";
  return [`Hey ${name},`, "", buildPreviewShareEmailBody(previewUrl)].join("\n");
}

/** SMS / DM length-conscious variant (same core idea). */
export function buildPreviewShareShortText(previewUrl: string): string {
  const link = normalizePreviewUrl(previewUrl);
  return `I put together a custom website preview for your business — a real look at the direction I${APOSTROPHE}d take before you commit to anything.\n\n${link}`;
}

/** Facebook / longer social blurb. */
export function buildPreviewShareFacebookBody(previewUrl: string): string {
  return buildPreviewShareShortText(previewUrl);
}

/** Default subject for preview emails. */
export function previewShareEmailSubject(businessName?: string | null): string {
  const b = String(businessName || "").trim();
  return b ? `Custom website preview for ${b}` : "Custom website preview";
}
