import type { Metadata } from "next";
import { BuildsPage } from "@/components/public/BuildsPage";

export const metadata: Metadata = {
  title: "Builds | MixedMakerShop",
  description:
    "Full library of Topher’s work: web projects, AI tools, samples, experiments, and 3D printing — browse and request a build.",
  openGraph: {
    title: "Builds | MixedMakerShop",
    url: "https://mixedmakershop.com/builds",
  },
};

export default function BuildsRoutePage() {
  return <BuildsPage />;
}
