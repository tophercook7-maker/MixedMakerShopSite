import Link from "next/link";

export const metadata = {
  title: "Topher Web Design | Arkansas Small Business Websites",
  description:
    "Local business websites built for calls and trust — mobile-friendly, click-to-call, forms, Google cleanup, review setup. Starter setups from $400, full business setups from $900, custom builds on quote.",
};

export default function WebDesignPage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div style={{ maxWidth: 860 }}>
            <div className="kicker">
              <span className="dot" /> Topher Web Design
            </div>
            <h1 className="h1">Build a Website That Actually Brings You Calls</h1>
            <p className="subhead">
              Most local businesses don&apos;t have a traffic problem — they have a setup problem. If your website is
              outdated, hard to use on a phone, or confusing to customers, you&apos;re losing work. I fix that.
            </p>
            <p className="hero-microproof">
              No overcomplicated systems. No agency pricing. Just a clean setup focused on trust, clarity, and getting
              your phone to ring.
            </p>
            <div className="btn-row">
              <Link href="/contact" className="btn gold">
                Get My Free Mockup
              </Link>
              <Link href="/website-samples" className="btn ghost">
                View Website Samples
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="what-i-do">
        <div className="container">
          <h2 className="section-heading">What I Do</h2>
          <p className="transformations-subhead" style={{ margin: "0 0 22px" }}>
            I help local businesses get more calls by fixing the online side of things.
          </p>
          <ul className="small" style={{ margin: "0 0 0 20px", maxWidth: 640, color: "var(--muted)", lineHeight: 1.65 }}>
            <li>Clean, mobile-friendly websites</li>
            <li>Click-to-call buttons</li>
            <li>Simple quote/contact forms</li>
            <li>Google profile cleanup</li>
            <li>Review setup to help get more 5-star reviews</li>
          </ul>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="container">
          <h2 className="section-heading">How It Works</h2>
          <div className="how-it-works-grid">
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">1. You tell me about your business</h3>
              <p className="how-it-works-copy">What you do, who you serve, and how people usually try to reach you.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">2. I build your setup</h3>
              <p className="how-it-works-copy">Clean structure, mobile-friendly flow, click-to-call, forms, and trust-ready basics.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">3. You review it</h3>
              <p className="how-it-works-copy">We adjust copy and layout until it matches how you want to show up online.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">4. You start getting more calls</h3>
              <p className="how-it-works-copy">A simpler path from finding you to contacting you — without a bloated build.</p>
            </div>
          </div>
          <p className="small" style={{ marginTop: 20, color: "var(--muted)" }}>
            Most projects are done in 5–7 days.
          </p>
        </div>
      </section>

      <section className="section" id="why-work-with-me">
        <div className="container">
          <h2 className="section-heading">Why Work With Me</h2>
          <div className="trust-points-grid" style={{ marginBottom: 0 }}>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Local</h3>
              <p className="how-it-works-copy">Hot Springs–based, working with businesses here and online.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Simple</h3>
              <p className="how-it-works-copy">Straightforward process, plain language, no fluff.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Affordable</h3>
              <p className="how-it-works-copy">Fair pricing without the agency markup.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Fast turnaround</h3>
              <p className="how-it-works-copy">Momentum matters — most builds ship in about a week.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Focused on real results</h3>
              <p className="how-it-works-copy">Calls, trust, and a setup that actually works on phones.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="container">
          <div className="panel">
            <h2 className="section-heading" style={{ margin: "0 0 10px" }}>
              Simple, Straightforward Pricing
            </h2>
            <p className="subhead" style={{ margin: "0 0 20px" }}>
              Most local businesses don&apos;t need something complicated — they just need a setup that actually brings in
              calls.
            </p>
            <div className="price-grid">
              <div className="price-card">
                <div className="tag">STARTER SETUP</div>
                <h3 className="how-it-works-title" style={{ marginTop: 12, marginBottom: 8 }}>
                  Starter Setup — $400
                </h3>
                <p className="small" style={{ margin: "0 0 10px" }}>
                  Perfect for getting online fast and making it easy for customers to reach you.
                </p>
                <ul className="small">
                  <li>1-page clean website</li>
                  <li>Mobile-friendly design</li>
                  <li>Click-to-call button</li>
                  <li>Contact / quote form</li>
                  <li>Basic Google setup</li>
                  <li>Simple, clear layout</li>
                </ul>
                <p className="small" style={{ marginTop: 14, fontWeight: 700, color: "var(--text)" }}>
                  Best for: small businesses that just need something that works
                </p>
              </div>
              <div className="price-card">
                <div className="tag">BUSINESS SETUP</div>
                <h3 className="how-it-works-title" style={{ marginTop: 12, marginBottom: 8 }}>
                  Business Setup — $900
                </h3>
                <p className="small" style={{ margin: "0 0 10px" }}>
                  For businesses ready to look more professional and bring in more consistent work.
                </p>
                <ul className="small">
                  <li>3–5 page website</li>
                  <li>Service pages</li>
                  <li>Strong call-to-action setup</li>
                  <li>Google profile optimization</li>
                  <li>Review system setup</li>
                  <li>Better structure for conversions</li>
                </ul>
                <p className="small" style={{ marginTop: 14, fontWeight: 700, color: "var(--text)" }}>
                  Best for: businesses that want more calls and better results
                </p>
              </div>
              <div className="price-card">
                <div className="tag">CUSTOM BUILDS</div>
                <h3 className="how-it-works-title" style={{ marginTop: 12, marginBottom: 8 }}>
                  Custom Builds
                </h3>
                <p className="small" style={{ margin: "0 0 10px" }}>
                  For businesses that need something more specific or advanced.
                </p>
                <ul className="small">
                  <li>Custom features</li>
                  <li>Advanced layouts</li>
                  <li>Specialized functionality</li>
                </ul>
                <p className="small" style={{ marginTop: 14, fontWeight: 700, color: "var(--text)" }}>
                  Price depends on the project
                </p>
              </div>
            </div>
            <div
              className="card"
              style={{
                marginTop: 24,
                padding: "20px 18px",
                border: "1px solid var(--border)",
                borderRadius: 16,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <h3 style={{ margin: "0 0 8px", fontSize: "1.15rem", fontWeight: 800 }}>Not sure what you need?</h3>
              <p className="small" style={{ margin: "0 0 16px", color: "var(--muted)" }}>
                I&apos;ll take a quick look at your business and tell you exactly what I&apos;d do — no pressure.
              </p>
              <Link href="/contact" className="btn gold">
                Get My Free Mockup
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="niches">
        <div className="container">
          <h2 className="section-heading">Help by industry</h2>
          <p className="transformations-subhead" style={{ margin: "0 0 22px" }}>
            Same focus on calls and trust — tailored examples for common local categories.
          </p>
          <div className="grid-3">
            <div className="card">
              <h3>Restaurant website design</h3>
              <p className="small">Menu-forward pages that help diners decide fast.</p>
              <Link href="/restaurant-websites-hot-springs" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                Learn more
              </Link>
            </div>
            <div className="card">
              <h3>Church websites</h3>
              <p className="small">Clear service times, ministries, and next steps.</p>
              <Link href="/church-websites-hot-springs" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                Learn more
              </Link>
            </div>
            <div className="card">
              <h3>Coffee shop websites</h3>
              <p className="small">Menu-first flow for locals searching on their phones.</p>
              <Link href="/coffee-shop-websites-hot-springs" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="portfolio">
        <div className="container">
          <h2 className="section-heading">Sample Work</h2>
          <p className="transformations-subhead" style={{ margin: "0 0 24px" }}>
            Examples of clean, conversion-minded layouts for local businesses.
          </p>
          <div className="grid-2">
            <div className="card">
              <p className="small" style={{ marginBottom: 6, letterSpacing: ".08em", textTransform: "uppercase" }}>
                Coffee Shop
              </p>
              <h3 style={{ margin: "0 0 8px" }}>Bean Bliss Concept</h3>
              <p className="small">Built for local cafes that need better menu visibility and faster ordering actions.</p>
              <Link href="/website-samples/bean-bliss" className="btn ghost" style={{ alignSelf: "flex-start", marginTop: 12 }}>
                View Live Preview
              </Link>
            </div>
            <div className="card">
              <p className="small" style={{ marginBottom: 6, letterSpacing: ".08em", textTransform: "uppercase" }}>
                Service Business
              </p>
              <h3 style={{ margin: "0 0 8px" }}>Diamond Plumbing</h3>
              <p className="small">Structured for urgent calls, trust-building proof, and straightforward service requests.</p>
              <Link href="/website-samples/diamond-plumbing" className="btn ghost" style={{ alignSelf: "flex-start", marginTop: 12 }}>
                View Live Preview
              </Link>
            </div>
            <div className="card">
              <p className="small" style={{ marginBottom: 6, letterSpacing: ".08em", textTransform: "uppercase" }}>
                Restaurant
              </p>
              <h3 style={{ margin: "0 0 8px" }}>Southern Diner Concept</h3>
              <p className="small">Designed for menu-first browsing and stronger reservation or call-through flow.</p>
              <Link href="/website-samples/southern-diner-concept" className="btn ghost" style={{ alignSelf: "flex-start", marginTop: 12 }}>
                View Live Preview
              </Link>
            </div>
            <div className="card">
              <p className="small" style={{ marginBottom: 6, letterSpacing: ".08em", textTransform: "uppercase" }}>
                Church
              </p>
              <h3 style={{ margin: "0 0 8px" }}>Grace Fellowship Church</h3>
              <p className="small">Clear service times and welcoming next steps for first-time visitors and families.</p>
              <Link href="/website-samples/grace-fellowship-church" className="btn ghost" style={{ alignSelf: "flex-start", marginTop: 12 }}>
                View Live Preview
              </Link>
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <Link href="/website-samples" className="btn ghost">
              View Website Samples
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="final-cta">
        <div className="container">
          <div className="panel">
            <h2 style={{ margin: "0 0 10px" }}>Want Me to Take a Look at Your Business?</h2>
            <p className="subhead" style={{ margin: "0 0 14px" }}>
              I&apos;ll show you exactly what I&apos;d fix — no pressure.
            </p>
            <div className="btn-row">
              <Link href="/contact" className="btn gold">
                Get My Free Mockup
              </Link>
              <Link href="/contact" className="btn ghost">
                Contact Topher
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
