import { NextResponse } from "next/server";
import { getStripeOrNull } from "@/lib/stripe/server";
import { baseUrl } from "@/lib/hollow-gate";

export const dynamic = "force-dynamic";

/**
 * Bot-resistant buy entry. Each hit creates a FRESH Stripe Checkout Session and
 * 303-redirects the browser to Stripe's hosted (fraud-protected) page — no static
 * payment link for card-testing bots to hammer.
 */
export async function GET(req: Request) {
  const base = baseUrl(req);
  const stripe = getStripeOrNull();
  if (!stripe) return NextResponse.redirect(`${base}/hollow-gate/index.html?error=unconfigured`, 303);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: 199,
            product_data: { name: "The Hollow Gate — Full Story Unlock" },
          },
        },
      ],
      success_url: `${base}/api/hollow-gate/unlock?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/hollow-gate/index.html?canceled=1`,
      metadata: { product: "hollow_gate_full" },
    });
    return NextResponse.redirect(session.url as string, 303);
  } catch (e) {
    console.error("[hollow-gate checkout]", e instanceof Error ? e.message : e);
    return NextResponse.redirect(`${base}/hollow-gate/index.html?error=checkout`, 303);
  }
}
