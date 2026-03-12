import Link from "next/link";

export default function ConnectPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>MixedMakerShop</h1>
          <p className="subhead">Choose what you need.</p>
          <div className="grid-2" style={{ marginTop: 24 }}>
            <Link href="/contact" className="card" style={{ textDecoration: "none" }}>
              <h3>Request a Website</h3>
              <p className="small">New build, redesign, or updates.</p>
              <span className="btn">Go →</span>
            </Link>
            <Link href="/free-website-check" className="card" style={{ textDecoration: "none" }}>
              <h3>Free Website Check</h3>
              <p className="small">Quick feedback on your current site.</p>
              <span className="btn">Go →</span>
            </Link>
            <Link href="/website-samples" className="card" style={{ textDecoration: "none" }}>
              <h3>View Portfolio</h3>
              <p className="small">Sample websites in different styles.</p>
              <span className="btn">Go →</span>
            </Link>
            <Link href="/contact" className="card" style={{ textDecoration: "none" }}>
              <h3>Contact Topher</h3>
              <p className="small">Ask a question or pitch an idea.</p>
              <span className="btn">Go →</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
