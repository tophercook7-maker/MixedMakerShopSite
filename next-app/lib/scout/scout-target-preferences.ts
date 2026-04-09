/**
 * Lightweight scoring hints for Scout (not a hard filter). Adjust for your markets.
 * Matches common Scout console cities / service categories.
 */
export const SCOUT_TARGET_CITIES: string[] = [
  "hot springs",
  "benton",
  "bryant",
  "malvern",
  "little rock",
  "conway",
  "fayetteville",
  "fort smith",
  "springdale",
  "rogers",
  "jonesboro",
  "texarkana",
];

export const SCOUT_TARGET_STATES: string[] = ["ar", "arkansas"];

/** Lowercase substrings matched against category / niche */
export const SCOUT_TARGET_CATEGORY_HINTS: string[] = [
  "plumb",
  "hvac",
  "roof",
  "landscap",
  "pressure",
  "detail",
  "electric",
  "clean",
  "contractor",
  "salon",
  "auto",
  "lawn",
  "fence",
  "pest",
  "garage door",
  "concrete",
];

export function cityMatchesTargetArea(city: string | null | undefined): boolean {
  const c = String(city || "").trim().toLowerCase();
  if (!c) return false;
  return SCOUT_TARGET_CITIES.some((t) => c === t || c.includes(t) || t.includes(c));
}

export function stateMatchesTargetArea(state: string | null | undefined): boolean {
  const s = String(state || "").trim().toLowerCase();
  if (!s) return false;
  return SCOUT_TARGET_STATES.some((t) => s === t || s.includes(t));
}

export function categoryMatchesTarget(category: string | null | undefined): boolean {
  const cat = String(category || "").trim().toLowerCase();
  if (!cat) return false;
  return SCOUT_TARGET_CATEGORY_HINTS.some((h) => cat.includes(h));
}
