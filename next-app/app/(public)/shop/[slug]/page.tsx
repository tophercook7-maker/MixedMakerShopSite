import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/public/JsonLd";
import { ShopBuyButton } from "@/components/public/ShopBuyButton";
import { SITE_URL } from "@/lib/site";
import { SHOP_PRODUCTS, findShopProduct, formatUsd, displayPrice } from "@/lib/shop-catalog";
import { LIBRARY, findBySlugOrCode, itemSlug, isOrderable } from "@/lib/shop-library";

type Params = { params: { slug: string } };

export function generateStaticParams() {
  return [
    ...SHOP_PRODUCTS.filter((p) => p.status === "live").map((p) => ({ slug: p.slug })),
    ...LIBRARY.map((i) => ({ slug: itemSlug(i) })),
  ];
}

export function generateMetadata({ params }: Params): Metadata {
  const product = findShopProduct(params.slug);
  if (product && product.status === "live") {
    return {
      title: `${product.name} | MixedMakerShop`,
      description: product.blurb,
      alternates: { canonical: `${SITE_URL}/shop/${product.slug}` },
    };
  }
  const item = findBySlugOrCode(params.slug);
  if (!item) return { title: "Not found | MixedMakerShop" };
  return {
    title: `${item.name} | MixedMakerShop`,
    description: `${item.name} — printed to order in Hot Springs, Arkansas. ${item.price}.`,
    alternates: { canonical: `${SITE_URL}/shop/${itemSlug(item)}` },
    openGraph: { title: item.name, url: `${SITE_URL}/shop/${itemSlug(item)}`, type: "website" },
  };
}

export default function ShopProductPage({ params }: Params) {
  const product = findShopProduct(params.slug);

  /* ---------- hand-written listing ---------- */
  if (product && product.status === "live") {
    const canonical = `${SITE_URL}/shop/${product.slug}`;
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.blurb,
      brand: { "@type": "Brand", name: "MixedMakerShop" },
      offers: {
        "@type": "Offer", url: canonical, priceCurrency: "USD",
        price: product.priceUsd.toFixed(2),
        availability: "https://schema.org/InStock",
        seller: { "@type": "Organization", name: "MixedMakerShop" },
      },
    };
    return (
      <>
        <JsonLd data={[schema]} />
        <section className="section">
          <div className="container">
            <p className="small" style={{ margin: "0 0 14px", color: "var(--muted2)" }}>
              <Link href="/shop" style={{ textDecoration: "underline" }}>Shop</Link> / {product.name}
            </p>
            <div className="panel">
              <div className="grid items-start gap-10 lg:grid-cols-2">
                {product.image ? (
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    <Image src={product.image} alt={product.imageAlt || product.name}
                      width={1080} height={1350} className="h-auto w-full" priority />
                  </div>
                ) : null}
                <div>
                  <div className="kicker"><span className="dot" /> Printed to order in Hot Springs</div>
                  <h1 className="h1" style={{ margin: "14px 0 12px" }}>{product.name}</h1>
                  <p style={{ margin: "0 0 18px", fontSize: 24, fontWeight: 700 }}>
                    {displayPrice(product)}
                  </p>
                  {product.description.map((para, i) => (
                    <p key={i} className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.7 }}>{para}</p>
                  ))}
                  <div style={{ margin: "20px 0" }}>
                    <ShopBuyButton slug={product.slug} label={`Buy — ${formatUsd(product.priceUsd)}`} />
                  </div>
                  <ul className="small" style={{ margin: 0, paddingLeft: 18, color: "var(--muted2)", lineHeight: 1.8 }}>
                    {product.sizeCm ? <li>{product.sizeCm}</li> : null}
                    {product.materialNote ? <li>{product.materialNote}</li> : null}
                    {product.localDeliveryNote ? <li>{product.localDeliveryNote}</li> : null}
                    <li>Made to order — allow a few days on the bench for larger pieces.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="panel">
              <h2 className="h3" style={{ marginTop: 0 }}>Design credit</h2>
              <p className="small" style={{ margin: "10px 0 12px", color: "var(--muted)", lineHeight: 1.7 }}>
                {product.source.attribution}
              </p>
              {product.source.remixOf ? (
                <p className="small" style={{ margin: 0, color: "var(--muted2)", lineHeight: 1.7 }}>
                  That design is itself a remix of <strong>{product.source.remixOf.title}</strong> by{" "}
                  {product.source.remixOf.designer} ({product.source.remixOf.license}), whose credit carries through.
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </>
    );
  }

  /* ---------- library listing ---------- */
  const item = findBySlugOrCode(params.slug);
  if (!item || !isOrderable(item)) notFound();

  const canonical = `${SITE_URL}/shop/${itemSlug(item)}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    description: `${item.name} — printed to order.`,
    ...(item.img ? { image: [item.img] } : {}),
    brand: { "@type": "Brand", name: "MixedMakerShop" },
    offers: {
      "@type": "Offer", url: canonical, priceCurrency: "USD",
      price: (item.priceCents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "MixedMakerShop" },
    },
  };

  return (
    <>
      <JsonLd data={[schema]} />
      <section className="section">
        <div className="container">
          <p className="small" style={{ margin: "0 0 14px", color: "var(--muted2)" }}>
            <Link href="/shop" style={{ textDecoration: "underline" }}>Shop</Link> / {item.cat} / {item.code}
          </p>

          <div className="panel">
            <div className="grid items-start gap-10 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-white/10"
                   style={{ aspectRatio: "4 / 3", background: "rgba(255,255,255,.03)" }}>
                {item.img ? (
                  // Creator's own photo — Printables licenses the whole upload,
                  // files and images alike, under the model's CC licence.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.img} alt={`${item.name} — example print`}
                       style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <div className="small" style={{ width: "100%", height: "100%", display: "flex",
                       alignItems: "center", justifyContent: "center", color: "var(--muted2)" }}>
                    Photo on request
                  </div>
                )}
              </div>

              <div>
                <div className="kicker"><span className="dot" /> {item.code} · printed to order</div>
                <h1 className="h1" style={{ margin: "14px 0 12px" }}>{item.name}</h1>
                <p style={{ margin: "0 0 18px", fontSize: 24, fontWeight: 700 }}>{item.price}</p>

                <p className="small" style={{ margin: "0 0 12px", color: "var(--muted)", lineHeight: 1.7 }}>
                  Printed fresh for your order on my own machines in Hot Springs — nothing sits in a
                  box waiting. Tell me the colour you want when you order.
                </p>

                <div style={{ margin: "20px 0" }}>
                  <ShopBuyButton slug={item.code} label={`Buy — ${item.price}`} />
                </div>

                <ul className="small" style={{ margin: 0, paddingLeft: 18, color: "var(--muted2)", lineHeight: 1.8 }}>
                  <li>Made to order — allow a few days for larger pieces.</li>
                  <li>Free local delivery around Hot Springs, or shipped USPS.</li>
                  <li>The photo shows an example print — yours is made in your chosen colour.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="panel">
            <h2 className="h3" style={{ marginTop: 0 }}>Design credit</h2>
            <p className="small" style={{ margin: "10px 0 12px", color: "var(--muted)", lineHeight: 1.7 }}>
              {item.attribution}
            </p>
            <p className="small" style={{ margin: 0, color: "var(--muted2)", lineHeight: 1.7 }}>
              Original model by {item.designer} on Printables, licensed{" "}
              <a href={item.licUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
                {item.lic}
              </a>
              {" · "}
              <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
                view the model
              </a>
              . I print and sell the physical piece; the design remains theirs.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
