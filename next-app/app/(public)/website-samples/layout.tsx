import type { Metadata } from "next";

const canonical = "https://mixedmakershop.com/website-samples";

// Index metadata only. Individual /website-samples/[slug] pages override title +
// canonical via their own generateMetadata, so this does not leak to sample pages.
export const metadata: Metadata = {
  title: "Website Samples & Concept Builds | MixedMakerShop",
  description:
    "Browse MixedMakerShop website samples — coffee shop, restaurant, church, service business, and redesign concept builds showing the design direction for Hot Springs small businesses.",
  alternates: { canonical },
  openGraph: {
    title: "Website Samples & Concept Builds | MixedMakerShop",
    description:
      "Concept builds and sample layouts for local small business websites — see the design direction before you commit.",
    url: canonical,
  },
};

export default function WebsiteSamplesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
