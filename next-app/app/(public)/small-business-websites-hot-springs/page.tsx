import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/small-business-websites-hot-springs`;

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
  title: "Small Business Websites in Hot Springs, AR | MixedMakerShop",
  description:
    "Small business website design for Hot Springs, Arkansas — affordable, mobile-friendly sites for local owners, side hustlers, and service providers.",
  alternates: { canonical },
  openGraph: {
    title: "Small Business Websites — Hot Springs, Arkansas",
    description:
      "Affordable, mobile-first websites for Hot Springs small businesses. Local SEO baseline, Google Maps, fast loads, starter setups from $400.",
    url: canonical,
    type: "website",
  },
};

const whoFor = [
  {
    badge: "01 · Service",
    title: "Local service providers",
    copy: "Lawn care, HVAC, plumbing, cleaning, handyman, mobile mechanic, dog walker — anyone driving to customers across Hot Springs.",
  },
  {
    badge: "02 · Shops",
    title: "Hot Springs storefronts",
    copy: 'Boutiques, gift shops, salons, gyms, studios — anywhere walk-in traffic and "open today?" matters.',
  },
  {
    badge: "03 · Solo",
    title: "Solo operators",
    copy: "One person, one calendar. Coaches, photographers, contractors, consultants. Your site is your office.",
  },
  {
    badge: "04 · New",
    title: "New Hot Springs businesses",
    copy: "Just opened. Need a real domain, real email, and a real website before competitors crowd you out of search.",
  },
  {
    badge: "05 · Side",
    title: "Side hustles going pro",
    copy: "Etsy or Facebook hobby is now real money. Time to graduate to a website customers can take seriously.",
  },
  {
    badge: "06 · Replace",
    title: "Outgrowing the old website",
    copy: "Built years ago by a developer who disappeared. Or stuck on a slow page builder. Time for something current and fully yours.",
  },
] as const;

const included = [
  {
    badge: "01 · Mobile",
    title: "Mobile-first design",
    copy: "Built for the customer on the phone before it scales up to desktop. Most Hot Springs searches happen on mobile.",
  },
  {
    badge: "02 · Local",
    title: "Local SEO baseline",
    copy: "Hot Springs, Hot Springs Village, Lake Hamilton, Benton, Malvern — schema, keywords, and page structure tuned for local search.",
  },
  {
    badge: "03 · Maps",
    title: "Google Maps + directions",
    copy: "Embedded map, address, business hours, and the click-to-call number front and center.",
  },
  {
    badge: "04 · Speed",
    title: "Fast page loads",
    copy: "No bloated builders, no heavyweight themes. Pages open before customers lose patience and tap back.",
  },
  {
    badge: "05 · Contact",
    title: "Multiple contact methods",
    copy: "Click-to-call, click-to-text, contact form, email, social — the channels real Hot Springs customers actually use.",
  },
  {
    badge: "06 · Help",
    title: "Updates handled by us",
    copy: "Need a phone number changed or holiday hours updated? Text Topher. Monthly hosting & support plans keep it current.",
  },
] as const;

const faqs = [
  {
    q: "How much does a Hot Springs small business website cost?",
    a: "Starter setups begin around $400. Full small-business websites typically start at $900. Final price depends on number of pages, photos, and features. See the pricing page for the breakdown.",
  },
  {
    q: "Do you only work with Hot Springs businesses?",
    a: "No. Hot Springs is where the studio is based and most local work happens. But we work with clients across Arkansas and nationwide. The local tuning we describe just applies to the Hot Springs-specific pages.",
  },
  {
    q: "Can you also help with Google Maps / Google Business Profile?",
    a: "Yes. For most Hot Springs small businesses, the profile drives more traffic than the website. We do both as a bundle if it makes sense for you.",
  },
  {
    q: "Do you build sites for non-Hot Springs Arkansas towns?",
    a: "Yes. Hot Springs Village, Lake Hamilton, Lonsdale, Benton, Malvern, and the surrounding region. Most pages we ship include specific mentions of these towns where relevant.",
  },
  {
    q: "How long does it take to launch?",
    a: "Most small business projects are live within 5–10 business days once we have your copy and photos. Larger projects with custom features take 2–3 weeks.",
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
    badge: "Ongoing",
    title: "Hosting & Maintenance",
    copy: "Monthly edits, updates, backups, and fixes for $89/mo — text Topher and it gets done.",
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
  name: "Small Business Websites in Hot Springs, AR | MixedMakerShop",
  description:
    "Small business website design for Hot Springs, Arkansas — affordable, mobile-friendly sites for local owners, side hustlers, and service providers.",
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

export default function SmallBusinessWebsitesPage() {
  return (
    <>
      <JsonLd data={[serviceSchema, faqSchema]} />

      {/* HERO */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="kicker">
              <span className="dot" /> Hot Springs small business
            </div>
            <h1 className="h1" style={{ margin: "14px 0 14px" }}>
              Small Business Websites in Hot Springs, Arkansas
            </h1>
            <p className="subhead" style={{ margin: "0 0 18px" }}>
              Hot Springs is full of one-person shops, family operations, and side hustles that grew up. Every one of
              them deserves a real website — not a Facebook page, not a Linktree, not a &quot;site coming soon&quot;
              placeholder. This is what we do.
            </p>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              Hot Springs, AR — based locally, working hands-on. Starter setups from $400. Direct communication with
              Topher Cook from the first call.
            </p>
            <div className="btn-row">
              <Link className="btn gold btn-cta-primary" href={publicFreeMockupFunnelHref}>
                Get My Free Hot Springs Mockup
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
              If your business serves customers in Hot Springs, Hot Springs Village, Lake Hamilton, Benton, Malvern, or
              anywhere in the surrounding area — and you&apos;re tired of competing with chains that have full marketing
              teams — this is the answer.
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
              What you get with a Hot Springs small business website
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              Every site we build for Hot Springs starts with the same foundation. Local-first, mobile-first, fast.
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
              For broader (not Hot Springs-specific) web design see <Link href="/web-design">web design</Link>. For the
              wider local angle see <Link href="/web-design-hot-springs-ar">Hot Springs web design</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="section" aria-labelledby="why-heading">
        <div className="container">
          <div className="panel">
            <h2 id="why-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Why local-only matters
            </h2>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              If you sell to customers in Hot Springs, your competition isn&apos;t national agencies — it&apos;s the
              other Hot Springs business down the street. That changes everything about how the website should be built.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              A national web designer builds for a national audience. They don&apos;t know that &quot;Park Avenue&quot;
              in Hot Springs is different from &quot;Park Avenue&quot; in New York. They don&apos;t know which
              neighborhoods you serve, what the locals call landmarks, or what time the high school football game runs.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              Local web design is meaningfully different. We mention Bathhouse Row, Lake Hamilton, Hot Springs Village,
              Mid-America Science Museum — because that&apos;s the geography customers actually live in. We tune Google
              Business Profile categories for Hot Springs-specific searches. We know that &quot;near me&quot; in Hot
              Springs means a different radius than &quot;near me&quot; in Little Rock.
            </p>
            <p className="small" style={{ margin: "0 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              The work isn&apos;t harder. It&apos;s just specific. Done right, it ranks for the searches that actually
              matter to you.
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
              See your Hot Springs business online.
            </h2>
            <p className="subhead" style={{ margin: "0 auto 22px", maxWidth: "60ch" }}>
              Send what your business does and Topher will mock up a homepage designed specifically for your customers in
              Hot Springs, AR. Free. No obligation.
            </p>
            <div className="btn-row" style={{ justifyContent: "center" }}>
              <Link className="btn gold btn-cta-primary" href={publicFreeMockupFunnelHref}>
                Get My Free Hot Springs Mockup
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
