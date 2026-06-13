import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/in-home-computer-repair`;

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
  title: "In-Home Computer Repair & AI Tutoring Hot Springs AR | MixedMakerShop",
  description:
    "In-home computer repair and one-on-one tutoring (including AI tools, ChatGPT, and AI assistants) in Hot Springs, Arkansas. Diagnostic $59, Tune-Up $99, tutoring flat $65/hr.",
  alternates: { canonical },
  openGraph: {
    title: "In-Home Computer & AI Tutoring + Repair — Hot Springs, AR",
    description:
      "Repair, setup, and patient one-on-one tutoring including AI tools. Diagnostic $59, Tune-Up $99, tutoring flat $65/hr at your kitchen table.",
    url: canonical,
    type: "website",
  },
};

const whoFor = [
  {
    badge: "01 · Home",
    title: "Home users",
    copy: "Retired, semi-retired, or just busy. You don't want to load the desktop into the car. We come to you, fix it, leave when it's working.",
  },
  {
    badge: "02 · Office",
    title: "Small business owners",
    copy: "One sick office PC is costing you a day of work. Same-day visits when the calendar allows.",
  },
  {
    badge: "03 · Scared",
    title: 'Anyone who got "the call"',
    copy: '"Hi, this is Microsoft, we\'ve detected a virus." It\'s never Microsoft. We clean up the damage and lock things down so it doesn\'t happen again.',
  },
  {
    badge: "04 · Printer",
    title: "Printer & network nightmares",
    copy: "New router, new printer, new Wi-Fi password — and now nothing talks to anything. Classic. Easy fix in person.",
  },
  {
    badge: "05 · New",
    title: "New computer buyers",
    copy: "Brand-new laptop or desktop. You need email, browsers, printer, files, photos, bookmarks all moved over. We do the whole transfer.",
  },
  {
    badge: "06 · Locked",
    title: "Locked-out users",
    copy: "Forgot the password to Microsoft, Google, your bank, your tax software. Half the work is verifying it's really you. We help untangle it.",
  },
] as const;

const whatWeFix = [
  {
    badge: "01 · Speed",
    title: "Slow PC cleanup",
    copy: "See what's actually eating CPU, RAM, and disk. Clean up startup junk, malware, leftover programs, and overgrown caches. Make it usable again.",
  },
  {
    badge: "02 · Login",
    title: "Login & password issues",
    copy: "Microsoft, Google, banking, Amazon, tax software — accounts that locked you out get untangled with you in the room. Most need a verification step you have to do.",
  },
  {
    badge: "03 · Printer",
    title: "Printer & network setup",
    copy: "New printer, new Wi-Fi, new router — get everything talking again. Includes mobile printing setup if you want it.",
  },
  {
    badge: "04 · Email",
    title: "Email problems",
    copy: "Email not sending, missing folders, old address book disappeared, suspicious activity, two-factor headaches — fixed.",
  },
  {
    badge: "05 · Virus",
    title: "Virus & adware cleanup",
    copy: 'Pop-ups, browser hijacks, slowdowns, scary "tech support" messages — cleaned up properly, not just hidden behind a new antivirus icon.',
  },
  {
    badge: "06 · Setup",
    title: "New computer setup",
    copy: "New laptop or desktop. We get email, browsers, printer, files, photos, and bookmarks all moved over. Old machine gets wiped and prepped for donation or disposal if you want.",
  },
] as const;

const tutoring = [
  {
    badge: "01 · AI",
    title: "ChatGPT & AI assistants",
    copy: "ChatGPT, Microsoft Copilot, Google Gemini, Claude. What they actually do, how to ask good questions, how to use them safely without giving away private info, and where AI is just plain wrong.",
  },
  {
    badge: "02 · AI Tools",
    title: "AI for everyday tasks",
    copy: "Writing better emails, drafting letters, summarizing long documents, planning trips, recipes, gift ideas, photo touch-ups, and quick image generation. Practical, not theoretical.",
  },
  {
    badge: "03 · Basics",
    title: "Computer, phone, & tablet basics",
    copy: "Turning things on, signing in, navigating, saving files where you can find them again, charging properly, and what each button does.",
  },
  {
    badge: "04 · Internet",
    title: "Email, browsing, & video calls",
    copy: "Gmail or Outlook the right way, safe browsing, bookmarks, Zoom / FaceTime / Google Meet calls with grandkids.",
  },
  {
    badge: "05 · Office",
    title: "Word, Excel, Google Docs & Sheets",
    copy: "Documents, spreadsheets, formatting, printing, sharing. Whatever your job or volunteer role needs — with AI assist where it speeds things up.",
  },
  {
    badge: "06 · Photos",
    title: "Photos, memories & safety",
    copy: 'Photos off the phone, organizing, sharing, backing up. Plus scam recognition, "Microsoft" calls, fake invoices, password managers, and recovering from a scare without panic.',
  },
] as const;

const repairPrices = [
  {
    tag: "DIAGNOSTIC VISIT",
    price: "$59",
    blurb:
      "A real look at what's wrong, what it'll take to fix, and whether the machine is worth fixing. Credited toward any service done the same visit.",
    bullets: [
      "On-site assessment",
      "Written summary of what's wrong",
      'Honest "fix vs. replace" answer',
      "Credit applied if you book the repair",
    ],
    cta: "Book a Diagnostic",
    gold: true,
  },
  {
    tag: "CLEAN & QUICK TUNE-UP · MOST REQUESTED",
    price: "$99",
    blurb:
      "The everyday rescue: clear out the junk slowing the machine down, sort the startup items, run a real security check, get it usable again.",
    bullets: [
      "Startup & background cleanup",
      "Disk & cache cleanup",
      "Browser cleanup (no more pop-ups)",
      "Basic security check",
      "Performance sanity pass",
    ],
    cta: "Book a Tune-Up",
    gold: true,
  },
  {
    tag: "NEW COMPUTER SETUP",
    price: "$129",
    blurb:
      "Unbox, configure, transfer your files, photos, email, printer, and bookmarks from the old machine, and lock the new one down so it stays clean.",
    bullets: [
      "Initial setup & account sign-in",
      "Email & browser migration",
      "Printer & Wi-Fi connection",
      "File / photo transfer",
      "Optional: wipe + prep old machine",
    ],
    cta: "Book a Setup",
    gold: false,
  },
  {
    tag: "VIRUS / MALWARE REMOVAL",
    price: "$149",
    blurb:
      'Pop-ups, browser hijacks, scary "tech support" messages, slow-downs that won\'t quit. Cleaned up properly, not hidden behind a new antivirus icon.',
    bullets: [
      "Full malware sweep",
      "Browser hijack removal",
      "Account & password review",
      "Plain-English explanation of how it got in",
      "Hardening so it doesn't come back",
    ],
    cta: "Book a Cleanup",
    gold: false,
  },
  {
    tag: "PRINTER & NETWORK SETUP",
    price: "$99",
    blurb:
      "New printer, new router, new Wi-Fi password — and now nothing talks to anything. Includes mobile printing if you want it.",
    bullets: [
      "Printer install & test",
      "Wi-Fi / router reconnect",
      "Mobile printing setup",
      "Up to 3 devices reconnected",
    ],
    cta: "Book a Setup",
    gold: false,
  },
  {
    tag: "HARDWARE INSTALL · LABOR",
    price: "$89",
    blurb:
      "RAM upgrade, SSD swap, hard-drive replacement, simple internal install. Parts are pass-through at cost; this is labor only.",
    bullets: [
      "Installation & cable management",
      "OS configuration after install",
      "Old drive cloning (when needed)",
      "Parts at cost, no markup",
    ],
    cta: "Book an Install",
    gold: false,
  },
] as const;

const faqs = [
  {
    q: "Do you come to homes or just businesses?",
    a: "Both. About half our calls are home users in the Hot Springs area, half are small business owners. Same response time either way.",
  },
  {
    q: "What if you can't fix it?",
    a: 'If we can\'t get it working in the time we quoted, you don\'t pay for that visit. We\'ll be straight about whether it\'s worth taking the problem further (sometimes the answer is "the computer is 9 years old, this is the third visit, time for a new one").',
  },
  {
    q: 'Are you a "Geek Squad" type service?',
    a: "Less corporate, more direct. You're working with Topher — same person who answers the phone, shows up, fixes it, and texts you a week later to make sure it's still working. No mystery techs assigned to your ticket.",
  },
  {
    q: "Will my data be safe?",
    a: "Yes. Everything stays on your machine. We don't copy your files to ours. If a fix requires backing up first, we use a drive you own or a folder you control.",
  },
  {
    q: "Do you remove old computers?",
    a: 'Yes — if you want. We wipe them properly (not just "delete the files") and either return them clean for donation or dispose of them responsibly. Free with any setup of the replacement.',
  },
] as const;

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "In-Home Computer Repair and Tutoring",
  name: "In-Home Computer Repair & Tutoring Hot Springs AR | MixedMakerShop",
  description:
    "In-home computer repair and one-on-one tutoring in Hot Springs, Arkansas. Diagnostic $59, Clean & Quick Tune-Up $99, tutoring flat $65/hr.",
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
    name: "In-Home Computer Repair & Tutoring",
    itemListElement: [
      { name: "Diagnostic Visit", price: "59" },
      { name: "Clean & Quick Tune-Up", price: "99" },
      { name: "New Computer Setup", price: "129" },
      { name: "Virus / Malware Removal", price: "149" },
      { name: "Printer & Network Setup", price: "99" },
      { name: "Hardware Install (labor)", price: "89" },
      { name: "One-on-One Tutoring (per hour)", price: "65" },
      { name: "Hourly rate (anything else)", price: "79" },
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

export default function InHomeComputerRepairPage() {
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
              In-Home Computer Repair &amp; Tutoring in Hot Springs
            </h1>
            <p className="subhead" style={{ margin: "0 0 18px" }}>
              Computer slow, printer won&apos;t talk to it, can&apos;t log into something — or want to finally figure out
              ChatGPT, AI assistants, and the apps you already own? Topher comes to your home or office in Hot Springs and
              gets it sorted (or teaches you) at your kitchen table, not in a shop you have to drive to.
            </p>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              No shop drop-off, no boxes shipped anywhere, no &quot;we&apos;ll call you in 3 days.&quot; Same-day or
              next-day in most cases. Flat rates so you know the price before any work starts. Tutoring is a simple flat
              $65 an hour — same rate whether we cover email basics or hands-on AI tools.
            </p>
            <div className="btn-row">
              <Link className="btn gold btn-cta-primary" href="/contact">
                Book a Visit
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
              In-home service makes the most sense for people who don&apos;t want to unhook their computer, drive it
              across town, and wait three days. That covers most of our customers.
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

      {/* WHAT WE FIX */}
      <section className="section" aria-labelledby="included-heading">
        <div className="container">
          <div className="panel">
            <h2 id="included-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              What we fix
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              The everyday stuff. If your problem isn&apos;t on this list, ask — we probably still handle it.
            </p>
            <div className="how-it-works-grid">
              {whatWeFix.map((c) => (
                <div className="how-it-works-card" key={c.title}>
                  <span className="how-it-works-badge">{c.badge}</span>
                  <h3 className="how-it-works-title">{c.title}</h3>
                  <p className="how-it-works-copy">{c.copy}</p>
                </div>
              ))}
            </div>
            <p className="small" style={{ margin: "22px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              If you also need a website or want to talk about local marketing, see{" "}
              <Link href="/web-design-hot-springs-ar">Hot Springs web design</Link>. Want the full price list?{" "}
              <Link href="/pricing">See the pricing page</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* TUTORING */}
      <section className="section" aria-labelledby="tutoring-heading">
        <div className="container">
          <div className="panel">
            <h2 id="tutoring-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              One-on-one tutoring — including AI — at your kitchen table
            </h2>
            <p className="small" style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.6 }}>
              If you&apos;d rather learn it yourself — or finally feel confident using ChatGPT, Microsoft Copilot, Google
              Gemini, and the apps you already own — Topher teaches one-on-one in your home. No classroom. No quiz. Same
              patient tone as a repair visit, just slower and aimed at what you actually want to learn.
            </p>
            <div className="how-it-works-grid">
              {tutoring.map((c) => (
                <div className="how-it-works-card" key={c.title}>
                  <span className="how-it-works-badge">{c.badge}</span>
                  <h3 className="how-it-works-title">{c.title}</h3>
                  <p className="how-it-works-copy">{c.copy}</p>
                </div>
              ))}
            </div>
            <p className="small" style={{ margin: "22px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              Sessions run about an hour. Simple flat rate — $65 an hour — same whether we&apos;re covering email basics
              or hands-on AI tools. Bring a list; we work through it.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES & PRICING */}
      <section className="section" aria-labelledby="pricing-heading">
        <div className="container">
          <div className="panel">
            <h2 id="pricing-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Services &amp; pricing
            </h2>
            <p className="small" style={{ margin: "0 0 22px", color: "var(--muted)", lineHeight: 1.6 }}>
              Flat rates for the common stuff. Anything not on this list runs hourly at $79/hr (1-hour minimum), or we
              quote it before any work starts. Travel inside Hot Springs / Hot Springs Village / Lake Hamilton is
              included; further out adds a small mileage fee — we&apos;ll tell you before we book.
            </p>

            <h3 className="section-heading" style={{ margin: "0 0 14px", fontSize: "1.05rem" }}>
              Repair, setup &amp; cleanup
            </h3>
            <div className="price-grid">
              {repairPrices.map((p) => (
                <div className="price-card" key={p.tag}>
                  <div className="tag">{p.tag}</div>
                  <div className="price">{p.price}</div>
                  <p className="small">{p.blurb}</p>
                  <ul>
                    {p.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <div className="actions">
                    <Link className={p.gold ? "mini gold" : "mini"} href="/contact">
                      {p.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="section-heading" style={{ margin: "28px 0 14px", fontSize: "1.05rem" }}>
              One-on-one tutoring (including AI)
            </h3>
            <div className="price-grid">
              <div className="price-card">
                <div className="tag">TUTORING · FLAT RATE</div>
                <div className="price">
                  $65<span style={{ fontSize: ".5em", opacity: 0.7 }}>/hr</span>
                </div>
                <p className="small">
                  One simple price for every topic. Book one hour to start, or block out a few hours in a row when
                  you&apos;ve got a real list. Same rate whether we&apos;re covering email basics or hands-on ChatGPT,
                  Copilot, or Gemini.
                </p>
                <ul>
                  <li>AI tools (ChatGPT, Copilot, Gemini, Claude)</li>
                  <li>Computer, phone &amp; tablet basics</li>
                  <li>Email, browsing, video calls</li>
                  <li>Office / Google Docs / Sheets</li>
                  <li>Photos, scam recognition, online safety</li>
                  <li>Written notes you can keep</li>
                  <li>No packs, no contracts, no minimums beyond one hour</li>
                </ul>
                <div className="actions">
                  <Link className="mini gold" href="/contact">
                    Book a Tutoring Session
                  </Link>
                </div>
              </div>
            </div>

            <p className="small" style={{ margin: "22px 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              See the full <Link href="/pricing">pricing page</Link> for web design and the other services.
            </p>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="section" aria-labelledby="why-heading">
        <div className="container">
          <div className="panel">
            <h2 id="why-heading" className="section-heading" style={{ margin: "0 0 14px" }}>
              Why in-home is better than the shop
            </h2>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              Computer shops work fine for some things — major hardware repairs, complicated motherboard surgery, data
              recovery from a dead drive. But for most of what real people actually deal with, the shop model creates more
              problems than it solves.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              You have to unplug your computer, load it into a car, drive it across town, wait three days, get a call you
              can&apos;t hear, come pick it up, and then realize the printer doesn&apos;t work anymore at home because the
              WiFi password changed while you were gone.
            </p>
            <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.6 }}>
              In-home is faster, cheaper for most jobs, and avoids the disconnect. We bring tools, sit down at your
              kitchen table, fix what&apos;s wrong, test it in your environment with your printer and your WiFi, and leave
              when it&apos;s actually working. If your daughter&apos;s laptop needs the same fix, we look at that too.
            </p>
            <p className="small" style={{ margin: "0 0 0", color: "var(--muted)", lineHeight: 1.6 }}>
              We&apos;re based in Hot Springs and serve Hot Springs, Hot Springs Village, Lake Hamilton, Lonsdale, Benton,
              and Malvern. If you&apos;re a little further out, ask — we&apos;ll usually still come.
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
              Pick a time that works.
            </h2>
            <p className="subhead" style={{ margin: "0 auto 22px", maxWidth: "60ch" }}>
              Send what&apos;s going wrong and a couple of days that work for a visit. We&apos;ll confirm a slot back the
              same day. No &quot;we&apos;ll call to schedule&quot; runaround.
            </p>
            <div className="btn-row" style={{ justifyContent: "center" }}>
              <Link className="btn gold btn-cta-primary" href="/contact">
                Book a Visit
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
