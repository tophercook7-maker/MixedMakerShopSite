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
  const raw = row.raw_payload && typeof row.raw_payload === "object" && !Array.isArray(row.raw_payload)
    ? row.raw_payload
    : {};
  const simpleConversionLayout = Boolean(
    (raw as { mockup_signature?: unknown }).mockup_signature ||
      (raw as { simple_conversion_layout?: unknown }).simple_conversion_layout
  );

  return (
    <SampleDraftClient
      initialDraft={draft}
      initialMode="presentation"
      embedOptions={{
        lockPresentation: true,
        initialStylePreset: stylePreset,
        initialColorPreset: colorPreset,
        secondaryHref: simpleConversionLayout ? "#cta" : "#services",
        portfolioFooter: true,
        portfolioFooterMessage: footerMessage,
        portfolioCopy: true,
        imageCategoryKey,
        wideLayout: true,
        aboutBeforeTrust: isWellness && !simpleConversionLayout,
        testimonialsBeforeTrustBullets: isWellness && !simpleConversionLayout,
        simpleConversionLayout,
      }}
    />
  );
}
