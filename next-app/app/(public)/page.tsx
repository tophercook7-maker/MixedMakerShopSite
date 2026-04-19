import type { Metadata } from "next";
import { UmbrellaHomePage } from "@/components/public/UmbrellaHomePage";

const canonical = "https://mixedmakershop.com";

export const metadata: Metadata = {
  title: "MixedMakerShop | Your Website Should Be Bringing You Clients",
  description:
    "Custom websites, mockups, and growth tools built to help real businesses get more leads.",
  alternates: { canonical },
  openGraph: {
    title: "MixedMakerShop | Your Website Should Be Bringing You Clients",
    description:
      "Custom websites, mockups, and growth tools built to help real businesses get more leads.",
    url: canonical,
    images: ["/og-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MixedMakerShop | Your Website Should Be Bringing You Clients",
    description:
      "Custom websites, mockups, and growth tools built to help real businesses get more leads.",
    images: ["/og-image"],
  },
};

export default function HomePage() {
  return <UmbrellaHomePage />;
}
