import Link from "next/link";

export const metadata = {
  title: "Restaurant Website Redesign | MixedMakerShop",
  description: "Example restaurant website redesign.",
};

export default function RestaurantRedesignPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Restaurant Website Redesign</h1>
          <p className="subhead">
            A clean redesign focused on clear menus, faster loading times, and a modern look that helps customers
            quickly find what they need.
          </p>
          <Link href="/website-samples" className="btn gold" style={{ marginTop: 20 }}>
            View website samples
          </Link>
        </div>
      </div>
    </section>
  );
}
