import type { Metadata } from "next";
import { FreeMockupFunnelClient } from "@/components/public/free-mockup-funnel-client";

export const metadata: Metadata = {
  title: "Build Your Free Website Mockup | MixedMakerShop",
  description:
    "Start your website mockup in minutes. Save progress and send it when you're ready — a real designer helps you finish with your content, images, and details.",
  openGraph: {
    title: "Build your website mockup — even if you're not ready yet",
    description:
      "Start designing in minutes. Save and send when you're ready for help finishing the build.",
    url: "https://mixedmakershop.com/free-mockup",
  },
  robots: { index: true, follow: true },
};

export default function FreeMockupPage() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: 8 }}>
        <div className="container">
          <div className="hero-copy">
            <h1 className="h1" style={{ marginBottom: 12 }}>
              Build Your Website Mockup — Even If You&apos;re Not Ready Yet
            </h1>
            <p className="subhead" style={{ margin: 0, marginBottom: 20 }}>
              Start designing your site in minutes. Save your progress and send it to me when you&apos;re ready — I&apos;ll
              help you finish the build with your content, images, and details.
            </p>
            <div className="btn-row" style={{ flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
              <a href="#free-mockup-start" className="btn gold">
                Start My Free Mockup
              </a>
            </div>
            <p className="small" style={{ margin: 0, marginBottom: 8, fontWeight: 500 }}>
              No pressure. Start now, finish later.
            </p>
            <p className="small" style={{ color: "var(--muted)", margin: 0, maxWidth: 440, lineHeight: 1.5 }}>
              Built and reviewed by a real web designer — not a generic template builder.
            </p>
            <div
              style={{
                marginTop: 28,
                paddingTop: 24,
                borderTop: "1px solid var(--border)",
                maxWidth: 420,
              }}
            >
              <p className="text-sm font-semibold" style={{ marginBottom: 12 }}>
                How it works
              </p>
              <ol
                className="small"
                style={{
                  margin: 0,
                  paddingLeft: 20,
                  color: "var(--muted)",
                  lineHeight: 1.65,
                  listStyleType: "decimal",
                }}
              >
                <li style={{ marginBottom: 8 }}>Build your mockup</li>
                <li style={{ marginBottom: 8 }}>Save &amp; send it to me</li>
                <li style={{ marginBottom: 0 }}>I help you finish and launch your site</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
      <FreeMockupFunnelClient />
    </>
  );
}
