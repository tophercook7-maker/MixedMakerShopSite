import Link from "next/link";

export const metadata = {
  title: "Pricing | MixedMakerShop",
  description:
    "Starter setups from $400, full business setups from $900, custom builds on quote, plus hosting and support.",
};

export default function PricingPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Pricing</h1>
          <p className="subhead" style={{ margin: "0 0 28px" }}>
            Straightforward web design builds for local businesses, plus optional hosting and support.
          </p>
          <div className="price-grid">
            <div className="price-card">
              <div className="tag">STARTER SETUP</div>
              <div className="price">$400</div>
              <p className="small">
                One-page site, mobile-friendly, click-to-call, contact form, and basic Google setup — built to bring in
                calls.
              </p>
              <div className="actions">
                <Link href="/contact" className="mini gold">
                  Get My Free Mockup
                </Link>
              </div>
            </div>
            <div className="price-card">
              <div className="tag">BUSINESS SETUP</div>
              <div className="price">$900</div>
              <p className="small">
                3–5 pages, service pages, stronger CTAs, Google profile optimization, and review setup — more trust,
                more consistency.
              </p>
              <div className="actions">
                <Link href="/contact" className="mini gold">
                  Get My Free Mockup
                </Link>
              </div>
            </div>
            <div className="price-card">
              <div className="tag">HOSTING & SUPPORT</div>
              <div className="price">$89/mo</div>
              <p className="small">Hosting, backups, monitoring, minor updates, and direct support.</p>
              <div className="actions">
                <Link href="/contact" className="mini gold">
                  Add Hosting
                </Link>
              </div>
            </div>
          </div>
          <p className="small" style={{ marginTop: 20, color: "var(--muted)" }}>
            Custom builds are quoted by project —{" "}
            <Link href="/web-design" style={{ color: "var(--gold)", fontWeight: 700 }}>
              see web design packages
            </Link>
            .
          </p>
          <div style={{ marginTop: 28 }}>
            <Link href="/contact" className="btn gold">
              Get My Free Mockup
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
