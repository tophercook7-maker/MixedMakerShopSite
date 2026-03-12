import Link from "next/link";
import { notFound } from "next/navigation";

const samples: Record<string, { name: string; desc: string }> = {
  "bean-bliss": { name: "Bean Bliss", desc: "Clean café website designed to highlight menu, location, and daily traffic." },
  "noir-roast": { name: "Noir Roast", desc: "Bold roastery layout focused on brand identity and product storytelling." },
  "sunrise-cafe": { name: "Sunrise Café", desc: "Warm neighborhood café style built to encourage visits and local loyalty." },
  "route-66-coffee": { name: "Route 66 Coffee", desc: "Retro diner-inspired design that stands out and invites travelers inside." },
};

export default async function WebsiteSamplePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sample = samples[slug];
  if (!sample) notFound();

  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>{sample.name}</h1>
          <p className="subhead">{sample.desc}</p>
          <p className="small" style={{ marginTop: 14 }}>
            This is a sample concept. Ready for a website like this for your business?
          </p>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <Link href="/#free-mockup-request" className="btn gold">
              Get My Free Mockup
            </Link>
            <Link href="/website-samples" className="btn ghost">
              View all samples
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
