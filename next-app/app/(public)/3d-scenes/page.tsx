import type { Metadata } from "next";
import Link from "next/link";
import { SocialPostCard } from "@/components/public/social-post-card";
import { THREE_D_SCENES } from "@/lib/three-d-scenes";
import { publicTopherPhoneDisplay, publicTopherPhoneTel } from "@/lib/public-brand";

export const metadata: Metadata = {
  alternates: { canonical: "https://mixedmakershop.com/3d-scenes" },
  title: "3D Pop-Out Scenes | Scroll-Stopping Video Ads | MixedMakerShop",
  description:
    "A gallery of 3D pop-out video ads — water, fire, money, confetti and more bursting out of the page — built as ready-to-post Facebook & Instagram posts for local businesses.",
};

export default function ThreeDScenesPage() {
  return (
    <section className="section" style={{ paddingTop: 32 }}>
      <div className="container" style={{ textAlign: "center" }}>
        <div className="small" style={{ letterSpacing: ".12em", opacity: 0.8, marginBottom: 8 }}>
          3D POP-OUT SCENES • SCROLL-STOPPING VIDEO ADS
        </div>
        <h1 className="h1" style={{ marginBottom: 16 }}>
          Pop-out video ads that stop the scroll
        </h1>
        <p className="subhead" style={{ maxWidth: 680, margin: "0 auto 6px" }}>
          Real effects burst out of the page — water, fire, money, confetti — while your text stays
          flat and readable. Each one is built as a ready-to-post Facebook &amp; Instagram ad.
        </p>
        <p className="small" style={{ color: "var(--muted)", marginBottom: 4 }}>
          {THREE_D_SCENES.length} scenes and growing · scroll the feed below 👇
        </p>
      </div>

      {/* Masonry feed of social-post cards */}
      <div className="container" style={{ marginTop: 28 }}>
        <div
          style={{
            columnWidth: 360,
            columnGap: 20,
            maxWidth: 1160,
            margin: "0 auto",
          }}
        >
          {THREE_D_SCENES.map((scene) => (
            <div key={scene.id} style={{ marginBottom: 20, breakInside: "avoid" }}>
              <SocialPostCard scene={scene} />
            </div>
          ))}
        </div>
      </div>

      <div className="container" style={{ textAlign: "center", marginTop: 36 }}>
        <h2 className="h2" style={{ marginBottom: 12 }}>
          Want one for your business?
        </h2>
        <p className="subhead" style={{ maxWidth: 620, margin: "0 auto 20px", color: "var(--muted)" }}>
          Send us your logo, menu, product, or website and we&apos;ll make your own pop-out ad —
          ready to post on Facebook and Instagram or drop onto your site.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <Link href="/contact" className="btn gold">
            Get my pop-out ad
          </Link>
          <Link href="/3docean" className="btn">
            See the full-screen ocean demo
          </Link>
        </div>
        <p className="small" style={{ marginTop: 20, color: "var(--muted)" }}>
          Or call / text{" "}
          <a href={publicTopherPhoneTel} style={{ color: "var(--gold)", fontWeight: 600 }}>
            {publicTopherPhoneDisplay}
          </a>{" "}
          — we&apos;ll show you a free mockup first.
        </p>
        <hr className="hr" style={{ margin: "28px auto", maxWidth: 680 }} />
        <Link href="/" className="btn">
          ← Back to MixedMakerShop
        </Link>
      </div>
    </section>
  );
}
