import Link from "next/link";

export const metadata = {
  title: "Pricing | MixedMakerShop",
  description: "Transparent pricing for web design and ongoing hosting/support.",
};

export default function PricingPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Pricing</h1>
          <p className="subhead" style={{ margin: "0 0 28px" }}>
            Clear pricing for web design builds and ongoing hosting/support.
          </p>
          <div className="price-grid">
            <div className="price-card">
              <div className="tag">STARTER WEBSITE</div>
              <div className="price">$300-$500</div>
              <p className="small">
                Best for a clean starter site with clear messaging and contact-focused layout.
              </p>
              <div className="actions">
                <Link href="/contact" className="mini gold">
                  Start a Project
                </Link>
              </div>
            </div>
            <div className="price-card">
              <div className="tag">STANDARD WEBSITE</div>
              <div className="price">$600-$900</div>
              <p className="small">
                Best for a stronger multi-section website designed for trust and conversion.
              </p>
              <div className="actions">
                <Link href="/contact" className="mini gold">
                  Start a Project
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
          <div style={{ marginTop: 28 }}>
            <Link href="/contact" className="btn gold">
              Get My Free Website Draft
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
