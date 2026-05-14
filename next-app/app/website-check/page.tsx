import type { Metadata } from "next";
import Link from "next/link";
import { WebsiteRoastForm } from "@/components/public/WebsiteRoastForm";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";

const canonical = "https://mixedmakershop.com/website-check";

export const metadata: Metadata = {
  title: "Free Website Roast | MixedMakerShop",
  description:
    "A practical, human review of your site — trust, clarity, and conversions — from Topher, not a generic auto-audit.",
  alternates: { canonical },
};

export default function WebsiteCheckPage() {
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
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center" style={{ marginTop: 22 }}>
            <a className="btn gold" href="#roast-form">
              Get My Free Roast
            </a>
            <Link className="btn ghost" href="/website-roast">
              See Full Roast Page
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="what-i-review">
        <div className="container">
          <h2 className="section-heading">What I review</h2>
          <p className="subhead" style={{ margin: "0 0 20px", maxWidth: "60ch" }}>
            A practical checklist: headline clarity, visual trust, calls to action, mobile experience, and whether a
            visitor can confidently take the next step.
          </p>
          <p className="small" style={{ marginTop: 22, opacity: 0.85, maxWidth: "56ch" }}>
            Want a new direction afterward?{" "}
            <Link href={publicFreeMockupFunnelHref} className="font-semibold underline-offset-4 hover:underline">
              Get My Free Preview
            </Link>{" "}
            or{" "}
            <Link href="/contact.html" className="font-semibold underline-offset-4 hover:underline">
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
              Your site URL and email — I&apos;ll follow up personally, typically within 24–48 hours.
            </p>
            <WebsiteRoastForm />
          </div>
        </div>
      </section>
    </>
  );
}
