/**
 * Adds lightweight keyword tags to 3D print leads from free text (request notes, summary, etc.).
 * Tags are merged with existing `print_tags` — manual tags are kept; inferred tags are additive.
 */

const RULES: { tag: string; test: (s: string) => boolean }[] = [
  {
    tag: "mount",
    test: (s) =>
      /\bmount\b/.test(s) ||
      /\bholder\b/.test(s) ||
      /\bbracket\b/.test(s) ||
      /\bwall\s*mount\b/.test(s),
  },
  {
    tag: "replacement_part",
    test: (s) =>
      /\breplacement\b/.test(s) ||
      /\bbroken\b/.test(s) ||
      /\bspare\b/.test(s) ||
      /\breplace(ment)?\s*part\b/.test(s),
  },
  {
    tag: "organizer",
    test: (s) => /\borganizer\b/.test(s) || /\borganise\b/.test(s) || /\borganiz(er|ing)\b/.test(s),
  },
  {
    tag: "custom_fix",
    test: (s) =>
      /\bcustom\b/.test(s) || /\bfix\b/.test(s) || /\brepair\b/.test(s) || /\bmodif(y|ied)\b/.test(s),
  },
];

/** Tags suggested from text only (no merge). */
export function inferPrintKeywordTags(text: string): string[] {
  const raw = String(text || "").trim();
  if (raw.length < 2) return [];

  const s = raw.toLowerCase();
  const out: string[] = [];
  for (const { tag, test } of RULES) {
    if (test(s)) out.push(tag);
  }
  if (out.length === 0) out.push("unknown");
  return out;
}

/** Merge DB `print_tags` with keyword inference from combined text. */
export function mergePrintKeywordTags(existing: string[] | null | undefined, text: string): string[] {
  const base = (existing || []).map((t) => String(t).trim()).filter(Boolean);
  const inferred = inferPrintKeywordTags(text);
  if (inferred.length === 0) return base;
  return Array.from(new Set([...base, ...inferred]));
}
