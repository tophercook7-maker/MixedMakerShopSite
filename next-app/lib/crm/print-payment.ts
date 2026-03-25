/**
 * 3D print lead payment helpers (Cash App is the primary path; Stripe helpers remain for legacy rows / future use).
 */

import { normalizePrintPipelineStatus } from "@/lib/crm/three-d-print-lead";

export const PRINT_PAYMENT_STATUSES = [
  "unpaid",
  "deposit_requested",
  "partially_paid",
  "paid",
  "refunded",
] as const;

export type PrintPaymentStatus = (typeof PRINT_PAYMENT_STATUSES)[number];

export const PRINT_PAYMENT_STATUS_LABELS: Record<PrintPaymentStatus, string> = {
  unpaid: "Unpaid",
  deposit_requested: "Deposit requested",
  partially_paid: "Partially paid",
  paid: "Paid",
  refunded: "Refunded",
};

export function normalizePrintPaymentStatus(raw: string | null | undefined): PrintPaymentStatus {
  const k = String(raw || "unpaid").toLowerCase().trim();
  if ((PRINT_PAYMENT_STATUSES as readonly string[]).includes(k)) return k as PrintPaymentStatus;
  return "unpaid";
}

export const PRINT_PAYMENT_METHODS = ["stripe", "cashapp", "manual"] as const;
export type PrintPaymentMethod = (typeof PRINT_PAYMENT_METHODS)[number];

export const PRINT_PAYMENT_METHOD_LABELS: Record<PrintPaymentMethod, string> = {
  stripe: "Stripe",
  cashapp: "Cash App",
  manual: "Manual",
};

export function normalizePrintPaymentMethod(raw: string | null | undefined): PrintPaymentMethod {
  const k = String(raw || "").toLowerCase().trim().replace(/\s+/g, "_");
  if (k === "stripe") return "stripe";
  if (k === "cashapp" || k === "cash_app") return "cashapp";
  return "manual";
}

export function formatUsdAmount(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n));
}

function num(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * Default share when `deposit_amount` is unset (change here or wire to env later).
 */
export const DEFAULT_DEPOSIT_FRACTION = 0.5;

export function resolveDefaultDepositUsd(quoted_amount?: unknown): number | null {
  const q = num(quoted_amount);
  if (q == null || q <= 0) return null;
  return Math.round(q * DEFAULT_DEPOSIT_FRACTION * 100) / 100;
}

/** Explicit deposit, or DEFAULT_DEPOSIT_FRACTION of quote when deposit not set. */
export function resolveEffectiveDepositAmountUsd(opts: {
  deposit_amount?: unknown;
  quoted_amount?: unknown;
}): number | null {
  const d = num(opts.deposit_amount);
  if (d != null && d > 0) return d;
  return resolveDefaultDepositUsd(opts.quoted_amount);
}

export type PrintPaymentRequestType = "deposit" | "full";

export function normalizePrintPaymentRequestType(raw: string | null | undefined): PrintPaymentRequestType {
  return String(raw || "").toLowerCase().trim() === "deposit" ? "deposit" : "full";
}

export const PRINT_PAYMENT_REQUEST_LABELS: Record<PrintPaymentRequestType, string> = {
  deposit: "Deposit",
  full: "Full payment",
};

/** Resolve dollars for a payment request (deposit vs full balance). */
export function resolveCheckoutAmountUsd(opts: {
  for: "deposit" | "full";
  deposit_amount?: unknown;
  final_amount?: unknown;
  price_charged?: unknown;
  quoted_amount?: unknown;
}): { usd: number | null; label: string } {
  if (opts.for === "deposit") {
    const d = resolveEffectiveDepositAmountUsd({
      deposit_amount: opts.deposit_amount,
      quoted_amount: opts.quoted_amount,
    });
    if (d == null || d <= 0) return { usd: null, label: "deposit" };
    return { usd: d, label: `deposit (${formatUsdAmount(d)})` };
  }
  const order = [opts.final_amount, opts.price_charged, opts.quoted_amount];
  for (const v of order) {
    const x = num(v);
    if (x != null && x > 0) return { usd: x, label: `total (${formatUsdAmount(x)})` };
  }
  return { usd: null, label: "full" };
}

const STRIPE_MIN_USD = 0.5;

export function usdToStripeCents(usd: number): number | null {
  if (!Number.isFinite(usd) || usd < STRIPE_MIN_USD) return null;
  return Math.round(usd * 100);
}

/**
 * Best-effort “amount still to collect” for dashboards / follow-up lists.
 * Not accounting — for CRM visibility only.
 */
export function computePrintJobAmountDueUsd(lead: {
  print_pipeline_status?: string | null;
  payment_status?: string | null;
  payment_request_type?: string | null;
  quoted_amount?: unknown;
  deposit_amount?: unknown;
  final_amount?: unknown;
  price_charged?: unknown;
}): { due: number | null; dueKind: "deposit" | "full" | "balance" | null } {
  const pay = normalizePrintPaymentStatus(lead.payment_status);
  if (pay === "paid" || pay === "refunded") return { due: null, dueKind: null };

  const pipe = normalizePrintPipelineStatus(lead.print_pipeline_status);
  const fullUsd = resolveCheckoutAmountUsd({
    for: "full",
    deposit_amount: lead.deposit_amount,
    final_amount: lead.final_amount,
    price_charged: lead.price_charged,
    quoted_amount: lead.quoted_amount,
  }).usd;

  const depUsd = resolveEffectiveDepositAmountUsd({
    deposit_amount: lead.deposit_amount,
    quoted_amount: lead.quoted_amount,
  });

  if (pay === "deposit_requested") {
    return { due: depUsd, dueKind: depUsd != null && depUsd > 0 ? "deposit" : null };
  }

  if (pay === "partially_paid") {
    if (fullUsd == null) return { due: null, dueKind: "balance" };
    const d = depUsd ?? 0;
    const bal = Math.round((fullUsd - d) * 100) / 100;
    if (bal <= 0) return { due: null, dueKind: null };
    return { due: bal, dueKind: "balance" };
  }

  if (pipe === "ready" || pipe === "approved" || pipe === "printing") {
    return { due: fullUsd, dueKind: fullUsd != null && fullUsd > 0 ? "full" : null };
  }

  if (pipe === "quoted") {
    const reqDep = normalizePrintPaymentRequestType(lead.payment_request_type) === "deposit";
    if (reqDep && depUsd != null && depUsd > 0) {
      return { due: depUsd, dueKind: "deposit" };
    }
    return { due: fullUsd, dueKind: fullUsd != null && fullUsd > 0 ? "full" : null };
  }

  return { due: fullUsd, dueKind: fullUsd != null && fullUsd > 0 ? "full" : null };
}

export function publicSiteBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim();
  if (fromEnv) return fromEnv;
  const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  if (!vercel) return "";
  return vercel.startsWith("http") ? vercel : `https://${vercel}`;
}

/**
 * @deprecated Use `buildPrintCashAppCustomerMessage` from `print-cashapp-messages.ts`. Retained for optional Stripe reintroduction.
 */
export function buildStripePaymentRequestMessage(opts: {
  customerName: string;
  paymentLink: string;
  amountUsd: number | null;
}): string {
  const name = String(opts.customerName || "").trim() || "there";
  const amountLine =
    opts.amountUsd != null && Number.isFinite(opts.amountUsd)
      ? formatUsdAmount(opts.amountUsd)
      : "See link";
  return [
    `Hi ${name},`,
    "",
    "Here's your payment link for the 3D print job:",
    opts.paymentLink.trim(),
    "",
    "Amount:",
    amountLine,
    "",
    "Once it's paid, I'll move it forward.",
    "",
    "– Topher",
    "MixedMakerShop",
  ].join("\n");
}
