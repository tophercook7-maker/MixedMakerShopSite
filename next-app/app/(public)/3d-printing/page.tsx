import Link from "next/link";
import {
  GALLERY_ITEMS,
  WHAT_I_PRINT,
  HOW_IT_WORKS,
  WHY_MIXEDMAKERSHOP,
} from "@/lib/3d-printing-data";

export const metadata = {
  title: "3D Printing — MixedMakerShop",
  description:
    "Custom 3D printing that brings your ideas to life. Practical parts, prototypes, gifts, and one-offs. Honest quotes, no minimum order.",
};

export default function ThreeDPrintingPage() {
  return (
    <>
      {/* Hero */}
      <section className="section print-hero">
        <div className="container">
          <div className="kicker">
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--gold)",
                display: "inline-block",
              }}
            />
            Custom 3D Printing
          </div>
          <h1 className="h1" style={{ marginBottom: 16 }}>
            3D Printing That{" "}
            <span className="gold">Brings Your Ideas to Life</span>
          </h1>
          <p className="subhead" style={{ maxWidth: "56ch", margin: "0 auto 24px" }}>
            Custom prints for practical parts, prototypes, personalized gifts, and
            small-batch work. You bring the idea — I handle design support, quality
            prints, and honest quotes. No minimum order, no factory pressure.
          </p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link href="/custom-3d-printing" className="btn gold">
              Get a Quote for Your Project
            </Link>
            <Link href="#samples" className="btn">
              See Sample Prints
            </Link>
          </div>
        </div>
      </section>

      {/* What I Print */}
      <section className="section print-section">
        <div className="container">
          <h2 className="print-section-title">What I Print</h2>
          <p className="print-section-sub">
            Prototypes, parts, gifts, and one-offs. If it can be printed, I can help
            you get it right.
          </p>
          <div className="print-what-grid">
            {WHAT_I_PRINT.map((item) => (
              <div key={item.title} className="print-what-card">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery / Samples */}
      <section id="samples" className="section print-section">
        <div className="container">
          <h2 className="print-section-title">Sample Prints</h2>
          <p className="print-section-sub">
            A few things I&apos;ve made. Colors, sizes, and designs can be adapted
            to your project.
          </p>
          <div className="print-gallery">
            {GALLERY_ITEMS.map((item) => (
              <div key={item.title} className="print-gallery-card">
                <div className="print-gallery-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt={item.alt} />
                </div>
                <div className="print-gallery-body">
                  <div className="print-gallery-title">{item.title}</div>
                  <div className="print-gallery-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section print-section">
        <div className="container">
          <h2 className="print-section-title">How It Works</h2>
          <p className="print-section-sub">
            Straightforward: you share the idea, I handle the rest.
          </p>
          <div className="print-how-grid">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="print-how-card">
                <span className="print-how-badge">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why MixedMakerShop */}
      <section className="section print-section">
        <div className="container">
          <h2 className="print-section-title">Why MixedMakerShop</h2>
          <p className="print-section-sub">
            One person, focused on your project. No bulk minimums, no runarounds.
          </p>
          <div className="print-why-grid">
            {WHY_MIXEDMAKERSHOP.map((item) => (
              <div key={item.title} className="print-why-card">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section">
        <div className="container">
          <div className="print-cta-block">
            <h2 className="print-cta-title">
              Ready to bring your idea to life?
            </h2>
            <p className="print-cta-desc">
              Share a sketch, file, or description. I&apos;ll respond with an honest
              quote and what&apos;s possible. No obligation, no minimum.
            </p>
            <Link href="/custom-3d-printing" className="btn gold">
              Get Your Quote
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
