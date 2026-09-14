import { NextResponse } from "next/server";
import { getStripeOrNull } from "@/lib/stripe/server";
import { SITE_URL } from "@/lib/site";
import { findShopProduct, priceInCents } from "@/lib/shop-catalog";
import { findBySlugOrCode, isOrderable } from "@/lib/shop-library";

export const dynamic = "force-dynamic";

/**
 * Public shop checkout.
 *
 * Takes a product slug and nothing else. Price, name and availability are read
 * from the server-side catalogue — a client that posts its own amount is
 * ignored, so a tampered request cannot buy a $45 mask for a dollar.
 */
export async function POST(request: Request) {
  let slug = "";
  try {
    const body = (await request.json()) as { slug?: unknown };
    slug = String(body?.slug ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!slug) {
    return NextResponse.json({ error: "Missing product." }, { status: 400 });
  }

  // Hand-written listings win; otherwise fall back to the print library.
  const product = findShopProduct(slug);
  const libItem = product ? null : findBySlugOrCode(slug);

  if (!product && !libItem) {
    return NextResponse.json({ error: "That item is not available." }, { status: 404 });
  }
  if (product && product.status !== "live") {
    // Drafts are deliberately unbuyable — no stock, no sale.
    return NextResponse.json({ error: "That item is not available." }, { status: 404 });
  }
  if (libItem && !isOrderable(libItem)) {
    // No confirmed licence or price means no sale, ever.
    return NextResponse.json({ error: "That item is not available to order yet." }, { status: 404 });
  }

  const line = product
    ? {
        name: product.name,
        description: product.blurb,
        amount: priceInCents(product),
        image: product.image ? `${SITE_URL}${product.image}` : "",
        slug: product.slug,
        sourceUrl: product.source.url,
        license: product.source.license,
        designer: product.source.designer,
      }
    : {
        name: `${libItem!.code} · ${libItem!.name}`,
        description: `Printed to order. ${libItem!.price}`,
        amount: libItem!.priceCents,
        image: libItem!.img,
        slug: libItem!.code,
        sourceUrl: libItem!.url,
        license: libItem!.lic,
        designer: libItem!.designer,
      };

  const stripe = getStripeOrNull();
  if (!stripe) {
    return NextResponse.json({ error: "Checkout is not configured yet." }, { status: 503 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: line.amount,
            product_data: {
              name: line.name,
              description: line.description,
              ...(line.image ? { images: [line.image] } : {}),
            },
          },
        },
      ],
      // Printed to order, so collect an address and let people pick delivery.
      shipping_address_collection: { allowed_countries: ["US"] },
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${SITE_URL}/shop/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/shop/${line.slug}`,
      metadata: {
        kind: "shop_product",
        product_slug: line.slug,
        product_name: line.name,
        // Provenance travels with the order so fulfilment never has to guess.
        source_url: line.sourceUrl,
        license: line.license,
        designer: line.designer,
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Stripe error";
    console.error("[shop checkout POST]", msg);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 502 });
  }
}
