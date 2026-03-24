import Link from "next/link";

export const metadata = {
  title: "Restaurant Website Design Hot Springs | MixedMakerShop",
  description:
    "Restaurant website design in Hot Springs, Arkansas. Menu-first, mobile-friendly pages built to increase calls, reservations, and local traffic.",
};

export default function RestaurantWebsitesPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Restaurant Websites in Hot Springs</h1>
          <p className="subhead">
            Clear menus, fast loading, mobile-friendly. Built for restaurants and food businesses in Hot Springs and
            beyond.
          </p>
          <h2 style={{ margin: "28px 0 10px" }}>What Restaurant Owners Need Most</h2>
          <div className="grid-2">
            <div className="card">
              <h3>Menu-first homepage flow</h3>
              <p className="small">Help visitors find menu highlights and pricing quickly.</p>
            </div>
            <div className="card">
              <h3>Reservation and call actions</h3>
              <p className="small">Put booking and call buttons where mobile users actually tap.</p>
            </div>
            <div className="card">
              <h3>Hours and location clarity</h3>
              <p className="small">Reduce drop-off by making open status and directions obvious.</p>
            </div>
            <div className="card">
              <h3>Local search readiness</h3>
              <p className="small">Page structure that supports local web design SEO basics.</p>
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <Link href="/free-mockup" className="btn gold">
              Get My Free Website Preview
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
