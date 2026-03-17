import Link from "next/link";
import { WEBSITE_SAMPLES } from "@/lib/website-samples";

export const metadata = {
  title: "Topher's Web Design",
  description: "Simple, clean websites for small businesses that bring in customers.",
};

const beforeAfter = [
  {
    beforeLabel: "Before",
    beforeText: "Outdated layout, hard-to-find contact details, and weak conversion flow.",
    afterLabel: "After",
    afterText: "Clear structure, mobile-first design, and stronger calls to action.",
    image: WEBSITE_SAMPLES.find((s) => s.slug === "restaurant-redesign-demo")?.imageUrl || "https://picsum.photos/id/292/1200/700",
    href: "/restaurant-website-redesign",
  },
  {
    beforeLabel: "Before",
    beforeText: "Generic homepage with no clear direction for visitors.",
    afterLabel: "After",
    afterText: "Focused messaging that shows services and drives contact requests.",
    image: WEBSITE_SAMPLES.find((s) => s.slug === "southern-diner-concept")?.imageUrl || "https://picsum.photos/id/1061/1200/700",
    href: "/website-samples",
  },
];

export default function TophersWebDesignPage() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="panel" style={{ padding: "36px 28px" }}>
            <p className="small" style={{ margin: "0 0 8px", letterSpacing: ".12em", opacity: 0.8 }}>
              CLIENT-FACING WEB DESIGN
            </p>
            <h1 className="h1" style={{ marginBottom: 10 }}>
              Topher&apos;s Web Design
            </h1>
            <p className="subhead" style={{ maxWidth: 760 }}>
              Simple, clean websites for small businesses that bring in customers
            </p>
            <div className="btn-row" style={{ marginTop: 20 }}>
              <Link href="#request-preview" className="btn gold">
                Request a Preview
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid-2">
            <article className="card">
              <h2 style={{ marginTop: 0 }}>What I Do</h2>
              <p className="small">
                I design and build clean, modern websites that help local businesses earn trust, explain services, and
                turn visitors into real customers.
              </p>
              <ul className="small" style={{ margin: "10px 0 0 18px" }}>
                <li>Website redesigns and new builds</li>
                <li>Mobile-friendly layouts and clear contact flow</li>
                <li>Simple pages that are easy to update and maintain</li>
              </ul>
            </article>
            <article className="card">
              <h2 style={{ marginTop: 0 }}>Who It&apos;s For</h2>
              <p className="small">
                Best fit for small businesses, churches, and local service companies that need a stronger online
                presence.
              </p>
              <ul className="small" style={{ margin: "10px 0 0 18px" }}>
                <li>Small businesses and owner-operated shops</li>
                <li>Churches and community organizations</li>
                <li>Local services (home, repair, food, and wellness)</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-heading">Before / After Examples</h2>
          <div className="grid-2">
            {beforeAfter.map((example) => (
              <article key={`${example.href}-${example.beforeLabel}`} className="card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={example.image}
                  alt="Website redesign example"
                  style={{ width: "100%", height: 190, objectFit: "cover", borderRadius: "10px", marginBottom: 14 }}
                />
                <p className="small" style={{ margin: "0 0 6px" }}>
                  <strong>{example.beforeLabel}:</strong> {example.beforeText}
                </p>
                <p className="small" style={{ margin: "0 0 14px" }}>
                  <strong>{example.afterLabel}:</strong> {example.afterText}
                </p>
                <Link href={example.href} className="btn ghost">
                  View Example
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-heading">How It Works</h2>
          <div className="how-it-works-grid">
            <article className="how-it-works-card">
              <span className="how-it-works-badge">01</span>
              <h3 className="how-it-works-title">Quick Website Review</h3>
              <p className="how-it-works-copy">
                I review your current site and identify what is costing you trust, clicks, or customer inquiries.
              </p>
            </article>
            <article className="how-it-works-card">
              <span className="how-it-works-badge">02</span>
              <h3 className="how-it-works-title">Preview Concept</h3>
              <p className="how-it-works-copy">
                You get a simple preview direction showing what your upgraded website could look like.
              </p>
            </article>
            <article className="how-it-works-card">
              <span className="how-it-works-badge">03</span>
              <h3 className="how-it-works-title">Build & Launch</h3>
              <p className="how-it-works-copy">
                If it&apos;s a fit, I build your full site and launch a clean, mobile-friendly website ready for customers.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="request-preview">
        <div className="container">
          <div className="panel" style={{ textAlign: "center" }}>
            <h2 style={{ margin: "0 0 10px" }}>Want to see what your site could look like?</h2>
            <p className="subhead" style={{ margin: "0 0 18px" }}>
              Request a preview and I&apos;ll show a clean direction tailored to your business.
            </p>
            <div className="btn-row" style={{ justifyContent: "center" }}>
              <Link href="/free-website-check" className="btn gold">
                Request a Preview
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="section" style={{ paddingTop: 18 }}>
        <div className="container">
          <div className="card" style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 6px", fontWeight: 700 }}>Topher&apos;s Web Design</p>
            <p className="small" style={{ margin: 0 }}>
              <a href="mailto:Topher@mixedmakershop.com">Topher@mixedmakershop.com</a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

