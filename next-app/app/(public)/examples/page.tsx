import type { Metadata } from "next";
import { ExamplesPageContent } from "@/components/public/ExamplesPageContent";

const canonical = "https://mixedmakershop.com/examples";

export const metadata: Metadata = {
  title: "Examples | MixedMakerShop",
  description:
    "A proof wall for MixedMakerShop: website examples, GiGi’s Print Shop examples, property care examples, tools, ideas, and before-and-after builds.",
  alternates: { canonical },
  openGraph: {
    title: "Examples | MixedMakerShop",
    description:
      "Website examples, print shop examples, property care examples, tools, ideas, and practical builds from MixedMakerShop.",
    url: canonical,
  },
  robots: { index: true, follow: true },
};

export default function ExamplesPage() {
  return <ExamplesPageContent />;
}
