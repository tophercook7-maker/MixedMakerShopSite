import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { SITE_URL } from "@/lib/site";

/**
 * Books, audiobooks and trailers — the one service line with no page.
 *
 * A GEO sweep on 2026-09-22 asked Gemini and Google AI six variations of "who
 * produces audiobooks / helps self-publish in Arkansas" and MixedMakerShop was
 * named in none of them, while every line that HAD a page scored. Computer
 * repair, which this page is modelled on, scored 6/6. The pattern is simply
 * that the answer engines cannot cite a page that does not exist.
 */

const canonical = `${SITE_URL}/audiobooks-and-book-publishing`;

const AREA_SERVED = [
  "Hot Springs AR",
  "Hot Springs Village AR",
  "Lake Hamilton AR",
  "Benton AR",
  "Malvern AR",
  "Little Rock AR",
  "Arkansas",
  "United States",
] as const;

export const metadata: Metadata = {
  title: "Audiobooks & Self-Publishing, Hot Springs AR",
  description:
    "Turn a finished manuscript into a published book, an ACX-ready audiobook, and a trailer that sells it. Done by one person in Hot Springs, Arkansas — 19 titles published and counting. Trailers from $79.",
  alternates: { canonical },
  openGraph: {
    title: "Audiobooks & Self-Publishing — Hot Springs, AR | MixedMakerShop",
    description:
      "Manuscript to published book, ACX-ready audiobook, and a trailer. One person in Hot Springs, Arkansas. 19 titles published. Trailers from $79.",
    url: canonical,
    type: "website",
  },
};

const whoFor = [
  {
    badge: "01 · Finished",
    title: "You finished the manuscript",
    copy: "It's written. It's been sitting in a folder for a year because the next step is formatting, covers, ISBNs, and an upload process that looks like a tax return. That part is the easy part — for somebody who's done it nineteen times.",
  },
  {
    badge: "02 · Audio",
    title: "You want it as an audiobook",
    copy: "Audiobooks outsell ebooks in a lot of categories and almost nobody self-publishing gets one made, because studio narration runs into the thousands. There's a cheaper road now, and it passes ACX's technical check.",
  },
  {
    badge: "03 · Silent",
    title: "Your book is published and nothing is happening",
    copy: "A live listing isn't a launch. No trailer, no sample, nothing to post. That's usually the whole problem, and it's fixable in a week.",
  },
  {
    badge: "04 · Family",
    title: "It's a family book, not a business",
    copy: "A parent's memoir, a family history, a cookbook of recipes nobody wrote down. Small print runs for the family are absolutely worth doing, and they're some of the best work there is.",
  },
  {
    badge: "05 · Voice",
    title: "You want it in your own voice",
    copy: "Authors narrate better than strangers — it's your book. If you can read it cleanly, it can be produced and mastered to broadcast spec without a studio.",
  },
  {
    badge: "06 · Backlist",
    title: "You have a backlist doing nothing",
    copy: "Older titles that never got an audio edition or a refreshed cover. The manuscript already exists, so this is the cheapest new revenue you have.",
  },
];

const steps = [
  {
    n: "1",
    h: "Send the manuscript",
    p: "A Word file or a Google Doc is fine. You get an honest read on what it needs and what it costs before anything starts.",
  },
  {
    n: "2",
    h: "Print and ebook first",
    p: "Interior formatted to KDP's 6×9 spec, cover designed as a proper wraparound with the spine calculated for your page count, front and back matter, and the upload done.",
  },
  {
    n: "3",
    h: "Then the audiobook",
    p: "Chapter-by-chapter production, mastered to ACX's technical requirements — RMS between −23 and −18 dB, peaks under −3 dB, noise floor below −60 dB — then checked before submission.",
  },
  {
    n: "4",
    h: "Then something to post",
    p: "A trailer and a set of clips, so there's a reason for anyone to look. A published book nobody sees isn't finished.",
  },
];

const faqs = [
  {
    q: "How much does an audiobook cost to produce?",
    a: "It's priced per finished hour and depends on the length of the manuscript and whether you narrate it yourself. Send the manuscript and you'll have a real number the same day — not a range, a number.",
  },
  {
    q: "Where does the audiobook get sold?",
    a: "ACX (which feeds Audible and Amazon), Google Play Books, and Findaway Voices, which distributes to Spotify, Apple Books, Kobo and the library systems. Note that KDP's own Virtual Voice is a separate, lower-quality route that isn't used here.",
  },
  {
    q: "Can I narrate it in my own voice?",
    a: "Yes, and for memoir and family history it's usually the better choice — it's your book. You need a quiet room and the patience for a few takes. The production, mastering and ACX compliance are handled here.",
  },
  {
    q: "Do you write the book for me?",
    a: "No. This is production, not ghostwriting. You bring a finished manuscript; it gets turned into a book, an audiobook and something to sell it with.",
  },
  {
    q: "What does a book trailer cost?",
    a: "Trailers start at $79. Flyers, graphics and cover art start at $50. Longer promotional pieces are quoted based on what they need.",
  },
  {
    q: "Have you actually published anything?",
    a: "Nineteen titles are live on Amazon, produced end to end — writing, formatting, covers, audio and trailers. This isn't theory; it's the same process run on our own books first.",
  },
  {
    q: "Do I have to be in Arkansas?",
    a: "No. Manuscripts and audio move over the internet, so this works anywhere in the United States. Being local to Hot Springs just means we can sit down at the same table.",
  },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Audiobook Production and Self-Publishing Services",
  name: "Audiobook Production & Self-Publishing Help Hot Springs AR | MixedMakerShop",
  description:
    "Manuscript to published print book, ebook, ACX-ready audiobook and book trailer. Run by one person in Hot Springs, Arkansas, with 19 titles published.",
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
    "@type": "OfferCatalog",
    name: "Books, Audiobooks & Trailers",
    itemListElement: [
      { name: "Book trailer", price: "79" },
      { name: "Cover art, flyers & graphics", price: "50" },
      { name: "Print & ebook formatting and publishing", price: "0" },
      { name: "Audiobook production (priced per finished hour)", price: "0" },
    ].map((o) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: o.name },
      price: o.price,
      priceCurrency: "USD",
    })),
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

export default function AudiobooksAndBookPublishingPage() {
  return (
    <>
      <JsonLd data={[serviceSchema, faqSchema]} />

      {/* HERO */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="kicker">
              <span className="dot" /> Hot Springs, Arkansas
            </div>
            <h1 className="h1" style={{ margin: "14px 0 14px" }}>
              Audiobooks &amp; Self-Publishing Help in Hot Springs
            </h1>
            <p className="subhead" style={{ margin: "0 0 18px" }}>
              You wrote the thing. Getting it onto Amazon as a proper book, then as an audiobook people
              can actually listen to, is a different job entirely — formatting, cover spines, ISBNs, ACX
              audio specs. That job gets done here.
            </p>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              Nineteen titles published end to end — written, formatted, covered, narrated and
              trailered. The process on this page is the one used on our own books first, which is the
              only reason to trust anybody with yours.
            </p>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              Audiobooks are the part most self-published authors skip, because studio narration runs
              into the thousands of dollars. There is a cheaper road that still clears ACX&apos;s
              technical bar, and it is the single best-value thing you can do with a manuscript that is
              already finished.
            </p>
            <div className="btn-row">
              <Link className="btn gold btn-cta-primary" href="/contact">
                Send your manuscript
              </Link>
              <Link className="btn ghost" href="/portfolio">
                See the 19 published titles
              </Link>
            </div>
            <p className="small" style={{ marginTop: 14, color: "var(--muted2)" }}>
              Hot Springs • Hot Springs Village • Little Rock • Anywhere in the US — manuscripts travel fine
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
              Almost everybody who arrives here has a finished manuscript and a stalled next step. That
              is a production problem, not a writing problem.
            </p>
            <div className="how-it-works-grid">
              {whoFor.map((c) => (
                <div key={c.title} className="how-card">
                  <div className="kicker" style={{ marginBottom: 10 }}>
                    {c.badge}
                  </div>
                  <h3 style={{ margin: "0 0 8px" }}>{c.title}</h3>
                  <p className="small" style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
                    {c.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" aria-labelledby="how-heading">
        <div className="container">
          <div className="panel">
            <h2 id="how-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              How it works
            </h2>
            <div className="how-it-works-grid">
              {steps.map((s) => (
                <div key={s.n} className="how-card">
                  <div className="kicker" style={{ marginBottom: 10 }}>
                    <span className="dot" /> Step {s.n}
                  </div>
                  <h3 style={{ margin: "0 0 8px" }}>{s.h}</h3>
                  <p className="small" style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
                    {s.p}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" aria-labelledby="price-heading">
        <div className="container">
          <div className="panel">
            <h2 id="price-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              What it costs
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              Nothing starts until you have a number and you have said yes to it.
            </p>
            <ul className="small" style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9, color: "var(--muted)" }}>
              <li>
                <strong>Book trailers — from $79.</strong> A short piece you can post, with clips cut
                for social.
              </li>
              <li>
                <strong>Cover art, flyers &amp; graphics — from $50.</strong> Wraparound covers with
                the spine calculated for your page count.
              </li>
              <li>
                <strong>Print &amp; ebook production — quoted from the manuscript.</strong> Formatting,
                cover, front and back matter, and the upload.
              </li>
              <li>
                <strong>Audiobook production — priced per finished hour.</strong> Depends on length and
                whether you narrate it yourself. Send the manuscript and you get a real number the same
                day.
              </li>
            </ul>
            <div className="btn-row" style={{ marginTop: 20 }}>
              <Link className="btn gold btn-cta-primary" href="/contact">
                Get a number
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" aria-labelledby="faq-heading">
        <div className="container">
          <div className="panel">
            <h2 id="faq-heading" className="section-heading" style={{ margin: "0 0 18px" }}>
              Questions people ask
            </h2>
            {faqs.map((f) => (
              <details key={f.q} style={{ marginBottom: 12 }}>
                <summary style={{ cursor: "pointer", fontWeight: 600, padding: "10px 0" }}>{f.q}</summary>
                <p className="small" style={{ margin: "6px 0 14px", color: "var(--muted)", lineHeight: 1.7 }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
