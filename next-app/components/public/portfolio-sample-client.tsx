"use client";

import { SampleDraftClient } from "@/app/(public)/website-samples/[slug]/sample-draft-client";
import { getPortfolioSampleBySlug } from "@/lib/portfolio-samples";

export function PortfolioSampleClient({ slug }: { slug: string }) {
  const found = getPortfolioSampleBySlug(slug);
  if (!found) return null;
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
      }}
    />
  );
}
