import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortfolioSampleBySlug } from "@/lib/portfolio-samples";
import { PortfolioSampleClient } from "@/components/public/portfolio-sample-client";

const SLUG = "restaurant";

export const metadata: Metadata = {
  title: "Sample: Restaurant & Food Truck Website | MixedMakerShop",
  description:
    "Hospitality sample for dine-in, catering, and food truck events — ordering CTAs and trust. Portfolio concept by Topher.",
};

export default function RestaurantPortfolioPage() {
  if (!getPortfolioSampleBySlug(SLUG)) notFound();
  return <PortfolioSampleClient slug={SLUG} />;
}
