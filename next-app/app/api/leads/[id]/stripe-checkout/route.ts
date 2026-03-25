/**
 * Stripe Checkout Session for a 3D print lead (one-time payment).
 *
 * Requires server env: STRIPE_SECRET_KEY
 * Optional: NEXT_PUBLIC_SITE_URL or VERCEL_URL for success/cancel URLs.
 *
 * If the secret is absent, returns 503 + { code: "STRIPE_NOT_CONFIGURED" } — no fake payment flow.
 */

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import {
  publicSiteBase,
  resolveCheckoutAmountUsd,
  usdToStripeCents,
} from "@/lib/crm/print-payment";
import { isThreeDPrintLead } from "@/lib/crm/three-d-print-lead";

async function leadIdFromParams(params: Promise<{ id: string }> | { id: string }): Promise<string> {
  const resolved = await Promise.resolve(params);
  return String(resolved?.id || "").trim();
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leadId = await leadIdFromParams(params);
  if (!leadId) {
    return NextResponse.json({ error: "Lead id is required." }, { status: 400 });
  }

  const secret = String(process.env.STRIPE_SECRET_KEY || "").trim();
  if (!secret) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Add STRIPE_SECRET_KEY to the server environment, then retry. Use Stripe Dashboard → Developers → API keys.",
        code: "STRIPE_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  }

  let body: { for?: string } = {};
  try {
    body = (await request.json()) as { for?: string };
  } catch {
    body = {};
  }
  const forKind = String(body.for || "full").toLowerCase() === "deposit" ? "deposit" : "full";

  const ownerId = String(user.id || "").trim();
  const supabase = await createClient();
  const { data: lead, error: loadErr } = await supabase
    .from("leads")
    .select(
      "id,business_name,owner_id,deposit_amount,final_amount,price_charged,quoted_amount,source,lead_source,category,lead_tags",
    )
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (loadErr) {
    return NextResponse.json({ error: loadErr.message }, { status: 500 });
  }
  if (!lead) {
    return NextResponse.json({ error: "Lead not found in your workspace." }, { status: 404 });
  }
  if (!isThreeDPrintLead(lead as Record<string, unknown>)) {
    return NextResponse.json({ error: "Checkout is only available for 3D printing jobs." }, { status: 400 });
  }

  const { usd, label } = resolveCheckoutAmountUsd({
    for: forKind,
    deposit_amount: (lead as { deposit_amount?: unknown }).deposit_amount,
    final_amount: (lead as { final_amount?: unknown }).final_amount,
    price_charged: (lead as { price_charged?: unknown }).price_charged,
    quoted_amount: (lead as { quoted_amount?: unknown }).quoted_amount,
  });
  if (usd == null) {
    return NextResponse.json(
      {
        error:
          forKind === "deposit"
            ? "Set a deposit amount or a quoted amount (we use 50% of quote when deposit is blank)."
            : "Set final amount, price charged, or quoted amount before creating a payment link.",
      },
      { status: 400 },
    );
  }

  const cents = usdToStripeCents(usd);
  if (cents == null) {
    return NextResponse.json(
      { error: `Amount must be at least $0.50 USD for Stripe (got ${usd}).` },
      { status: 400 },
    );
  }

  const base = publicSiteBase();
  if (!base) {
    return NextResponse.json(
      {
        error:
          "Set NEXT_PUBLIC_SITE_URL (or rely on VERCEL_URL) so Stripe can redirect after checkout.",
        code: "MISSING_PUBLIC_BASE_URL",
      },
      { status: 503 },
    );
  }

  const stripe = new Stripe(secret);
  const businessName = String((lead as { business_name?: string }).business_name || "3D print job").trim();
  const lineName = forKind === "deposit" ? "3D print — deposit" : "3D print — payment";

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${base}/admin/leads/${encodeURIComponent(leadId)}?payment=success`,
      cancel_url: `${base}/admin/leads/${encodeURIComponent(leadId)}?payment=cancel`,
      metadata: {
        lead_id: leadId,
        owner_id: ownerId,
        checkout_for: forKind,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: cents,
            product_data: {
              name: lineName,
              description: businessName.slice(0, 500),
            },
          },
        },
      ],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Stripe error";
    console.error("[stripe-checkout]", msg);
    return NextResponse.json({ error: msg, code: "STRIPE_ERROR" }, { status: 502 });
  }

  const url = session.url;
  if (!url) {
    return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
  }

  const patch: Record<string, unknown> = {
    payment_link: url,
    payment_method: "stripe",
    payment_request_type: forKind === "deposit" ? "deposit" : "full",
    last_updated_at: new Date().toISOString(),
  };
  if (forKind === "deposit") {
    patch.payment_status = "deposit_requested";
  }

  const { error: upErr } = await supabase.from("leads").update(patch).eq("id", leadId).eq("owner_id", ownerId);
  if (upErr) {
    return NextResponse.json(
      {
        error: `Checkout created but could not save link on lead: ${upErr.message}. Copy URL from Stripe Dashboard if needed.`,
        url,
        warning: "LEAD_UPDATE_FAILED",
      },
      { status: 207 },
    );
  }

  return NextResponse.json({
    ok: true,
    url,
    checkoutSessionId: session.id,
    amountUsd: usd,
    label,
  });
}
