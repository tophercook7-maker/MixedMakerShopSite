import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Request Custom 3D Printing | MixedMakerShop",
  description:
    "Submit a request for custom PLA parts, mounts, or fixes. Photos and measurements welcome — no STL required to start.",
};

const PHONE = "501-575-8017";
const PHONE_TEL = "tel:+15015758017";

export default function Custom3DPrintingPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel" style={{ maxWidth: 640, margin: "0 auto" }}>
          <div className="small" style={{ letterSpacing: ".12em", opacity: 0.8, marginBottom: 8 }}>
            CUSTOM 3D PRINTING • PLA ONLY
          </div>
          <h1 className="h1" style={{ marginBottom: 16 }}>
            Submit a request
          </h1>
          <p className="subhead" style={{ marginBottom: 20 }}>
            Describe the part, send photos or measurements, and we&apos;ll reply with next steps. PLA only — practical
            custom work for mounts, organizers, replacements, and one-off fixes.
          </p>
          <p className="small" style={{ marginBottom: 24, color: "var(--muted)" }}>
            Prefer to talk it through?{" "}
            <a href={PHONE_TEL} style={{ color: "var(--gold)", fontWeight: 600 }}>
              {PHONE}
            </a>
          </p>
          <Link href="/contact" className="btn gold" style={{ marginBottom: 16 }}>
            Continue to contact form
          </Link>
          <p className="small" style={{ color: "var(--muted)" }}>
            Or email{" "}
            <a href="mailto:Topher@mixedmakershop.com" style={{ color: "var(--gold)", textDecoration: "underline" }}>
              Topher@mixedmakershop.com
            </a>{" "}
            with what you need — include photos if you can.
          </p>
          <hr className="hr" style={{ margin: "28px 0" }} />
          <Link href="/3d-printing" className="btn">
            ← Back to 3D printing
          </Link>
        </div>
      </div>
    </section>
  );
}
