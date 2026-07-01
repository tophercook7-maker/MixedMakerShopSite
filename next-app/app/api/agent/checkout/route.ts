import { NextResponse } from "next/server";
import { getStripeOrNull } from "@/lib/stripe/server";
import { baseUrl, AGENT_PRICE_CENTS } from "@/lib/agent-gate-config";

export const dynamic = "force-dynamic";

/**
 * Buy entry for the Autonomous Desktop Agent download. Each hit creates a FRESH
 * Stripe Checkout Session and 303-redirects to Stripe's hosted page — no static
 * payment link for card-testing bots. On success Stripe returns to the unlock
 * route, which verifies payment server-side before granting the download.
 */
export async function GET(req: Request) {
  const base = baseUrl(req);
  const stripe = getStripeOrNull();
  if (!stripe) {
    return NextResponse.redirect(`${base}/`, 303);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: AGENT_PRICE_CENTS,
            product_data: {
              name: "Autonomous Desktop Agent — Lifetime License (macOS)",
              description:
                "One-time license for the macOS app. Bring your own Anthropic API key; AI usage is billed by Anthropic, not us.",
            },
          },
        },
      ],
      allow_promotion_codes: true,
      success_url: `${base}/api/agent/unlock?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/`,
      metadata: { product: "autonomous_desktop_agent" },
    });
    return NextResponse.redirect(session.url as string, 303);
  } catch (e) {
    console.error("[agent checkout]", e instanceof Error ? e.message : e);
    return NextResponse.redirect(`${base}/`, 303);
  }
}
