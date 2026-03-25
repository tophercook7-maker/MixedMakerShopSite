/**
 * Quick reply copy for 3D print leads (admin). Stored in code — edit here to change tone.
 */

export type PrintReplyTemplate = {
  id: string;
  title: string;
  /** Plain text body; use "$X–$X" in simple_quote for optional replacement via `resolvePrintReplyBody`. */
  body: string;
};

export const PRINT_REPLY_TEMPLATES: readonly PrintReplyTemplate[] = [
  {
    id: "first_reply",
    title: "First reply",
    body: [
      "Hey — I got your request.",
      "",
      "That looks like something I can help with.",
      "",
      "A couple quick questions:",
      "- size (rough is fine)",
      "- how many you need",
      "",
      "Once I have that, I can give you a better idea.",
      "",
      "– Topher",
    ].join("\n"),
  },
  {
    id: "simple_quote",
    title: "Simple quote",
    body: [
      "I can do that for around $X–$X depending on final size and detail.",
      "",
      "If that works for you, I can get started.",
    ].join("\n"),
  },
  {
    id: "need_more_info",
    title: "Need more info",
    body: [
      "Can you send a quick photo or a little more detail on how it’s used?",
      "",
      "That helps me get it right the first time.",
    ].join("\n"),
  },
  {
    id: "ready_to_start",
    title: "Ready to move forward",
    body: [
      "I can get started on this.",
      "",
      "Turnaround is usually pretty quick once I have everything.",
    ].join("\n"),
  },
  {
    id: "follow_up",
    title: "Follow-up",
    body: "Just checking in — did you still want help with this?",
  },
  {
    id: "close_polite",
    title: "Close (polite)",
    body: [
      "No worries if you went another direction.",
      "",
      "If you need anything later, just reach out.",
    ].join("\n"),
  },
] as const;

/** Replace placeholder range in simple_quote; pass e.g. "$50–$75" or "50–75" (add $ if missing). */
export function resolvePrintReplyBody(templateId: string, priceRangeRaw?: string | null): string {
  const t = PRINT_REPLY_TEMPLATES.find((x) => x.id === templateId);
  if (!t) return "";
  let body = t.body;
  if (templateId === "simple_quote") {
    const raw = String(priceRangeRaw || "").trim();
    if (raw) {
      const normalized = raw.replace(/-/g, "–");
      const withDollar = normalized.includes("$") ? normalized : `$${normalized}`;
      body = body.replace("$X–$X", withDollar);
    }
  }
  return body;
}
