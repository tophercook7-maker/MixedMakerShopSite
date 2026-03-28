import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { publicSiteBase } from "@/lib/crm/print-payment";
import { requireStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { interval?: string };

/**
 * Deep Well Membership — Stripe Checkout (subscription).
 * Optional auth: metadata.user_id + customer linkage when logged in.
 */
export async function POST(request: Request) {
  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    body = {};
  }
  const interval = String(body.interval || "month").toLowerCase() === "year" ? "year" : "month";

  const priceMonthly = String(process.env.STRIPE_PRICE_ID_MONTHLY || "").trim();
  const priceYearly = String(process.env.STRIPE_PRICE_ID_YEARLY || "").trim();

  if (interval === "year" && !priceYearly) {
    return NextResponse.json(
      { error: "Annual plan is not configured.", code: "MISSING_YEARLY_PRICE" },
      { status: 400 }
    );
  }

  const priceId = interval === "year" ? priceYearly : priceMonthly;

  if (!priceId) {
    console.error("[create-checkout-session] missing STRIPE_PRICE_ID_MONTHLY (and yearly if requested)");
    return NextResponse.json(
      {
        error:
          "Membership checkout is not configured. Add STRIPE_PRICE_ID_MONTHLY to the server environment.",
        code: "MISSING_PRICE_ID",
      },
      { status: 503 }
    );
  }

  let stripe: ReturnType<typeof requireStripe>;
  try {
    stripe = requireStripe();
  } catch {
    return NextResponse.json(
      { error: "Stripe is not configured.", code: "STRIPE_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  const base = publicSiteBase();
  if (!base) {
    return NextResponse.json(
      { error: "Set NEXT_PUBLIC_SITE_URL (or VERCEL_URL) for checkout redirects.", code: "MISSING_PUBLIC_BASE_URL" },
      { status: 503 }
    );
  }

  const user = await getCurrentUser();
  const userId = user?.id ? String(user.id).trim() : "";
  const userEmail = user?.email ? String(user.email).trim() : undefined;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/account/claim?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/membership`,
      client_reference_id: userId || undefined,
      customer_email: userEmail,
      metadata: {
        purpose: "world_watch_membership",
        user_id: userId || "",
        email: userEmail || "",
        plan_interval: interval,
      },
      subscription_data: {
        metadata: {
          purpose: "world_watch_membership",
          user_id: userId || "",
          plan_interval: interval,
        },
      },
      allow_promotion_codes: true,
    });

    const url = session.url;
    if (!url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
    }

    return NextResponse.json({ url, sessionId: session.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "checkout error";
    console.error("[create-checkout-session]", msg);
    return NextResponse.json({ error: msg, code: "STRIPE_ERROR" }, { status: 502 });
  }
}
