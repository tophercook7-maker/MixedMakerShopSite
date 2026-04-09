/**
 * Append a short, human-readable line to `leads.notes` (plain text).
 * Keeps history without spamming huge blocks.
 */
export function appendLeadNoteLine(existing: string | null | undefined, line: string, maxLen = 12000): string {
  const next = String(line || "").trim();
  if (!next) return String(existing || "").trim();
  const base = String(existing || "").trim();
  const stamp = new Date().toISOString().slice(0, 10);
  const prefixed = `[${stamp}] ${next}`;
  if (!base) return prefixed;
  const combined = `${base}\n${prefixed}`;
  return combined.length <= maxLen ? combined : combined.slice(combined.length - maxLen);
}
