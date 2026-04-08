import type { Metadata } from "next";
import { UmbrellaHomePage } from "@/components/public/UmbrellaHomePage";

export const metadata: Metadata = {
  title: "MixedMakerShop by Topher | Web Design, 3D Printing & Digital Builds",
  description:
    "MixedMakerShop is Topher's umbrella studio in Hot Springs, Arkansas — practical web design (main service), custom 3D printing, and useful digital builds.",
  openGraph: {
    title: "MixedMakerShop by Topher | Websites, prints & digital builds",
    description:
      "Web design by Topher first — plus 3D printing and practical digital builds when you need them. Direct. No fluff.",
    url: "https://mixedmakershop.com",
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
