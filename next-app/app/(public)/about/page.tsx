import type { Metadata } from "next";
import { AboutTopherPage } from "@/components/public/AboutTopherPage";
import { JsonLd } from "@/components/public/JsonLd";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/about`;

export const metadata: Metadata = {
  alternates: { canonical },
  title: "About Topher | MixedMakerShop",
  description:
    "Topher has provided local tech help since 2000 — formerly Cook's Computer Service, now MixedMakerShop with in-home computer repair, web design, AI help, and custom 3D printing in Hot Springs, Arkansas.",
  openGraph: {
    title: "About Topher | MixedMakerShop",
    url: canonical,
  },
};

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Topher | MixedMakerShop",
  url: canonical,
  description:
    "Topher has provided local tech help since 2000 — formerly Cook's Computer Service, now MixedMakerShop with in-home computer repair, web design, AI help, and custom 3D printing in Hot Springs, Arkansas.",
  mainEntity: {
    "@type": "Person",
    name: "Topher Cook",
    jobTitle: "Founder",
    url: canonical,
    worksFor: { "@type": "Organization", name: "MixedMakerShop", url: `${SITE_URL}/` },
    knowsAbout: [
      "Web Design",
      "Local SEO",
      "In-Home Computer Repair",
      "AI Automation",
      "3D Printing",
    ],
  },
};

export default function AboutRoutePage() {
  return (
    <>
      <JsonLd data={aboutSchema} />
      <AboutTopherPage />
    </>
  );
}
