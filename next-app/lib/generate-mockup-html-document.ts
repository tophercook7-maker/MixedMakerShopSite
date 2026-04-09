import "server-only";

import { readFileSync } from "fs";
import { join } from "path";
import React from "react";
import { buildSampleDraftFromPublicMockup, type MockupColorPreset, type MockupStylePreset, type PublicCrmMockupRow } from "@/lib/crm-mockup";
import { MockupStaticMarkup } from "@/lib/mockup-static-markup";
import type { SampleDraft } from "@/lib/sample-draft-types";
import { buildSampleStandaloneCssVars } from "@/lib/sample-draft-css-vars";
import type { SampleImageCategory } from "@/lib/sample-fallback-images";

function escapeHtmlTitle(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadBundledExportCss(): string {
  const p = join(process.cwd(), "public", "mockup-export.css");
  try {
    return readFileSync(p, "utf8");
  } catch {
    return "/* mockup-export.css not found — open this export from the deployed app or add public/mockup-export.css */";
  }
}

/**
 * Builds a full static HTML document from a CRM mockup row (same inputs as /preview/[slug]).
 * Uses a runtime import of `react-dom/server` because Next blocks static imports of it alongside React trees.
 */
export async function generateMockupHtmlDocument(row: PublicCrmMockupRow): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { draft, imageCategoryKey, stylePreset, colorPreset } = buildSampleDraftFromPublicMockup(row);
  const cssVars = buildSampleStandaloneCssVars(stylePreset, colorPreset);
  const footerMessage = `Prepared for ${row.business_name || "your business"}. This is a layout example — not a live website.`;
  const isWellness = row.template_key === "wellness";
  const raw = row.raw_payload && typeof row.raw_payload === "object" && !Array.isArray(row.raw_payload)
    ? (row.raw_payload as Record<string, unknown>)
    : {};
  const simpleConversionLayout =
    Boolean(raw.simple_conversion_layout) || raw.mockup_signature === true;

  const inner = renderToStaticMarkup(
    React.createElement(MockupStaticMarkup, {
      draft,
      imageCategoryKey,
      cssVars,
      footerMessage,
      aboutBeforeTrust: isWellness,
      testimonialsBeforeTrustBullets: isWellness,
      simpleConversionLayout,
    })
  );

  const title = escapeHtmlTitle(`${row.business_name || "Website mockup"} | MixedMakerShop`);
  const css = loadBundledExportCss();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<meta name="robots" content="noindex,nofollow"/>
<style>
${css}
</style>
</head>
<body>
${inner}
</body>
</html>`;
}

/** Static HTML export from an explicit SampleDraft (e.g. admin quick generator). */
export async function generateMockupHtmlFromSampleDraft(
  draft: SampleDraft,
  opts: {
    businessName: string;
    stylePreset: MockupStylePreset;
    colorPreset: MockupColorPreset;
    imageCategoryKey: SampleImageCategory;
    templateKey: string;
  }
): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const cssVars = buildSampleStandaloneCssVars(opts.stylePreset, opts.colorPreset);
  const footerMessage = `Prepared for ${opts.businessName || "your business"}. Admin-generated preview — not a live website.`;
  const isWellness = opts.templateKey === "wellness";

  const inner = renderToStaticMarkup(
    React.createElement(MockupStaticMarkup, {
      draft,
      imageCategoryKey: opts.imageCategoryKey,
      cssVars,
      footerMessage,
      aboutBeforeTrust: isWellness,
      testimonialsBeforeTrustBullets: isWellness,
      simpleConversionLayout: true,
    })
  );

  const title = escapeHtmlTitle(`${opts.businessName || "Website mockup"} | MixedMakerShop`);
  const css = loadBundledExportCss();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<meta name="robots" content="noindex,nofollow"/>
<style>
${css}
</style>
</head>
<body>
${inner}
</body>
</html>`;
}
