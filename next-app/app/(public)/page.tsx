import type { Metadata } from "next";
import { WebDesignSalesPage } from "@/components/public/WebDesignSalesPage";

export const metadata: Metadata = {
  title: "Web Design That Brings You Customers | MixedMakerShop",
  description:
    "I build websites for small businesses that look better, load faster, and turn visitors into leads. Get your free website preview. Hot Springs, Arkansas.",
  openGraph: {
    title: "Web design that brings you customers | MixedMakerShop",
    description:
      "Small business websites built for leads — clear messaging, fast pages, mockup first. By Topher.",
    url: "https://mixedmakershop.com",
    images: ["/og-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Design That Brings You Customers | MixedMakerShop",
    description:
      "Websites for small businesses that turn visitors into leads. Free website preview. By Topher.",
    images: ["/og-image"],
  },
};

export default function HomePage() {
  return <WebDesignSalesPage />;
}
