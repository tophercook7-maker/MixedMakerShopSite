import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillPrintCheckoutSession } from "@/lib/stripe/fulfill-print-checkout";
import {
  fulfillWorldWatchMembershipCheckout,
  updateEntitlementBySubscriptionId,
} from "@/lib/stripe/sync-member-entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Service-role client; `stripe_*` tables are not in the generated schema. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WebhookSupabase = SupabaseClient<any, "public", any>;

async function alreadyProcessed(supabase: WebhookSupabase, eventId: string): Promise<boolean> {
  const { data } = await supabase
    .from("stripe_webhook_events")
    .select("id")
    .eq("stripe_event_id", eventId)
    .maybeSingle();
  return Boolean(data?.id);
}

async function markProcessed(
  supabase: WebhookSupabase,
  eventId: string,
  eventType: string
): Promise<"ok" | "duplicate" | "error"> {
  const { error } = await supabase.from("stripe_webhook_events").insert({
    stripe_event_id: eventId,
    event_type: eventType,
  });
  if (!error) return "ok";
  if (error.code === "23505") return "duplicate";
  console.error("[stripe webhook] insert stripe_webhook_events failed", error.message);
  return "error";
}

function serviceSupabase(): WebhookSupabase | null {
  const url = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) return null;
  return createClient(url, key) as WebhookSupabase;
}

async function markEntitlementCanceled(supabase: WebhookSupabase, sub: Stripe.Subscription): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("member_entitlements")
    .update({
      subscription_status: "canceled",
      updated_at: now,
    })
    .eq("stripe_subscription_id", sub.id);
  if (error) {
    console.warn("[stripe webhook] member_entitlements cancel update", error.message);
  }
}

/**
 * Stripe webhook — raw body + Stripe-Signature. Idempotent via stripe_webhook_events.
 * World Watch membership: subscription lifecycle + subscription Checkout.
 * 3D print leads: payment-mode checkout.session.completed.
 */
export async function POST(request: Request) {
  const secret = String(process.env.STRIPE_SECRET_KEY || "").trim();
  const webhookSecret = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();

  if (!secret || !webhookSecret) {
    console.error("[stripe webhook] missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const supabase = serviceSupabase();
  if (!supabase) {
    console.error("[stripe webhook] missing Supabase service env");
    return NextResponse.json({ error: "Server configuration error." }, { status: 503 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    console.warn("[stripe webhook] missing Stripe-Signature header");
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = new Stripe(secret);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "invalid signature";
    console.warn("[stripe webhook] signature verification failed:", msg);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (await alreadyProcessed(supabase, event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          const wr = await fulfillWorldWatchMembershipCheckout(supabase, stripe, session);
          if (!wr.ok) {
            console.error("[stripe webhook] world watch checkout", wr.reason, session.id);
            return NextResponse.json({ received: false, error: wr.reason }, { status: 500 });
          }
          break;
        }
        const print = await fulfillPrintCheckoutSession(supabase, session);
        if (!print.ok && print.reason !== "missing_metadata") {
          console.error("[stripe webhook] print fulfill", print.reason, session.id);
          return NextResponse.json({ received: false, error: print.reason }, { status: 500 });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        try {
          await updateEntitlementBySubscriptionId(supabase, stripe, sub.id);
        } catch (e) {
          console.error("[stripe webhook] subscription sync failed", sub.id, e);
          return NextResponse.json({ received: false }, { status: 500 });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await markEntitlementCanceled(supabase, sub);
        break;
      }
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const subRef = inv.subscription;
        const subId = typeof subRef === "string" ? subRef : subRef?.id;
        if (subId) {
          try {
            await updateEntitlementBySubscriptionId(supabase, stripe, subId);
          } catch (e) {
            console.error("[stripe webhook] invoice subscription sync", subId, e);
            return NextResponse.json({ received: false }, { status: 500 });
          }
        }
        if (event.type === "invoice.payment_failed") {
          console.info("[stripe webhook] invoice.payment_failed", {
            invoice: inv.id,
            subscription: subId,
          });
        }
        break;
      }
      case "payment_intent.succeeded": {
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.info("[stripe webhook] payment_intent.payment_failed", {
          id: pi.id,
          last_error: pi.last_payment_error?.message,
        });
        break;
      }
      default:
        break;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "handler error";
    console.error("[stripe webhook] handler error", msg);
    return NextResponse.json({ received: false }, { status: 500 });
  }

  const marked = await markProcessed(supabase, event.id, event.type);
  if (marked === "error") {
    return NextResponse.json({ received: false }, { status: 500 });
  }

  return NextResponse.json({ received: true, duplicate: marked === "duplicate" });
}
