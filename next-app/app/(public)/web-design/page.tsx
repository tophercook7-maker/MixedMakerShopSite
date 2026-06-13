import type { Metadata } from "next";
import { JsonLd } from "@/components/public/JsonLd";
import { WebDesignServicePage } from "@/components/public/WebDesignServicePage";
import { SITE_URL } from "@/lib/site";

const canonical = "https://mixedmakershop.com/web-design";

export const metadata: Metadata = {
  title: "Web Design for Real Businesses | MixedMakerShop",
  description:
    "Practical web design by Topher — clear sites that build trust and drive calls and leads. Hot Springs, AR & nationwide. Start with a free preview.",
  alternates: { canonical },
  openGraph: {
    title: "Web design for real businesses | MixedMakerShop",
    description: "Clear, conversion-focused websites — built directly by Topher, no agency layers.",
    url: canonical,
  },
};

// Pricing mirrors lib/web-design-packages.ts / lib/pricing-tiers.ts (the canonical source).
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Web Design",
  name: "Web Design for Real Businesses | MixedMakerShop",
  description:
    "Practical, conversion-focused web design for small businesses — clear sites that build trust and drive calls and leads. Built directly by Topher Cook.",
  provider: {
    "@type": "LocalBusiness",
    name: "MixedMakerShop",
    url: `${SITE_URL}/`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hot Springs",
      addressRegion: "AR",
      addressCountry: "US",
    },
  },
  areaServed: ["Hot Springs AR", "Hot Springs Village AR", "Lake Hamilton AR", "Benton AR", "Malvern AR", "Arkansas"],
  url: canonical,
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Web Design Packages",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Starter Setup",
        price: "400",
        priceCurrency: "USD",
        description: "A clean, simple site to look legit and make contact easy.",
      },
      {
        "@type": "Offer",
        name: "Growth Site",
        price: "900",
        priceCurrency: "USD",
        description: "Stronger presence, service-focused pages, and structure built for leads ($900–$1,800).",
      },
      {
        "@type": "Offer",
        name: "Custom Build",
        priceCurrency: "USD",
        description: "Tailored features, integrations, and support — quoted per project.",
      },
    ],
  },
};

export default function WebDesignPage() {
  return (
    <>
      <JsonLd data={serviceSchema} />
      <WebDesignServicePage />
    </>
  );
}
