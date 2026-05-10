import type { Metadata } from "next";
import { UmbrellaHomePage } from "@/components/public/UmbrellaHomePage";
import { SITE_URL } from "@/lib/site";

const canonical = SITE_URL;

export const metadata: Metadata = {
  title: "Mixed Maker Shop | Umbrella Studio HQ — Web Design, Maker Builds & Digital Tools",
  description:
    "Mixed Maker Shop is the umbrella studio headquarters: Topher's Web Design (websites), 3D printing & maker builds, AI & automation, digital products, Mixed Maker Labs, and story — one umbrella, multiple branches.",
  keywords: [
    "Mixed Maker Shop",
    "umbrella studio",
    "Topher's Web Design",
    "3D printing",
    "maker builds",
    "AI automation",
    "digital products",
    "Mixed Maker Labs",
    "Hot Springs Arkansas",
    "small business websites",
  ],
  alternates: { canonical },
  openGraph: {
    title: "Mixed Maker Shop | Umbrella Studio HQ",
    description:
      "Studio headquarters for websites, maker work, AI & automation, digital products, and experiments — organized under one umbrella.",
    url: canonical,
    images: ["/og-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mixed Maker Shop | Umbrella Studio HQ",
    description:
      "Websites, 3D printing, AI tools, digital products, and labs — one umbrella studio.",
    images: ["/og-image"],
  },
};

export default function HomePage() {
  return <UmbrellaHomePage />;
}
