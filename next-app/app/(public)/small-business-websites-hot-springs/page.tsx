import Link from "next/link";

export const metadata = {
  title: "Small Business Website Design Hot Springs | MixedMakerShop",
  description:
    "Small business website design in Hot Springs, Arkansas. Clear, modern, conversion-focused websites built for local growth.",
};

export default function SmallBusinessWebsitesPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Small Business Websites in Hot Springs</h1>
          <p className="subhead">
            Professional small business websites that explain what you do and make it easy for customers to contact you.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>Landing Page Essentials</h2>
          <div className="grid-2">
            <div className="card">
              <h3>Offer clarity</h3>
              <p className="small">Service descriptions that help visitors understand your business quickly.</p>
            </div>
            <div className="card">
              <h3>Local trust signals</h3>
              <p className="small">Reviews, credibility points, and location context where they matter most.</p>
            </div>
            <div className="card">
              <h3>Mobile conversion flow</h3>
              <p className="small">Simple paths to call, request a quote, or submit an inquiry form.</p>
            </div>
            <div className="card">
              <h3>Fast update path</h3>
              <p className="small">Built to be maintainable as your business services evolve.</p>
            </div>
          </div>

          <div className="btn-row" style={{ marginTop: 22 }}>
            <Link href="/contact" className="btn gold">
              Get My Free Website Draft
            </Link>
            <Link href="/web-design" className="btn ghost">
              Web Design Services
            </Link>
            <Link href="/website-samples" className="btn ghost">
              View Website Samples
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
