import type { Metadata } from "next";
import { BuildsPage } from "@/components/public/BuildsPage";

export const metadata: Metadata = {
  alternates: { canonical: "https://mixedmakershop.com/builds" },
  title: "Builds",
  description:
    "Full library of Topher’s work: web projects, AI tools, apps, samples, and experiments — browse and request a build.",
  openGraph: {
    title: "Builds | MixedMakerShop",
    url: "https://mixedmakershop.com/builds",
  },
};

export default function BuildsRoutePage() {
  return <BuildsPage />;
}
