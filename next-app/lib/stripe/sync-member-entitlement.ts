import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import type { MemberEntitlementRow } from "@/lib/membership/entitlement";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sb = SupabaseClient<any, "public", any>;

function customerIdFromStripe(cust: Stripe.Customer | Stripe.DeletedCustomer | string | null | undefined): string | null {
  if (!cust) return null;
  if (typeof cust === "string") return cust.trim() || null;
  if ("deleted" in cust && cust.deleted) return null;
  return cust.id || null;
}

async function resolveCustomerEmail(stripe: Stripe, customerId: string): Promise<string | null> {
  try {
    const c = await stripe.customers.retrieve(customerId);
    if (typeof c === "string" || ("deleted" in c && c.deleted)) return null;
    const e = c.email;
    return e ? String(e).toLowerCase().trim() : null;
  } catch (e) {
    console.warn("[member entitlement] customer email fetch failed", e);
    return null;
  }
}

export async function upsertMemberEntitlementFromSubscription(
  supabase: Sb,
  stripe: Stripe,
  subscription: Stripe.Subscription,
  opts?: { userIdHint?: string | null; emailHint?: string | null }
): Promise<void> {
  const customerId = customerIdFromStripe(subscription.customer);
  if (!customerId) {
    console.warn("[member entitlement] missing customer on subscription", subscription.id);
    return;
  }

  const metaUid = String(subscription.metadata?.user_id || opts?.userIdHint || "").trim() || null;
  const emailFromMeta = opts?.emailHint
    ? String(opts.emailHint).toLowerCase().trim()
    : null;
  const emailFromStripe = await resolveCustomerEmail(stripe, customerId);
  const emailCandidate = emailFromMeta || emailFromStripe;

  const { data: existing } = await supabase
    .from("member_entitlements")
    .select("user_id,email,plan_interval")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  const mergedUserId = metaUid || (existing?.user_id as string | null) || null;
  const mergedEmail = emailCandidate || (existing?.email as string | null) || null;

  const periodEnd =
    typeof subscription.current_period_end === "number"
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;

  const metaPlan = String(subscription.metadata?.plan_interval || "").toLowerCase();
  const fromMeta = metaPlan === "year" ? "year" : metaPlan === "month" ? "month" : null;
  const priceInterval = subscription.items.data[0]?.price?.recurring?.interval;
  const fromPrice = priceInterval === "year" ? "year" : priceInterval === "month" ? "month" : null;
  const computedPlan = fromPrice || fromMeta || null;
  const existingPlanRaw = String(existing?.plan_interval || "").toLowerCase();
  const existingPlan = existingPlanRaw === "year" || existingPlanRaw === "month" ? existingPlanRaw : null;
  const mergedPlanInterval = computedPlan || existingPlan;

  const now = new Date().toISOString();

  const row: Omit<MemberEntitlementRow, "id" | "created_at"> & { updated_at: string } = {
    user_id: mergedUserId,
    email: mergedEmail,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    current_period_end: periodEnd,
    plan_interval: mergedPlanInterval,
    updated_at: now,
  };

  const { error } = await supabase.from("member_entitlements").upsert(row, {
    onConflict: "stripe_customer_id",
  });

  if (error) {
    console.error("[member entitlement] upsert failed", error.message);
    throw error;
  }
}

export async function updateEntitlementBySubscriptionId(
  supabase: Sb,
  stripe: Stripe,
  subscriptionId: string
): Promise<void> {
  const sub = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });
  await upsertMemberEntitlementFromSubscription(supabase, stripe, sub);
}

export async function fulfillWorldWatchMembershipCheckout(
  supabase: Sb,
  stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (session.mode !== "subscription") {
    return { ok: false, reason: "not_subscription_mode" };
  }

  const subRef = session.subscription;
  const subId = typeof subRef === "string" ? subRef : subRef?.id;
  if (!subId) {
    return { ok: false, reason: "missing_subscription" };
  }

  const sub = await stripe.subscriptions.retrieve(subId, {
    expand: ["items.data.price"],
  });
  const emailHint =
    session.customer_details?.email ||
    (typeof session.customer_email === "string" ? session.customer_email : null);
  const userIdHint = String(session.metadata?.user_id || "").trim() || null;

  await upsertMemberEntitlementFromSubscription(supabase, stripe, sub, {
    userIdHint,
    emailHint,
  });

  return { ok: true };
}
