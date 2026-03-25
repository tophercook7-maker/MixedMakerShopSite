import Link from "next/link";

export const metadata = {
  title: "Work With Topher | Websites That Bring In Customers | MixedMakerShop",
  description:
    "Website + SEO + Google Business + ongoing support. Starter Website $400, Growth System ($600 + from $89/mo), or custom builds — Hot Springs, AR and nationwide.",
};

export default function WebDesignPage() {
  return (
    <div className="web-design-page web-design-page--immersive">
      <div className="web-design-page__bg" aria-hidden />
      <div className="web-design-page__veil" aria-hidden />
      <div className="web-design-page__inner">
      {/* 1. Hero */}
      <section className="hero wd-hero wd-motion-scope wd-hero--immersive">
        <div className="container">
          <div className="hero-copy wd-hero-copy">
            <div className="kicker">
              <span className="dot" /> Work With Topher
            </div>
            <h1 className="h1">Websites that actually bring in customers</h1>
            <p className="subhead">
              Not just a website — a system with SEO, Google Business optimization, and ongoing support to help your
              business get found and grow.
            </p>
            <div className="btn-row">
              <Link href="/free-mockup" className="btn gold">
                Get My Free Website Preview
              </Link>
              <Link href="#pricing" className="btn ghost">
                See Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem */}
      <section className="section" id="problem">
        <div className="container">
          <h2 className="section-heading">Most websites don&apos;t work.</h2>
          <p className="wd-lead wd-lead--narrow">
            Most businesses build a website and expect it to bring in customers.
          </p>
          <p className="wd-lead wd-lead--narrow wd-lead--spaced">But nothing happens.</p>
          <div className="how-it-works-grid wd-problem-cards">
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">No traffic</h3>
              <p className="how-it-works-copy">People aren&apos;t finding you when they search.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">No calls</h3>
              <p className="how-it-works-copy">Visitors don&apos;t know what to do next — so they leave.</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">No visibility</h3>
              <p className="how-it-works-copy">Your Google presence and messaging don&apos;t build trust.</p>
            </div>
          </div>
          <p className="wd-punch">Because a website alone isn&apos;t enough.</p>
        </div>
      </section>

      {/* 3. Solution */}
      <section className="section" id="solution">
        <div className="container">
          <h2 className="section-heading">What actually works instead</h2>
          <p className="wd-lead">You don&apos;t just need a website.</p>
          <p className="wd-lead">You need a system that keeps your business visible and active.</p>
          <ul className="wd-scan-list">
            <li>A clean, high-converting website</li>
            <li>SEO so people can find you</li>
            <li>Google Business optimization</li>
            <li>Ongoing updates and activity</li>
            <li>Content and ads to keep things moving</li>
          </ul>
          <p className="wd-punch wd-punch--after-list">That&apos;s what I build.</p>
        </div>
      </section>

      {/* 4. Pricing */}
      <section className="section web-design-pricing" id="pricing">
        <div className="container">
          <div className="panel">
            <h2 className="section-heading">Simple pricing. Real growth.</h2>
            <p className="subhead web-design-pricing-intro">
              Three ways to work together — start lean, go all-in with growth support, or go custom.
            </p>
            <div className="price-grid">
              <div className="price-card">
                <div className="tag">STARTER</div>
                <h3 className="price-card__title price-card__title--first">
                  Starter Website — <span className="price-card__title-price">$400</span>
                </h3>
                <p className="small price-card__blurb">
                  Get online the right way: clear layout, mobile-friendly, easy for customers to reach you.
                </p>
                <ul className="small">
                  <li>1–3 page website</li>
                  <li>Mobile-friendly + click-to-call</li>
                  <li>Contact / quote form</li>
                  <li>Basic SEO + Google Business connection</li>
                </ul>
              </div>
              <div className="price-card price-card--featured">
                <div className="tag">GROWTH SYSTEM</div>
                <h3 className="price-card__title price-card__title--first">
                  Growth System — <span className="price-card__title-price">$600</span>
                  <span className="price-card__title-plus"> + starting at </span>
                  <span className="price-card__title-price">$89/month</span>
                </h3>
                <p className="small price-card__blurb price-card__blurb--mid">
                  Full website plus the ongoing work that keeps you competitive — not a one-and-done launch.
                </p>
                <ul className="small">
                  <li>Full website build</li>
                  <li>Stronger SEO + Google Business optimization</li>
                  <li>Structure built for calls and conversions</li>
                  <li>Content / ad support as you grow</li>
                </ul>
                <div className="price-card__monthly-block">
                  <p className="price-card__monthly-label">What the $89/month includes:</p>
                  <ul>
                    <li>SEO improvements</li>
                    <li>Google Business updates</li>
                    <li>Content + ads</li>
                    <li>Ongoing optimization</li>
                  </ul>
                </div>
              </div>
              <div className="price-card">
                <div className="tag">CUSTOM</div>
                <h3 className="price-card__title price-card__title--first">Custom Builds</h3>
                <p className="small price-card__blurb price-card__blurb--narrow">
                  Larger sites, custom features, or branding-heavy projects — scoped to what you need.
                </p>
                <ul className="small">
                  <li>Custom layouts &amp; advanced features</li>
                  <li>Specialized functionality</li>
                  <li>Bigger structures &amp; integrations</li>
                </ul>
                <p className="price-card__foot">Price depends on the project</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why monthly */}
      <section className="section" id="why-monthly">
        <div className="container">
          <h2 className="section-heading">Why the monthly matters</h2>
          <div className="wd-monthly-body">
            <p>A website without ongoing work won&apos;t bring in customers.</p>
            <p>
              Search rankings shift. Competitors post and update. Your Google Business profile needs fresh activity.
              Without steady SEO and visibility work, even a good site goes quiet.
            </p>
            <p>
              The monthly piece keeps your business <strong className="wd-em">showing up</strong> and{" "}
              <strong className="wd-em">looking active</strong> — so you&apos;re not starting from zero every year.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Process */}
      <section className="section" id="process">
        <div className="container">
          <h2 className="section-heading">Simple process</h2>
          <div className="wd-process-grid">
            <div className="how-it-works-card">
              <p className="how-it-works-badge">Step 1</p>
              <h3 className="how-it-works-title">I review your business</h3>
              <p className="how-it-works-copy">
                What you offer, who you serve, and how people should get in touch — so the plan matches reality.
              </p>
            </div>
            <div className="how-it-works-card">
              <p className="how-it-works-badge">Step 2</p>
              <h3 className="how-it-works-title">I build your site</h3>
              <p className="how-it-works-copy">
                Clean structure, mobile-first flow, and clear next steps so visitors can become calls.
              </p>
            </div>
            <div className="how-it-works-card">
              <p className="how-it-works-badge">Step 3</p>
              <h3 className="how-it-works-title">We improve and grow it</h3>
              <p className="how-it-works-copy">
                SEO, Google presence, and ongoing tweaks — so your visibility doesn&apos;t stall after launch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="section" id="cta">
        <div className="container">
          <div className="wd-cta-panel">
            <h2 className="section-heading">Not sure what you need?</h2>
            <p className="wd-lead">
              I&apos;ll take a quick look at your business and tell you exactly what I&apos;d recommend — no pressure.
            </p>
            <Link href="/free-mockup" className="btn gold">
              Get My Free Website Preview
            </Link>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
