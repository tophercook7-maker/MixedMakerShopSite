import type { Metadata } from "next";
import { UmbrellaGateway } from "@/components/public/UmbrellaGateway";

export const metadata: Metadata = {
  title: "MixedMakerShop | Web Design & 3D Printing",
  description:
    "MixedMakerShop — choose web design for local visibility or 3D printing for real-world parts and prototypes. Hot Springs, Arkansas.",
  openGraph: {
    title: "MixedMakerShop | What are you trying to build?",
    description:
      "Two clear paths: Topher's Web Design for websites and leads, or 3D printing and problem-solving.",
    url: "https://mixedmakershop.com",
    images: ["/og-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MixedMakerShop | Web Design & 3D Printing",
    description: "Websites, landing pages, tools, and custom 3D printing — one brand, two focused paths.",
    images: ["/og-image"],
  },
};

export default function HomePage() {
  return <UmbrellaGateway />;
}
