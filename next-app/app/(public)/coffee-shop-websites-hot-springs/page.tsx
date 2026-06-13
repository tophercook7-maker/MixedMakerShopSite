import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/coffee-shop-websites-hot-springs`;

const AREA_SERVED = [
  "Hot Springs AR",
  "Hot Springs Village AR",
  "Lake Hamilton AR",
  "Benton AR",
  "Malvern AR",
  "Lonsdale AR",
  "Arkansas",
] as const;

export const metadata: Metadata = {
  title: "Coffee Shop Website Design in Hot Springs, AR | MixedMakerShop",
  description:
    "Coffee shop website design for Hot Springs, Arkansas — menu, hours, location, atmosphere. Mobile-first sites that bring locals and tourists through the door.",
  alternates: { canonical },
  openGraph: {
    title: "Coffee Shop Website Design — Hot Springs, Arkansas",
    description:
      "Visual-first coffee shop websites built for the morning customer making a 10-second decision. Menu, hours, photos, parking, drive-thru info.",
    url: canonical,
    type: "website",
  },
};

const whoFor = [
  {
    badge: "01 · Indie",
    title: "Independent shops",
    copy: "One owner, one shop, one personality. Your website should look like you — not a corporate template.",
  },
  {
    badge: "02 · Drive-thru",
    title: "Drive-thru-only locations",
    copy: "Customers checking your menu from another drive-thru lane. Big text, fast load, no clutter.",
  },
  {
    badge: "03 · Roasters",
    title: "Local roasters & roasting cafés",
    copy: "Sell beans, share the roast story, list current single-origins, and link to your wholesale program in one place.",
  },
  {
    badge: "04 · Brunch",
    title: "Brunch-heavy coffee bars",
    copy: "Brunch menu matters as much as the coffee. Weekend hours, Mother's Day specials, the works.",
  },
  {
    badge: "05 · Specialty",
    title: "Specialty / third-wave",
    copy: "Pour-over menu, single-origin info, brew method explainers — content that serious coffee customers actually read.",
  },
  {
    badge: "06 · Tourist",
    title: "Downtown / tourist-adjacent",
    copy: 'Hot Springs has tourist foot traffic. Your site needs to convert "I see a sign — let me check the website" within the same block.',
  },
] as const;

const included = [
  {
    badge: "01 · Menu",
    title: "Drink menu with prices",
    copy: "Espresso, drip, pour-over, cold drinks, seasonal specials, syrups. Prices visible. No menu PDF download.",
  },
  {
    badge: "02 · Hours",
    title: "Daily hours + holiday hours",
    copy: "Big, mobile-readable. Special hours for Hot Springs marathon weekend, holidays, weather closures. Easy to update.",
  },
  {
    badge: "03 · Photos",
    title: "Real interior + drink photos",
    copy: "Your shop's actual vibe — natural light, your barista, your latte art. Not stock images of foam.",
  },
  {
    badge: "04 · Location",
    title: "Address + parking + drive-thru",
    copy: '"Free 2-hour parking lot behind the building." Embedded Google Maps. Drive-thru hours if different from inside.',
  },
  {
    badge: "05 · Loyalty",
    title: "Loyalty program or online order",
    copy: "Toast, Square Loyalty, app link — whatever you use, one tap from the homepage.",
  },
  {
    badge: "06 · Instagram",
    title: "Instagram feed embed",
    copy: "Your active social presence on the page. Auto-updates as you post. Gives the site current-day energy.",
  },
] as const;

const faqs = [
  {
    q: "Can I sell bags of coffee online?",
    a: "Yes. We hook up Shopify, Square, or a simple Stripe-based shop depending on volume. If you're shipping coffee, we wire shipping rates, weights, and roast-date displays.",
  },
  {
    q: "Do you take photos for the site?",
    a: "Not directly, but we can refer a local photographer. Most shops have enough usable photos on their phone if we cull the good ones. We'll tell you straight if a phone shoot would be worth the half-day.",
  },
  {
    q: "How long does a coffee shop site take?",
    a: "Most projects are live within 5–10 business days once we have your menu, hours, and photos. We launch the basics first; iterate on photo galleries and Instagram embeds after.",
  },
  {
    q: "Do you also handle Instagram posting?",
    a: "Posting only, yes — see our Social Media Takeover service. We do not reply to comments or DMs as you; that voice stays yours.",
  },
  {
    q: "What about online ordering?",
    a: "We integrate Toast Online Ordering, Square Online, ChowNow, or whatever you use. Customer experience stays seamless — they don't feel like they got routed to a third party.",
  },
] as const;

const relatedServices = [
  {
    href: "/web-design",
    badge: "Web design",
    title: "Small Business Website Design",
    copy: "Custom mobile-first websites built for how customers actually find and contact you.",
  },
  {
    href: "/web-design-hot-springs-ar",
    badge: "Local",
    title: "Hot Springs Web Design",
    copy: "Web design specifically for Hot Springs, Benton, Malvern, and nearby Arkansas communities.",
  },
  {
    href: "/local-seo-services",
    badge: "SEO",
    title: "Local SEO Services",
    copy: 'Get found in "near me" searches. On-page tuning, schema, and ongoing visibility work.',
  },
  {
    href: "/google-business-profile-help",
    badge: "Google Maps",
    title: "Google Business Profile",
    copy: "Listed, verified, and ranking on Google Maps — photos, posts, hours, services, the works.",
  },
  {
    href: "/social-media-takeover",
    badge: "Social",
    title: "Social Media Takeover",
    copy: "Done-for-you posting across Instagram, Facebook, and GBP. You keep your DMs and comments.",
  },
  {
    href: "/ai-business-tools",
    badge: "Automation",
    title: "AI Business Tools",
    copy: "Practical AI workflows for lead follow-up, content, intake, and the boring stuff eating your time.",
  },
] as const;

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Coffee Shop Website Design",
  name: "Coffee Shop Website Design in Hot Springs, AR | MixedMakerShop",
  description:
    "Coffee shop website design for Hot Springs, Arkansas — menu, hours, location, atmosphere. Mobile-first sites that bring locals and tourists through the door.",
  provider: {
    "@type": "LocalBusiness",
    name: "MixedMakerShop",
    url: `${SITE_URL}/`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hot Springs",
      addressRegion: "AR",
      addressCountry: "US",
    },
  },
  areaServed: [...AREA_SERVED],
  url: canonical,
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function CoffeeShopWebsitesPage() {
  return (
    <>
      <JsonLd data={[serviceSchema, faqSchema]} />

      {/* HERO */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="kicker">
              <span className="dot" /> Coffee shops in Hot Springs
            </div>
            <h1 className="h1" style={{ margin: "14px 0 14px" }}>
              Coffee Shop Website Design in Hot Springs, Arkansas
            </h1>
            <p className="subhead" style={{ margin: "0 0 18px" }}>
              A coffee shop website is the difference between &quot;let&apos;s try that one&quot; and the customer
              driving to the chain three blocks down. Menu, vibe, hours, parking — all visible in 10 seconds on a phone
              with one hand on the wheel.
            </p>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              Hot Springs, AR — founder-led web design starting at $400. We work with indie shops, drive-thrus,
              roasters, and breakfast/brunch spots.
            </p>
            <div className="btn-row">
              <Link className="btn gold btn-cta-primary" href={publicFreeMockupFunnelHref}>
                Get a Free Coffee Shop Mockup
              </Link>
              <Link className="btn ghost" href="/pricing">
                See pricing
              </Link>
            </div>
            <p className="small" style={{ marginTop: 14, color: "var(--muted2)" }}>
              Hot Springs • Hot Springs Village • Lake Hamilton • Benton • Malvern • Remote-friendly nationwide
            </p>
          </div>
        </div>
      </section>

      {/* WHO */}
      <section className="section" aria-labelledby="who-heading">
        <div className="container">
          <div className="panel">
            <h2 id="who-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Who this is for
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              Coffee shop customers decide fast and visually. Your website has to compete with Instagram for the same
              job — communicating what your shop feels like — but with the practical info Instagram can&apos;t put in one
              place.
            </p>
            <div className="how-it-works-grid">
              {whoFor.map((c) => (
                <div className="how-it-works-card" key={c.title}>
                  <span className="how-it-works-badge">{c.badge}</span>
                  <h3 className="how-it-works-title">{c.title}</h3>
                  <p className="how-it-works-copy">{c.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="section" aria-labelledby="incl-heading">
        <div className="container">
          <div className="panel">
            <h2 id="incl-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              What every coffee shop site needs
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              Visual-first, mobile-first, hand-on-wheel friendly. These are the must-haves.
            </p>
            <div className="how-it-works-grid">
              {included.map((c) => (
                <div className="how-it-works-card" key={c.title}>
                  <span className="how-it-works-badge">{c.badge}</span>
                  <h3 className="how-it-works-title">{c.title}</h3>
                  <p className="how-it-works-copy">{c.copy}</p>
                </div>
              ))}
            </div>
            <p className="small" style={{ margin: "22px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              Want to keep your <Link href="/google-business-profile-help">Google Business Profile</Link> active with
              weekly posts? Worth pairing — most &quot;near me&quot; coffee searches surface the GBP before the website.{" "}
              <Link href="/pricing">See pricing</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="section" aria-labelledby="why-heading">
        <div className="container">
          <div className="panel">
            <h2 id="why-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Why coffee shops can&apos;t just lean on social
            </h2>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              A lot of coffee shop owners say &quot;we just use Instagram.&quot; That works for the existing customer
              base — but new visitors don&apos;t see your Instagram unless you advertise. They search &quot;coffee near
              me&quot; or &quot;best coffee Hot Springs&quot; on Google, and Google shows them a list of shops with
              websites.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              If you&apos;re not on that list — or you&apos;re on it with a half-finished site that loads slowly — they
              go to the next shop. The shop they would have liked yours better, but you never got the chance.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              Hot Springs has a year-round tourist base — Bathhouse Row, the lake, marathon weekend, racing season. These
              visitors aren&apos;t scrolling local Instagram accounts. They&apos;re Googling at 8:30 AM trying to find a
              real coffee shop before heading out. The shops that show up clearly online get that business.
            </p>
            <p className="small" style={{ margin: "0 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              A coffee shop website doesn&apos;t replace Instagram. It does the job Instagram can&apos;t — be the answer
              to &quot;where should I go right now.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" aria-labelledby="cta-heading">
        <div className="container">
          <div className="panel" style={{ textAlign: "center" }}>
            <div className="kicker" style={{ margin: "0 auto" }}>
              <span className="dot" /> Free to ask
            </div>
            <h2 id="cta-heading" className="section-heading" style={{ margin: "14px 0 12px" }}>
              Let&apos;s mock up your coffee shop&apos;s site.
            </h2>
            <p className="subhead" style={{ margin: "0 auto 22px", maxWidth: "60ch" }}>
              Send your shop name and a couple of photos. Topher will design a homepage that looks like your actual shop
              and ships within the week.
            </p>
            <div className="btn-row" style={{ justifyContent: "center" }}>
              <Link className="btn gold btn-cta-primary" href={publicFreeMockupFunnelHref}>
                Get a Free Coffee Shop Mockup
              </Link>
              <Link className="btn ghost" href="/pricing">
                See pricing
              </Link>
            </div>
            <p className="small" style={{ marginTop: 14, color: "var(--muted)" }}>
              Direct communication with Topher Cook • Hot Springs, AR • Fast turnaround
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" aria-labelledby="faq-heading">
        <div className="container">
          <div className="panel">
            <h2 id="faq-heading" className="section-heading" style={{ margin: "0 0 18px" }}>
              Frequently asked questions
            </h2>
            {faqs.map((f) => (
              <div className="card" style={{ marginBottom: 14 }} key={f.q}>
                <h3 style={{ margin: "0 0 8px" }}>{f.q}</h3>
                <p className="small" style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
                  {f.a}
                </p>
              </div>
            ))}
            <p className="small" style={{ margin: "18px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              Have a different question? <Link href="/contact">Ask Topher directly</Link> — or check the{" "}
              <Link href="/pricing">pricing page</Link> for what each service costs.
            </p>
          </div>
        </div>
      </section>

      {/* RELATED SERVICES */}
      <section className="section" aria-labelledby="related-services-heading">
        <div className="container">
          <div className="panel">
            <h2 id="related-services-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Related Services
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              Other ways MixedMakerShop helps small businesses get found, win customers, and stay running smoothly.
            </p>
            <div className="how-it-works-grid">
              {relatedServices.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="how-it-works-card"
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <span className="how-it-works-badge">{r.badge}</span>
                  <h3 className="how-it-works-title">{r.title}</h3>
                  <p className="how-it-works-copy">{r.copy}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
