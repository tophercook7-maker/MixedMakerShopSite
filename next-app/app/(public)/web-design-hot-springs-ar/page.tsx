import Link from "next/link";

export const metadata = {
  title: "Web Design Hot Springs AR | MixedMakerShop",
  description: "Web design services in Hot Springs, Arkansas.",
};

export default function WebDesignHotSpringsPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Web Design in Hot Springs, Arkansas</h1>
          <p className="subhead">
            MixedMakerShop is a small web design studio based in Hot Springs. I work with local businesses to create
            fast, modern websites that look professional and are easy for customers to use.
          </p>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <Link href="/#free-mockup-request" className="btn gold">
              Get My Free Mockup
            </Link>
            <Link href="/web-design" className="btn ghost">
              Web design services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
