import type { Metadata } from "next";
import { UmbrellaHomePage } from "@/components/public/UmbrellaHomePage";
import { SITE_URL } from "@/lib/site";

const canonical = SITE_URL;

export const metadata: Metadata = {
  title: "MixedMakerShop | Practical Creative Studio by Topher & GiGi",
  description:
    "MixedMakerShop is Topher & GiGi's practical creative studio for useful things built online, outside, and in the workshop — including websites, tools, 3D printing, property care, and creative projects.",
  keywords: [
    "MixedMakerShop",
    "Topher and GiGi",
    "creative studio",
    "practical projects",
    "websites and tools",
    "3D printing",
    "property care",
    "handmade projects",
    "small business tools",
    "local services",
  ],
  alternates: { canonical },
  openGraph: {
    title: "MixedMakerShop | Practical Creative Studio by Topher & GiGi",
    description:
      "MixedMakerShop is Topher & GiGi's practical creative studio for useful things built online, outside, and in the workshop — including websites, tools, 3D printing, property care, and creative projects.",
    url: canonical,
    images: ["/og-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MixedMakerShop | Practical Creative Studio by Topher & GiGi",
    description:
      "MixedMakerShop is Topher & GiGi's practical creative studio for useful things built online, outside, and in the workshop — including websites, tools, 3D printing, property care, and creative projects.",
    images: ["/og-image"],
  },
};

export default function HomePage() {
  return <UmbrellaHomePage />;
}
