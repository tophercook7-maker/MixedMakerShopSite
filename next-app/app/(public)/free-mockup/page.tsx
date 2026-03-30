import type { Metadata } from "next";
import { FreeMockupFunnelClient } from "@/components/public/free-mockup-funnel-client";

export const metadata: Metadata = {
  title: "Get Your Free Website Mockup | MixedMakerShop",
  description:
    "Request a free custom homepage mockup for your small business — see what your new site could look like before you commit.",
  openGraph: {
    title: "Get Your Free Website Mockup | MixedMakerShop",
    description:
      "I'll design a custom homepage preview so you can see the difference before you decide. Low pressure, no obligation.",
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
              Get Your Free Website Mockup
            </h1>
            <p className="subhead" style={{ margin: 0, marginBottom: 20 }}>
              I&apos;ll design a custom homepage for your business so you can see exactly what your new site could look like
              — before you commit to anything.
            </p>
            <div className="btn-row" style={{ flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
              <a href="#free-mockup-start" className="btn gold">
                Get My Free Mockup
              </a>
            </div>
            <p className="small" style={{ margin: 0, marginBottom: 8, fontWeight: 500 }}>
              No pressure. No obligation. Just a real preview of your future site.
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
