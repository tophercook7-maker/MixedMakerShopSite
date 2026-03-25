/**
 * Simple bracket labor pricing for 3D print CRM (reference rate + fixed tier amounts).
 */

export const DEFAULT_PRINT_LABOR_RATE_USD_PER_HOUR = 40;

/** Reference $/hr for docs / future tiers (see env). Tier amounts below align with ~$40/hr ballpark. */
export function printLaborBaseRateUsdPerHourFromEnv(): number {
  const raw =
    process.env.PRINT_LABOR_RATE_USD_PER_HOUR?.trim() ||
    process.env.NEXT_PUBLIC_PRINT_LABOR_RATE_USD_PER_HOUR?.trim();
  const n = Number.parseFloat(String(raw ?? ""));
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_PRINT_LABOR_RATE_USD_PER_HOUR;
}

export const PRINT_LABOR_LEVELS = [
  { id: "very_simple", label: "Very simple (~15 min)", laborCostUsd: 10 },
  { id: "simple", label: "Simple (~30 min)", laborCostUsd: 20 },
  { id: "moderate", label: "Moderate (~1 hour)", laborCostUsd: 40 },
  { id: "detailed", label: "Detailed (~2 hours)", laborCostUsd: 80 },
  { id: "complex", label: "Complex (3+ hours)", laborCostUsd: 120 },
] as const;

export type PrintLaborLevelId = (typeof PRINT_LABOR_LEVELS)[number]["id"];

const LEVEL_IDS = new Set<string>(PRINT_LABOR_LEVELS.map((x) => x.id));

export function normalizePrintLaborLevel(raw: string | null | undefined): PrintLaborLevelId | null {
  const k = String(raw || "").trim().toLowerCase();
  if (!k) return null;
  if (LEVEL_IDS.has(k)) return k as PrintLaborLevelId;
  return null;
}

export function printLaborCostForLevel(id: PrintLaborLevelId | null | undefined): number | null {
  if (!id) return null;
  const row = PRINT_LABOR_LEVELS.find((x) => x.id === id);
  return row ? row.laborCostUsd : null;
}

/** Pick the closer “clean” total: multiple of 5 vs 10 (whichever is nearer). */
export function roundPrintPriceEstimate(usd: number): number {
  if (!Number.isFinite(usd) || usd <= 0) return 0;
  const r5 = Math.round(usd / 5) * 5;
  const r10 = Math.round(usd / 10) * 10;
  const d5 = Math.abs(usd - r5);
  const d10 = Math.abs(usd - r10);
  return d10 <= d5 ? r10 : r5;
}

export function computePrintPriceEstimateUsd(opts: {
  laborCostUsd: number | null | undefined;
  filamentCostUsd: number | null | undefined;
}): { subtotal: number; rounded: number } {
  const lab = opts.laborCostUsd != null && Number.isFinite(Number(opts.laborCostUsd)) ? Math.max(0, Number(opts.laborCostUsd)) : 0;
  const mat =
    opts.filamentCostUsd != null && Number.isFinite(Number(opts.filamentCostUsd)) ? Math.max(0, Number(opts.filamentCostUsd)) : 0;
  const subtotal = Math.round((lab + mat) * 100) / 100;
  return { subtotal, rounded: roundPrintPriceEstimate(subtotal) };
}
