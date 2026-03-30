import type { Metadata } from "next";
import { UmbrellaGateway } from "@/components/public/UmbrellaGateway";

export const metadata: Metadata = {
  title: "MixedMakerShop | Web Design & Digital Tools for Small Businesses",
  description:
    "Web design and digital tools by Topher for small businesses — clearer messaging, faster sites, and lead-focused builds. Free homepage mockup. Hot Springs, Arkansas.",
  openGraph: {
    title: "Web Design & Digital Tools for Small Business | MixedMakerShop",
    description:
      "Websites, landing pages, and practical digital tools built to get you more leads. By Topher — start with a free mockup.",
    url: "https://mixedmakershop.com",
    images: ["/og-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Design & Digital Tools for Small Business | MixedMakerShop",
    description:
      "Small business web design and digital tools — clarity, conversions, and growth. By Topher.",
    images: ["/og-image"],
  },
};

export default function HomePage() {
  return <UmbrellaGateway />;
}
