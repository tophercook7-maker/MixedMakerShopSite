import Link from "next/link";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";
import { WEBSITE_SAMPLES } from "@/lib/website-samples";

export const metadata = {
  title: "Topher's Web Design",
  description:
    "Simple local-business websites built for calls and trust. Starter setups from $400, full business setups from $900, custom builds on quote.",
};

const beforeAfter = [
  {
    beforeLabel: "Before",
    beforeText: "Outdated layout, hard-to-find contact details, and weak conversion flow.",
    afterLabel: "After",
    afterText: "Clear structure, mobile-first design, and stronger calls to action.",
    image:
      WEBSITE_SAMPLES.find((s) => s.slug === "restaurant-redesign-demo")?.imageUrl ||
      "/images/showcase/deep-well-audio.jpg",
    href: "/restaurant-website-redesign",
  },
  {
    beforeLabel: "Before",
    beforeText: "Generic homepage with no clear direction for visitors.",
    afterLabel: "After",
    afterText: "Focused messaging that shows services and drives contact requests.",
    image:
      WEBSITE_SAMPLES.find((s) => s.slug === "southern-diner-concept")?.imageUrl ||
      "/images/showcase/freshcut-property-care.jpg",
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
            <p className="subhead">
              Simple, mobile-friendly sites with click-to-call, clear forms, Google cleanup, and review setup — built for
              more calls, not agency overhead.
            </p>
            <p className="small copy-readable" style={{ margin: "14px 0 0", color: "var(--muted)" }}>
              Starter setups from $400 · Full business setups from $900 · Custom builds on quote
            </p>
            <div className="btn-row" style={{ marginTop: 20 }}>
              <Link href={publicFreeMockupFunnelHref} className="btn gold">
                Get My Free Preview
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
                I help local businesses get more calls by fixing the online side — not with bloated builds, but with a
                setup that actually works on phones.
              </p>
              <ul className="small" style={{ margin: "10px 0 0 18px" }}>
                <li>Clean, mobile-friendly websites</li>
                <li>Click-to-call and simple quote/contact forms</li>
                <li>Google profile cleanup and review setup</li>
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
          <h2 className="section-heading">Before &amp; After</h2>
          <div className="grid-2">
            {beforeAfter.map((example) => (
              <article key={`${example.href}-${example.beforeLabel}`} className="card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={example.image}
                  alt="Website before and after redesign"
                  style={{ width: "100%", height: 190, objectFit: "cover", borderRadius: "10px", marginBottom: 14 }}
                />
                <p className="small" style={{ margin: "0 0 6px" }}>
                  <strong>{example.beforeLabel}:</strong> {example.beforeText}
                </p>
                <p className="small" style={{ margin: "0 0 14px" }}>
                  <strong>{example.afterLabel}:</strong> {example.afterText}
                </p>
                <Link href={example.href} className="btn ghost">
                  See the redesign
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
              <h3 className="how-it-works-title">You tell me about your business</h3>
              <p className="how-it-works-copy">What you do, who you serve, and how customers usually try to reach you.</p>
            </article>
            <article className="how-it-works-card">
              <span className="how-it-works-badge">02</span>
              <h3 className="how-it-works-title">I build your setup</h3>
              <p className="how-it-works-copy">
                Clean structure, mobile-friendly flow, click-to-call, forms, and trust-ready basics.
              </p>
            </article>
            <article className="how-it-works-card">
              <span className="how-it-works-badge">03</span>
              <h3 className="how-it-works-title">You review it</h3>
              <p className="how-it-works-copy">We adjust copy and layout until it matches how you want to show up online.</p>
            </article>
            <article className="how-it-works-card">
              <span className="how-it-works-badge">04</span>
              <h3 className="how-it-works-title">You start getting more calls</h3>
              <p className="how-it-works-copy">A simpler path from finding you to contacting you.</p>
            </article>
          </div>
          <p className="small" style={{ marginTop: 18, color: "var(--muted)" }}>
            Most projects are done in 5–7 days.
          </p>
        </div>
      </section>

      <section className="section" id="request-preview">
        <div className="container">
          <div className="panel" style={{ textAlign: "center" }}>
            <h2 style={{ margin: "0 0 10px" }}>Want Me to Take a Look at Your Business?</h2>
            <p className="subhead" style={{ margin: "0 0 18px" }}>
              I&apos;ll show you exactly what I&apos;d fix — no pressure.
            </p>
            <div className="btn-row" style={{ justifyContent: "center" }}>
              <Link href={publicFreeMockupFunnelHref} className="btn gold">
                Get My Free Preview
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

