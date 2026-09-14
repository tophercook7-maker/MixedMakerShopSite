import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { publicTopherEmail } from "@/lib/public-brand";

export const metadata: Metadata = {
  title: "Order received | MixedMakerShop",
  description: "Thanks — your order is in and heading to the printers.",
  alternates: { canonical: `${SITE_URL}/shop/thank-you` },
  robots: { index: false, follow: false },
};

export default function ShopThankYouPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <div className="kicker">
            <span className="dot" /> Order received
          </div>
          <h1 className="h1" style={{ margin: "14px 0 14px" }}>
            Thanks — that&apos;s in.
          </h1>
          <p className="subhead" style={{ margin: "0 0 18px", maxWidth: "60ch" }}>
            Stripe has emailed you a receipt. Your piece goes on the printer next, and I&apos;ll
            send you a photo of the finished thing before it leaves the bench.
          </p>
          <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.7, maxWidth: "60ch" }}>
            Local to Hot Springs? I&apos;ll message you to arrange a drop-off. Further out and it
            goes USPS with tracking. Either way you&apos;ll hear from me — you don&apos;t need to
            chase it.
          </p>
          <div className="btn-row">
            <Link className="btn gold btn-cta-primary" href="/shop">
              Back to the shop
            </Link>
            <a className="btn ghost" href={`mailto:${publicTopherEmail}?subject=About%20my%20order`}>
              Email me about this order
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
