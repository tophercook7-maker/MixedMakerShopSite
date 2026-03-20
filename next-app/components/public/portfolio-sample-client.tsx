"use client";

import { SampleDraftClient } from "@/app/(public)/website-samples/[slug]/sample-draft-client";
import { getPortfolioSampleBySlug } from "@/lib/portfolio-samples";
import type { SampleImageCategory } from "@/lib/sample-fallback-images";

const SLUG_TO_IMAGE_CATEGORY: Record<string, SampleImageCategory> = {
  "pressure-washing": "pressure-washing",
  "auto-detailing": "auto-detailing",
  landscaping: "landscaping",
  plumbing: "plumbing",
  restaurant: "restaurant",
};

export function PortfolioSampleClient({ slug }: { slug: string }) {
  const found = getPortfolioSampleBySlug(slug);
  if (!found) return null;
  const imageCategoryKey = SLUG_TO_IMAGE_CATEGORY[slug] ?? "default-service-business";
  return (
    <SampleDraftClient
      initialDraft={found.draft}
      initialMode="presentation"
      embedOptions={{
        lockPresentation: true,
        initialStylePreset: found.stylePreset,
        initialColorPreset: found.colorPreset,
        secondaryHref: "#services",
        portfolioFooter: true,
        portfolioCopy: true,
        imageCategoryKey,
      }}
    />
  );
}
