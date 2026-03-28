import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStripeOrNull } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

/**
 * Optional: load Checkout Session for display after return (never used for fulfillment).
 * GET ?session_id=cs_...
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = String(searchParams.get("session_id") || "").trim();
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session_id." }, { status: 400 });
  }

  const stripe = getStripeOrNull();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const ownerId = String(session.metadata?.owner_id || "").trim();
    if (!ownerId || ownerId !== String(user.id).trim()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_details?.email ?? null,
      metadata: session.metadata,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Stripe error";
    console.error("[stripe session GET]", msg);
    return NextResponse.json({ error: "Could not load session." }, { status: 502 });
  }
}
