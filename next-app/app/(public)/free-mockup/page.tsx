import type { Metadata } from "next";
import { FreeMockupFunnelClient } from "@/components/public/free-mockup-funnel-client";

export const metadata: Metadata = {
  title: "See Your Website Preview | MixedMakerShop",
  description:
    "Enter your business info and see an instant sample website preview. Save your preview to get a shareable link.",
  openGraph: {
    title: "See what your business could look like online",
    description: "Instant sample website preview for local businesses.",
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
              See what your business could look like online
            </h1>
            <p className="subhead" style={{ margin: 0 }}>
              Enter your business info and get an instant sample website preview. Adjust a few options, then save to get a
              link you can keep or share.
            </p>
          </div>
        </div>
      </section>
      <FreeMockupFunnelClient />
    </>
  );
}
