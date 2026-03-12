import Link from "next/link";

export const metadata = {
  title: "Web Design | MixedMakerShop",
  description: "Clean, modern small business websites designed in Hot Springs, Arkansas.",
};

export default function WebDesignPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Web Design for Small Businesses</h1>
          <p className="subhead" style={{ margin: "0 0 20px" }}>
            Clean, fast websites that help local businesses grow. You work directly with the designer — no agency
            layers.
          </p>
          <div className="btn-row">
            <Link href="/#free-mockup-request" className="btn gold">
              Get My Free Mockup
            </Link>
            <Link href="/website-samples" className="btn ghost">
              View Website Samples
            </Link>
          </div>
          <div className="grid-2" style={{ marginTop: 28 }}>
            <div className="card">
              <h3>Restaurant websites</h3>
              <p className="small">
                Clear menus, fast loading, easy to update. Built for restaurants and food businesses.
              </p>
              <Link href="/restaurant-websites-hot-springs" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                Learn more
              </Link>
            </div>
            <div className="card">
              <h3>Small business websites</h3>
              <p className="small">
                Professional sites that explain what you do and make it easy for customers to reach you.
              </p>
              <Link href="/small-business-websites-hot-springs" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                Learn more
              </Link>
            </div>
            <div className="card">
              <h3>Church websites</h3>
              <p className="small">
                Clear information, events, and ways for visitors to connect.
              </p>
              <Link href="/church-websites-hot-springs" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                Learn more
              </Link>
            </div>
            <div className="card">
              <h3>Coffee shop websites</h3>
              <p className="small">
                Menu, location, vibe — built to bring customers in.
              </p>
              <Link href="/coffee-shop-websites-hot-springs" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                Learn more
              </Link>
            </div>
          </div>
          <div style={{ marginTop: 28 }}>
            <Link href="/#pricing" className="btn gold">
              See pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
