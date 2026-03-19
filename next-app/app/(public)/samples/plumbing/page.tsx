import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortfolioSampleBySlug } from "@/lib/portfolio-samples";
import { PortfolioSampleClient } from "@/components/public/portfolio-sample-client";

const SLUG = "plumbing";

export const metadata: Metadata = {
  title: "Sample: Plumbing & HVAC Website | MixedMakerShop",
  description:
    "Service-trades website sample for plumbing and HVAC — repairs, water heaters, tune-ups, emergency line. Portfolio by Topher.",
};

export default function PlumbingPortfolioPage() {
  if (!getPortfolioSampleBySlug(SLUG)) notFound();
  return <PortfolioSampleClient slug={SLUG} />;
}
