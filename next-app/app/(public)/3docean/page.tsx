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
    <section className="section" style={{ paddingTop: 32 }}>
      <div className="container" style={{ textAlign: "center" }}>
        <div className="small" style={{ letterSpacing: ".12em", opacity: 0.8, marginBottom: 8 }}>
          3D OCEAN • POP-OUT VIDEO EFFECT
        </div>
        <h1 className="h1" style={{ marginBottom: 16 }}>
          We made the ocean spill across the page
        </h1>
        <p className="subhead" style={{ maxWidth: 640, margin: "0 auto 8px" }}>
          A real wave crashes over the top, foams down the screen, and leaves everything glistening
          wet — and not one word smears or floats away.
        </p>
      </div>

      {/* Full-bleed hero — breaks out of the page, no frame, no box. */}
      <div
        style={{
          position: "relative",
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginTop: 28,
          marginBottom: 28,
          lineHeight: 0,
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
          style={{
            display: "block",
            width: "100vw",
            maxHeight: "78vh",
            objectFit: "cover",
          }}
        />
      </div>

      <div className="container" style={{ textAlign: "center" }}>
        <p
          className="subhead"
          style={{ maxWidth: 680, margin: "0 auto 24px", color: "var(--muted)" }}
        >
          This is the kind of pop-out video ad we build to make a flat website, menu, or flyer stop
          the scroll. Same trick, any image — a squirrel claws out from under the umbrella, a dish
          rises off the menu with steam, a product bursts off the page. The page underneath stays
          flat, sharp and readable the whole time.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
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

        <hr className="hr" style={{ margin: "28px auto", maxWidth: 680 }} />
        <Link href="/" className="btn">
          ← Back to MixedMakerShop
        </Link>
      </div>
    </section>
  );
}
