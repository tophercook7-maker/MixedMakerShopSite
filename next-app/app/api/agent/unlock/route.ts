import { NextResponse } from "next/server";
import { getStripeOrNull } from "@/lib/stripe/server";
import { signToken, AGENT_COOKIE, baseUrl } from "@/lib/agent-gate";

export const dynamic = "force-dynamic";

/**
 * Stripe success redirect target. VERIFIES the session was actually paid
 * (server-side), then sets a signed httpOnly unlock cookie that the middleware
 * checks before serving the gated DMG. This is what makes the unlock real
 * instead of honor-system.
 */
export async function GET(req: Request) {
  const base = baseUrl(req);
  const sid = String(new URL(req.url).searchParams.get("session_id") || "").trim();
  const stripe = getStripeOrNull();
  if (!stripe || !sid.startsWith("cs_")) {
    return NextResponse.redirect(`${base}/`, 303);
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sid);
    if (session.payment_status === "paid") {
      const res = NextResponse.redirect(`${base}/`, 303);
      res.cookies.set(AGENT_COOKIE, signToken(), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 3650, // ~10 years
      });
      return res;
    }
    return NextResponse.redirect(`${base}/`, 303);
  } catch (e) {
    console.error("[agent unlock]", e instanceof Error ? e.message : e);
    return NextResponse.redirect(`${base}/`, 303);
  }
}
