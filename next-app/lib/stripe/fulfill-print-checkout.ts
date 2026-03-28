import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

/** Service-role client; Stripe tables may be absent from generated DB types. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceSupabase = SupabaseClient<any, "public", any>;

export type FulfillResult =
  | { ok: true; leadId: string; checkoutFor: "deposit" | "full" }
  | { ok: false; reason: string };

/**
 * Apply checkout.session.completed to CRM lead + insert stripe_print_checkouts.
 * Idempotent: safe if called again for the same session (upsert by session id).
 */
export async function fulfillPrintCheckoutSession(
  supabase: ServiceSupabase,
  session: Stripe.Checkout.Session
): Promise<FulfillResult> {
  const sessionId = String(session.id || "").trim();
  if (!sessionId) {
    return { ok: false, reason: "missing_session_id" };
  }

  const leadId = String(session.metadata?.lead_id || "").trim();
  const ownerId = String(session.metadata?.owner_id || "").trim();
  const rawFor = String(session.metadata?.checkout_for || "full").toLowerCase();
  const checkoutFor = rawFor === "deposit" ? "deposit" : "full";

  if (!leadId || !ownerId) {
    return { ok: false, reason: "missing_metadata" };
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent && typeof session.payment_intent === "object"
        ? session.payment_intent.id
        : null;

  const amountTotal = session.amount_total ?? null;
  const currency = String(session.currency || "usd").toLowerCase();
  const customerEmail =
    session.customer_details?.email ||
    (typeof session.customer_email === "string" ? session.customer_email : null) ||
    null;

  const now = new Date().toISOString();

  const { error: rowErr } = await supabase.from("stripe_print_checkouts").upsert(
    {
      stripe_checkout_session_id: sessionId,
      stripe_payment_intent_id: paymentIntentId,
      lead_id: leadId,
      owner_id: ownerId,
      customer_email: customerEmail,
      amount_total_cents: amountTotal,
      currency,
      status: "completed",
      checkout_for: checkoutFor,
      updated_at: now,
    },
    { onConflict: "stripe_checkout_session_id" }
  );

  if (rowErr) {
    console.error("[stripe fulfill] stripe_print_checkouts upsert failed", rowErr.message);
    return { ok: false, reason: "checkout_row_failed" };
  }

  const leadPatch: Record<string, unknown> = {
    payment_method: "stripe",
    last_updated_at: now,
  };

  if (checkoutFor === "deposit") {
    leadPatch.payment_status = "partially_paid";
  } else {
    leadPatch.payment_status = "paid";
    leadPatch.paid_at = now;
  }

  const { error: leadErr } = await supabase
    .from("leads")
    .update(leadPatch)
    .eq("id", leadId)
    .eq("owner_id", ownerId);

  if (leadErr) {
    console.error("[stripe fulfill] lead update failed", leadErr.message);
    return { ok: false, reason: "lead_update_failed" };
  }

  return { ok: true, leadId, checkoutFor };
}
