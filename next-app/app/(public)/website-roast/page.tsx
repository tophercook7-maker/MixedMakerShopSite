import type { Metadata } from "next";
import Link from "next/link";
import { WebsiteRoastForm } from "@/components/public/WebsiteRoastForm";

const canonical = "https://mixedmakershop.com/website-roast";

export const metadata: Metadata = {
  title: "Free Website Roast | MixedMakerShop",
  description:
    "A practical, human review of your site — trust, clarity, and conversions — from Topher, not a generic auto-audit.",
  alternates: { canonical },
  openGraph: {
    title: "Free website roast | MixedMakerShop",
    description: "Personal feedback on what helps and what hurts — usually within 24–48 hours.",
    url: canonical,
  },
};

export default function WebsiteRoastPage() {
  return (
    <>
      <section className="hero roast-hero">
        <div className="container">
          <h1 className="h1">Straight talk on your website — free</h1>
          <p className="subhead">
            I&apos;ll review your site in plain language: what builds trust, what creates doubt, and what may be costing
            you leads.
          </p>
          <p className="hero-microproof" style={{ margin: "10px 0 0" }}>
            Built for small businesses, contractors, local services, and anyone who depends on their site to bring in
            work.
          </p>
          <div
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            style={{ marginTop: 22 }}
          >
            <a className="btn gold" href="#roast-form">
              Get My Free Roast
            </a>
            <a className="btn ghost" href="#what-i-review">
              See What I Review
            </a>
          </div>
          <div className="trust-line" style={{ marginTop: 18 }}>
            <span>Free review</span>
            <span>No obligation</span>
            <span>Actionable feedback</span>
          </div>
          <p className="small" style={{ margin: "14px 0 0", opacity: 0.88, maxWidth: "52ch", lineHeight: 1.55 }}>
            This is a personal pass from someone who builds sites every week — not a canned AI scorecard or automated
            “SEO audit” PDF.
          </p>
        </div>
      </section>

      <section className="section" id="what-is-roast">
        <div className="container">
          <h2 className="section-heading">What you get</h2>
          <p className="subhead" style={{ margin: "0 0 28px", maxWidth: "65ch" }}>
            A concise review focused on first impression, clarity, and whether visitors can confidently take the next
            step — usually call, text, or book.
          </p>
          <div className="how-it-works-grid roast-cards">
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">First impression</h3>
              <p className="how-it-works-copy">Does the site immediately feel credible and relevant?</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Clarity</h3>
              <p className="how-it-works-copy">Is it obvious what you do, who it&apos;s for, and what to do next?</p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Conversion</h3>
              <p className="how-it-works-copy">Do layout, messaging, and CTAs make action easy on desktop and phone?</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section roast-review-section" id="what-i-review">
        <div className="container">
          <h2 className="section-heading">What I review</h2>
          <p className="subhead" style={{ margin: "0 0 20px", maxWidth: "60ch" }}>
            A practical checklist — not buzzwords.
          </p>
          <div
            className="roast-checklist"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}
          >
            <div className="roast-checklist-item card">
              <span className="roast-checklist-label">Headline clarity</span>
              <p className="small" style={{ margin: "4px 0 0" }}>
                Does the main message match what visitors came for?
              </p>
            </div>
            <div className="roast-checklist-item card">
              <span className="roast-checklist-label">Visual trust</span>
              <p className="small" style={{ margin: "4px 0 0" }}>
                Does the design feel intentional and aligned with your business?
              </p>
            </div>
            <div className="roast-checklist-item card">
              <span className="roast-checklist-label">Calls to action</span>
              <p className="small" style={{ margin: "4px 0 0" }}>
                Are next steps obvious, repeated where it helps, and easy to tap?
              </p>
            </div>
            <div className="roast-checklist-item card">
              <span className="roast-checklist-label">Mobile experience</span>
              <p className="small" style={{ margin: "4px 0 0" }}>
                Does the site hold up on a phone — readability, speed, thumb reach?
              </p>
            </div>
          </div>
          <p className="small" style={{ marginTop: 22, opacity: 0.85, maxWidth: "56ch" }}>
            Want a new direction afterward?{" "}
            <Link href="/free-mockup" className="font-semibold underline-offset-4 hover:underline">
              Get My Free Preview
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="font-semibold underline-offset-4 hover:underline">
              contact me
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="section" id="roast-form">
        <div className="container">
          <div className="panel">
            <h2 style={{ margin: "0 0 14px" }}>Request your roast</h2>
            <p className="subhead" style={{ margin: "0 0 24px" }}>
              Your site URL and email — I&apos;ll follow up personally (typically within 24–48 hours).
            </p>
            <WebsiteRoastForm />
          </div>
        </div>
      </section>
    </>
  );
}
