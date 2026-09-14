import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/JsonLd";
import { SITE_URL } from "@/lib/site";
import { contactHrefForTopic } from "@/lib/what-i-do";
import { libraryByCategory, isOrderable, itemSlug, LIBRARY_COUNT } from "@/lib/shop-library";

const canonical = `${SITE_URL}/shop`;
const askHref = contactHrefForTopic("3d-printing");

export const metadata: Metadata = {
  title: "3D Print Shop | Hot Springs, AR — MixedMakerShop",
  description:
    "Browse the print library — vases, planters, gift boxes, lamps, organizers and seasonal pieces. Printed to order in Hot Springs, Arkansas. Free local delivery or shipped nationwide.",
  alternates: { canonical },
  openGraph: {
    title: "3D Print Shop — MixedMakerShop",
    description: "Printed to order in Hot Springs, Arkansas. Nothing is made until you order it.",
    url: canonical,
    type: "website",
  },
};

export default function ShopPage() {
  const groups = libraryByCategory();

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: canonical },
    ],
  };

  return (
    <>
      <JsonLd data={[breadcrumb]} />

      {/* HERO */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <div className="kicker">
              <span className="dot" /> Hot Springs, Arkansas · free local delivery
            </div>
            <h1 className="h1" style={{ margin: "14px 0 14px" }}>
              Pick it, and I&apos;ll print it.
            </h1>
            <p className="subhead" style={{ margin: "0 0 16px", maxWidth: "62ch" }}>
              {LIBRARY_COUNT} pieces you can order, printed to order on my own machines here in
              Hot Springs. Nothing sits in a box waiting — I make yours when you ask for it, in
              whatever colour you want.
            </p>
            <p className="small" style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6, maxWidth: "62ch" }}>
              Want something that isn&apos;t here? Send a photo, a link, or a file and I&apos;ll
              quote it — that&apos;s the{" "}
              <Link href="/3d-printing" style={{ textDecoration: "underline" }}>
                custom printing service
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* LIBRARY */}
      {groups.map(({ cat, items }) => (
        <section className="section" key={cat}>
          <div className="container">
            <h2 className="h2" style={{ marginTop: 0, marginBottom: 16 }}>
              {cat}{" "}
              <span className="small" style={{ color: "var(--muted2)", fontWeight: 400 }}>
                {items.length} {items.length === 1 ? "piece" : "pieces"}
              </span>
            </h2>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item) => {
                const orderable = isOrderable(item);
                return (
                  <div key={item.code} className="panel" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div
                      className="overflow-hidden rounded-xl border border-white/10"
                      style={{ aspectRatio: "4 / 3", background: "rgba(255,255,255,.03)" }}
                    >
                      {item.img ? (
                        // Creator's own photo. Printables licenses the whole upload —
                        // files and images — under the model's CC licence.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.img}
                          alt={`${item.name} — example print`}
                          loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      ) : (
                        <div
                          className="small"
                          style={{
                            width: "100%", height: "100%", display: "flex",
                            alignItems: "center", justifyContent: "center", color: "var(--muted2)",
                          }}
                        >
                          Photo on request
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span className="small" style={{ color: "var(--muted2)", letterSpacing: ".06em" }}>
                        {item.code}
                      </span>
                      <strong>{item.price}</strong>
                    </div>

                    <h3 className="h3" style={{ margin: 0, fontSize: 17 }}>
                      {item.name}
                    </h3>

                    <div style={{ marginTop: "auto", paddingTop: 6 }}>
                      {orderable ? (
                        <Link className="btn gold btn-cta-primary" href={`/shop/${itemSlug(item)}`}>
                          Order this
                        </Link>
                      ) : (
                        <Link className="btn ghost" href={`${askHref}${askHref.includes("?") ? "&" : "?"}item=${item.code}`}>
                          Ask about {item.code}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <h2 className="h2" style={{ marginTop: 0 }}>
              How it works
            </h2>
            <div className="grid gap-6 md:grid-cols-3" style={{ marginTop: 16 }}>
              <div>
                <div className="kicker"><span className="dot" /> 1 · Pick</div>
                <p className="small" style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
                  Tell me the code and the colour. Anything on this page can be made.
                </p>
              </div>
              <div>
                <div className="kicker"><span className="dot" /> 2 · Printed for you</div>
                <p className="small" style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
                  It goes on the printer once you order. A couple of days for most pieces.
                </p>
              </div>
              <div>
                <div className="kicker"><span className="dot" /> 3 · Delivered</div>
                <p className="small" style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>
                  Hot Springs and nearby, I drop it off. Further out, it ships USPS.
                </p>
              </div>
            </div>
            <p className="small" style={{ marginTop: 20, color: "var(--muted2)", lineHeight: 1.6 }}>
              Photos show an example print of each design — yours is made fresh in the colour you
              choose, so it may differ slightly. Every design here is licensed for commercial use
              and the creator is credited on the product page.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
