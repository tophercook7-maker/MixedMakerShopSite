import Link from "next/link";

export const metadata = {
  title: "Topher Web Design | Arkansas Small Business Websites",
  description:
    "Work directly with Topher Cook for clean, modern small-business websites built to improve trust, calls, and conversions.",
};

export default function WebDesignPage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div style={{ maxWidth: 860 }}>
            <div className="kicker"><span className="dot" /> Topher Web Design</div>
            <h1 className="h1">Topher Web Design</h1>
            <p className="subhead">
              Websites for small businesses that need more trust, more calls, and a cleaner online presence.
            </p>
            <p className="hero-microproof">
              Work directly with Topher Cook from start to finish. No agency layers, no confusing process, just a
              clean modern site built to help your business look legit and make it easier for customers to contact you.
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

      <section className="section" id="why-work-with-topher">
        <div className="container">
          <h2 className="section-heading">Why work with Topher?</h2>
          <p className="transformations-subhead" style={{ margin: "0 0 28px" }}>
            I build websites for small businesses that want something clear, modern, and easy for customers to use.
            You work directly with me from start to finish, so things stay simple, communication stays clear, and your
            site gets built around what your business actually needs.
          </p>
          <div className="trust-points-grid" style={{ marginBottom: 0 }}>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Direct communication from start to finish</h3>
              <p className="how-it-works-copy">No handoffs, no layers, no confusion.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Clean, modern design without the fluff</h3>
              <p className="how-it-works-copy">Every section has a purpose and supports your goal.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Built for real businesses, not just looks</h3>
              <p className="how-it-works-copy">Designed to improve trust and make contacting you easier.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Simple process and fast momentum</h3>
              <p className="how-it-works-copy">You get clarity quickly and steady progress without complexity.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="services">
        <div className="container">
          <h2 className="section-heading">What I can build for you</h2>
          <p className="transformations-subhead" style={{ margin: "0 0 22px" }}>
            Whether you need a simple business site, a redesign, or a focused landing page, I can help you create a
            site that looks better and makes it easier for customers to trust and contact you.
          </p>
          <div className="grid-3">
            <div className="card">
              <h3>Small Business Websites</h3>
              <p className="small">Clear service pages and contact flow for local businesses that need trust fast.</p>
            </div>
            <div className="card">
              <h3>Website Redesigns</h3>
              <p className="small">Refresh outdated sites with cleaner structure, stronger copy, and better UX.</p>
            </div>
            <div className="card">
              <h3>Landing Pages</h3>
              <p className="small">Focused one-page builds for offers, campaigns, and lead generation.</p>
            </div>
            <div className="card">
              <h3>Restaurant website design</h3>
              <p className="small">Menu-forward pages that help diners quickly decide and contact or visit.</p>
              <Link href="/restaurant-websites-hot-springs" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                Learn more
              </Link>
            </div>
            <div className="card">
              <h3>Church websites</h3>
              <p className="small">Welcoming layouts with clear service times, ministries, and next steps.</p>
              <Link href="/church-websites-hot-springs" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                Learn more
              </Link>
            </div>
            <div className="card">
              <h3>Coffee shop websites</h3>
              <p className="small">Menu-first sites that make ordering, visiting, and local discovery easier.</p>
              <Link href="/coffee-shop-websites-hot-springs" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="container">
          <div className="panel">
            <h2 style={{ margin: "0 0 10px" }}>Simple Pricing</h2>
            <p className="subhead" style={{ margin: "0 0 14px" }}>
              Every project is different, but these ranges help set expectations. Contact me and I&apos;ll point you in
              the right direction.
            </p>
            <div className="price-grid">
              <div className="price-card">
                <div className="tag">STARTER SITE</div>
                <div className="price">From $300</div>
                <p className="small">
                  A simple, clean website for businesses that need a professional online presence fast.
                </p>
              </div>
              <div className="price-card">
                <div className="tag">BUSINESS SITE</div>
                <div className="price">From $500</div>
                <p className="small">
                  A more complete website with multiple sections, stronger messaging, and a polished presentation.
                </p>
              </div>
              <div className="price-card">
                <div className="tag">CUSTOM BUILD</div>
                <div className="price">Custom Quote</div>
                <p className="small">For businesses that need something more tailored, niche, or feature-specific.</p>
              </div>
            </div>
            <div className="btn-row" style={{ marginTop: 16 }}>
              <Link href="/contact" className="btn gold">
                Ask About Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="container">
          <h2 className="section-heading">How it works</h2>
          <div className="how-it-works-grid">
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">1. Tell me what you need</h3>
              <p className="how-it-works-copy">
                Share your business, your goals, and what kind of site you want.
              </p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">2. I mock up the direction</h3>
              <p className="how-it-works-copy">
                I put together a clean direction so you can see where the site is going before we refine it.
              </p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">3. We refine and launch</h3>
              <p className="how-it-works-copy">
                We make it better, tighten the details, and get your website ready to go live.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="portfolio">
        <div className="container">
          <h2 className="section-heading">Sample Work</h2>
          <p className="transformations-subhead" style={{ margin: "0 0 24px" }}>
            A few examples of the kinds of websites I can build for small businesses.
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
            <h2 style={{ margin: "0 0 10px" }}>Need a better website?</h2>
            <p className="subhead" style={{ margin: "0 0 14px" }}>
              If your business needs a cleaner online presence, I can help you create something modern, clear, and
              easier for customers to trust.
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
