import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/restaurant-websites-hot-springs`;

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
  title: "Restaurant Website Design in Hot Springs, AR | MixedMakerShop",
  description:
    "Restaurant web design for Hot Springs, Arkansas — menus, hours, online ordering, mobile-first sites that turn searches into seated tables.",
  alternates: { canonical },
  openGraph: {
    title: "Restaurant Website Design — Hot Springs, Arkansas",
    description:
      "Mobile-first restaurant websites: live menus, always-right hours, click-to-call, online ordering, and Hot Springs local SEO.",
    url: canonical,
    type: "website",
  },
};

const whoFor = [
  {
    badge: "01 · Sit-down",
    title: "Full-service restaurants",
    copy: "Hot Springs sit-down restaurants with a menu that changes seasonally and customers searching from their car.",
  },
  {
    badge: "02 · Fast-casual",
    title: "Fast-casual & counter service",
    copy: 'Quick decisions matter. Menu, hours, location, "order online" — and nothing in the way.',
  },
  {
    badge: "03 · BBQ",
    title: "BBQ joints & local favorites",
    copy: "Hot Springs has the BBQ. We have the websites that match. Photos that show what you're smoking and hours nobody has to call to confirm.",
  },
  {
    badge: "04 · Breakfast",
    title: "Breakfast & brunch spots",
    copy: 'Saturday morning is your peak. Your site needs to answer "what time do they open" before the first cup of coffee.',
  },
  {
    badge: "05 · Food trucks",
    title: "Food trucks & mobile vendors",
    copy: "Schedule, current location, today's menu, and a way to message bookings — all on one page that loads in seconds.",
  },
  {
    badge: "06 · Bars",
    title: "Bars & taprooms",
    copy: "Hours, food menu (yes you have one), event calendar, happy hour, and what's on tap. Local-first, Hot Springs Village or downtown.",
  },
] as const;

const included = [
  {
    badge: "01 · Menu",
    title: "Live, scannable menu",
    copy: "Searchable on phone. Sections that don't require pinching. Prices visible. Allergens and dietary notes where they belong.",
  },
  {
    badge: "02 · Hours",
    title: "Hours, today and special days",
    copy: "Including kitchen-closes-at vs bar-closes-at. Holiday hours that you can change without calling us. Big and obvious.",
  },
  {
    badge: "03 · Photos",
    title: "Food and room photos",
    copy: "Real photos of real plates. Real shot of the dining room. No stock-photo shrimp from a website builder.",
  },
  {
    badge: "04 · Tap to call",
    title: "Click-to-call + directions",
    copy: "Phone number tapped from the top of the page. Google Maps embedded. Reservation link if you take them.",
  },
  {
    badge: "05 · Ordering",
    title: "Online ordering or POS link",
    copy: "We hook up Toast, Square, DoorDash, ChowNow, or whatever you use. Customer never feels routed.",
  },
  {
    badge: "06 · Local SEO",
    title: "Hot Springs local SEO",
    copy: 'Hours, menu, address, photos, schema markup — wired so Google answers "best [your cuisine] in Hot Springs" with you.',
  },
] as const;

const faqs = [
  {
    q: "How long does it take to launch a restaurant website?",
    a: "Most restaurant projects are live within 5–10 business days once we have your menu, hours, and photos. If you don't have photos, we can either schedule a shoot or use what you have from your Google Business Profile.",
  },
  {
    q: "Do you integrate with my online ordering system?",
    a: "Yes. We've hooked up Toast, Square, ChowNow, Clover, DoorDash, Grubhub, and several others. Tell us what you use and we wire it in.",
  },
  {
    q: "Can I update my menu without calling you?",
    a: "Yes. Most of our restaurant clients are on monthly maintenance and text us menu changes — usually live within 24 hours. If you'd rather edit it yourself we can set you up with a simple admin.",
  },
  {
    q: "Do you work with restaurants outside Hot Springs?",
    a: "Yes. Based in Hot Springs, AR. Most of the work is remote-friendly. Clients across Arkansas and nationwide are all welcome.",
  },
  {
    q: "How much does a restaurant website cost?",
    a: "Starter setups begin around $400 for single-location restaurants. Full sites with online ordering and reservations typically start at $900. See the pricing page for the full breakdown.",
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
    copy: "Monthly edits, menu updates, backups, and fixes for $89/mo — text Topher and it gets done.",
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
  serviceType: "Restaurant Website Design",
  name: "Restaurant Website Design in Hot Springs, AR | MixedMakerShop",
  description:
    "Restaurant web design for Hot Springs, Arkansas — menus, hours, online ordering, mobile-first sites that turn searches into seated tables.",
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

export default function RestaurantWebsitesPage() {
  return (
    <>
      <JsonLd data={[serviceSchema, faqSchema]} />

      {/* HERO */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="kicker">
              <span className="dot" /> Restaurants in Hot Springs
            </div>
            <h1 className="h1" style={{ margin: "14px 0 14px" }}>
              Restaurant Website Design in Hot Springs, Arkansas
            </h1>
            <p className="subhead" style={{ margin: "0 0 18px" }}>
              A restaurant website has one job: get the customer in the door. Menus that load instantly, hours that are
              always right, photos that look like the food, and a phone number that taps to call. We build restaurant
              sites that do exactly that.
            </p>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              Hot Springs, AR. Founder-led, fast turnaround, starter setups from $400. Direct communication with Topher
              Cook from first call through launch.
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
              Restaurant sites have a specific job that&apos;s different from any other small business: get people
              physically through the door tonight. That makes them simpler to design well — but easier to design badly.
              This is for owners who care about the experience before customers ever taste the food.
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
              What every restaurant site needs
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              These are the table stakes. If your current site doesn&apos;t do all of them, you&apos;re losing customers
              to competitors whose sites do.
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
              Want to combine this with a{" "}
              <Link href="/google-business-profile-help">Google Business Profile tune-up</Link>? Smart move — for
              restaurants the profile drives more traffic than the website. <Link href="/pricing">See pricing</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="section" aria-labelledby="why-heading">
        <div className="container">
          <div className="panel">
            <h2 id="why-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Why this is harder than it looks
            </h2>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              Restaurant websites have one of the highest bounce rates of any business type — because people are
              typically deciding right now whether to come in. They check three things: menu, hours, location. If any of
              those takes more than a few seconds to find, they go to the next restaurant on Google&apos;s list.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              Most restaurant sites we audit fail at least two of those three. The menu is a PDF that takes 8 seconds to
              load on cell data. The hours haven&apos;t been updated since 2022. The address is on a contact page two
              clicks deep. Every one of those problems is solvable in a day.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              A real restaurant website also keeps you off the third-party platforms that take 20-30% per order. Owning
              your domain, your menu, and your contact channels is the difference between independence and being a vassal
              of DoorDash forever.
            </p>
            <p className="small" style={{ margin: "0 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              For Hot Springs specifically, &quot;downtown Hot Springs&quot; + &quot;Bathhouse Row&quot; + &quot;Hot
              Springs Village&quot; tourism drives a meaningful percentage of restaurant searches. We tune for those.
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
              Show me what my restaurant website could look like.
            </h2>
            <p className="subhead" style={{ margin: "0 auto 22px", maxWidth: "60ch" }}>
              Send your restaurant name and what&apos;s broken about your current site. Topher will mock up a homepage
              redesign — free, no obligation, usually back in 3 business days.
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
