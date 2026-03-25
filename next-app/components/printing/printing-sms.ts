import { type PriceEstimateSnapshot, estimateSummaryRows } from "@/components/printing/printing-price-estimate";

export const PRINTING_QUOTE_PHONE_DISPLAY = "501-575-8017";
export const PRINTING_QUOTE_PHONE_E164 = "+15015758017";
export const PRINTING_QUOTE_PHONE_TEL = "tel:+15015758017";

const SMS_ESTIMATE_ORDER = [
  "Type",
  "Size",
  "Complexity",
  "Quantity",
  "Estimated starting range",
] as const;

/** Prefill body for sms: — short for mobile; includes calculator lines when snapshot is set. */
export function buildPrintQuoteSmsBody(snapshot: PriceEstimateSnapshot | null): string {
  const intro = "Hi, I need help with a 3D printed part.";
  if (!snapshot) {
    return [
      intro,
      "Problem:",
      "Size:",
      "Quantity:",
      "Photo attached separately.",
    ].join("\n");
  }

  const byLabel = Object.fromEntries(estimateSummaryRows(snapshot).map((r) => [r.label, r.value]));
  const lines = [intro];
  for (const label of SMS_ESTIMATE_ORDER) {
    const value = byLabel[label];
    if (value == null) continue;
    if (label === "Estimated starting range") {
      lines.push(`Estimated range: ${value}`);
    } else {
      lines.push(`${label}: ${value}`);
    }
  }
  lines.push("Problem:");
  return lines.join("\n");
}

/** sms: URI — use on mobile; desktop OS may open linked apps or nothing. */
export function buildPrintQuoteSmsHref(snapshot: PriceEstimateSnapshot | null): string {
  const body = buildPrintQuoteSmsBody(snapshot);
  return `sms:${PRINTING_QUOTE_PHONE_E164}?body=${encodeURIComponent(body)}`;
}
