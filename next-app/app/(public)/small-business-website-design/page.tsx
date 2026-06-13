import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/small-business-website-design`;

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
  title: "Small Business Website Design | MixedMakerShop",
  description:
    "Clean, mobile-friendly small business website design built around how customers find, trust, and contact you. Starter setups from $400, full sites from $900.",
  alternates: { canonical },
  openGraph: {
    title: "Small Business Website Design | MixedMakerShop",
    description:
      "Founder-led small business web design — mobile-first, fast, conversion-focused. No agency layers. Starter from $400.",
    url: canonical,
    type: "website",
  },
};

const whoFor = [
  {
    badge: "01 · Solo",
    title: "Solo operators",
    copy: "Coaches, photographers, contractors, consultants — one person, one calendar, and a website that takes them seriously.",
  },
  {
    badge: "02 · Local",
    title: "Local service businesses",
    copy: 'Lawn care, cleaning, HVAC, plumbing, mobile repair — anywhere "near me" matters and a phone call is the goal.',
  },
  {
    badge: "03 · Shops",
    title: "Storefronts",
    copy: 'Restaurants, cafés, boutiques, salons, studios — anywhere walk-in traffic and "directions to ___" actually matter.',
  },
  {
    badge: "04 · Replace",
    title: "Owners replacing an outdated site",
    copy: "Built years ago by a developer who disappeared, or stuck on a slow platform. Time for something that loads, looks current, and is yours.",
  },
  {
    badge: "05 · New",
    title: "Brand-new businesses",
    copy: 'Just opened. Need a real website, a real domain, a real email — not a Linktree, a Facebook page, or a "site coming soon" message.',
  },
  {
    badge: "06 · Side",
    title: "Side hustlers going pro",
    copy: "The side gig is making real money. Time to graduate from Etsy or Instagram bios to something customers can trust.",
  },
] as const;

const included = [
  {
    badge: "01 · Mobile",
    title: "Mobile-first design",
    copy: "Built for a phone first, then scaled up to desktop. Most of your customers are visiting from their phone — we design accordingly.",
  },
  {
    badge: "02 · Speed",
    title: "Fast-loading pages",
    copy: "Optimized images, lazy loading, no overweight builders. Pages open before visitors lose patience or bounce.",
  },
  {
    badge: "03 · Contact",
    title: "Clear contact buttons",
    copy: "Call, text, email, quote-request — placed where people actually look for them. Tracked so you can see where leads come from.",
  },
  {
    badge: "04 · SEO",
    title: "Baseline SEO",
    copy: "Page titles, meta descriptions, schema markup, sitemap, robots.txt — the foundation Google needs.",
  },
  {
    badge: "05 · Maps",
    title: "Google Maps integration",
    copy: "Hours, address, directions, embedded map — everything a foot-traffic or local-service customer needs at a glance.",
  },
  {
    badge: "06 · Ongoing",
    title: "Help with updates",
    copy: "Need a page changed, photo swapped, holiday hours updated? You text Topher. Monthly maintenance plans keep it current.",
  },
] as const;

const faqs = [
  {
    q: "How much does a small business website cost?",
    a: "Starter setups begin around $400 and full small-business websites typically start at $900. Final price depends on number of pages, photos, and features. See the pricing page for the full breakdown.",
  },
  {
    q: "How long does it take to build?",
    a: "Most small business projects are live within 5–10 business days once we have your copy and photos. Larger projects with custom features can take 2–3 weeks. We don't run on agency timelines.",
  },
  {
    q: "Will I own my website?",
    a: "Yes. You own your domain, your hosting, your files, and your content. There's no proprietary platform lock-in. If you ever stop working with us, the site keeps running.",
  },
  {
    q: "Do I need to be in Hot Springs?",
    a: "No. We're based in Hot Springs, AR and serve nearby Arkansas towns in person — but most of the work is remote-friendly. Clients across the U.S. are welcome.",
  },
  {
    q: "Can you redesign my existing website?",
    a: "Yes. Redesigns are a large share of our work. We'll look at what you have, what's working, and what's dragging you down — then quote a redesign that preserves your wins. Send the URL and we'll take a look.",
  },
] as const;

const relatedServices = [
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
    href: "/website-maintenance",
    badge: "Ongoing",
    title: "Website Maintenance",
    copy: "Monthly edits, updates, backups, and fixes from $89/mo — text Topher and it gets done.",
  },
  {
    href: "/pricing",
    badge: "Pricing",
    title: "Pricing",
    copy: "Starter from $400, Growth $900–$1,800, custom quote — the full breakdown.",
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
  serviceType: "Small Business Website Design",
  name: "Small Business Website Design | MixedMakerShop",
  description:
    "Clean, mobile-friendly small business website design built around how customers find, trust, and contact you. Starter setups from $400, full sites from $900.",
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
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Small Business Website Design",
    itemListElement: [
      { "@type": "Offer", name: "Starter Setup", price: "400", priceCurrency: "USD" },
      { "@type": "Offer", name: "Full Business Website ($900–$1,800)", price: "900", priceCurrency: "USD" },
    ],
  },
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

export default function SmallBusinessWebsiteDesignPage() {
  return (
    <>
      <JsonLd data={[serviceSchema, faqSchema]} />

      {/* HERO */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="kicker">
              <span className="dot" /> Small business website design
            </div>
            <h1 className="h1" style={{ margin: "14px 0 14px" }}>
              Small Business Website Design
            </h1>
            <p className="subhead" style={{ margin: "0 0 18px" }}>
              Clean, mobile-friendly websites built around how your customers actually find you, decide to trust you, and
              contact you. Built by a founder-led studio — no agency layers, no mystery handoffs.
            </p>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              Based in Hot Springs, AR — most of the work is remote-friendly. Starter setups from $400, full
              small-business websites from $900. Direct communication with Topher Cook from the first call to the live
              site.
            </p>
            <div className="btn-row">
              <Link className="btn gold btn-cta-primary" href="/contact">
                Start My Website
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

      {/* WHO IT'S FOR */}
      <section className="section" aria-labelledby="who-heading">
        <div className="container">
          <div className="panel">
            <h2 id="who-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Who this is for
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              Small business website design works best for owners who care about how their business looks online but
              don&apos;t want to become a developer to maintain it. If your customers find you through search, referrals,
              or word of mouth — this is built for you.
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
      <section className="section" aria-labelledby="included-heading">
        <div className="container">
          <div className="panel">
            <h2 id="included-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              What&apos;s included
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              Every site is built on the same baseline — the things real customers actually need from a small business
              website. No bloated builders, no &quot;starter templates&quot; you&apos;ll outgrow.
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
              In Hot Springs, AR specifically? See <Link href="/web-design-hot-springs-ar">Hot Springs web design</Link>.
              Want to add Google Business Profile setup? See{" "}
              <Link href="/google-business-profile-help">GBP help</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="section" aria-labelledby="why-heading">
        <div className="container">
          <div className="panel">
            <h2 id="why-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Why a real website still matters
            </h2>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              &quot;Social media is enough&quot; is the most expensive mistake small businesses make. Social platforms own
              your audience, change the rules every quarter, and can shut your reach off overnight. A website is the one
              thing you actually own.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              When a new customer hears about you — from a friend, an ad, a sign, a Google search — the first thing they
              do is look you up. If they land on a slow, broken, or outdated site, they bounce. If they land on a
              Linktree or a half-finished Wix page, they question whether you&apos;re still in business.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              A real website does three jobs at once: it answers the questions every customer asks, it builds trust
              without you in the room, and it gives Google something concrete to rank for &quot;near me&quot; and
              &quot;best ___&quot; searches.
            </p>
            <p className="small" style={{ margin: "0 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              Done right, the cost of the site is paid back by the first one or two customers it earns. After that, every
              customer it earns is profit.
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
              See what your website could look like.
            </h2>
            <p className="subhead" style={{ margin: "0 auto 22px", maxWidth: "60ch" }}>
              Send a few details about your business and Topher will put together a free homepage preview — designed
              specifically for what you do, who you serve, and how customers actually find you.
            </p>
            <div className="btn-row" style={{ justifyContent: "center" }}>
              <Link className="btn gold btn-cta-primary" href={publicFreeMockupFunnelHref}>
                Get My Free Preview
              </Link>
              <Link className="btn ghost" href="/pricing">
                See pricing first
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
