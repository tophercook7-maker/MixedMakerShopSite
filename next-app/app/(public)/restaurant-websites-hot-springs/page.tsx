import Link from "next/link";

export const metadata = {
  title: "Restaurant Websites Hot Springs | MixedMakerShop",
  description: "Restaurant website design for Hot Springs, Arkansas.",
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
          <div className="btn-row" style={{ marginTop: 20 }}>
            <Link href="/#free-mockup-request" className="btn gold">
              Get My Free Mockup
            </Link>
            <Link href="/website-samples" className="btn ghost">
              View samples
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
