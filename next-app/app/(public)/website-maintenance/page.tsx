import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/website-maintenance`;

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
  title: "Website Maintenance for Small Businesses | MixedMakerShop",
  description:
    "Done-for-you website maintenance in Hot Springs, AR — content edits, security updates, off-site backups, bug fixes, and uptime monitoring from $89/mo. Text Topher; it gets done.",
  alternates: { canonical },
  openGraph: {
    title: "Website Maintenance for Small Businesses | MixedMakerShop",
    description:
      "Keep your website current, secure, and fast — month-to-month maintenance with a direct line to Topher. From $89/mo.",
    url: canonical,
    type: "website",
  },
};

const whoFor = [
  {
    badge: "01 · Built-once",
    title: "Built-once-and-forgotten owners",
    copy: "Site was built three years ago. Phone number is still right. Everything else is stale. You don't want to learn the editor.",
  },
  {
    badge: "02 · Inherited",
    title: "Inherited sites",
    copy: "Old developer disappeared. You have access (kind of). You don't know what platform it's even on. We do.",
  },
  {
    badge: "03 · Worried",
    title: "Owners worried about getting hacked",
    copy: "Outdated WordPress sites are the #1 target. We patch quickly and back up off-site.",
  },
  {
    badge: "04 · Busy",
    title: "Service-business owners",
    copy: "You're running the actual business. Site updates fall to the bottom of the list forever.",
  },
  {
    badge: "05 · Growing",
    title: "Growing businesses with constant changes",
    copy: "New services, new staff, new pricing, new locations — and you don't want to call a developer for every edit.",
  },
  {
    badge: "06 · Multi-site",
    title: "Multi-site owners",
    copy: "Two or three sites for different brands. Want one person handling them all.",
  },
] as const;

const included = [
  {
    badge: "01 · Edits",
    title: "Content edits",
    copy: "New copy, swapped photos, new service pages, updated hours, holiday hours, new testimonials, blog posts — send and done.",
  },
  {
    badge: "02 · Updates",
    title: "Platform & plugin updates",
    copy: "Patches, security updates, version bumps applied carefully so nothing breaks. We test in staging before pushing live.",
  },
  {
    badge: "03 · Backups",
    title: "Off-site backups",
    copy: "Weekly full-site backups stored separately from your host. If anything ever goes wrong, we restore in minutes, not days.",
  },
  {
    badge: "04 · Fixes",
    title: "Bug fixes",
    copy: "Forms that stopped working, broken images, layout glitches on a new phone, contact form going to spam — handled as part of monthly.",
  },
  {
    badge: "05 · Monitoring",
    title: "Uptime monitoring",
    copy: "We watch the site 24/7. If it goes down, we know before you do.",
  },
  {
    badge: "06 · Direct",
    title: "Direct line",
    copy: "No tickets, no portals, no support queue. Text Topher; it gets done.",
  },
] as const;

const faqs = [
  {
    q: "How fast do edits get done?",
    a: "Small edits (hours, phone, photo swap, new testimonial) are usually same-day or next-day. Larger changes (new pages, redesigned sections) get a quick scope-and-quote first and typically ship within the week.",
  },
  {
    q: "Do you maintain websites you didn't build?",
    a: "Sometimes. We'll take a look first. If the site is on a platform we know (WordPress, Wix, Squarespace, Shopify, Webflow, static HTML) and isn't a custom-built disaster underneath, we'll maintain it. If it's a tangle we can't safely touch, we'll be straight with you.",
  },
  {
    q: "What if I want to cancel?",
    a: "Month-to-month. Cancel any time. You keep all your files, your hosting, your domain — everything stays with you.",
  },
  {
    q: "Do you also fix things I broke trying to edit it myself?",
    a: "Yes, this is half of what maintenance ends up being. Don't feel bad — text us a screenshot.",
  },
  {
    q: "Can I have multiple sites under one maintenance plan?",
    a: "Yes. Each additional site is added at a small per-site fee. Useful if you run multiple brands or locations on separate domains.",
  },
] as const;

const relatedServices = [
  {
    href: "/web-design",
    badge: "Web design",
    title: "Web Design",
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
    href: "/pricing",
    badge: "Pricing",
    title: "Pricing",
    copy: "Hosting & support from $89/mo, plus the full breakdown of every service.",
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
  serviceType: "Website Maintenance",
  name: "Website Maintenance for Small Businesses | MixedMakerShop",
  description:
    "Done-for-you website maintenance — content edits, security updates, off-site backups, bug fixes, and uptime monitoring. Month-to-month from $89/mo.",
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
  offers: {
    "@type": "Offer",
    name: "Hosting & Support",
    price: "89",
    priceCurrency: "USD",
    description: "Monthly website maintenance, hosting, backups, monitoring, and content edits.",
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

export default function WebsiteMaintenancePage() {
  return (
    <>
      <JsonLd data={[serviceSchema, faqSchema]} />

      {/* HERO */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="kicker">
              <span className="dot" /> Always up to date
            </div>
            <h1 className="h1" style={{ margin: "14px 0 14px" }}>
              Website Maintenance for Small Businesses
            </h1>
            <p className="subhead" style={{ margin: "0 0 18px" }}>
              You shouldn&apos;t have to learn a page builder to change a phone number. MixedMakerShop keeps your website
              current, secure, and fast — you just send the change and it gets done.
            </p>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              Month-to-month, no long contracts. Text Topher; it gets done. Most edits same-day or next-day.
            </p>
            <div className="btn-row">
              <Link className="btn gold btn-cta-primary" href="/contact">
                Start Maintenance
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
              Maintenance is the unsexy work that keeps websites earning their keep over years, not weeks. It&apos;s for
              owners who don&apos;t want their site to be a hobby.
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
              A clear, plain-English scope for monthly care. No ticket systems, no portals, no upsells.
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
              Looking for the website that maintenance keeps current? See{" "}
              <Link href="/web-design-hot-springs-ar">Hot Springs web design</Link>. Want to combine maintenance with{" "}
              <Link href="/local-seo-services">local SEO</Link>? Discounted bundle available —{" "}
              <Link href="/pricing">see pricing</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="section" aria-labelledby="why-heading">
        <div className="container">
          <div className="panel">
            <h2 id="why-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Maintenance is what makes a website earn its keep
            </h2>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              A new website is exciting. The build feels productive, the launch feels like an accomplishment, and then it
              sits there. Within a year, the hours are slightly wrong, the photos are slightly old, plugins are out of
              date, and Google is starting to notice.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              Within two years it&apos;s embarrassing to send people to. By year three it&apos;s actively losing you
              customers and you&apos;re shopping for a redesign you didn&apos;t need to buy.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              Maintenance is what prevents that cycle. A small monthly investment in keeping the site current is
              dramatically cheaper than rebuilding every three years. And the side effect — knowing someone is actually
              watching the site — catches small problems before they become real ones.
            </p>
            <p className="small" style={{ margin: "0 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              If you&apos;re a Hot Springs area business and your site hasn&apos;t been touched in over a year, it&apos;s
              costing you more than maintenance would.
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
              Stop fighting with your website.
            </h2>
            <p className="subhead" style={{ margin: "0 auto 22px", maxWidth: "60ch" }}>
              Send what needs done first and we&apos;ll get you on monthly maintenance — usually within a week. First
              month includes a full site audit.
            </p>
            <div className="btn-row" style={{ justifyContent: "center" }}>
              <Link className="btn gold btn-cta-primary" href="/contact">
                Start Maintenance
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
