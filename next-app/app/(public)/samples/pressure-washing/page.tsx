import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortfolioSampleBySlug } from "@/lib/portfolio-samples";
import { PortfolioSampleClient } from "@/components/public/portfolio-sample-client";

const SLUG = "pressure-washing";

export const metadata: Metadata = {
  title: "Sample: Pressure Washing Website | MixedMakerShop",
  description:
    "Polished demo homepage for a pressure washing business — services, trust, gallery, and quote CTAs. Portfolio sample by Topher.",
};

export default function PressureWashingPortfolioPage() {
  if (!getPortfolioSampleBySlug(SLUG)) notFound();
  return <PortfolioSampleClient slug={SLUG} />;
}
