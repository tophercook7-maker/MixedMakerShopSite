import { NextResponse } from "next/server";
import { getStripeOrNull } from "@/lib/stripe/server";
import { baseUrl, signToken, HG_COOKIE } from "@/lib/hollow-gate";

export const dynamic = "force-dynamic";

/**
 * Stripe success redirect target. VERIFIES the session was actually paid
 * (server-side), then sets a signed httpOnly unlock cookie. This is what makes
 * the unlock real instead of honor-system.
 */
export async function GET(req: Request) {
  const base = baseUrl(req);
  const sid = String(new URL(req.url).searchParams.get("session_id") || "").trim();
  const stripe = getStripeOrNull();
  if (!stripe || !sid.startsWith("cs_")) {
    return NextResponse.redirect(`${base}/hollow-gate/index.html?error=verify`, 303);
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sid);
    if (session.payment_status === "paid") {
      const res = NextResponse.redirect(`${base}/hollow-gate/index.html?unlocked=1`, 303);
      res.cookies.set(HG_COOKIE, signToken(), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 3650, // ~10 years
      });
      return res;
    }
    return NextResponse.redirect(`${base}/hollow-gate/index.html?error=unpaid`, 303);
  } catch (e) {
    console.error("[hollow-gate unlock]", e instanceof Error ? e.message : e);
    return NextResponse.redirect(`${base}/hollow-gate/index.html?error=verify`, 303);
  }
}
