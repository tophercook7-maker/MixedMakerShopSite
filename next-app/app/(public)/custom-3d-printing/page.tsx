import Link from "next/link";

export const metadata = {
  title: "Custom 3D Printing | MixedMakerShop",
  description: "Request a quote for custom 3D prints, prototypes, and parts.",
};

export default function Custom3DPrintingPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Custom 3D Printing</h1>
          <p className="subhead" style={{ margin: "0 0 20px" }}>
            Need a custom part, prototype, or personalized item? Tell me what you need and I&apos;ll send a quote.
          </p>
          <Link href="/contact" className="btn gold">
            Request a Quote via Contact
          </Link>
          <p className="small" style={{ marginTop: 14 }}>
            Or email Topher@mixedmakershop.com with your project details.
          </p>
        </div>
      </div>
    </section>
  );
}
