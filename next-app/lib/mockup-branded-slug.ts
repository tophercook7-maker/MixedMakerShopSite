import type { SupabaseClient } from "@supabase/supabase-js";

const CRM_TABLE = "crm_mockups";
const LEADS_TABLE = "leads";

/** True if slug is taken on CRM mockups or lead site-draft previews. */
export async function isPreviewSlugTaken(supabase: SupabaseClient, slug: string): Promise<boolean> {
  const s = String(slug || "").trim();
  if (!s) return true;
  const { data: m, error: errM } = await supabase.from(CRM_TABLE).select("id").eq("mockup_slug", s).maybeSingle();
  if (errM) return true;
  if (m) return true;
  const { data: l, error: errL } = await supabase.from(LEADS_TABLE).select("id").eq("site_draft_preview_slug", s).maybeSingle();
  if (errL) return false;
  return Boolean(l);
}

/** UUID v4 pattern for routing `/preview/{uuid}` → lead site draft. */
export function isLeadPreviewUuid(segment: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(segment || "").trim()
  );
}

export function slugifyPreviewSegment(raw: string): string {
  const s = String(raw || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return s.slice(0, 56) || "preview";
}

function shortToken(): string {
  const bytes = new Uint8Array(4);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Ordered candidates: prefer `{name}-preview`, then city disambiguation, then random suffix. */
export function brandedMockupSlugCandidates(businessName: string, city: string | null | undefined): string[] {
  const base = slugifyPreviewSegment(businessName);
  const cityPart = city
    ? slugifyPreviewSegment(String(city).split(",")[0]?.trim() || String(city)).slice(0, 28)
    : "";
  const withPreview = `${base}-preview`;
  const out: string[] = [];
  if (withPreview.length >= 8) out.push(withPreview);
  if (base.length >= 6) out.push(`${base}-website-preview`);
  if (cityPart && base.length >= 4) out.push(`${base}-${cityPart}`);
  out.push(`${base}-${shortToken()}`);
  return Array.from(new Set(out));
}

function fallbackHexSlug(): string {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `m-${hex}`;
}

/**
 * Picks the first branded slug not used on `crm_mockups` or `leads.site_draft_preview_slug`.
 */
export async function allocateUniqueBrandedMockupSlug(
  supabase: SupabaseClient,
  businessName: string,
  city: string | null | undefined
): Promise<string> {
  const candidates = brandedMockupSlugCandidates(businessName, city);
  for (const candidate of candidates) {
    const taken = await isPreviewSlugTaken(supabase, candidate);
    if (!taken) return candidate;
  }
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const slug = fallbackHexSlug();
    const taken = await isPreviewSlugTaken(supabase, slug);
    if (!taken) return slug;
  }
  return fallbackHexSlug();
}

/** Branded slug for public client site draft previews (`/preview/{slug}`). */
export async function allocateUniqueSiteDraftPreviewSlug(
  supabase: SupabaseClient,
  businessName: string,
  city: string | null | undefined
): Promise<string> {
  return allocateUniqueBrandedMockupSlug(supabase, businessName, city);
}

/** Public path for share links (no trailing slash). */
export function previewPublicPath(slug: string): string {
  const s = String(slug || "").trim();
  return `/preview/${encodeURIComponent(s)}`;
}

export function absolutePreviewUrl(origin: string, slug: string): string {
  const base = String(origin || "").replace(/\/$/, "");
  return `${base}${previewPublicPath(slug)}`;
}
