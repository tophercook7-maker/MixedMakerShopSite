import Link from "next/link";
import { notFound } from "next/navigation";
import { getSampleBySlug } from "@/lib/website-samples";

export default async function WebsiteSamplePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sample = getSampleBySlug(slug);
  if (!sample || sample.externalHref) notFound();

  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          {sample.imageUrl && (
            <div style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sample.imageUrl}
                alt=""
                style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }}
              />
            </div>
          )}
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
