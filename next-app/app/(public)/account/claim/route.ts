import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { linkMemberEntitlementsToUser } from "@/lib/auth/isActiveMember";
import { MEMBER_CUSTOMER_COOKIE, signMemberCustomerCookie } from "@/lib/membership/member-cookie";
import { publicSiteBase } from "@/lib/crm/print-payment";
import { getStripeOrNull } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sets signed httpOnly cookie after verified subscription Checkout (guest or logged-in).
 * Webhook remains source of truth for subscription_status.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = String(searchParams.get("session_id") || "").trim();
  const base = publicSiteBase() || new URL(request.url).origin;

  if (!sessionId.startsWith("cs_")) {
    return NextResponse.redirect(new URL("/world-watch", base));
  }

  const stripe = getStripeOrNull();
  if (!stripe) {
    return NextResponse.redirect(new URL("/account/success?warn=config", base));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.mode !== "subscription") {
      return NextResponse.redirect(new URL("/world-watch", base));
    }
    if (session.payment_status !== "paid") {
      return NextResponse.redirect(new URL("/world-watch", base));
    }

    const cust = session.customer;
    const customerId = typeof cust === "string" ? cust : null;
    if (!customerId?.startsWith("cus_")) {
      return NextResponse.redirect(new URL("/account/success?warn=customer", base));
    }

    const signed = signMemberCustomerCookie(customerId);
    if (!signed) {
      console.warn("[account/claim] MEMBER_SESSION_SECRET / STRIPE_WEBHOOK_SECRET missing — cookie not set");
      return NextResponse.redirect(new URL("/account/success?warn=cookie", base));
    }

    const user = await getCurrentUser();
    if (user?.id && user.email) {
      await linkMemberEntitlementsToUser(user.id, user.email);
    }

    const res = NextResponse.redirect(new URL("/account/success", base));
    res.cookies.set(MEMBER_CUSTOMER_COOKIE, signed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
    });
    return res;
  } catch (e) {
    console.error("[account/claim]", e instanceof Error ? e.message : e);
    return NextResponse.redirect(new URL("/world-watch", base));
  }
}
