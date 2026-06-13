import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/how-much-does-a-website-cost`;
const DATE_PUBLISHED = "2026-06-12";
const DATE_MODIFIED = "2026-06-12";

export const metadata: Metadata = {
  title: "How Much Does a Small Business Website Cost? (2026 Answer) | MixedMakerShop",
  description:
    "What small business websites really cost in 2026, what drives the price, and the hidden ongoing costs nobody talks about. Real ranges from DIY to agency, with honest context.",
  alternates: { canonical },
  openGraph: {
    title: "How Much Does a Small Business Website Cost? Real Numbers, 2026",
    description:
      "DIY $40/mo · Freelancer $800-$3,000 · Small agency $3,000-$10,000+ · Large agency $10,000-$50,000+. Plus what really drives the price.",
    url: canonical,
    type: "article",
  },
};

const tiers = [
  {
    badge: "Tier 1 · DIY",
    title: "$0 – $40 / month",
    copy: "Wix, Squarespace, Shopify's starter plans, GoDaddy Website Builder. You build it. You maintain it. It looks like it.",
  },
  {
    badge: "Tier 2 · Freelancer",
    title: "$800 – $3,000",
    copy: "Independent designer or developer working solo. Quality varies wildly. Communication varies wildly. Worth shopping carefully.",
  },
  {
    badge: "Tier 3 · Small studio",
    title: "$3,000 – $10,000+",
    copy: "Small agency or boutique studio. Real process, real designers, real ongoing support. Most small businesses outgrow Tier 2 and end up here.",
  },
  {
    badge: "Tier 4 · Large agency",
    title: "$10,000 – $50,000+",
    copy: "Full-service agency with account managers and PM layers. Worth it for complex businesses with budget. Massive overkill for a small business website.",
  },
] as const;

const drivers = [
  {
    badge: "01 · Page count",
    title: "Number of pages",
    copy: "A one-page site is the simplest thing in web design. A 25-page site is 25× the design, copy, and tuning work. Page count is the single biggest cost driver.",
  },
  {
    badge: "02 · Custom design",
    title: "Custom vs template",
    copy: "Template starts cheap, custom starts expensive. The middle ground — a thoughtful custom layout based on proven structures — is where most small businesses actually want to live.",
  },
  {
    badge: "03 · Integrations",
    title: "Third-party connections",
    copy: "Online ordering, reservation systems, scheduling tools, payment processors, CRMs, email marketing — each one is a separate setup and ongoing maintenance task.",
  },
  {
    badge: "04 · Content",
    title: "Who writes the copy",
    copy: "You writing it = cheaper and usually better. Us writing it (or hiring it out) = more expensive but consistent quality. Hybrid (you write, we polish) is the sweet spot.",
  },
  {
    badge: "05 · SEO scope",
    title: "SEO depth",
    copy: "Basic SEO (titles, descriptions, schema, sitemap) is included in any decent build. Ongoing local SEO work — content, ranking tuning, citation building — is a separate monthly service.",
    link: { href: "/local-seo-services", label: "local SEO services", prefix: "See " },
  },
  {
    badge: "06 · Ongoing care",
    title: "Maintenance & hosting",
    copy: "A site without maintenance ages quickly and gets hacked. $89/month for managed hosting, backups, security, and minor updates is the real cost.",
    link: { href: "/pricing", label: "the pricing page", prefix: "See " },
  },
] as const;

const faqs = [
  {
    q: "How long does it take to build a small business website?",
    a: "Most small business projects are live within 5–10 business days once we have your copy and photos. Starter setups (single-page) can ship in under a week. Larger custom builds with online ordering or specialized features take 2–3 weeks. Anyone telling you 60–90 days is padding the timeline to justify the price.",
  },
  {
    q: "Do I need hosting?",
    a: "Yes. Hosting is what keeps a website online. You can host on a shared $5–10/month service if you don't mind managing it yourself, or pay for managed hosting that includes backups, monitoring, and support. MixedMakerShop's $89/month hosting & support plan covers backups, updates, monitoring, and minor content edits.",
  },
  {
    q: "What do you actually need from me to start?",
    a: "Less than you'd think. Your business name, a short description of what you do, photos if you have them (a phone is fine), and a couple of websites you like for reference. We figure out the rest from there. Writing copy and finding images we can help with, or quote separately.",
  },
  {
    q: "Can I update my website later without calling someone?",
    a: "Yes. We set up a simple admin so you can edit text, swap photos, change hours, and add pages. If you'd rather just text us and have it done, monthly maintenance plans handle that for $89/month.",
  },
  {
    q: "Do you build online stores?",
    a: "Yes, but they're priced separately because they take more work. A simple Shopify or Square store setup starts around $1,200. Custom e-commerce with payment integration, inventory, and shipping logic is quoted by project. If selling online is the main goal, tell us up front so we scope it correctly.",
  },
  {
    q: "Are there hidden ongoing costs?",
    a: "Three real ones nobody mentions in the quote: (1) Domain renewal — about $12–$20/year. (2) Premium third-party tools — paid reservation systems, advanced online ordering, paid email marketing. We pass these through at cost with no markup. (3) Hosting — required for any site to stay online. Everything else is included in the price you see.",
  },
  {
    q: "Why are agency websites so expensive?",
    a: "Three reasons. First, overhead — agencies pay account managers, project managers, designers, and developers separately. Second, process — agencies bill for discovery, strategy decks, stakeholder reviews, and revision rounds. Third, scope creep — agency contracts often include vague features that turn into change orders. For most small businesses, the agency overhead is paying for value you can't use.",
  },
] as const;

const relatedServices = [
  {
    href: "/pricing",
    badge: "Pricing",
    title: "Full Pricing Page",
    copy: "All MixedMakerShop tiers — Starter, Growth, Hosting & Support, and more. Real numbers.",
  },
  {
    href: "/web-design",
    badge: "Web design",
    title: "Web Design",
    copy: "What we build, who we build it for, and what every site comes with at baseline.",
  },
  {
    href: "/web-design-hot-springs-ar",
    badge: "Local",
    title: "Hot Springs Web Design",
    copy: "Local-tuned web design specifically for Hot Springs, Benton, Malvern, and nearby Arkansas communities.",
  },
  {
    href: "/local-seo-services",
    badge: "SEO",
    title: "Local SEO Services",
    copy: 'Get found in "near me" searches. On-page tuning, schema, and ongoing visibility work.',
  },
  {
    href: "/contact",
    badge: "Free quote",
    title: "Contact Topher",
    copy: "Send a few details and get a real written quote — usually within 24 hours.",
  },
] as const;

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
  headline: "How Much Does a Small Business Website Cost? A Real Answer (2026)",
  description:
    "What small business websites actually cost in 2026, what drives the price, and the hidden ongoing costs nobody talks about. With real numbers and honest ranges.",
  image: `${SITE_URL}/assets/m3-brand.png`,
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  author: { "@type": "Person", name: "Topher Cook", url: `${SITE_URL}/about` },
  publisher: {
    "@type": "Organization",
    name: "MixedMakerShop",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/m3-brand.png` },
  },
  about: [
    { "@type": "Thing", name: "Small Business Website Cost" },
    { "@type": "Thing", name: "Web Design Pricing" },
    { "@type": "Service", name: "Web Design", url: `${SITE_URL}/web-design` },
  ],
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

export default function HowMuchDoesAWebsiteCostPage() {
  return (
    <>
      <JsonLd data={[articleSchema, faqSchema]} />

      {/* HERO */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="kicker">
              <span className="dot" /> 2026 buyer&apos;s guide
            </div>
            <h1 className="h1" style={{ margin: "14px 0 14px" }}>
              How Much Does a Small Business Website Cost?
            </h1>
            <p className="subhead" style={{ margin: "0 0 18px" }}>
              The honest 2026 answer is: somewhere between $0 and $50,000. That range is so wide it&apos;s almost
              useless, so this guide breaks it down into the four real price tiers, what actually drives the cost, and
              the hidden ongoing costs nobody mentions in the quote.
            </p>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              Written by Topher Cook at MixedMakerShop in Hot Springs, AR. We build small business websites for between
              $400 and $1,800. We&apos;re honest about where we sit in this range and why.
            </p>
            <div className="btn-row">
              <Link className="btn gold btn-cta-primary" href="/contact">
                Get a Free Quote
              </Link>
              <Link className="btn ghost" href="/pricing">
                See our pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ANSWER */}
      <section className="section" aria-labelledby="quick-heading">
        <div className="container">
          <div className="panel">
            <h2 id="quick-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              The quick answer
            </h2>
            <p className="small" style={{ margin: "0 0 16px", color: "var(--muted)", lineHeight: 1.6 }}>
              Four real price tiers cover almost every small business website in 2026:
            </p>
            <div className="how-it-works-grid">
              {tiers.map((t) => (
                <div className="how-it-works-card" key={t.badge}>
                  <span className="how-it-works-badge">{t.badge}</span>
                  <h3 className="how-it-works-title">{t.title}</h3>
                  <p className="how-it-works-copy">{t.copy}</p>
                </div>
              ))}
            </div>
            <p className="small" style={{ margin: "18px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              <strong>MixedMakerShop sits at the bottom of Tier 3 — between $400 and $1,800.</strong> Starter setups
              (single-page) at $400, full business sites (3–5 pages) at $900, and custom builds quoted per project.{" "}
              <Link href="/pricing">See full pricing</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT DRIVES COST */}
      <section className="section" aria-labelledby="drivers-heading">
        <div className="container">
          <div className="panel">
            <h2 id="drivers-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              What actually drives the cost
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              Six factors decide where your project lands in the range above. None of them are mysterious.
            </p>
            <div className="how-it-works-grid">
              {drivers.map((d) => (
                <div className="how-it-works-card" key={d.badge}>
                  <span className="how-it-works-badge">{d.badge}</span>
                  <h3 className="how-it-works-title">{d.title}</h3>
                  <p className="how-it-works-copy">
                    {d.copy}
                    {"link" in d && d.link ? (
                      <>
                        {" "}
                        {d.link.prefix}
                        <Link href={d.link.href}>{d.link.label}</Link>.
                      </>
                    ) : null}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HIDDEN COSTS */}
      <section className="section" aria-labelledby="hidden-heading">
        <div className="container">
          <div className="panel">
            <h2 id="hidden-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              The hidden costs nobody talks about
            </h2>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              Three ongoing costs that aren&apos;t in the original quote but you&apos;ll pay regardless:
            </p>
            <ul className="small" style={{ margin: "0 0 16px 18px", color: "var(--muted)", lineHeight: 1.8 }}>
              <li>
                <strong>Domain renewal</strong> — $12–$20 per year forever. Mandatory. Don&apos;t let it expire.
              </li>
              <li>
                <strong>Hosting</strong> — minimum $5–10/month for the cheapest shared plan, $89/month for managed
                hosting that includes the work to keep it secure and current.
              </li>
              <li>
                <strong>Premium third-party tools</strong> — paid online ordering systems ($50–200/month), reservation
                platforms ($100–300/month), email marketing platforms ($15–50/month). Optional but common.
              </li>
            </ul>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              At MixedMakerShop, we pass third-party costs through at cost — no markup. The domain stays in your name. The
              hosting is yours if you cancel. No vendor lock-in tricks.
            </p>
            <p className="small" style={{ margin: "0 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              The fourth hidden cost — and the most expensive — is rebuilding the site every 3 years because nobody
              maintained it. That&apos;s the cost the monthly maintenance plan prevents.
            </p>
          </div>
        </div>
      </section>

      {/* HOW MIXEDMAKERSHOP PRICES */}
      <section className="section" aria-labelledby="mms-heading">
        <div className="container">
          <div className="panel">
            <h2 id="mms-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              How MixedMakerShop prices
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              We sit at the bottom of Tier 3 — between $400 and $1,800 for the build, plus $89/month for ongoing care.
              Three reasons we can stay this low:
            </p>
            <ul className="small" style={{ margin: "0 0 16px 18px", color: "var(--muted)", lineHeight: 1.8 }}>
              <li>
                <strong>Two-person studio.</strong> No account manager layer. No PM layer. No designer-to-developer
                handoff with a billable strategy meeting in between.
              </li>
              <li>
                <strong>Focused scope.</strong> We don&apos;t bid on $50,000 enterprise projects. We build small business
                websites. That focus lets us ship faster and price lower than agencies trying to do everything.
              </li>
              <li>
                <strong>Hot Springs based.</strong> We don&apos;t carry San Francisco salaries or New York office rent.
              </li>
            </ul>
            <p className="small" style={{ margin: "0 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              The math works because most small business websites should cost between $500 and $2,000, not between $5,000
              and $20,000. The work is real, but it&apos;s not 10× the work an agency claims.{" "}
              <Link href="/pricing">See our pricing</Link> for the full breakdown.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" aria-labelledby="cta-heading">
        <div className="container">
          <div className="panel" style={{ textAlign: "center" }}>
            <div className="kicker" style={{ margin: "0 auto" }}>
              <span className="dot" /> Get a real quote
            </div>
            <h2 id="cta-heading" className="section-heading" style={{ margin: "14px 0 12px" }}>
              Want a real number for your project?
            </h2>
            <p className="subhead" style={{ margin: "0 auto 22px", maxWidth: "60ch" }}>
              Send a few details about your business and we&apos;ll reply with a written quote — usually within 24 hours.
              No sales call required.
            </p>
            <div className="btn-row" style={{ justifyContent: "center" }}>
              <Link className="btn gold btn-cta-primary" href="/contact">
                Get a Free Quote
              </Link>
              <Link className="btn ghost" href="/pricing">
                See pricing tiers
              </Link>
            </div>
            <p className="small" style={{ marginTop: 14, color: "var(--muted)" }}>
              Direct communication with Topher Cook · Hot Springs, AR · Fast turnaround
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
              Different question? <Link href="/contact">Ask Topher directly</Link> — typical reply within a few hours
              during the workday.
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
              Where to go next once you have a budget in mind.
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
