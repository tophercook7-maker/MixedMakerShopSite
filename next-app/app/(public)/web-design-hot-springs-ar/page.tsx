import Link from "next/link";

export const metadata = {
  title: "Web Design Hot Springs AR | Small Business Website Designer",
  description:
    "Web design services in Hot Springs, Arkansas for small businesses. Clean, fast, conversion-focused websites with direct designer communication.",
};

export default function WebDesignHotSpringsPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Web Design in Hot Springs, Arkansas</h1>
          <p className="subhead">
            MixedMakerShop is a small web design studio based in Hot Springs. I build clean, fast websites that help
            local businesses earn trust and convert visitors into calls.
          </p>

          <h2 style={{ margin: "28px 0 10px" }}>What You Get</h2>
          <div className="grid-2">
            <div className="card">
              <h3>Clear service messaging</h3>
              <p className="small">Pages are structured so customers understand what you do in seconds.</p>
            </div>
            <div className="card">
              <h3>Mobile-first layout</h3>
              <p className="small">Designed for the phones your local customers use every day.</p>
            </div>
            <div className="card">
              <h3>Conversion-focused calls to action</h3>
              <p className="small">Built to drive calls, quote requests, and bookings.</p>
            </div>
            <div className="card">
              <h3>Direct support</h3>
              <p className="small">You work directly with Topher, not a handoff chain.</p>
            </div>
          </div>

          <h2 style={{ margin: "28px 0 10px" }}>Who This Is For</h2>
          <p className="small">
            Ideal for service businesses, restaurants, churches, and local shops that need a stronger website presence
            in Hot Springs and surrounding Arkansas markets.
          </p>

          <div className="btn-row" style={{ marginTop: 22 }}>
            <Link href="/free-mockup" className="btn gold">
              Get My Free Preview
            </Link>
            <Link href="/examples" className="btn ghost">
              See Examples
            </Link>
            <Link href="/web-design" className="btn ghost">
              Web Design
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
