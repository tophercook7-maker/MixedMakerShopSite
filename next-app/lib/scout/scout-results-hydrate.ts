/**
 * Merge canonical `scout_results` columns with `raw_source_payload` (upstream Scout lead)
 * so API consumers always see business_name, city, category, facebook_url, and phone when
 * the data exists in either place (e.g. phone only in raw after "present" normalization).
 */

export type HydratedScoutContactFields = {
  business_name: string;
  city: string | null;
  state: string | null;
  category: string | null;
  facebook_url: string | null;
  phone: string | null;
  has_phone: boolean | null;
  has_facebook: boolean | null;
};

function trimStr(v: unknown): string {
  return String(v ?? "").trim();
}

function phoneFromRawPayload(raw: Record<string, unknown> | null): string {
  if (!raw) return "";
  const p =
    trimStr(raw.phone) ||
    trimStr(raw.contact_phone) ||
    trimStr(raw.phone_number) ||
    trimStr(raw.tel) ||
    trimStr(raw.mobile) ||
    trimStr(raw.primary_phone);
  return p;
}

/** True if string looks like a Facebook / Meta URL (host check optional). */
function looksLikeFacebookUrl(s: string): boolean {
  return /facebook\.|fb\.com|fb\.me|\.facebook\.com/i.test(s);
}

/**
 * Read merged outreach / mockup fields from a `scout_results` row shape (DB or JSON).
 */
export function hydrateScoutResultRecord(r: Record<string, unknown>): HydratedScoutContactFields {
  const raw =
    r.raw_source_payload && typeof r.raw_source_payload === "object"
      ? (r.raw_source_payload as Record<string, unknown>)
      : null;

  const business_name = trimStr(r.business_name) || (raw ? trimStr(raw.business_name) : "") || "";

  const cityJoined = trimStr(r.city) || (raw ? trimStr(raw.city) : "") || null;
  const stateRaw = r.state ?? raw?.state;
  const state = stateRaw != null && trimStr(stateRaw) ? trimStr(stateRaw) : null;

  const category = trimStr(r.category) || (raw ? trimStr(raw.category) : "") || null;

  let facebook_url = trimStr(r.facebook_url) || (raw ? trimStr(raw.facebook_url) : "") || "";
  if (!facebook_url && raw) {
    const web = trimStr(raw.website);
    if (web && looksLikeFacebookUrl(web)) facebook_url = web;
  }
  const facebook_urlOut = facebook_url || null;

  let phone = trimStr(r.phone);
  if (phone === "present") phone = "";
  if (!phone) phone = phoneFromRawPayload(raw);
  const phoneOut = phone || null;

  let has_phone: boolean | null = null;
  if (phoneOut) has_phone = true;
  else if (typeof r.has_phone === "boolean") has_phone = r.has_phone;
  else if (raw && trimStr(raw.best_contact_method).toLowerCase() === "phone") has_phone = true;

  let has_facebook: boolean | null = null;
  if (facebook_urlOut) has_facebook = true;
  else if (typeof r.has_facebook === "boolean") has_facebook = r.has_facebook;
  else if (raw && trimStr(raw.best_contact_method).toLowerCase() === "facebook") has_facebook = true;

  return {
    business_name,
    city: cityJoined,
    state,
    category: category || null,
    facebook_url: facebook_urlOut,
    phone: phoneOut,
    has_phone,
    has_facebook,
  };
}
