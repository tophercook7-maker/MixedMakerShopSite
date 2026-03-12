import Link from "next/link";

export const metadata = {
  title: "Pricing | MixedMakerShop",
  description: "Transparent pricing for web design, hosting, and 3D printing services.",
};

export default function PricingPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Pricing</h1>
          <p className="subhead" style={{ margin: "0 0 28px" }}>
            Clear pricing for web design, hosting, and support.
          </p>
          <div className="price-grid">
            <div className="price-card">
              <div className="tag">FULL WEBSITE BUILD</div>
              <div className="price">$950</div>
              <p className="small">
                Up to 5 pages, mobile-first, contact form, SEO structure. 2 revision rounds. Launch support included.
              </p>
              <div className="actions">
                <Link href="/#full-project-inquiry" className="mini gold">
                  Start a Project
                </Link>
              </div>
            </div>
            <div className="price-card">
              <div className="tag">HOSTING & SUPPORT</div>
              <div className="price">$89/mo</div>
              <p className="small">Hosting, backups, monitoring, minor updates, direct support.</p>
              <div className="actions">
                <Link href="/#full-project-inquiry" className="mini gold">
                  Add hosting
                </Link>
              </div>
            </div>
            <div className="price-card">
              <div className="tag">3D PRINTING</div>
              <div className="price">Quote</div>
              <p className="small">Custom prints, prototypes, parts. Price varies by size and material.</p>
              <div className="actions">
                <Link href="/custom-3d-printing" className="mini gold">
                  Request quote
                </Link>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 28 }}>
            <Link href="/#free-mockup-request" className="btn gold">
              Get My Free Mockup
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
