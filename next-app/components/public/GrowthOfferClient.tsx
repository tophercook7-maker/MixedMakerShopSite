"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Globe2,
  MapPin,
  Megaphone,
  PhoneOff,
  Radio,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";

const CTA_HREF = "/free-mockup";

function OfferCtaPrimary({ className = "" }: { className?: string }) {
  return (
    <Link href={CTA_HREF} className={`btn gold offer-cta-primary ${className}`.trim()}>
      Get My Free Website Preview
    </Link>
  );
}

function OfferCtaGhost({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`btn ghost offer-cta-ghost ${className}`.trim()}>
      {children}
    </Link>
  );
}

export function GrowthOfferClient() {
  return (
    <div className="offer-page">
      {/* 1 Hero */}
      <section className="section offer-band offer-band--hero">
        <div className="offer-hero-bg" aria-hidden="true">
          <span className="offer-orb offer-orb--a" />
          <span className="offer-orb offer-orb--b" />
          <span className="offer-grid-texture" />
        </div>
        <div className="offer-shell offer-hero-grid">
          <div className="offer-hero-copy">
            <p className="offer-kicker offer-reveal-line">
              <Sparkles className="offer-kicker-icon" aria-hidden />
              Website + growth system
            </p>
            <h1 className="offer-hero-title offer-section-title">A website alone won&apos;t grow your business.</h1>
            <p className="offer-lead offer-reveal-line">
              Most businesses build a site and then wonder why nothing happens. No traffic. No calls. No real growth.
            </p>
            <p className="offer-body offer-reveal-line">
              What actually works is a complete system — website, SEO, Google Business optimization, updates, and content
              that keep your business visible and growing.
            </p>
            <div className="offer-hero-actions offer-reveal-line">
              <OfferCtaPrimary />
              <OfferCtaGhost href="#included">See What&apos;s Included</OfferCtaGhost>
            </div>
          </div>
          <div className="offer-hero-visual" aria-hidden="true">
            <div className="offer-hero-glow" />
            <div className="offer-mock-stack">
              <div className="offer-browser-card offer-browser-card--back" />
              <div className="offer-browser-card offer-browser-card--mid" />
              <div className="offer-browser-card offer-browser-card--front">
                <div className="offer-browser-chrome">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="offer-browser-body">
                  <div className="offer-browser-line offer-browser-line--long" />
                  <div className="offer-browser-line" />
                  <div className="offer-browser-blocks">
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>
            <div className="offer-stat-cluster">
              <div className="offer-stat-pill">
                <span className="offer-stat-dot" />
                Local visibility
              </div>
              <div className="offer-stat-pill offer-stat-pill--accent">
                <TrendingUp className="offer-stat-icon" aria-hidden />
                Growth trend
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 Problem */}
      <section className="section offer-band offer-band--slate" id="problem">
        <div className="offer-shell">
          <h2 className="offer-section-title offer-h2">Why most websites go nowhere</h2>
          <p className="offer-intro offer-reveal-line">
            Most businesses build a site and then stop. That usually leads to stalled growth — because a website by itself
            often just sits there.
          </p>
          <div className="offer-problem-grid">
            <article className="offer-card offer-problem-card offer-card--problem">
              <div className="offer-card-icon-wrap offer-card-icon-wrap--problem">
                <TrendingDown className="offer-card-icon" aria-hidden />
              </div>
              <h3 className="offer-card-title">No traffic</h3>
              <p className="offer-card-text">Nothing steady coming in — the site isn&apos;t being found or remembered.</p>
            </article>
            <article className="offer-card offer-problem-card offer-card--problem">
              <div className="offer-card-icon-wrap offer-card-icon-wrap--problem">
                <PhoneOff className="offer-card-icon" aria-hidden />
              </div>
              <h3 className="offer-card-title">No calls</h3>
              <p className="offer-card-text">Visitors don&apos;t convert — weak trust, weak next steps, or the wrong traffic.</p>
            </article>
            <article className="offer-card offer-problem-card offer-card--problem">
              <div className="offer-card-icon-wrap offer-card-icon-wrap--problem">
                <BarChart3 className="offer-card-icon" aria-hidden />
              </div>
              <h3 className="offer-card-title">No real growth</h3>
              <p className="offer-card-text">Without ongoing work, rankings and momentum fade — competitors move past you.</p>
            </article>
          </div>
        </div>
      </section>

      {/* 3 System */}
      <section className="section offer-band offer-band--deep" id="system">
        <div className="offer-band-accent-line" aria-hidden />
        <div className="offer-shell">
          <h2 className="offer-section-title offer-h2">What actually works is a complete system</h2>
          <p className="offer-intro offer-reveal-line">
            One coordinated package — not a random one-off website with no follow-through.
          </p>
          <div className="offer-system-grid">
            {[
              { icon: Globe2, title: "A clean, high-converting website", text: "Built to guide visitors toward contact — fast on phones, clear on desktop." },
              { icon: Search, title: "Ongoing SEO", text: "So the right people can actually find you when they search." },
              { icon: MapPin, title: "Google Business optimization", text: "Your profile working harder — categories, photos, and signals that match how locals search." },
              { icon: Radio, title: "Staying active in local search", text: "Consistency beats silence — activity helps you stay visible over time." },
              { icon: Megaphone, title: "Ads & content support", text: "Lightweight promotion and messaging so things keep moving — without chaos." },
              { icon: Sparkles, title: "Simple posts you can use", text: "Ideas and formats you can publish without overthinking every caption." },
            ].map((item, i) => (
              <article key={item.title} className="offer-card offer-system-card">
                <div className="offer-system-index" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="offer-card-icon-wrap offer-card-icon-wrap--system">
                  <item.icon className="offer-card-icon" aria-hidden />
                </div>
                <h3 className="offer-card-title">{item.title}</h3>
                <p className="offer-card-text">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Pricing */}
      <section className="section offer-band offer-band--pricing" id="pricing">
        <div className="offer-shell">
          <h2 className="offer-section-title offer-h2">Simple pricing. Real growth.</h2>
          <p className="offer-intro offer-reveal-line">
            No guessing. No piecing things together. Just a simple system that helps bring in more customers over time.
          </p>
          <div className="offer-pricing-row">
            <article className="offer-card offer-pricing-card">
              <p className="offer-price-label">One-time</p>
              <p className="offer-price">$600</p>
              <p className="offer-price-sub">Website build</p>
              <p className="offer-card-text">A focused site structured for trust, clarity, and conversions — mobile-first.</p>
            </article>
            <article className="offer-card offer-pricing-card offer-pricing-card--featured">
              <p className="offer-price-badge">Where growth happens</p>
              <p className="offer-price-label">Monthly</p>
              <p className="offer-price">$89</p>
              <p className="offer-price-sub">/ month · keep everything working</p>
              <p className="offer-card-text">
                SEO, Google Business attention, light ads/content help, and usable posts — so your presence doesn&apos;t go
                quiet after launch.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* 5 Included */}
      <section className="section offer-band offer-band--slate" id="included">
        <div className="offer-shell">
          <h2 className="offer-section-title offer-h2">What you actually get</h2>
          <p className="offer-intro offer-reveal-line">
            Most businesses either build a site and stop, or pay different people for every piece. This keeps it simple.
          </p>
          <div className="offer-included-grid">
            <article className="offer-card offer-included-card">
              <h3 className="offer-included-heading">Website build</h3>
              <ul className="offer-checklist">
                {["Clean layout that fits your business", "Mobile-friendly design", "Strong calls to action", "Built to convert, not just look pretty"].map((t) => (
                  <li key={t}>
                    <Check className="offer-check-icon" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </article>
            <article className="offer-card offer-included-card offer-included-card--accent">
              <h3 className="offer-included-heading">Monthly growth support</h3>
              <ul className="offer-checklist">
                {[
                  "Ongoing SEO work",
                  "Google Business optimization",
                  "Simple ad / content support",
                  "Posts you can actually use",
                  "Visibility improvements over time",
                ].map((t) => (
                  <li key={t}>
                    <Check className="offer-check-icon" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* 6 Compare */}
      <section className="section offer-band offer-band--deep">
        <div className="offer-shell">
          <h2 className="offer-section-title offer-h2">Why businesses struggle when they only build the site</h2>
          <div className="offer-compare-grid">
            <article className="offer-card offer-compare-card offer-compare-card--bad">
              <h3 className="offer-compare-title">
                <X className="offer-compare-title-icon" aria-hidden />
                Website only
              </h3>
              <ul className="offer-compare-list">
                {["Site goes live", "Nobody updates it", "No SEO work", "No Google momentum", "No support", "No real growth"].map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
            <article className="offer-card offer-compare-card offer-compare-card--good">
              <h3 className="offer-compare-title">
                <Check className="offer-compare-title-icon" aria-hidden />
                Complete package
              </h3>
              <ul className="offer-compare-list">
                {[
                  "Website is built right",
                  "SEO keeps improving",
                  "Google presence gets attention",
                  "Content keeps things active",
                  "Support month to month",
                  "Room to grow over time",
                ].map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* 7 Mockup CTA */}
      <section className="section offer-band offer-band--cta-mid">
        <div className="offer-cta-mid-glow" aria-hidden />
        <div className="offer-shell offer-cta-mid-inner">
          <h2 className="offer-section-title offer-h2 offer-h2--light">Want to see what your business could look like?</h2>
          <p className="offer-cta-mid-body offer-reveal-line">
            I can put together a quick example showing how your website could look and how it could help bring in more
            customers. No pressure — just something to help you see what&apos;s possible.
          </p>
          <OfferCtaPrimary className="offer-cta-large" />
        </div>
      </section>

      {/* 8 Final CTA */}
      <section className="section offer-band offer-band--final">
        <div className="offer-shell offer-final-inner">
          <h2 className="offer-section-title offer-h2 offer-h2--light">Stop piecing everything together.</h2>
          <p className="offer-final-lead offer-reveal-line">Get a website that actually works for your business.</p>
          <OfferCtaPrimary className="offer-cta-large" />
          <p className="offer-final-note offer-reveal-line">
            Built for local businesses that want more calls, more customers, and a stronger online presence.
          </p>
          <Link href={CTA_HREF} className="offer-inline-link">
            Get started <ArrowRight className="offer-inline-link-icon" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
