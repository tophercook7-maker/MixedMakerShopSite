import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/church-websites-hot-springs`;

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
  title: "Church Website Design in Hot Springs, AR | MixedMakerShop",
  description:
    "Church web design for Hot Springs, Arkansas — service times, sermons, events, first-time visitor info. Built for mobile-first, ministry-first.",
  alternates: { canonical },
  openGraph: {
    title: "Church Website Design — Hot Springs, Arkansas",
    description:
      'Modern church websites focused on the first-time visitor. Service times, sermons, events, giving, and a clear "what to expect" page.',
    url: canonical,
    type: "website",
  },
};

const whoFor = [
  {
    badge: "01 · Established",
    title: "Established Hot Springs congregations",
    copy: "Long-standing church with a strong base but a website that hasn't been updated in years. Modernize without losing the voice.",
  },
  {
    badge: "02 · Plant",
    title: "New church plants",
    copy: 'Just starting. Need a real digital front door, a clear "what we believe," and an easy way for visitors to plan a first Sunday.',
  },
  {
    badge: "03 · Family",
    title: "Family-focused churches",
    copy: "Family services, kids ministries, student programs — clear paths for parents trying to figure out where their kids go.",
  },
  {
    badge: "04 · Multi-campus",
    title: "Multi-campus / multi-site",
    copy: "Multiple Hot Springs area locations needing their own pages but a consistent brand.",
  },
  {
    badge: "05 · Small",
    title: "Small congregations",
    copy: "100 members, no website committee, no design team. We make it simple to launch and easy to keep current.",
  },
  {
    badge: "06 · Outreach",
    title: "Outreach-focused churches",
    copy: "Community ministry, food banks, recovery programs — your site should make it easy for the people who need help to find you.",
  },
] as const;

const included = [
  {
    badge: "01 · Times",
    title: "Service times, big and obvious",
    copy: "Sunday service times on the homepage. Special services. Holiday schedules. Big enough to read on a phone in the church parking lot.",
  },
  {
    badge: "02 · Visitor",
    title: '"What to expect" page',
    copy: "First-time visitor info — parking, what to wear, where to drop off kids, what the service is like. Lowers the anxiety bar.",
  },
  {
    badge: "03 · Sermons",
    title: "Sermon archive",
    copy: "Embeddable from YouTube, Vimeo, or your podcast feed. Searchable. Date-organized. Working on mobile.",
  },
  {
    badge: "04 · Events",
    title: "Events calendar",
    copy: "Recurring services, special events, community programs. Easy for staff or volunteers to update without calling a developer.",
  },
  {
    badge: "05 · Giving",
    title: "Online giving integration",
    copy: "Connect to Tithe.ly, Pushpay, Subsplash, Planning Center Giving, Stripe — whatever you use. One click from any page.",
  },
  {
    badge: "06 · Contact",
    title: "Prayer requests & contact",
    copy: "Prayer request form that goes to the pastor. Contact form that doesn't send to a black hole. Real email reply addresses.",
  },
] as const;

const faqs = [
  {
    q: "Do you build for any denomination?",
    a: "Yes. We've worked with non-denominational, Southern Baptist, Methodist, Catholic, and several independent congregations. The denominational specifics shape the content; the technical work is consistent.",
  },
  {
    q: "Can our volunteers update the site?",
    a: "Yes. We set up a simple admin so a volunteer can change service times, add a sermon, post an event, and update the calendar. No coding required.",
  },
  {
    q: "Do you integrate with our church management system (ChMS)?",
    a: "Most ChMS platforms — Planning Center, Subsplash, Tithe.ly Giving, Church Community Builder — have embed widgets we can drop in. Calendars, giving, sermons all live in their own platform but display on the site.",
  },
  {
    q: "How much does a church website cost?",
    a: "Starter setups begin around $400. Full church sites with sermon archive, giving integration, and events typically start at $900. Many churches qualify for nonprofit discounts — ask about that.",
  },
  {
    q: "How long does it take to launch?",
    a: "Most church projects are live within 1–2 weeks once we have your service times, photos, and any sermon links. We launch first, iterate after — getting the new site up serves the ministry more than waiting on perfection.",
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
  serviceType: "Church Website Design",
  name: "Church Website Design in Hot Springs, AR | MixedMakerShop",
  description:
    "Church web design for Hot Springs, Arkansas — service times, sermons, events, first-time visitor info. Built for mobile-first, ministry-first.",
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

export default function ChurchWebsitesPage() {
  return (
    <>
      <JsonLd data={[serviceSchema, faqSchema]} />

      {/* HERO */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="kicker">
              <span className="dot" /> Churches in Hot Springs
            </div>
            <h1 className="h1" style={{ margin: "14px 0 14px" }}>
              Church Website Design in Hot Springs, Arkansas
            </h1>
            <p className="subhead" style={{ margin: "0 0 18px" }}>
              When someone in Hot Springs Googles your church before visiting, they&apos;re looking for three things:
              what time is service, what should I wear, and is this a place where I&apos;ll feel welcome. We build church
              sites that answer those three questions in the first 10 seconds.
            </p>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              Hot Springs, AR. Built by Topher Cook with respect for the ministry behind the site. Starter setups from
              $400.
            </p>
            <div className="btn-row">
              <Link className="btn gold btn-cta-primary" href={publicFreeMockupFunnelHref}>
                Get a Free Mockup
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
              Most church websites are built for the existing congregation — bulletins, newsletters, member portals. The
              opportunity is the first-time visitor — the person Googling at 9:43 on Sunday morning. We design for that
              visitor.
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
              What a church website needs
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              Built around the first-time visitor — and the volunteer who has to keep it current after we hand it over.
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
              Want to combine this with help setting up your church&apos;s{" "}
              <Link href="/google-business-profile-help">Google Business Profile</Link>? Many local searches for
              &quot;churches near me&quot; pull from the profile, not the website.{" "}
              <Link href="/contact">Ask us about both.</Link>
            </p>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="section" aria-labelledby="why-heading">
        <div className="container">
          <div className="panel">
            <h2 id="why-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Why church websites matter more than they used to
            </h2>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              For decades, the church directory was a printed booklet on a kitchen counter. People found churches by
              family invitation, by neighborhood, by denomination signage on the highway. That&apos;s not how anyone
              finds a church in 2026.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              Today, the modal first-time visitor Googles &quot;churches near me,&quot; scrolls through 4–5 options,
              looks at each website for under a minute, and decides which one they&apos;ll show up at on Sunday. If your
              website looks like it was built in 2014, has wrong service times, or doesn&apos;t answer &quot;what should
              I wear&quot; — you lose visitors you never knew were looking.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              For Hot Springs area churches, the opportunity is significant. Hot Springs has tourist traffic year-round
              and a growing retiree population, both of which include people actively looking for a new church home. A
              well-built site captures that.
            </p>
            <p className="small" style={{ margin: "0 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              The technical work isn&apos;t the hard part. The hard part is treating the website like ministry — not like
              a brochure.
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
              Let&apos;s build a website that helps the visitor say yes.
            </h2>
            <p className="subhead" style={{ margin: "0 auto 22px", maxWidth: "60ch" }}>
              Send a couple of details about your church and the next person looking for a church home in Hot Springs
              gets a better experience landing on your site.
            </p>
            <div className="btn-row" style={{ justifyContent: "center" }}>
              <Link className="btn gold btn-cta-primary" href={publicFreeMockupFunnelHref}>
                Get a Free Mockup
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
