import Link from "next/link";

export const metadata = {
  title: "Small Business Websites Hot Springs | MixedMakerShop",
  description: "Small business website design for Hot Springs, Arkansas.",
};

export default function SmallBusinessWebsitesPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Small Business Websites in Hot Springs</h1>
          <p className="subhead">
            Professional sites that explain what you do and make it easy for customers to get in touch.
          </p>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <Link href="/#free-mockup-request" className="btn gold">
              Get My Free Mockup
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
