import type { Metadata } from "next";
import Link from "next/link";
import { publicTopherPhoneDisplay, publicTopherPhoneTel } from "@/lib/public-brand";

export const metadata: Metadata = {
  alternates: { canonical: "https://mixedmakershop.com/3docean" },
  title: "3D Ocean Pop-Out Effect | MixedMakerShop",
  description:
    "Watch a real ocean wave crash across our homepage and soak the page — without smearing a single word. A live demo of the pop-out video ads we build for local businesses.",
};

export default function ThreeDOceanPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel" style={{ maxWidth: 880, margin: "0 auto" }}>
          <div className="small" style={{ letterSpacing: ".12em", opacity: 0.8, marginBottom: 8 }}>
            3D OCEAN • POP-OUT VIDEO EFFECT
          </div>
          <h1 className="h1" style={{ marginBottom: 16 }}>
            We made the ocean spill across the page
          </h1>
          <p className="subhead" style={{ marginBottom: 24 }}>
            A real wave crashes over the top, foams down the screen, and leaves everything
            glistening wet — and not one word smears or floats away. This is a live demo of the
            pop-out video ads we build to make a flat website or flyer stop the scroll.
          </p>

          {/* The effect */}
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid var(--pub-border)",
              boxShadow: "0 24px 60px rgba(0,0,0,.35)",
              marginBottom: 28,
            }}
          >
            <video
              src="/videos/ocean-spill.mp4"
              poster="/videos/ocean-spill-poster.jpg"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-label="A realistic ocean wave crashes and washes over the MixedMakerShop homepage, leaving it wet but fully readable."
              style={{ display: "block", width: "100%", height: "auto" }}
            />
          </div>

          <div className="grid" style={{ gap: 16, marginBottom: 28 }}>
            <p className="small" style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              Same trick, any image: a squirrel can claw out from under the umbrella, a dish can rise
              off the menu with steam, a product can burst off the page, or — like here — a wave can
              roll right over your homepage. The page underneath stays flat, sharp and readable the
              whole time.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
            <Link href="/contact" className="btn gold">
              Get a pop-out video for your business
            </Link>
            <Link href="/ad-lab" className="btn">
              See more pop-out effects
            </Link>
          </div>

          <p className="small" style={{ marginTop: 20, color: "var(--muted)" }}>
            Want one for your site, menu, or listing? Call or text{" "}
            <a href={publicTopherPhoneTel} style={{ color: "var(--gold)", fontWeight: 600 }}>
              {publicTopherPhoneDisplay}
            </a>{" "}
            and we&apos;ll show you a free mockup first.
          </p>

          <hr className="hr" style={{ margin: "28px 0" }} />
          <Link href="/" className="btn">
            ← Back to MixedMakerShop
          </Link>
        </div>
      </div>
    </section>
  );
}
