export const PROJECT_PAYMENT_STATUSES = [
  "not_requested",
  "deposit_requested",
  "deposit_received",
  "partially_paid",
  "paid_in_full",
  "refunded",
  "canceled",
] as const;

export type ProjectPaymentStatus = (typeof PROJECT_PAYMENT_STATUSES)[number];

export const PROJECT_PAYMENT_STATUS_LABELS: Record<ProjectPaymentStatus, string> = {
  not_requested: "Not requested",
  deposit_requested: "Deposit requested",
  deposit_received: "Deposit received",
  partially_paid: "Partially paid",
  paid_in_full: "Paid in full",
  refunded: "Refunded",
  canceled: "Canceled",
};

export type ProjectMoneyBadge = {
  label: "Balance Due" | "Paid in Full" | "Deposit Needed" | "Not Requested";
  className: string;
};

function money(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function calculateProjectBalance(estimatedPrice: unknown, amountPaid: unknown): number {
  return Math.max(0, money(estimatedPrice) - money(amountPaid));
}

export function projectPaymentStatusLabel(status: string | null | undefined): string {
  const key = String(status || "not_requested").trim() as ProjectPaymentStatus;
  return PROJECT_PAYMENT_STATUS_LABELS[key] || PROJECT_PAYMENT_STATUS_LABELS.not_requested;
}

export function projectMoneyBadge({
  estimatedPrice,
  amountPaid,
  paymentStatus,
}: {
  estimatedPrice: unknown;
  amountPaid: unknown;
  paymentStatus: string | null | undefined;
}): ProjectMoneyBadge {
  const status = String(paymentStatus || "not_requested").trim();
  const balance = calculateProjectBalance(estimatedPrice, amountPaid);
  const estimate = money(estimatedPrice);
  const paid = money(amountPaid);

  if (status === "not_requested" || status === "canceled") {
    return { label: "Not Requested", className: "admin-badge admin-badge-muted" };
  }
  if (status === "deposit_requested" && paid <= 0) {
    return { label: "Deposit Needed", className: "admin-badge admin-badge-overdue" };
  }
  if (status === "paid_in_full" || (estimate > 0 && balance <= 0)) {
    return { label: "Paid in Full", className: "admin-badge admin-badge-complete" };
  }
  return { label: "Balance Due", className: "admin-badge admin-badge-pending" };
}
