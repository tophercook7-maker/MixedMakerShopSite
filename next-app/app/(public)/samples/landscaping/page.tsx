import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortfolioSampleBySlug } from "@/lib/portfolio-samples";
import { PortfolioSampleClient } from "@/components/public/portfolio-sample-client";

const SLUG = "landscaping";

export const metadata: Metadata = {
  title: "Sample: Landscaping & Lawn Care Website | MixedMakerShop",
  description:
    "Evergreen lawn care and landscaping homepage sample — maintenance, mulch, trimming, seasonal trust. By Topher.",
};

export default function LandscapingPortfolioPage() {
  if (!getPortfolioSampleBySlug(SLUG)) notFound();
  return <PortfolioSampleClient slug={SLUG} />;
}
