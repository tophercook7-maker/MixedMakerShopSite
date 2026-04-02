export const MOCKUP_DEAL_STATUSES = [
  "new",
  "mockup_sent",
  "replied",
  "interested",
  "closed_won",
  "closed_lost",
] as const;

export type MockupDealStatus = (typeof MOCKUP_DEAL_STATUSES)[number];

export const MOCKUP_DEAL_STATUS_LABELS: Record<MockupDealStatus, string> = {
  new: "New",
  mockup_sent: "Mockup sent",
  replied: "Replied",
  interested: "Interested",
  closed_won: "Closed — won",
  closed_lost: "Closed — lost",
};

export function normalizeMockupDealStatus(raw: string | null | undefined): MockupDealStatus {
  const k = String(raw || "")
    .trim()
    .toLowerCase();
  if ((MOCKUP_DEAL_STATUSES as readonly string[]).includes(k)) return k as MockupDealStatus;
  return "new";
}

/** Shorthand for compact list badges */
export function mockupDealStatusShortLabel(status: string | null | undefined): string {
  const s = normalizeMockupDealStatus(status);
  const map: Record<MockupDealStatus, string> = {
    new: "Mockup: new",
    mockup_sent: "Mockup sent",
    replied: "Replied",
    interested: "Interested",
    closed_won: "Won",
    closed_lost: "Lost",
  };
  return map[s];
}

const MS_DAY = 86_400_000;

export function isLeadStaleNoContact(lastContactIso: string | null | undefined, staleAfterDays = 3): boolean {
  const raw = String(lastContactIso || "").trim();
  if (!raw) return true;
  const t = new Date(raw).getTime();
  if (!Number.isFinite(t)) return true;
  return Date.now() - t >= staleAfterDays * MS_DAY;
}
