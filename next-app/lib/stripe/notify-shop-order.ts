import type Stripe from "stripe";
import { sendViaSmtp } from "@/lib/crm/smtp-notify";

/**
 * A /shop catalogue order (metadata.kind === "shop_product") has no lead_id/
 * owner_id — that metadata shape belongs to the older /3d-printing custom-quote
 * flow (see fulfill-print-checkout.ts), so it can never satisfy that function's
 * requirements. Until 2026-09-23 this meant a paid shop order produced NO
 * record and NO notification anywhere — the webhook received the event, found
 * missing_metadata, and silently moved on. This is the fix: a shop order gets
 * its own lightweight path that emails Topher what to build and where to ship
 * it, straight from the Checkout Session itself (no database dependency, so
 * it can't be blocked by an unrelated table/schema problem).
 */
export async function notifyShopOrder(session: Stripe.Checkout.Session): Promise<
  { ok: true; via: string } | { ok: false; error: string }
> {
  const to = String(process.env.SHOP_ORDER_NOTIFY_TO || process.env.GMAIL_USER || "topher.cook7@gmail.com").trim();

  const productName = String(session.metadata?.product_name || "Unknown item").trim();
  const productSlug = String(session.metadata?.product_slug || "").trim();
  const designer = String(session.metadata?.designer || "").trim();
  const license = String(session.metadata?.license || "").trim();
  const sourceUrl = String(session.metadata?.source_url || "").trim();

  const amount = typeof session.amount_total === "number" ? (session.amount_total / 100).toFixed(2) : "?";
  const currency = String(session.currency || "usd").toUpperCase();

  const customerEmail =
    session.customer_details?.email ||
    (typeof session.customer_email === "string" ? session.customer_email : null) ||
    "no email on file";
  const customerName = session.customer_details?.name || session.shipping_details?.name || "no name on file";
  const customerPhone = session.customer_details?.phone || "no phone on file";

  const addr = session.shipping_details?.address || session.customer_details?.address;
  const addressLines = addr
    ? [addr.line1, addr.line2, [addr.city, addr.state, addr.postal_code].filter(Boolean).join(", "), addr.country]
        .filter(Boolean)
        .join("\n")
    : "no shipping address collected";

  const orderId = session.id;

  const text = `New 3D print shop order — build and ship this one.

ITEM: ${productName}${productSlug ? ` (${productSlug})` : ""}
PAID: $${amount} ${currency}

CUSTOMER
${customerName}
${customerEmail}
${customerPhone}

SHIP TO
${addressLines}

SOURCE / LICENSE
${sourceUrl || "n/a"}
${license || "n/a"}${designer ? ` — designer: ${designer}` : ""}

Stripe checkout session: ${orderId}
`;

  return sendViaSmtp({
    to,
    subject: `🖨️ Order: ${productName} — $${amount}`,
    text,
    replyTo: session.customer_details?.email || undefined,
  });
}
