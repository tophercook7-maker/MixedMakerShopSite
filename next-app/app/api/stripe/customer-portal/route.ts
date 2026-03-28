import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { MEMBER_CUSTOMER_COOKIE, verifyMemberCustomerCookie } from "@/lib/membership/member-cookie";
import { publicSiteBase } from "@/lib/crm/print-payment";
import { getServiceRoleSupabase } from "@/lib/supabase/service-role";
import { requireStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let stripe: ReturnType<typeof requireStripe>;
  try {
    stripe = requireStripe();
  } catch {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const base = publicSiteBase();
  if (!base) {
    return NextResponse.json({ error: "Missing site URL configuration." }, { status: 503 });
  }

  let customerId: string | null = null;
  const user = await getCurrentUser();

  if (user?.id) {
    const svc = getServiceRoleSupabase();
    if (svc.ok) {
      const { data } = await svc.supabase
        .from("member_entitlements")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();
      customerId = data?.stripe_customer_id ? String(data.stripe_customer_id) : null;
    }
    if (!customerId && user.email) {
      const svc = getServiceRoleSupabase();
      if (svc.ok) {
        const { data } = await svc.supabase
          .from("member_entitlements")
          .select("stripe_customer_id")
          .eq("email", String(user.email).toLowerCase().trim())
          .maybeSingle();
        customerId = data?.stripe_customer_id ? String(data.stripe_customer_id) : null;
      }
    }
  }

  if (!customerId) {
    const cookieStore = await cookies();
    const val = cookieStore.get(MEMBER_CUSTOMER_COOKIE)?.value;
    customerId = verifyMemberCustomerCookie(val);
  }

  if (!customerId || !customerId.startsWith("cus_")) {
    return NextResponse.json(
      { error: "No billing account found. Start a membership or sign in with the email you used at checkout." },
      { status: 400 }
    );
  }

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${base}/account`,
    });
    if (!portal.url) {
      return NextResponse.json({ error: "Stripe did not return a portal URL." }, { status: 502 });
    }
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "portal error";
    console.error("[customer-portal]", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
