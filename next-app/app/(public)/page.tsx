import type { Metadata } from "next";
import { UmbrellaGateway } from "@/components/public/UmbrellaGateway";

export const metadata: Metadata = {
  title: "MixedMakerShop | Web Design, SEO & Digital Growth for Small Businesses",
  description:
    "Web design, SEO, and digital growth support by Topher — professional small business websites, Google visibility, and lead-focused builds. Free website preview. Hot Springs, Arkansas.",
  openGraph: {
    title: "Web Design, SEO & Digital Growth | MixedMakerShop",
    description:
      "Small business websites, search visibility, and ongoing digital support by Topher. Start with a free website preview.",
    url: "https://mixedmakershop.com",
    images: ["/og-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Design, SEO & Digital Growth | MixedMakerShop",
    description:
      "Web design and SEO for small businesses — clearer sites, better rankings, and more leads. By Topher.",
    images: ["/og-image"],
  },
};

export default function HomePage() {
  return <UmbrellaGateway />;
}
