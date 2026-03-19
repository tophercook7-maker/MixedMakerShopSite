import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortfolioSampleBySlug } from "@/lib/portfolio-samples";
import { PortfolioSampleClient } from "@/components/public/portfolio-sample-client";

const SLUG = "auto-detailing";

export const metadata: Metadata = {
  title: "Sample: Auto Detailing Website | MixedMakerShop",
  description:
    "Mobile-friendly auto detailing sample with packages, gallery, and booking-focused CTAs. Portfolio concept by Topher.",
};

export default function AutoDetailingPortfolioPage() {
  if (!getPortfolioSampleBySlug(SLUG)) notFound();
  return <PortfolioSampleClient slug={SLUG} />;
}
