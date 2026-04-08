import type { Metadata } from "next";
import { WebDesignServicePage } from "@/components/public/WebDesignServicePage";

export const metadata: Metadata = {
  title: "Web Design by Topher | MixedMakerShop",
  description:
    "Clean, dependable websites for real businesses — built directly by Topher. Hot Springs, Arkansas. Start with a free mockup.",
  openGraph: {
    title: "Web design by Topher | MixedMakerShop",
    description: "Websites built to help real businesses get customers — without agency layers.",
    url: "https://mixedmakershop.com/web-design",
  },
};

export default function WebDesignPage() {
  return <WebDesignServicePage />;
}
