import Stripe from "stripe";

export function getStripeOrNull(): Stripe | null {
  const key = String(process.env.STRIPE_SECRET_KEY || "").trim();
  if (!key) return null;
  return new Stripe(key);
}

export function requireStripe(): Stripe {
  const s = getStripeOrNull();
  if (!s) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  return s;
}
