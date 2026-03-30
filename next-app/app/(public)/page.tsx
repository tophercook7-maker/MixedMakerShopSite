import type { Metadata } from "next";
import { UmbrellaGateway } from "@/components/public/UmbrellaGateway";

export const metadata: Metadata = {
  title: "MixedMakerShop | Web Design & 3D Printing",
  description:
    "MixedMakerShop — websites that help your business grow, plus custom 3D printing for prototypes and practical parts. Hot Springs, Arkansas.",
  openGraph: {
    title: "MixedMakerShop | Websites that grow your business",
    description:
      "Most clients start with web design; I also build custom 3D printed parts and prototypes under one MixedMakerShop brand.",
    url: "https://mixedmakershop.com",
    images: ["/og-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MixedMakerShop | Web Design & 3D Printing",
    description:
      "Websites and lead-focused web design first — plus custom 3D printing when you need it. One brand, one builder.",
    images: ["/og-image"],
  },
};

export default function HomePage() {
  return <UmbrellaGateway />;
}
