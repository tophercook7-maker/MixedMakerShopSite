import Link from "next/link";

export const metadata = {
  title: "Tools | MixedMakerShop",
  description: "Free tools and resources from MixedMakerShop.",
};

export default function ToolsPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Tools</h1>
          <p className="subhead">Free tools and resources for small businesses.</p>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <Link href="/website-roast" className="btn gold">
              Website Roast
            </Link>
            <Link href="/free-website-check" className="btn ghost">
              Website Check
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
