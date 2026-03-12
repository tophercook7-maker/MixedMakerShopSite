import Link from "next/link";

export const metadata = {
  title: "Coffee Shop Websites Hot Springs | MixedMakerShop",
  description: "Coffee shop website design for Hot Springs, Arkansas.",
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
          <Link href="/website-samples" className="btn gold" style={{ marginTop: 20 }}>
            View samples
          </Link>
        </div>
      </div>
    </section>
  );
}
