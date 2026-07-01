import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { metaDescription } from "@/lib/seo/snippet-meta";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/google-business-profile-help`;

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
  title: "Google Business Profile Setup Hot Springs",
  description: metaDescription(
    "Google Business Profile setup and tuning in Hot Springs, AR — categories, photos, services, posts, and suspensions handled. More map visibility, more calls."
  ),
  alternates: { canonical },
  openGraph: {
    title: "Google Business Profile Setup & Ongoing Help",
    description:
      "Done-for-you Google Business Profile setup and monthly tuning. The single highest-leverage local marketing asset most small businesses are ignoring.",
    url: canonical,
    type: "website",
  },
};

const whoFor = [
  {
    badge: "01 · New",
    title: "Brand-new businesses",
    copy: "Just opened. Need the profile created, verified, and populated before competitors crowd you out.",
  },
  {
    badge: "02 · Stale",
    title: "Owners with stale profiles",
    copy: "Profile exists but you haven't touched it since you claimed it. Hours wrong, photos from 2019, zero posts.",
  },
  {
    badge: "03 · Suspended",
    title: "Suspended profiles",
    copy: 'Got the dreaded "your business profile has been suspended" email. We\'ve untangled this before.',
  },
  {
    badge: "04 · Multi-loc",
    title: "Multi-location operators",
    copy: "Two or three locations all needing their own profile, consistent branding, and individually tuned.",
  },
  {
    badge: "05 · Service-area",
    title: "Service-area businesses",
    copy: "You drive to the customer (HVAC, lawn care, mobile mechanic). Service-area profiles have specific rules; we handle them right.",
  },
  {
    badge: "06 · DIY",
    title: "DIY owners who hit a wall",
    copy: "You set it up yourself, did your best, and now want a pro to clean it up and take over the monthly work.",
  },
] as const;

const setup = [
  {
    badge: "01 · Verify",
    title: "Setup & verification",
    copy: "Create or claim the profile, walk you through verification (postcard, video, or phone), and choose the right primary + secondary categories. Categories are the single biggest ranking factor — we don't guess.",
  },
  {
    badge: "02 · Info",
    title: "Business info",
    copy: "Name, address, hours (including special hours for holidays), service area, attributes, and accepted payment methods — all consistent with your website and other listings.",
  },
  {
    badge: "03 · Photos",
    title: "Photo upload",
    copy: "Logo, cover, exterior, interior, team, products, and services. Each photo is named correctly and uploaded with the right geotag. Most owners upload 3 photos; we upload 20+.",
  },
  {
    badge: "04 · Services",
    title: "Services & categories",
    copy: "Full service list with descriptions and pricing where it makes sense. Secondary categories tuned for the searches you should appear in.",
  },
  {
    badge: "05 · Posts",
    title: "Posts & offers",
    copy: "Weekly or monthly post cadence — updates, offers, events. Google rewards active profiles. Stale profiles slip down the rankings.",
  },
  {
    badge: "06 · Q&A",
    title: "Q&A seeding",
    copy: "Pre-seed the questions customers actually ask, with clear honest answers. Better than letting a competitor or troll answer first.",
  },
] as const;

const faqs = [
  {
    q: "Do I already need a Google account?",
    a: "You'll need a Google account on the email that owns (or should own) the profile. If you're not sure who owns it — old developer, ex-business-partner, mystery — we'll help untangle that before anything else.",
  },
  {
    q: "What if my profile got suspended?",
    a: "We've dealt with suspensions before. The fix depends on why — usually a category mismatch, address issue, virtual-office address, or website-content red flag. Forward the email Google sent you and we'll look. Some are recoverable; some require starting fresh.",
  },
  {
    q: "Can you respond to reviews for me?",
    a: "We can draft responses for your approval, but most owners prefer to respond themselves in their own voice. Either works. If you go silent on negative reviews, it hurts you more than a careful response would.",
  },
  {
    q: "How long does verification take?",
    a: "Phone verification: minutes. Video verification: 1–2 days. Postcard verification: usually 5–14 days. We'll pick the fastest method Google offers you.",
  },
  {
    q: "Will my reviews transfer if I'm moving locations?",
    a: "Yes, usually — Google generally lets you update the address without losing reviews, as long as it's the same business. We'll walk you through it so nothing breaks.",
  },
] as const;

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Google Business Profile Setup",
  name: "Google Business Profile Setup & Help | MixedMakerShop",
  description:
    "Get your Google Business Profile set up, verified, and ranking in Hot Springs, AR. Categories, photos, services, posts, Q&A, suspensions — all handled.",
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

export default function GoogleBusinessProfileHelpPage() {
  return (
    <>
      <JsonLd data={[serviceSchema, faqSchema]} />

      {/* HERO */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="kicker">
              <span className="dot" /> Google Maps
            </div>
            <h1 className="h1" style={{ margin: "14px 0 14px" }}>
              Google Business Profile Setup &amp; Help
            </h1>
            <p className="subhead" style={{ margin: "0 0 18px" }}>
              A properly tuned Google Business Profile is the single highest-leverage local marketing asset most small
              businesses have — and the one most are completely ignoring. MixedMakerShop sets yours up correctly and
              keeps it tuned every month.
            </p>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              Founder-led setup and ongoing care. We handle the boring tuning so you can keep running the actual
              business.
            </p>
            <div className="btn-row">
              <Link className="btn gold btn-cta-primary" href="/contact">
                Get My Profile Set Up
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
              If your customers can drive to you (or you drive to them) and they have phones, this is the marketing
              channel that matters most. This service is for owners who know the profile is important but never have time
              to actually work on it.
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

      {/* WHAT WE SET UP */}
      <section className="section" aria-labelledby="included-heading">
        <div className="container">
          <div className="panel">
            <h2 id="included-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              What we set up
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              Every part of the profile, done in one focused pass. Most owners are surprised how much is actually under
              the hood.
            </p>
            <div className="how-it-works-grid">
              {setup.map((c) => (
                <div className="how-it-works-card" key={c.title}>
                  <span className="how-it-works-badge">{c.badge}</span>
                  <h3 className="how-it-works-title">{c.title}</h3>
                  <p className="how-it-works-copy">{c.copy}</p>
                </div>
              ))}
            </div>
            <p className="small" style={{ margin: "22px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              Profile setup is one focused project. <Link href="/pricing">See the pricing page</Link> for typical
              project cost. Want ongoing monthly tuning? That&apos;s a separate add-on covered in the next section.
            </p>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="section" aria-labelledby="why-heading">
        <div className="container">
          <div className="panel">
            <h2 id="why-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Why this is the highest-leverage thing you can do
            </h2>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              Of every dollar a small business can spend on local marketing — website, SEO, ads, social, mailers — the
              most underused channel is the one Google gives away for free.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              A real Google Business Profile shows up in the map pack, in &quot;near me&quot; searches, and in branded
              searches when someone Googles your business directly. It is the storefront most customers see before they
              ever visit your website. If it&apos;s broken, empty, or outdated, you lose the lead before you even know
              they existed.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              The work isn&apos;t glamorous. It&apos;s photo upload, category research, post writing, Q&amp;A seeding,
              and weekly tuning. But the ROI is the best of anything small businesses can spend on. We do it because most
              owners genuinely don&apos;t have the time.
            </p>
            <p className="small" style={{ margin: "0 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              Best paired with <Link href="/local-seo-services">local SEO on the website side</Link> and{" "}
              <Link href="/web-design-hot-springs-ar">a website that backs up the profile</Link>.
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
              Let&apos;s get your profile in shape.
            </h2>
            <p className="subhead" style={{ margin: "0 auto 22px", maxWidth: "60ch" }}>
              Send your business name and we&apos;ll audit what&apos;s there, fix what&apos;s broken, and tell you what to
              focus on next. Free 15-minute audit, no sales pressure.
            </p>
            <div className="btn-row" style={{ justifyContent: "center" }}>
              <Link className="btn gold btn-cta-primary" href="/contact">
                Get My Profile Set Up
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
