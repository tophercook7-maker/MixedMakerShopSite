import Link from "next/link";

export const metadata = {
  title: "Coffee Shop Website Design Hot Springs | MixedMakerShop",
  description:
    "Coffee shop website design in Hot Springs, Arkansas. Menu, hours, location, and call-to-action flow built for local traffic.",
};

export default function CoffeeShopWebsitesPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Coffee Shop Websites in Hot Springs</h1>
          <p className="subhead">
            Menu, location, vibe — built to bring customers in. View our coffee shop website samples.
          </p>
          <h2 style={{ margin: "28px 0 10px" }}>Coffee Shop Website Focus</h2>
          <div className="grid-2">
            <div className="card">
              <h3>Menu visibility</h3>
              <p className="small">Highlight featured drinks, prices, and seasonal offerings.</p>
            </div>
            <div className="card">
              <h3>Location and hours clarity</h3>
              <p className="small">Help local customers decide quickly whether to visit now.</p>
            </div>
            <div className="card">
              <h3>Brand vibe in layout</h3>
              <p className="small">Reflect your in-store feel with cleaner design and stronger visuals.</p>
            </div>
            <div className="card">
              <h3>Fast mobile flow</h3>
              <p className="small">Built for local users searching on phones while on the move.</p>
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: 22 }}>
            <Link href="/contact" className="btn gold">
              Get My Free Website Draft
            </Link>
            <Link href="/website-samples" className="btn ghost">
              View Website Samples
            </Link>
            <Link href="/web-design" className="btn ghost">
              Web Design Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
