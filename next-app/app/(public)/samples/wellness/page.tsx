import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortfolioSampleBySlug } from "@/lib/portfolio-samples";
import { PortfolioSampleClient } from "@/components/public/portfolio-sample-client";

const SLUG = "wellness";

export const metadata: Metadata = {
  title: "Sample: Wellness & Massage Website | MixedMakerShop",
  description:
    "Premium wellness homepage sample — massage, yoga, and sound baths with layered sand-and-sage visuals and clear booking flow.",
};

export default function WellnessPortfolioPage() {
  if (!getPortfolioSampleBySlug(SLUG)) notFound();
  return <PortfolioSampleClient slug={SLUG} />;
}
