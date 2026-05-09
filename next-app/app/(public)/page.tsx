import type { Metadata } from "next";
import { UmbrellaHomePage } from "@/components/public/UmbrellaHomePage";

const canonical = "https://mixedmakershop.com";

export const metadata: Metadata = {
  title: "Mixed Maker Shop | Umbrella Studio · Web Design & 3D Printing in Hot Springs, AR",
  description:
    "Mixed Maker Shop is the umbrella studio in Hot Springs, AR — Topher's Web Design for websites and web systems, GiGi's Print Shop for custom 3D printing, plus tools and property care paths.",
  alternates: { canonical },
  openGraph: {
    title: "Mixed Maker Shop | Umbrella Studio for Web Design & 3D Printing in Hot Springs, AR",
    description:
      "One studio: Topher's Web Design for sites and systems, GiGi's Print Shop for useful 3D prints, organized under Mixed Maker Shop.",
    url: canonical,
    images: ["/og-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mixed Maker Shop | Umbrella Studio for Web Design & 3D Printing in Hot Springs, AR",
    description:
      "One studio: Topher's Web Design for sites and systems, GiGi's Print Shop for useful 3D prints, organized under Mixed Maker Shop.",
    images: ["/og-image"],
  },
};

export default function HomePage() {
  return <UmbrellaHomePage />;
}
