import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";
import { metaDescription } from "@/lib/seo/snippet-meta";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/web-design-hot-springs-ar`;

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
  title: "Hot Springs Web Design for Small Business",
  description: metaDescription(
    "Affordable Hot Springs, AR web design for contractors, restaurants, and local brands. Starter sites $400 · full setups $900 · free preview. Founder-led, mobile-first."
  ),
  alternates: { canonical },
  openGraph: {
    title: "Hot Springs Web Design | MixedMakerShop",
    description:
      "Affordable web design in Hot Springs, Arkansas for small businesses, service providers, side hustlers, and local brands.",
    url: canonical,
    type: "website",
  },
};

const whoFor = [
  {
    badge: "Outdoor",
    title: "Lawn care businesses",
    copy: "Show service areas, before/after photos, and a contact form people can fill out from the truck.",
  },
  {
    badge: "Trades",
    title: "Contractors",
    copy: "Project galleries, licensing details, quote request forms, and clear service categories.",
  },
  {
    badge: "Home services",
    title: "Cleaning services",
    copy: "Service tiers, frequency options, instant booking — the stuff that turns visits into customers.",
  },
  {
    badge: "Brick & mortar",
    title: "Local shops",
    copy: "Address, hours, photos, products, Google Maps directions — everything a foot-traffic customer needs.",
  },
  {
    badge: "Solo",
    title: "Side hustlers",
    copy: "A real web home that takes you seriously — past Etsy, Linktree, or just an Instagram bio.",
  },
  {
    badge: "Pros",
    title: "Service providers",
    copy: "Coaches, consultants, mobile mechanics, photographers — anyone selling time, expertise, or a service.",
  },
  {
    badge: "New",
    title: "New businesses",
    copy: "Just opening doors? Start with the basics done right — domain, hosting, pages, contact, and Google.",
  },
] as const;

const whatYouGet = [
  {
    badge: "01 · Device",
    title: "Mobile-friendly design",
    copy: "Built mobile-first. Reads cleanly on a phone before it gets fancy on a desktop.",
  },
  {
    badge: "02 · Conversion",
    title: "Clear contact buttons",
    copy: "Call, text, email, and quote-request buttons placed where people actually look for them.",
  },
  {
    badge: "03 · Findability",
    title: "Basic SEO setup",
    copy: "Page titles, descriptions, headings, schema, and a sitemap — the foundation Google needs.",
    link: { href: "/local-seo-services", label: "See local SEO.", prefix: "Need more? " },
  },
  {
    badge: "04 · Speed",
    title: "Fast-loading pages",
    copy: "Optimized images, no bloated builders, low overhead. Pages open before visitors lose patience.",
  },
  {
    badge: "05 · Structure",
    title: "Google-friendly structure",
    copy: "Clean URLs, semantic HTML, structured data, accessible markup — the boring stuff that ranks.",
  },
  {
    badge: "06 · Ongoing",
    title: "Help with updates",
    copy: "Need a page changed, a new photo, or a holiday hours edit? You text Topher. It gets done.",
  },
] as const;

const faqs = [
  {
    q: "How much does a small business website cost?",
    a: "Starter setups begin around $400 and full small-business websites typically start at $900. The final price depends on how many pages, photos, and features you need. See the pricing page for a clear breakdown.",
  },
  {
    q: "Can you help with Google Business Profile?",
    a: "Yes. MixedMakerShop sets up and tunes Google Business Profile listings — categories, photos, services, hours, posts, and the basics that help you appear when nearby customers search.",
  },
  {
    q: "Do you work with businesses outside Hot Springs?",
    a: "Yes. The studio is based in Hot Springs, AR, but most of the work is remote-friendly — clients in Benton, Malvern, Hot Springs Village, Lake Hamilton, and nationwide are all welcome.",
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
    href: "/local-seo-services",
    badge: "SEO",
    title: "Local SEO Services",
    copy: 'Get found in "near me" searches. On-page tuning, schema, and ongoing visibility work for Hot Springs.',
  },
  {
    href: "/google-business-profile-help",
    badge: "Google Maps",
    title: "Google Business Profile",
    copy: "Listed, verified, and ranking on Google Maps — photos, posts, hours, services, the works.",
  },
  {
    href: "/pricing",
    badge: "Ongoing",
    title: "Hosting & Maintenance",
    copy: "Monthly edits, updates, backups, and fixes for $89/mo — text Topher and it gets done.",
  },
  {
    href: "/in-home-computer-repair",
    badge: "Local",
    title: "In-Home Computer Repair",
    copy: "Slow PC, login problems, printer issues — fixed at your home or office in Hot Springs.",
  },
  {
    href: "/ai-business-tools",
    badge: "Automation",
    title: "AI Business Tools",
    copy: "Practical AI workflows for lead follow-up, content, intake, and the boring stuff eating your time.",
  },
] as const;

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "MixedMakerShop — Hot Springs Web Design",
  url: canonical,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Hot Springs",
    addressRegion: "AR",
    addressCountry: "US",
  },
  areaServed: [...AREA_SERVED],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Hot Springs Web Design",
  name: "Hot Springs Web Design — Small Business Websites by MixedMakerShop",
  description:
    "Founder-led web design for Hot Springs, Arkansas businesses. Mobile-first, fast-loading, SEO-tuned websites built specifically for local businesses across Hot Springs, Hot Springs Village, Lake Hamilton, Benton, and Malvern.",
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
    name: "Hot Springs Web Design Pricing",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Starter Setup",
        price: "400",
        priceCurrency: "USD",
        description:
          "One-page mobile-friendly website with click-to-call and contact form. Live within 5 business days.",
      },
      {
        "@type": "Offer",
        name: "Business Setup",
        price: "900",
        priceCurrency: "USD",
        description: "3-5 page website with service pages, Google profile optimization, and review setup.",
      },
      {
        "@type": "Offer",
        name: "Custom Build",
        priceCurrency: "USD",
        description: "Custom features, advanced layouts, specialized functionality. Quoted per project.",
      },
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

export default function HotSpringsWebDesignPage() {
  return (
    <>
      <JsonLd data={[localBusinessSchema, serviceSchema, faqSchema]} />

      {/* HERO */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="kicker">
              <span className="dot" /> Hot Springs, Arkansas
            </div>
            <h1 className="h1" style={{ margin: "14px 0 14px" }}>
              Hot Springs Web Design for Small Businesses
            </h1>
            <p className="subhead" style={{ margin: "0 0 18px" }}>
              MixedMakerShop builds clean, mobile-friendly websites for Hot Springs businesses — sites that load fast,
              read well on a phone, and make it easy for local customers to find you and contact you.
            </p>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              Founder-led studio in Hot Springs, AR. You work directly with Topher Cook — no agency layers, no mystery
              handoffs. Starter setups from $400, full small-business websites from $900.
            </p>
            <div className="btn-row">
              <Link className="btn gold btn-cta-primary" href={publicFreeMockupFunnelHref}>
                Get My Free Preview
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

      {/* WHO THIS IS FOR */}
      <section className="section" aria-labelledby="who-heading">
        <div className="container">
          <div className="panel">
            <h2 id="who-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Who this is for
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              If your customers are local, your phone is your office, and your current website (or lack of one)
              isn&apos;t helping — this is built for you.
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

      {/* WHAT YOU GET */}
      <section className="section" aria-labelledby="what-heading">
        <div className="container">
          <div className="panel">
            <h2 id="what-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              What you get
            </h2>
            <p className="small" style={{ margin: "0 0 20px", color: "var(--muted)", lineHeight: 1.6 }}>
              Every site is built on the same baseline — the things real customers actually need from a small-business
              website.
            </p>
            <div className="how-it-works-grid">
              {whatYouGet.map((c) => (
                <div className="how-it-works-card" key={c.title}>
                  <span className="how-it-works-badge">{c.badge}</span>
                  <h3 className="how-it-works-title">{c.title}</h3>
                  <p className="how-it-works-copy">
                    {c.copy}
                    {"link" in c && c.link ? (
                      <>
                        {" "}
                        {c.link.prefix}
                        <Link href={c.link.href}>{c.link.label}</Link>
                      </>
                    ) : null}
                  </p>
                </div>
              ))}
            </div>
            <p className="small" style={{ margin: "22px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              Looking to go further? Pair this with{" "}
              <Link href="/google-business-profile-help">Google Business Profile setup</Link> for full local
              visibility, or check <Link href="/pricing">starting pricing</Link> for the full breakdown.
            </p>
          </div>
        </div>
      </section>

      {/* LOCAL CTA */}
      <section className="section" aria-labelledby="cta-heading">
        <div className="container">
          <div className="panel" style={{ textAlign: "center" }}>
            <div className="kicker" style={{ margin: "0 auto" }}>
              <span className="dot" /> Free, no obligation
            </div>
            <h2 id="cta-heading" className="section-heading" style={{ margin: "14px 0 12px" }}>
              See what your Hot Springs website could look like.
            </h2>
            <p className="subhead" style={{ margin: "0 auto 22px", maxWidth: "60ch" }}>
              Send a few details about your business and Topher will put together a free homepage preview — designed
              specifically for your shop, service, or hustle.
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
              FAQ
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
              More questions? <Link href="/contact">Contact Topher</Link> or check{" "}
              <Link href="/pricing">starting pricing</Link> for the full breakdown.
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
              Other ways MixedMakerShop helps Hot Springs small businesses get found, win customers, and stay running
              smoothly.
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
