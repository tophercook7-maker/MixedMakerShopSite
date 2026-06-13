import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/local-seo-services`;

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
  title: "Local SEO Services Hot Springs AR | MixedMakerShop",
  description:
    "Local SEO services for Hot Springs, Arkansas small businesses — Google Maps visibility, on-page optimization, schema, and ongoing work that actually moves rankings.",
  alternates: { canonical },
  openGraph: {
    title: "Local SEO Services for Hot Springs Small Businesses",
    description:
      'Founder-led local SEO in Hot Springs, AR. Get found in Google Maps and "near me" searches. No contracts.',
    url: canonical,
    type: "website",
  },
};

const whoFor = [
  {
    badge: "01 · Service",
    title: "Service-area businesses",
    copy: "Lawn care, HVAC, plumbing, contractors, cleaning, mobile mechanics — anywhere you drive to the customer, not the other way around.",
  },
  {
    badge: "02 · Storefront",
    title: "Local storefronts",
    copy: 'Shops, restaurants, cafés, salons, studios — anywhere walk-in traffic matters and "directions to ___" is a real query.',
  },
  {
    badge: "03 · Solo",
    title: "Solo operators",
    copy: "Coaches, photographers, instructors, consultants — anyone whose calendar fills up via local word-of-mouth and search.",
  },
  {
    badge: "04 · New",
    title: "Newly opened businesses",
    copy: "You're open but Google doesn't know you exist yet. Get on the map before competitors with deeper pockets bury you.",
  },
  {
    badge: "05 · Stuck",
    title: "Businesses outranked by chains",
    copy: "Local independent shop getting buried by a national franchise on every search. SEO is how you fight back.",
  },
  {
    badge: "06 · Multi-location",
    title: "Multi-location operators",
    copy: "Two or three locations, each needing their own page and profile, all consistent with the brand.",
  },
] as const;

const included = [
  {
    badge: "01 · Pages",
    title: "On-page optimization",
    copy: "Page titles, meta descriptions, headings, internal links, image alt text, and URL structure — every page tuned for the local searches that matter.",
  },
  {
    badge: "02 · Schema",
    title: "Local schema markup",
    copy: "LocalBusiness, Service, FAQ, Review, and Breadcrumb JSON-LD so Google understands exactly what you offer and who you serve.",
  },
  {
    badge: "03 · Speed",
    title: "Page speed basics",
    copy: "Image compression, lazy-loading, font cleanup, render-blocking script audit. Faster pages rank better, full stop.",
  },
  {
    badge: "04 · Maps",
    title: "Google Business Profile tuning",
    copy: "Profile, categories, services, photos, posts, Q&A. Often the single highest-leverage local lever.",
  },
  {
    badge: "05 · Content",
    title: "Service + location pages",
    copy: "A page per service and per nearby town. Hot Springs, Hot Springs Village, Lake Hamilton, Benton, Malvern — each gets its own real content, not a copy-paste template.",
  },
  {
    badge: "06 · Reports",
    title: "Monthly plain-English updates",
    copy: "Short monthly note: what changed, what ranked, what we're trying next. No 20-page PDFs nobody reads.",
  },
] as const;

const faqs = [
  {
    q: "How long does local SEO take to show results?",
    a: 'Profile and on-page changes usually show up in Google within a few days to a couple of weeks. Real ranking lifts — getting into the three-pack for "Hot Springs ___" searches — typically take 6–12 weeks of consistent work. Anyone promising overnight results is selling smoke.',
  },
  {
    q: "Do I need a new website for local SEO to work?",
    a: "Not always. If your site is reasonably structured and loads quickly, we can tune what's there. If it's built on a slow page builder, has crawl issues, or hasn't been touched in years, a redesign usually pays for itself faster than ongoing SEO does.",
  },
  {
    q: "Do you do SEO contracts?",
    a: "No long-term contracts. Month-to-month, cancel any time. If we're not earning the work each month, that's on us to fix or part ways.",
  },
  {
    q: "Will you guarantee I'll rank #1?",
    a: "No, and you should run from anyone who does. We can guarantee the foundational work gets done correctly and that we'll be straight about progress. Where you actually rank depends on competition you don't control.",
  },
  {
    q: "Do I have to pay Google?",
    a: "For ranking? No. Google's organic results and the map pack are free. We're tuning those, not running ads. (If you want to also run Google Ads, that's separate.)",
  },
] as const;

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Local SEO",
  name: "Local SEO Services Hot Springs AR | MixedMakerShop",
  description:
    "Local SEO services for Hot Springs, Arkansas small businesses — Google Maps visibility, on-page optimization, schema, and ongoing work that actually moves rankings.",
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

export default function LocalSeoServicesPage() {
  return (
    <>
      <JsonLd data={[serviceSchema, faqSchema]} />

      {/* HERO */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="kicker">
              <span className="dot" /> Local visibility
            </div>
            <h1 className="h1" style={{ margin: "14px 0 14px" }}>
              Local SEO Services for Small Businesses
            </h1>
            <p className="subhead" style={{ margin: "0 0 18px" }}>
              Get found by the people right around you. MixedMakerShop tunes your website, Google listing, and on-page
              signals so &quot;near me&quot; and &quot;Hot Springs&quot; searches actually land on your business — not
              your competitor down the street.
            </p>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              Founder-led work, month-to-month, no SEO contracts you can&apos;t cancel. You see what changed, why it
              changed, and what&apos;s ranking — in plain English.
            </p>
            <div className="btn-row">
              <Link className="btn gold btn-cta-primary" href="/contact">
                Get a Free Local SEO Look
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
              Local SEO is highest-leverage for businesses whose customers live within driving distance. If most of your
              leads come from &quot;near me&quot; searches, Google Maps, or a &quot;Hot Springs ___&quot; query, this is
              built for you.
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
              A clear, plain-English scope. No &quot;SEO magic,&quot; no vague monthly retainers — just the foundational
              work that moves local rankings.
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
              Looking to pair this with a real foundation? See{" "}
              <Link href="/web-design-hot-springs-ar">Hot Springs web design</Link>. The map work is detailed on the{" "}
              <Link href="/google-business-profile-help">Google Business Profile help</Link> page. Need to know what it
              costs? <Link href="/pricing">See the pricing page</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="section" aria-labelledby="why-heading">
        <div className="container">
          <div className="panel">
            <h2 id="why-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Why local SEO matters for small businesses
            </h2>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              When someone in Hot Springs searches &quot;lawn care near me&quot; or &quot;plumber open now,&quot; their
              phone shows them a map with three businesses on it. Those three get the calls. Everyone else might as well
              not exist for that search.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              Getting into that three-pack — and staying there as competitors move in — is what local SEO actually does.
              It&apos;s not a one-shot project. It&apos;s ongoing tuning of the same three things: your website, your
              Google profile, and the signals connecting them.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              Most local businesses we work with were never told this is what should be happening. Their site was built,
              paid for, and then forgotten. Meanwhile, the competitor who hired someone to do this monthly is taking the
              calls.
            </p>
            <p className="small" style={{ margin: "0 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              If you&apos;re in Hot Springs, AR — or anywhere within driving distance — this is the difference between a
              website that exists and a website that earns its keep.
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
              Want to know where you stand right now?
            </h2>
            <p className="subhead" style={{ margin: "0 auto 22px", maxWidth: "60ch" }}>
              Send your business name. Topher will run a quick visibility audit — what&apos;s ranking, what&apos;s
              missing, what&apos;s easy to fix. No sales pressure, no obligation.
            </p>
            <div className="btn-row" style={{ justifyContent: "center" }}>
              <Link className="btn gold btn-cta-primary" href="/contact">
                Get a Free Local SEO Look
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
    </>
  );
}
