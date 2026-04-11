import type { Metadata } from "next";
import { ExamplesPageContent } from "@/components/public/ExamplesPageContent";

const canonical = "https://mixedmakershop.com/examples";

export const metadata: Metadata = {
  title: "Website Examples & Live Work | MixedMakerShop",
  description:
    "See real client websites and builds by Topher — Fresh Cut Property Care, Deep Well Audio, and more. Web design is the primary service at MixedMakerShop.",
  alternates: { canonical },
  openGraph: {
    title: "Website examples & live work | MixedMakerShop",
    description:
      "Real business sites and practical builds from Topher’s studio — trustworthy, conversion-focused web design first.",
    url: canonical,
  },
  robots: { index: true, follow: true },
};

export default function ExamplesPage() {
  return <ExamplesPageContent />;
}
