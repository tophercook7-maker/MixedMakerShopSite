/** Checkbox ids for “what should your website help you do?” — stored on submissions + raw_payload. */
export const FUNNEL_DESIRED_OUTCOME_IDS = [
  "get_more_calls",
  "get_more_leads",
  "look_more_professional",
  "show_up_better_online",
  "replace_outdated_site",
  "explain_services_clearly",
  "make_contact_easier",
] as const;

export type FunnelDesiredOutcomeId = (typeof FUNNEL_DESIRED_OUTCOME_IDS)[number];

export const FUNNEL_DESIRED_OUTCOME_LABELS: Record<FunnelDesiredOutcomeId, string> = {
  get_more_calls: "Get more calls",
  get_more_leads: "Get more leads / inquiries",
  look_more_professional: "Look more professional",
  show_up_better_online: "Show up better online",
  replace_outdated_site: "Replace an outdated site",
  explain_services_clearly: "Explain services more clearly",
  make_contact_easier: "Make contact easier",
};

/** Short benefit lines for mockup “why choose” band (customer-facing). */
export const FUNNEL_DESIRED_OUTCOME_WHY_LINES: Record<FunnelDesiredOutcomeId, string> = {
  get_more_calls: "Clear next steps so more customers pick up the phone",
  get_more_leads: "Layout tuned for inquiries, quotes, and follow-up",
  look_more_professional: "Presentation that matches the quality of your work",
  show_up_better_online: "Stronger first impression where people look you up",
  replace_outdated_site: "A modern structure that reflects how you operate today",
  explain_services_clearly: "Services explained in plain language with scannable sections",
  make_contact_easier: "Contact options that reduce friction for busy customers",
};

export function normalizeDesiredOutcomeIds(raw: unknown): FunnelDesiredOutcomeId[] {
  if (!Array.isArray(raw)) return [];
  const out: FunnelDesiredOutcomeId[] = [];
  for (const x of raw) {
    const s = String(x || "").trim();
    if ((FUNNEL_DESIRED_OUTCOME_IDS as readonly string[]).includes(s)) out.push(s as FunnelDesiredOutcomeId);
  }
  return Array.from(new Set(out));
}
