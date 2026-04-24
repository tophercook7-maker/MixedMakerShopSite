import type { Metadata } from "next";
import { UmbrellaHomePage } from "@/components/public/UmbrellaHomePage";

const canonical = "https://mixedmakershop.com";

export const metadata: Metadata = {
  title: "MixedMakerShop | Websites, Tools, 3D Printing & Property Care in Hot Springs, AR",
  description:
    "MixedMakerShop is a practical creative studio by Topher & GiGi, building websites, digital tools, useful 3D prints, property care services, and new ideas in Hot Springs, Arkansas.",
  alternates: { canonical },
  openGraph: {
    title: "MixedMakerShop | Websites, Tools, 3D Printing & Property Care in Hot Springs, AR",
    description:
      "Useful things built online, outside, and in the workshop by Topher & GiGi.",
    url: canonical,
    images: ["/og-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MixedMakerShop | Websites, Tools, 3D Printing & Property Care in Hot Springs, AR",
    description:
      "Useful things built online, outside, and in the workshop by Topher & GiGi.",
    images: ["/og-image"],
  },
};

export default function HomePage() {
  return <UmbrellaHomePage />;
}
