"use client";

import { SampleDraftClient } from "@/app/(public)/website-samples/[slug]/sample-draft-client";
import { getPortfolioSampleBySlug } from "@/lib/portfolio-samples";
import { imageCategoryFromPortfolioRouteSlug } from "@/lib/sample-fallback-images";

export function PortfolioSampleClient({ slug }: { slug: string }) {
  const found = getPortfolioSampleBySlug(slug);
  if (!found) return null;
  const imageCategoryKey = imageCategoryFromPortfolioRouteSlug(slug);
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
