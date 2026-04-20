import type { Metadata } from "next";
import Link from "next/link";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";

export const metadata: Metadata = {
  title: "Restaurant Website Redesign | MixedMakerShop",
  description:
    "How we redesign restaurant sites for faster loads, clearer menus, and more reservations — with live samples you can preview.",
};

/** Local showcase previews under /public/images/ (concept before/after, not literal site screenshots). */
const IMG_BEFORE = "/images/showcase/freshcut-property-care.jpg";
const IMG_AFTER = "/images/showcase/deep-well-audio.jpg";

export default function RestaurantRedesignPage() {
  return (
    <>
      <section className="section">
        <div className="container">
          <div className="panel" style={{ marginBottom: 28 }}>
            <p className="small" style={{ margin: "0 0 8px", opacity: 0.85 }}>
              Concept page · Restaurant & hospitality
            </p>
            <h1 className="h1" style={{ margin: "0 0 12px" }}>
              Restaurant websites that sell the room — not the confusion
            </h1>
            <p className="subhead" style={{ margin: 0, lineHeight: 1.55 }}>
              Most restaurant homepages bury the menu, hide hours, and load like it is 2012. This page explains how a
              redesign fixes that: mobile-first layout, obvious reserve and order paths, and photography that matches
              how guests actually decide where to eat.
            </p>
            <div className="btn-row" style={{ marginTop: 22, flexWrap: "wrap" }}>
              <Link href="/website-samples/southern-diner-concept" className="btn gold">
                Open Southern diner sample
              </Link>
              <Link href="/samples/restaurant" className="btn ghost">
                Full restaurant portfolio demo
              </Link>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 36, alignItems: "stretch" }}>
            <article className="card" style={{ padding: 0, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={IMG_BEFORE}
                alt="Local service website preview — clear structure and mobile-friendly layout"
                style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
                width={800}
                height={400}
              />
              <div style={{ padding: "16px 18px 18px" }}>
                <h2 className="section-heading" style={{ margin: "0 0 8px", fontSize: "1.15rem" }}>
                  Before: friction on the first tap
                </h2>
                <p className="small" style={{ margin: 0, lineHeight: 1.5, opacity: 0.92 }}>
                  PDF menus, tiny tap targets, autoplay music, and buried hours. Guests bounce to the next tab — and you
                  never know they were interested.
                </p>
              </div>
            </article>
            <article className="card" style={{ padding: 0, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={IMG_AFTER}
                alt="Polished brand website preview — strong typography and hero presence"
                style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
                width={800}
                height={400}
              />
              <div style={{ padding: "16px 18px 18px" }}>
                <h2 className="section-heading" style={{ margin: "0 0 8px", fontSize: "1.15rem" }}>
                  After: menu, hours, and proof up front
                </h2>
                <p className="small" style={{ margin: 0, lineHeight: 1.5, opacity: 0.92 }}>
                  One scroll tells the story: what you serve, when you are open, how to book or order, and social proof
                  — all thumb-friendly on a phone.
                </p>
              </div>
            </article>
          </div>

          <div className="panel" style={{ marginBottom: 28 }}>
            <h2 className="section-heading" style={{ margin: "0 0 14px", fontSize: "1.25rem" }}>
              What we actually change
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.65 }} className="small">
              <li>
                <strong>Information hierarchy</strong> — hours, location, and menu links in the first screen, not three
                clicks deep.
              </li>
              <li>
                <strong>Speed and Core Web Vitals</strong> — compressed images, modern fonts, and no heavy sliders that
                tank mobile scores.
              </li>
              <li>
                <strong>Reservation and order CTAs</strong> — consistent buttons that match how you take business
                (phone, platform, or native form).
              </li>
              <li>
                <strong>Seasonal updates you can own</strong> — simple patterns so your team can swap specials without
                breaking the layout.
              </li>
            </ul>
          </div>

          <div className="panel" style={{ marginBottom: 28 }}>
            <h2 className="section-heading" style={{ margin: "0 0 10px", fontSize: "1.25rem" }}>
              See it in a live sample layout
            </h2>
            <p className="small copy-readable" style={{ margin: "0 0 16px", lineHeight: 1.5 }}>
              The <strong>Southern Diner Concept</strong> and <strong>Brick &amp; Ember</strong> portfolio demo show the
              same structure we use for real clients: hero, services / menu blocks, gallery, reviews, and a strong
              closing CTA. Open either link on your phone — that is the bar we build toward.
            </p>
            <div className="btn-row" style={{ flexWrap: "wrap" }}>
              <Link href="/website-samples/southern-diner-concept" className="btn gold">
                Southern diner concept
              </Link>
              <Link href="/samples/restaurant" className="btn ghost">
                Brick &amp; Ember (portfolio)
              </Link>
              <Link href="/website-samples" className="btn ghost">
                Layout demos
              </Link>
            </div>
          </div>

          <div
            className="credibility-strip"
            style={{
              padding: "22px 20px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              marginBottom: 24,
            }}
          >
            <h2 className="section-heading" style={{ margin: "0 0 8px", fontSize: "1.2rem" }}>
              Want this for your kitchen or dining room?
            </h2>
            <p className="small" style={{ margin: "0 0 16px", maxWidth: 640, lineHeight: 1.5 }}>
              Send your current URL and a few photos — I will reply with a short teardown and how a redesign could move
              more covers and takeout orders.
            </p>
            <div className="btn-row">
              <Link href={publicFreeMockupFunnelHref} className="btn gold">
                Get My Free Preview
              </Link>
              <Link href="/contact" className="btn ghost">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
