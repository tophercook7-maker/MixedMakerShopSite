import type { Metadata } from "next";
import { UmbrellaHomePage } from "@/components/public/UmbrellaHomePage";

const canonical = "https://mixedmakershop.com";

export const metadata: Metadata = {
  title: "MixedMakerShop | Web Design for Real Businesses — Topher",
  description:
    "MixedMakerShop is Topher's studio in Hot Springs, Arkansas — practical web design first, plus 3D printing and digital builds when you need them.",
  alternates: { canonical },
  openGraph: {
    title: "MixedMakerShop | Web design, 3D printing & builds by Topher",
    description:
      "Trustworthy business websites are the main focus — 3D printing and digital builds available through the same studio.",
    url: canonical,
    images: ["/og-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MixedMakerShop by Topher",
    description: "Web design, 3D printing, and practical digital builds — Hot Springs & nationwide.",
    images: ["/og-image"],
  },
};

export default function HomePage() {
  return <UmbrellaHomePage />;
}
