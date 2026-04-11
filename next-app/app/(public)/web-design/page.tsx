import type { Metadata } from "next";
import { WebDesignServicePage } from "@/components/public/WebDesignServicePage";

const canonical = "https://mixedmakershop.com/web-design";

export const metadata: Metadata = {
  title: "Web Design for Real Businesses | MixedMakerShop",
  description:
    "Practical web design by Topher — clear sites that build trust and drive calls and leads. Hot Springs, AR & nationwide. Start with a free preview.",
  alternates: { canonical },
  openGraph: {
    title: "Web design for real businesses | MixedMakerShop",
    description: "Clear, conversion-focused websites — built directly by Topher, no agency layers.",
    url: canonical,
  },
};

export default function WebDesignPage() {
  return <WebDesignServicePage />;
}
