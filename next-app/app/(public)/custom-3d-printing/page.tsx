import Link from "next/link";

export const metadata = {
  title: "Request a Custom 3D Print | MixedMakerShop",
  description:
    "Get a quote for your custom 3D print. Share a sketch, file, or description — no minimum order, no obligation.",
};

export default function Custom3DPrintingPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel" style={{ maxWidth: 640, margin: "0 auto" }}>
          <div
            className="small"
            style={{ letterSpacing: ".12em", opacity: 0.8, marginBottom: 8 }}
          >
            GET A QUOTE
          </div>
          <h1 className="h1" style={{ marginBottom: 16 }}>
            Custom 3D Print Request
          </h1>
          <p className="subhead" style={{ marginBottom: 28 }}>
            Share your idea — a sketch, STL file, or description — and I&apos;ll
            get back to you with a clear quote and what&apos;s possible. No minimum
            order. No obligation.
          </p>
          <Link href="/contact" className="btn gold" style={{ marginBottom: 16 }}>
            Send Your Project Details
          </Link>
          <p className="small" style={{ color: "var(--muted)" }}>
            Prefer email?{" "}
            <a
              href="mailto:Topher@mixedmakershop.com"
              style={{ color: "var(--gold)", textDecoration: "underline" }}
            >
              Topher@mixedmakershop.com
            </a>
            — include what you want and I&apos;ll respond personally.
          </p>
          <hr className="hr" style={{ margin: "28px 0" }} />
          <Link href="/3d-printing" className="btn">
            ← Back to 3D Printing
          </Link>
        </div>
      </div>
    </section>
  );
}
