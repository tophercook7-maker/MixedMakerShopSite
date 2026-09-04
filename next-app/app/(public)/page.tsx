import type { Metadata } from "next";
import { JsonLd } from "@/components/public/JsonLd";
import { UmbrellaHomePage } from "@/components/public/UmbrellaHomePage";
import { metaDescription } from "@/lib/seo/snippet-meta";
import { SITE_URL } from "@/lib/site";
import { getHomeWebPageSchema } from "@/lib/structured-data";

const canonical = SITE_URL;

export const metadata: Metadata = {
  title: "Web Design, AI, Computer Help & 3D Printing in Hot Springs AR",
  description: metaDescription(
    "One guy, a lot of skills. Websites from $400 with a free preview, AI & automation, books & audiobooks, in-home computer repair, 3D printing, and family-tree research — all by one person in Hot Springs, AR."
  ),
  keywords: [
    "MixedMakerShop",
    "Mixed Maker Shop",
    "web design Hot Springs AR",
    "small business websites",
    "AI automation",
    "in-home computer repair Hot Springs",
    "3D printing Hot Springs",
    "genealogy Hot Springs Arkansas",
    "audiobook production",
    "Hot Springs Arkansas",
  ],
  alternates: { canonical },
  openGraph: {
    title: "MixedMakerShop — One guy. A lot of skills. Hot Springs, AR",
    description: metaDescription(
      "Websites, AI & automation, books & audio, in-home computer help, 3D printing, family history, and ideas that need building. One person, Hot Springs, AR."
    ),
    url: canonical,
    images: ["/og-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MixedMakerShop — One guy. A lot of skills.",
    description: metaDescription(
      "Websites from $400, AI & automation, computer help, 3D printing, family history — one person in Hot Springs, AR."
    ),
    images: ["/og-image"],
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={getHomeWebPageSchema()} />
      <UmbrellaHomePage />
    </>
  );
}
