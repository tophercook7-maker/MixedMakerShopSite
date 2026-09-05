import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { SITE_URL } from "@/lib/site";
import { contactHrefForTopic } from "@/lib/what-i-do";

const canonical = `${SITE_URL}/family-history`;
const askHref = contactHrefForTopic("family-history");
const PAY_START = "/pay-tree";

const treeStyles = [
  { name: "Heritage", img: "/images/family-history/style-heritage.jpg", copy: "A vintage engraved oak on aged parchment with name plates on the branches — the look of an old botanical print." },
  { name: "Nouveau", img: "/images/family-history/style-nouveau.jpg", copy: "An art-nouveau bookplate: flowing ornamental branches, a floral canopy, and gilt corners on ivory. Elegant and a little formal." },
  { name: "Oil Painting", img: "/images/family-history/style-oilpainting.jpg", copy: "A magnificent solitary oak painted in warm golden light, old-master style. Rich, warm, and timeless on a wall." },
  { name: "Gilded", img: "/images/family-history/style-gilded.jpg", copy: "Gold-leaf foliage and fine linework on deep forest green, with cream name plates. The most dramatic of the four — made for a frame." },
] as const;

const tiers = [
  { name: "Starter", price: "$100", depth: "3 generations", pay: "/pay-tree", copy: "Parents, grandparents and great-grandparents on both sides. Digital Tree of Life, written findings, every record I find. Also the deposit for any bigger project." },
  { name: "Family Tree", price: "$195", depth: "5 generations", pay: "/pay-tree-5", copy: "Up to 31 direct ancestors, both sides. Print-ready Tree of Life, a copy of every record, findings and sources, one round of corrections." },
  { name: "Deep Roots", price: "$390", depth: "up to 10 generations", pay: "/pay-tree-10", copy: "Everything in Family Tree, plus where each line came from, the stories behind the names, and a poster-size print master." },
  { name: "To the Boat", price: "from $585", depth: "as far as the records go", pay: null, copy: "Every surviving line followed to its end, a full research report, and printed-poster preparation. Quoted after we talk — the $100 start holds your spot." },
] as const;

export const metadata: Metadata = {
  title: "Genealogy & Family Tree Research Hot Springs AR | Family Trees by Topher",
  description:
    "Find out where your family came from. Family-tree research, organizing what you already know, and a printable Tree of Life with your ancestors' names — researched carefully, labeled honestly. Starts at $100.",
  alternates: { canonical },
  openGraph: {
    title: "Genealogy & Family History — Family Trees by Topher",
    description:
      "Family-tree research and a printable Tree of Life with your ancestors' names. Honest research, no invented ancestors. Starts at $100.",
    url: canonical,
    type: "website",
    images: ["/images/family-history/tree-of-life-sample.jpg"],
  },
};

const whatYouGet = [
  {
    badge: "01 · Research",
    title: "Family-tree research",
    copy: "Starting from the names, dates, and stories you already have, I work backward through census records, cemetery records, obituaries, marriage and death records, and land records — as many generations as you want to go.",
  },
  {
    badge: "02 · Organize",
    title: "Organizing what you've got",
    copy: "That shoebox of photos, the notes on the back of a funeral program, the half-finished Ancestry tree — it gets pulled into one clean, properly sourced tree in Family Tree Maker that you keep.",
  },
  {
    badge: "03 · The story",
    title: "The history behind the names",
    copy: "Where they lived, what they did, who they buried, why they moved. The people, not just the dates.",
  },
  {
    badge: "04 · Tree of Life",
    title: "A printable Tree of Life — your choice of style",
    copy: "Your ancestors' names placed on the tree — paternal line on one side, maternal on the other, roots reaching to the places they came from. Pick Heritage, Nouveau, Oil Painting, or Gilded. Digital file included; prints available.",
  },
  {
    badge: "05 · Book",
    title: "A family-history book (optional)",
    copy: "For families who want more than a chart: a typeset book with the tree, the records, the photos, and the stories — the kind of thing that gets handed down.",
  },
  {
    badge: "06 · Living relatives",
    title: "Finding the living branches",
    copy: "Cousins you didn't know you had. Privacy for living people is respected — nothing about the living goes in a print or online without their say.",
  },
] as const;

const howItWorks = [
  {
    step: "1",
    title: "Tell me what you know",
    copy: "Names, rough dates, where they lived, family stories — even if it's just a grandparent. Everything helps; nothing is required.",
  },
  {
    step: "2",
    title: "Pick how deep — and which style",
    copy: "Five generations back is a great first tree. Ten or more if you want to keep going. Then choose Heritage, Nouveau, Oil Painting, or Gilded. The price follows the depth and the time — agreed before any research starts.",
  },
  {
    step: "3",
    title: "Get the tree, the sources, and the story",
    copy: "Every conclusion is labeled with how sure I am and what it rests on. You get the tree file, the Tree of Life image, and a plain-language write-up.",
  },
] as const;

const faqs = [
  {
    q: "How much does it cost?",
    a: "Family-tree projects start at $100 for three generations, $195 for five, $390 for up to ten, and from $585 to go as far as the records survive. $100 starts any project; you'll have the full number before I begin, and payment plans are fine.",
  },
  {
    q: "Can you guarantee how far back you'll get?",
    a: "No, and anyone who does is guessing. Records burn, names change, people vanish from the paper trail. What I guarantee is honest work: every person on your tree is backed by a record or clearly labeled as a probable match, and I'll never invent an ancestor, a date, or a coat of arms to make the tree look fuller.",
  },
  {
    q: "Are you a certified genealogist?",
    a: "No — I'm not a Certified Genealogist and don't claim to be. I follow the Genealogical Proof Standard, cite sources, and label every conclusion. If a line needs a specialist (overseas archives, DNA analysis), I'll say so.",
  },
  {
    q: "What does the tree look like?",
    a: "Your choice of four styles, same price: Heritage (a vintage engraved oak on parchment), Nouveau (an art-nouveau bookplate with gilt corners), Oil Painting (an old-master oak in golden light), or Gilded (gold-leaf foliage on deep forest green). Samples are on this page — all four are my dad's real five-generation tree.",
  },
  {
    q: "Do I need an Ancestry or FamilySearch account?",
    a: "No. I handle the research. If you already have a tree somewhere, I can work from an export of it.",
  },
  {
    q: "What about DNA?",
    a: "I don't run DNA tests or interpret results. If you've already tested, I can use the matches you share as leads for record research.",
  },
  {
    q: "Where are you and do you work remotely?",
    a: "Hot Springs, Arkansas. Most of the work is remote; local families can sit down in person to go through photos and papers.",
  },
] as const;

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Genealogy and Family History Research",
  name: "Family Trees by Topher — Genealogy & Family History",
  description:
    "Family-tree research, organizing existing family records, printable Tree of Life artwork, and optional family-history books. Sourced and labeled to the Genealogical Proof Standard.",
  provider: {
    "@type": "LocalBusiness",
    name: "MixedMakerShop",
    url: `${SITE_URL}/`,
    address: { "@type": "PostalAddress", addressLocality: "Hot Springs", addressRegion: "AR", addressCountry: "US" },
  },
  areaServed: ["Hot Springs AR", "Arkansas", "United States (remote)"],
  url: canonical,
  offers: { "@type": "Offer", price: "100", priceCurrency: "USD", description: "Starting price; final quote by depth and time" },
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

export default function FamilyHistoryPage() {
  return (
    <>
      <JsonLd data={[serviceSchema, faqSchema]} />

      {/* HERO */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <div>
                <div className="kicker">
                  <span className="dot" /> Family Trees by Topher · Hot Springs, Arkansas
                </div>
                <h1 className="h1" style={{ margin: "14px 0 14px" }}>
                  Interested in finding out where your family came from?
                </h1>
                <p className="subhead" style={{ margin: "0 0 18px" }}>
                  I take on genealogy and family-history projects using real record research and Family Tree Maker. I
                  can organize the family information you already have, build the tree, research the history behind
                  the names and relationships you know — and turn it into a Tree of Life you can hang on the wall, in
                  your choice of four styles.
                </p>
                <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
                  I built my own family&apos;s tree first — 156 people, eight generations, lost branches recovered,
                  cousins found — then a 50-page book from it. That&apos;s the process you get.
                </p>
                <div className="btn-row">
                  <a className="btn gold btn-cta-primary" href={PAY_START}>
                    Start for $100
                  </a>
                  <Link className="btn ghost" href={askHref}>
                    Ask a question first
                  </Link>
                  <a className="btn ghost" href="#fh-pricing">
                    See pricing
                  </a>
                </div>
                <p className="small" style={{ marginTop: 14, color: "var(--muted2)" }}>
                  Starts at $100 · priced by how deep you want to go · payment plans welcome · secure card checkout
                </p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                <Image
                  src="/images/family-history/tree-of-life-sample.jpg"
                  alt="Sample Tree of Life — an illustrated family tree with ancestors' names placed on the branches"
                  width={798}
                  height={932}
                  priority
                  className="h-auto w-full"
                />
                <p className="small px-4 py-3 text-center" style={{ color: "var(--muted2)", margin: 0 }}>
                  Sample Tree of Life — my dad&apos;s five-generation tree
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="section" aria-labelledby="fh-what-heading">
        <div className="container">
          <div className="panel">
            <h2 id="fh-what-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              What a family-history project includes
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              Pick the pieces you want. Some families want the tree. Some want the book. Some just want to know if the
              story about great-grandpa is true.
            </p>
            <div className="how-it-works-grid">
              {whatYouGet.map((c) => (
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

      {/* TREE STYLES */}
      <section className="section" aria-labelledby="fh-styles-heading" id="fh-styles">
        <div className="container">
          <div className="panel">
            <h2 id="fh-styles-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Pick your tree style — four to choose from, same price
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              Every style is built from the same researched tree, so you can change your mind before delivery. Names,
              dates, and places are placed by hand from the records — never guessed.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {treeStyles.map((t) => (
                <div className="card" key={t.name} style={{ display: "flex", flexDirection: "column" }}>
                  <div className="overflow-hidden rounded-xl border border-white/10" style={{ marginBottom: 12 }}>
                    <Image src={t.img} alt={`${t.name} tree style — sample from my dad's five-generation tree`} width={800} height={920} className="h-auto w-full" />
                  </div>
                  <h3 className="how-it-works-title" style={{ marginBottom: 6 }}>
                    {t.name}
                  </h3>
                  <p className="how-it-works-copy">{t.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" aria-labelledby="fh-how-heading">
        <div className="container">
          <div className="panel">
            <h2 id="fh-how-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              How it works
            </h2>
            <div className="how-it-works-grid">
              {howItWorks.map((s) => (
                <div className="how-it-works-card" key={s.title}>
                  <span className="how-it-works-badge">Step {s.step}</span>
                  <h3 className="how-it-works-title">{s.title}</h3>
                  <p className="how-it-works-copy">{s.copy}</p>
                </div>
              ))}
            </div>
            <div className="btn-row" style={{ marginTop: 22 }}>
              <a className="btn gold btn-cta-primary" href={PAY_START}>
                Start for $100
              </a>
              <Link className="btn ghost" href={askHref}>
                Ask a question first
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" aria-labelledby="fh-pricing-heading" id="fh-pricing">
        <div className="container">
          <div className="panel">
            <h2 id="fh-pricing-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Pricing — you pick how deep
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              $100 starts any project. Pay the rest as we go — payment plans welcome, prices negotiable. Every tier
              includes your choice of the four tree styles. Add a family history book from $395, a private family
              website from $350, or a printed poster.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {tiers.map((t) => (
                <div className="card" key={t.name} style={{ display: "flex", flexDirection: "column" }}>
                  <span className="how-it-works-badge">{t.depth}</span>
                  <h3 className="how-it-works-title" style={{ marginBottom: 4 }}>
                    {t.name}
                  </h3>
                  <div style={{ fontSize: 30, fontWeight: 700, color: "var(--gold, #e9cf7f)", marginBottom: 8 }}>{t.price}</div>
                  <p className="how-it-works-copy" style={{ flex: 1 }}>{t.copy}</p>
                  {t.pay ? (
                    <a className="btn gold" href={t.pay} style={{ marginTop: 12 }}>
                      Pay {t.price} &amp; start
                    </a>
                  ) : (
                    <Link className="btn ghost" href={askHref} style={{ marginTop: 12 }}>
                      Get a quote
                    </Link>
                  )}
                </div>
              ))}
            </div>
            <p className="small" style={{ margin: "18px 0 0", color: "var(--muted2)", lineHeight: 1.6 }}>
              Checkout is handled by Stripe. After you pay, I text you within a day to get your grandparents&apos; names
              and get started. Records vary — I never promise a number of ancestors, only honest work.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" aria-labelledby="fh-faq-heading" id="fh-faq">
        <div className="container">
          <div className="panel">
            <h2 id="fh-faq-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Honest answers first
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {faqs.map((f) => (
                <div className="card" key={f.q}>
                  <h3 className="how-it-works-title" style={{ marginBottom: 8 }}>
                    {f.q}
                  </h3>
                  <p className="how-it-works-copy">{f.a}</p>
                </div>
              ))}
            </div>
            <p className="small" style={{ margin: "22px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              If you&apos;ve been wanting to learn more about your family history,{" "}
              <Link href={askHref}>just send me a message</Link>. A grandparent&apos;s name is enough to start.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
