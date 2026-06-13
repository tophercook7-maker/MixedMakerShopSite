import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/ai-business-tools`;

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
  title: "AI Business Tools for Small Businesses | MixedMakerShop",
  description:
    "Practical AI workflows for small businesses — lead follow-up, smart intake, blog drafts, review sequences, quote helpers. Real tasks, off your plate.",
  alternates: { canonical },
  openGraph: {
    title: "AI Business Tools — Practical Automation, No Hype",
    description:
      'We don\'t sell "AI strategy." We take 3–4 specific tasks off your plate. Real workflows, owned by you, no chatbots that pretend to be people.',
    url: canonical,
    type: "website",
  },
};

const whoFor = [
  {
    badge: "01 · Solo",
    title: "Solo owners drowning in admin",
    copy: "One-person shops where every task — quote, follow-up, blog post, invoice reminder — falls on you. Automation buys back hours per week.",
  },
  {
    badge: "02 · Slow",
    title: "Slow lead follow-up",
    copy: "Leads coming in but taking hours (or days) to get a response. Conversion rates triple when first response happens within 5 minutes.",
  },
  {
    badge: "03 · Manual",
    title: "Businesses doing repetitive intake",
    copy: "Every new client asks the same 12 questions. You answer them every time. There's a better way.",
  },
  {
    badge: "04 · Service",
    title: "Service businesses with reviews to chase",
    copy: "Job ends, payment clears, and the review never happens. Automated request sequences fix the ask-rate without being pushy.",
  },
  {
    badge: "05 · Content",
    title: 'Owners told they need to "do content"',
    copy: "You know you should blog, post, and email — but the blank page wins every week. AI drafts you actually want to publish.",
  },
  {
    badge: "06 · Curious",
    title: "Owners who tried ChatGPT and got generic outputs",
    copy: "You've experimented but couldn't get useful results. The difference is in the prompts, the context, and the workflow around the AI — not the AI itself.",
  },
] as const;

const useCases = [
  {
    badge: "01 · Follow-up",
    title: "5-minute lead follow-up",
    copy: "New contact comes in. Within 5 minutes they get a personalized text, an email with next steps, and your calendar link. You stay sleeping; the response went out.",
  },
  {
    badge: "02 · Intake",
    title: "Smart intake forms",
    copy: 'Forms that ask the right next question based on the last answer. Less back-and-forth before the first call, fewer "tell me about your project" sessions.',
  },
  {
    badge: "03 · Content",
    title: "Blog & social drafts",
    copy: "Drafts that actually sound like your business, fed by your existing content. Ready to review and post.",
    related: { href: "/social-media-takeover", label: "Social Media Takeover", suffix: " if you want us to handle the posting too." },
  },
  {
    badge: "04 · Reviews",
    title: "Review request sequences",
    copy: "Automatic ask after each completed job, with the right link to your Google profile. Builds your reputation without you remembering to ask.",
  },
  {
    badge: "05 · Quotes",
    title: "Quick quote helpers",
    copy: "Internal tool — fill in a few numbers, get a clean quote PDF in your branding. Common quote types in 30 seconds instead of 20 minutes.",
  },
  {
    badge: "06 · Records",
    title: "Searchable records",
    copy: 'Make your past quotes, jobs, emails, and customer history instantly searchable in plain English. "What did we charge that lawn customer last summer?" becomes a 5-second answer.',
  },
] as const;

const faqs = [
  {
    q: "Will the AI sound like a robot?",
    a: 'Not the way we build it. We tune voice and prompts against samples of how you actually talk to customers. If something reads as "AI," we fix it before it ships. We\'d rather not ship at all than ship something that damages trust.',
  },
  {
    q: "Do I own the workflows?",
    a: "Yes. Everything runs in your accounts — your email, your CRM, your Google workspace, your phone number. If you ever stop working with us, the workflows keep running. You're not locked into a platform.",
  },
  {
    q: "Is this expensive?",
    a: "Most individual automation projects are $300–$1,500 one-time, depending on scope. Bigger custom workflows are quoted up front. See the pricing page for the breakdown.",
  },
  {
    q: "What if my customer data is sensitive?",
    a: "Then we keep it local. For sensitive cases we use AI providers with no-training agreements (Anthropic, OpenAI Enterprise) or self-host smaller models. Tell us what's sensitive and we'll scope around it.",
  },
  {
    q: "Will this replace my employees?",
    a: 'Almost never. Most projects we do free up an owner or staff member from 5–10 hours of admin so they can do more billable work. The math is "do more business" not "fire someone."',
  },
] as const;

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "AI Business Tools",
  name: "AI Business Tools for Small Businesses | MixedMakerShop",
  description:
    "Practical AI workflows for small businesses — lead follow-up, smart intake, blog drafts, review sequences, quote helpers. Real tasks, off your plate.",
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
    description: "Individual automation projects, typically one-time.",
    priceSpecification: {
      "@type": "PriceSpecification",
      minPrice: "300",
      maxPrice: "1500",
      priceCurrency: "USD",
    },
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

export default function AiBusinessToolsPage() {
  return (
    <>
      <JsonLd data={[serviceSchema, faqSchema]} />

      {/* HERO */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="kicker">
              <span className="dot" /> Practical automation
            </div>
            <h1 className="h1" style={{ margin: "14px 0 14px" }}>
              AI Business Tools for Small Businesses
            </h1>
            <p className="subhead" style={{ margin: "0 0 18px" }}>
              Most small businesses don&apos;t need an &quot;AI strategy.&quot; They need three or four specific
              repetitive tasks taken off their plate. We figure out which ones, build them, and hand them over running.
            </p>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              No hype, no chatbots pretending to be people, no platforms you have to learn. Real workflows that run in
              your existing tools, owned by you.
            </p>
            <div className="btn-row">
              <Link className="btn gold btn-cta-primary" href="/contact">
                Tell Me What&apos;s Eating My Time
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
              AI automation works best when you have a clear list of recurring tasks that drain time without adding much
              judgment. If you can describe a task in one sentence and you do it more than weekly, it&apos;s probably a
              candidate.
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

      {/* REAL USE CASES */}
      <section className="section" aria-labelledby="included-heading">
        <div className="container">
          <div className="panel">
            <h2 id="included-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Real use cases
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              The actual workflows small business owners ask us to automate. Each is a separate fixed-price project — not
              a monthly retainer.
            </p>
            <div className="how-it-works-grid">
              {useCases.map((c) => (
                <div className="how-it-works-card" key={c.title}>
                  <span className="how-it-works-badge">{c.badge}</span>
                  <h3 className="how-it-works-title">{c.title}</h3>
                  <p className="how-it-works-copy">
                    {c.copy}
                    {"related" in c && c.related ? (
                      <>
                        {" "}
                        See <Link href={c.related.href}>{c.related.label}</Link>
                        {c.related.suffix}
                      </>
                    ) : null}
                  </p>
                </div>
              ))}
            </div>
            <p className="small" style={{ margin: "22px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              Want to combine automation with a website that captures the leads in the first place? See{" "}
              <Link href="/web-design-hot-springs-ar">Hot Springs web design</Link>. Want pricing on typical automation
              projects? <Link href="/pricing">See the pricing page</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="section" aria-labelledby="why-heading">
        <div className="container">
          <div className="panel">
            <h2 id="why-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Why this matters for small businesses, not just big ones
            </h2>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              Most &quot;AI for business&quot; content is aimed at enterprises with VPs of Innovation. That&apos;s not who
              actually benefits the most. Small businesses do, because the same tools that used to require a full-time
              hire to automate are now available to a single owner.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              A solo cleaning business in Hot Springs can have the same automated follow-up sequence as a
              multi-million-dollar franchise. A small contractor can have a faster quote tool than a big firm. The
              leverage is highest for the smallest operators — because every hour saved goes straight back into doing the
              actual work.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              The catch is that off-the-shelf AI tools are generic by design. They sound like AI because they have no
              context about your business. The work we do is in the integration — connecting the AI to your customer
              data, your voice, your offers, your calendar — so the output reads like you wrote it.
            </p>
            <p className="small" style={{ margin: "0 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              Done right, you get the leverage without the &quot;this was clearly AI&quot; tax customers can sniff out
              instantly.
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
              What&apos;s the most boring thing on your plate?
            </h2>
            <p className="subhead" style={{ margin: "0 auto 22px", maxWidth: "60ch" }}>
              Tell Topher what tasks keep eating your time. We&apos;ll tell you which ones make sense to automate, what
              each one would cost, and which ones honestly aren&apos;t worth it.
            </p>
            <div className="btn-row" style={{ justifyContent: "center" }}>
              <Link className="btn gold btn-cta-primary" href="/contact">
                Tell Me What&apos;s Eating My Time
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
