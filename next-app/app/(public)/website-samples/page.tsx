import Link from "next/link";

export const metadata = {
  title: "Website Samples | MixedMakerShop",
  description: "Example websites in different styles — clean, modern, rustic, bold.",
};

const samples = [
  { slug: "bean-bliss", name: "Bean Bliss", desc: "Clean café website designed to highlight menu, location, and daily traffic." },
  { slug: "noir-roast", name: "Noir Roast", desc: "Bold roastery layout focused on brand identity and product storytelling." },
  { slug: "sunrise-cafe", name: "Sunrise Café", desc: "Warm neighborhood café style built to encourage visits and local loyalty." },
  { slug: "route-66-coffee", name: "Route 66 Coffee", desc: "Retro diner-inspired design that stands out and invites travelers inside." },
];

export default function WebsiteSamplesPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Website Samples</h1>
          <p className="subhead" style={{ margin: "0 0 28px" }}>
            Example sites in different styles — clean, modern, rustic, bold. Yours can follow one of these or go fully
            custom.
          </p>
          <div className="grid-2">
            {samples.map((s) => (
              <Link
                key={s.slug}
                href={`/website-samples/${s.slug}`}
                className="card"
                style={{ textDecoration: "none" }}
              >
                <h3 style={{ margin: "0 0 6px" }}>{s.name}</h3>
                <span className="small" style={{ display: "block", marginTop: 6 }}>
                  {s.desc}
                </span>
              </Link>
            ))}
          </div>
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
