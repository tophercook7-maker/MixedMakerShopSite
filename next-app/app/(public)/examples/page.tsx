import type { Metadata } from "next";
import { ExamplesPageContent } from "@/components/public/ExamplesPageContent";

const canonical = "https://mixedmakershop.com/examples";

export const metadata: Metadata = {
  title: "Examples",
  description:
    "A proof wall for MixedMakerShop: website examples, lab builds, property care examples, tools, ideas, and before-and-after work.",
  alternates: { canonical },
  openGraph: {
    title: "Examples | MixedMakerShop",
    description:
      "Website examples, lab builds, property care examples, tools, ideas, and practical projects from MixedMakerShop.",
    url: canonical,
  },
  robots: { index: true, follow: true },
};

export default function ExamplesPage() {
  return <ExamplesPageContent />;
}
