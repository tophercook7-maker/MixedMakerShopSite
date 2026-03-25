/** Transparent pricing helpers for the /3d-printing quick estimator (not a quote). */

export type RequestTypeKey = "small_replacement" | "mount_holder" | "organizer" | "one_off" | "not_sure";
export type SizeKey = "small" | "medium" | "large";
export type ComplexityKey = "simple" | "moderate" | "detailed";

export type PriceEstimateSnapshot = {
  requestType: RequestTypeKey;
  size: SizeKey;
  complexity: ComplexityKey;
  quantity: number;
  designHelp: boolean;
  low: number;
  high: number;
};

const REQUEST_LABELS: Record<RequestTypeKey, string> = {
  small_replacement: "Small replacement part",
  mount_holder: "Mount / holder",
  organizer: "Organizer",
  one_off: "One-off custom fix",
  not_sure: "I'm not sure",
};

const SIZE_LABELS: Record<SizeKey, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

const COMPLEXITY_LABELS: Record<ComplexityKey, string> = {
  simple: "Simple",
  moderate: "Moderate",
  detailed: "Detailed",
};

const REQUEST_SET = new Set<RequestTypeKey>([
  "small_replacement",
  "mount_holder",
  "organizer",
  "one_off",
  "not_sure",
]);
const SIZE_SET = new Set<SizeKey>(["small", "medium", "large"]);
const COMPLEXITY_SET = new Set<ComplexityKey>(["simple", "moderate", "detailed"]);

const REQUEST_BASE: Record<RequestTypeKey, number> = {
  small_replacement: 15,
  mount_holder: 20,
  organizer: 25,
  one_off: 30,
  not_sure: 20,
};

const SIZE_MOD: Record<SizeKey, number> = {
  small: 0,
  medium: 10,
  large: 20,
};

const COMPLEXITY_MOD: Record<ComplexityKey, number> = {
  simple: 0,
  moderate: 10,
  detailed: 20,
};

/** Upper-range spread added to total low estimate (after quantity). */
const COMPLEXITY_RANGE_SPREAD: Record<ComplexityKey, number> = {
  simple: 15,
  moderate: 20,
  detailed: 25,
};

export function clampQuantity(q: number): number {
  if (!Number.isFinite(q) || q < 1) return 1;
  return Math.min(500, Math.floor(q));
}

export function computePriceEstimate(opts: {
  requestType: RequestTypeKey;
  size: SizeKey;
  complexity: ComplexityKey;
  quantity: number;
  designHelp: boolean;
}): { low: number; high: number } {
  const design = opts.designHelp ? 15 : 0;
  const unit = REQUEST_BASE[opts.requestType] + SIZE_MOD[opts.size] + COMPLEXITY_MOD[opts.complexity] + design;
  const q = clampQuantity(opts.quantity);
  const low = Math.round(unit * q);
  const spread = COMPLEXITY_RANGE_SPREAD[opts.complexity];
  const high = Math.round(low + spread);
  return { low, high };
}

export function humanSummary(opts: {
  requestType: RequestTypeKey;
  size: SizeKey;
  complexity: ComplexityKey;
  quantity: number;
  designHelp: boolean;
  low: number;
  high: number;
}): string {
  const q = clampQuantity(opts.quantity);
  return [
    `Calculator: ${REQUEST_LABELS[opts.requestType]}; ${SIZE_LABELS[opts.size]}; ${COMPLEXITY_LABELS[opts.complexity]}; qty ${q}; design help ${opts.designHelp ? "yes" : "no"}`,
    `Rough range $${opts.low}–$${opts.high}`,
  ].join(" | ");
}

/** Rows for compact UI summary above submit. */
export function estimateSummaryRows(s: PriceEstimateSnapshot): { label: string; value: string }[] {
  const q = clampQuantity(s.quantity);
  return [
    { label: "Type", value: REQUEST_LABELS[s.requestType] },
    { label: "Size", value: SIZE_LABELS[s.size] },
    { label: "Complexity", value: COMPLEXITY_LABELS[s.complexity] },
    { label: "Quantity", value: String(q) },
    { label: "Design help", value: s.designHelp ? "Yes" : "No" },
    { label: "Estimated starting range", value: `$${s.low}–$${s.high}` },
  ];
}

/** Safe parse for API — returns null if shape is invalid. */
export function parsePriceEstimateSnapshotJson(raw: string): PriceEstimateSnapshot | null {
  if (!raw || raw.length > 4000) return null;
  try {
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return null;
    const r = o as Record<string, unknown>;
    const requestType = r.requestType;
    const size = r.size;
    const complexity = r.complexity;
    const quantity = r.quantity;
    const designHelp = r.designHelp;
    const low = r.low;
    const high = r.high;
    if (typeof requestType !== "string" || !REQUEST_SET.has(requestType as RequestTypeKey)) return null;
    if (typeof size !== "string" || !SIZE_SET.has(size as SizeKey)) return null;
    if (typeof complexity !== "string" || !COMPLEXITY_SET.has(complexity as ComplexityKey)) return null;
    if (typeof quantity !== "number" || !Number.isFinite(quantity)) return null;
    if (typeof designHelp !== "boolean") return null;
    if (typeof low !== "number" || typeof high !== "number" || !Number.isFinite(low) || !Number.isFinite(high))
      return null;
    const q = clampQuantity(quantity);
    return {
      requestType: requestType as RequestTypeKey,
      size: size as SizeKey,
      complexity: complexity as ComplexityKey,
      quantity: q,
      designHelp,
      low: Math.round(low),
      high: Math.round(high),
    };
  } catch {
    return null;
  }
}

/** Indented rows for emails / DB (no title line — callers add "Estimate details"). */
export function formatEstimateDetailsForStorage(snapshot: PriceEstimateSnapshot): string {
  const rows = estimateSummaryRows(snapshot);
  return rows.map((row) => `  ${row.label}: ${row.value}`).join("\n");
}

/** Short line for customer auto-reply when a parsed snapshot exists. */
export function estimateAutoReplyLine(snapshot: PriceEstimateSnapshot): string {
  return (
    `Ballpark from the calculator: ${REQUEST_LABELS[snapshot.requestType]}, about $${snapshot.low}–$${snapshot.high} ` +
    `(not a final quote).`
  );
}
