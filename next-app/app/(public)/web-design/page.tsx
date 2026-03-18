import Link from "next/link";

export const metadata = {
  title: "Topher Web Design | Arkansas Small Business Websites",
  description:
    "Topher Web Design builds clean, simple websites for Arkansas small businesses that turn visitors into customers.",
};

export default function WebDesignPage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div style={{ maxWidth: 860 }}>
            <div className="kicker"><span className="dot" /> Topher Web Design</div>
            <h1 className="h1">Websites That Make Your Business Look Legit and Get More Calls</h1>
            <p className="subhead">
              I build clean, simple websites for small businesses in Arkansas that actually turn visitors into
              customers.
            </p>
            <div className="btn-row">
              <Link href="/contact" className="btn gold">
                Get My Free Website Draft
              </Link>
              <Link href="/website-samples" className="btn ghost">
                View Website Examples
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="problem-solution">
        <div className="container">
          <h2 className="section-heading">Problem / Solution</h2>
          <p className="transformations-subhead" style={{ margin: "0 0 28px" }}>
            Most small business websites lose leads because they are confusing or outdated. This process fixes that.
          </p>
          <div className="how-it-works-grid">
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Problem: unclear messaging</h3>
              <p className="how-it-works-copy">Visitors leave when they cannot quickly tell what you do.</p>
              <p className="small" style={{ color: "var(--gold2)", margin: 0 }}>
                Solution: clear structure and direct service copy.
              </p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Problem: weak mobile experience</h3>
              <p className="how-it-works-copy">Most local traffic comes from phones, but many sites are hard to use.</p>
              <p className="small" style={{ color: "var(--gold2)", margin: 0 }}>
                Solution: mobile-first pages built for calls and form submissions.
              </p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Problem: low trust first impression</h3>
              <p className="how-it-works-copy">Outdated design makes good businesses look unreliable.</p>
              <p className="small" style={{ color: "var(--gold2)", margin: 0 }}>
                Solution: a clean, modern website that feels credible on first click.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="sample-showcase">
        <div className="container">
          <h2 className="section-heading">Sample Showcase</h2>
          <p className="transformations-subhead" style={{ margin: "0 0 22px" }}>
            See category-specific examples built for real sales conversations.
          </p>
          <div className="grid-2">
            <div className="card">
              <h3>Restaurant website design</h3>
              <p className="small">Menu-forward pages with stronger calls-to-action and first-impression clarity.</p>
              <Link href="/restaurant-websites-hot-springs" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                Learn more
              </Link>
            </div>
            <div className="card">
              <h3>Small business websites</h3>
              <p className="small">Clean service pages that help visitors understand and take the next step quickly.</p>
              <Link href="/small-business-websites-hot-springs" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                Learn more
              </Link>
            </div>
            <div className="card">
              <h3>Church websites</h3>
              <p className="small">Clear service times, events, and next-step paths for visitors and members.</p>
              <Link href="/church-websites-hot-springs" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                Learn more
              </Link>
            </div>
            <div className="card">
              <h3>Coffee shop websites</h3>
              <p className="small">Menu, location, and mobile clarity designed to increase local walk-ins.</p>
              <Link href="/coffee-shop-websites-hot-springs" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                Learn more
              </Link>
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: 18 }}>
            <Link href="/website-samples" className="btn ghost">
              View Website Examples
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="why-choose-me">
        <div className="container">
          <h2 className="section-heading">Why Choose Me</h2>
          <p className="transformations-subhead" style={{ margin: "0 0 28px" }}>
            You work directly with one person focused on outcomes, not agency overhead.
          </p>
          <div className="trust-points-grid">
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Direct communication</h3>
              <p className="how-it-works-copy">No handoff chain, no confusion. You work directly with Topher.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Conversion-focused decisions</h3>
              <p className="how-it-works-copy">Every section is designed to guide visitors toward contacting you.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Practical speed</h3>
              <p className="how-it-works-copy">Clean execution, quick feedback loops, and straightforward next steps.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="container">
          <div className="panel">
            <h2 style={{ margin: "0 0 10px" }}>Simple Pricing</h2>
            <p className="subhead" style={{ margin: "0 0 14px" }}>
              Clear options so you know what to expect before we start.
            </p>
            <div className="price-grid">
              <div className="price-card">
                <div className="tag">STARTER WEBSITE</div>
                <div className="price">$300-$500</div>
                <p className="small">Ideal for one-page or starter sites with clear core messaging.</p>
              </div>
              <div className="price-card">
                <div className="tag">STANDARD WEBSITE</div>
                <div className="price">$600-$900</div>
                <p className="small">Best for full small-business websites with stronger conversion structure.</p>
              </div>
              <div className="price-card">
                <div className="tag">HOSTING & SUPPORT</div>
                <div className="price">$89/mo</div>
                <p className="small">For continued updates, maintenance, and dependable support.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="final-cta">
        <div className="container">
          <div className="panel">
            <h2 style={{ margin: "0 0 10px" }}>Ready to upgrade your website?</h2>
            <p className="subhead" style={{ margin: "0 0 14px" }}>
              Start with a free website draft and a clear direction for your business.
            </p>
            <div className="btn-row">
              <Link href="/contact" className="btn gold">
                Get My Free Website Draft
              </Link>
              <Link href="/website-samples" className="btn ghost">
                View Website Examples
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
