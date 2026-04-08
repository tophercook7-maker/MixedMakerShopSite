import type { Metadata } from "next";
import { BuildsPage } from "@/components/public/BuildsPage";

export const metadata: Metadata = {
  title: "Digital Builds by Topher | MixedMakerShop",
  description:
    "Beyond client websites: tools, experiments, and practical digital systems by Topher — context for MixedMakerShop’s broader build capability.",
  openGraph: {
    title: "Digital builds & experiments | MixedMakerShop",
    url: "https://mixedmakershop.com/builds",
  },
};

export default function BuildsRoutePage() {
  return <BuildsPage />;
}
