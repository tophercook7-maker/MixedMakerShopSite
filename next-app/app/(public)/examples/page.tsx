import type { Metadata } from "next";
import { ExamplesPageContent } from "@/components/public/ExamplesPageContent";

const canonical = "https://mixedmakershop.com/examples";

export const metadata: Metadata = {
  title: "Website Examples — Real Work & Concept Builds | MixedMakerShop",
  description:
    "Real client sites first, then concept builds and layout demos. See Fresh Cut Property Care, Deep Well Audio, and more — request a free preview for your business.",
  alternates: { canonical },
  openGraph: {
    title: "Website examples — real work & concept builds | MixedMakerShop",
    description:
      "Examples of websites and builds designed to look better and work harder. Mix of real client work and demos — get a free preview for your business.",
    url: canonical,
  },
  robots: { index: true, follow: true },
};

export default function ExamplesPage() {
  return <ExamplesPageContent />;
}
