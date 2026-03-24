"use client";

import { useMemo } from "react";
import { SampleDraftClient } from "@/app/(public)/website-samples/[slug]/sample-draft-client";
import { buildSampleDraftFromPublicMockup, type PublicCrmMockupRow } from "@/lib/crm-mockup";

export function CrmMockupPreviewClient({ row }: { row: PublicCrmMockupRow }) {
  const { draft, imageCategoryKey, stylePreset, colorPreset } = useMemo(
    () => buildSampleDraftFromPublicMockup(row),
    [row]
  );

  const footerMessage = `Prepared for ${row.business_name || "your business"}. This is a layout example — not a live website.`;

  const isWellness = row.template_key === "wellness";

  return (
    <SampleDraftClient
      initialDraft={draft}
      initialMode="presentation"
      embedOptions={{
        lockPresentation: true,
        initialStylePreset: stylePreset,
        initialColorPreset: colorPreset,
        secondaryHref: "#services",
        portfolioFooter: true,
        portfolioFooterMessage: footerMessage,
        portfolioCopy: true,
        imageCategoryKey,
        wideLayout: true,
        aboutBeforeTrust: isWellness,
        testimonialsBeforeTrustBullets: isWellness,
      }}
    />
  );
}
