import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { SITE_URL } from "@/lib/site";
import { contactHrefForTopic } from "@/lib/what-i-do";

const canonical = `${SITE_URL}/family-history`;
const askHref = contactHrefForTopic("family-history");

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
    title: "A printable Tree of Life",
    copy: "Your ancestors' names placed on an illustrated tree — paternal line on one side, maternal on the other, roots reaching to the places they came from. Digital file included; prints available.",
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
    title: "Pick how deep you want to go",
    copy: "Five generations back is a great first tree. Ten or more if you want to keep going. The price follows the depth and the time — agreed before any research starts.",
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
    a: "Family-tree projects start at $100. The final price depends on how many generations you want and how long the research takes — you'll have the number before I begin, and payment plans are fine.",
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
                  the names and relationships you know — and turn it into a Tree of Life you can hang on the wall.
                </p>
                <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
                  I built my own family&apos;s tree first — 156 people, eight generations, lost branches recovered,
                  cousins found — then a 50-page book from it. That&apos;s the process you get.
                </p>
                <div className="btn-row">
                  <Link className="btn gold btn-cta-primary" href={askHref}>
                    Start a family tree
                  </Link>
                  <a className="btn ghost" href="#fh-faq">
                    Pricing &amp; honest answers
                  </a>
                </div>
                <p className="small" style={{ marginTop: 14, color: "var(--muted2)" }}>
                  Starts at $100 · priced by how deep you want to go · payment plans welcome
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
              <Link className="btn gold btn-cta-primary" href={askHref}>
                Start a family tree
              </Link>
            </div>
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
