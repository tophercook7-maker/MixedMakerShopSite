import type { Metadata } from "next";
import { UmbrellaGateway } from "@/components/public/UmbrellaGateway";

export const metadata: Metadata = {
  title: "MixedMakerShop | Custom Websites for Small Businesses",
  description:
    "Custom websites for small businesses — better sites, messaging, and digital tools to help you grow. Free mockup. Hot Springs, Arkansas.",
  openGraph: {
    title: "Custom Websites for Small Businesses | MixedMakerShop",
    description:
      "I help small businesses grow with better websites, messaging, and useful digital tools. Request a free mockup.",
    url: "https://mixedmakershop.com",
    images: ["/og-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Custom Websites for Small Businesses | MixedMakerShop",
    description:
      "Better websites and digital tools for small businesses — clarity, leads, and growth. By Topher.",
    images: ["/og-image"],
  },
};

export default function HomePage() {
  return <UmbrellaGateway />;
}
