import { createHmac, timingSafeEqual } from "crypto";

function getSecret(): string {
  const s =
    String(process.env.MEMBER_SESSION_SECRET || "").trim() ||
    String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();
  return s;
}

/** httpOnly cookie name — pairs with Stripe customer id after verified checkout. */
export const MEMBER_CUSTOMER_COOKIE = "dwa_mem";

/**
 * Signed opaque cookie value; server verifies before trusting.
 * Membership is still validated against DB (subscription_status + period).
 */
export function signMemberCustomerCookie(customerId: string): string | null {
  const secret = getSecret();
  if (!secret || !customerId) return null;
  const payload = Buffer.from(customerId, "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(customerId, "utf8").digest("hex");
  return `${payload}.${sig}`;
}

export function verifyMemberCustomerCookie(value: string | undefined | null): string | null {
  if (!value) return null;
  const secret = getSecret();
  if (!secret) return null;
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return null;
  let customerId: string;
  try {
    customerId = Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
  if (!customerId.startsWith("cus_")) return null;
  const expected = createHmac("sha256", secret).update(customerId, "utf8").digest("hex");
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return customerId;
}
