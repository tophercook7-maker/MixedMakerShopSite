export type MemberEntitlementRow = {
  id: string;
  user_id: string | null;
  email: string | null;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  subscription_status: string;
  current_period_end: string | null;
  /** Stripe recurring interval when known (`month` / `year`). */
  plan_interval?: string | null;
  created_at?: string;
  updated_at?: string;
};

/**
 * Webhook-maintained status; used server-side only.
 * past_due / unpaid / canceled → no access (calm downgrade per product rules).
 */
export function isEntitlementActive(row: Pick<MemberEntitlementRow, "subscription_status" | "current_period_end">): boolean {
  const s = String(row.subscription_status || "").toLowerCase().trim();
  if (s === "none" || s === "" || s === "incomplete" || s === "incomplete_expired") return false;
  if (s === "past_due" || s === "unpaid" || s === "canceled" || s === "paused") return false;

  const end = row.current_period_end ? new Date(row.current_period_end).getTime() : NaN;
  const endOk = !Number.isFinite(end) || end > Date.now();

  if (s === "active" || s === "trialing") return endOk;
  return false;
}
