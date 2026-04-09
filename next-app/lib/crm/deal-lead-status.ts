/** Stored `public.leads.lead_status` values (deal / follow-up lane). */
export const DEAL_LEAD_STATUS_KEYS = [
  "new",
  "mockup_sent",
  "replied",
  "interested",
  "closed_won",
  "closed_lost",
] as const;

export type DealLeadStatusKey = (typeof DEAL_LEAD_STATUS_KEYS)[number];

const DEAL_LEAD_STATUS_SET = new Set<string>(DEAL_LEAD_STATUS_KEYS);

export const DEAL_LEAD_STATUS_LABELS: Record<DealLeadStatusKey, string> = {
  new: "New",
  mockup_sent: "Mockup Sent",
  replied: "Replied",
  interested: "Interested",
  closed_won: "Won",
  closed_lost: "Lost",
};

export function normalizeDealLeadStatus(raw: unknown): DealLeadStatusKey {
  const s = String(raw || "").trim().toLowerCase();
  if (DEAL_LEAD_STATUS_SET.has(s)) return s as DealLeadStatusKey;
  return "new";
}

/** When user sets this via UI, also bump `last_contacted_at`. */
export function dealLeadStatusTouchesLastContacted(status: DealLeadStatusKey): boolean {
  return status === "replied" || status === "interested" || status === "closed_won" || status === "closed_lost";
}
