import { formatUsdAmount } from "@/lib/crm/print-payment";

export type PrintCashAppRequestKind = "deposit" | "full";

/**
 * Customer-facing Cash App request copy for 3D print jobs (deposit vs full).
 * Include amount when known; otherwise a placeholder so you notice before sending.
 */
export function buildPrintCashAppCustomerMessage(opts: {
  kind: PrintCashAppRequestKind;
  customerName: string;
  /** Handle or URL shown after "Cash App:" */
  cashAppLine: string;
  amountUsd: number | null;
}): string {
  const name = String(opts.customerName || "").trim() || "there";
  const cash = String(opts.cashAppLine || "").trim() || "(configure Cash App in env)";
  const amountStr =
    opts.amountUsd != null && Number.isFinite(Number(opts.amountUsd))
      ? formatUsdAmount(Number(opts.amountUsd))
      : "(set amount)";

  if (opts.kind === "deposit") {
    return [
      `Hi ${name},`,
      "",
      "I can get started on this.",
      "",
      "I usually take a small deposit to begin.",
      "",
      `Cash App: ${cash}`,
      `Amount: ${amountStr}`,
      "",
      "Please put your name in the note so I can match it.",
      "",
      "– Topher",
      "MixedMakerShop",
    ].join("\n");
  }

  return [
    `Hi ${name},`,
    "",
    "You can send payment here:",
    "",
    `Cash App: ${cash}`,
    `Amount: ${amountStr}`,
    "",
    "Please put your name in the note so I can match it.",
    "",
    "– Topher",
    "MixedMakerShop",
  ].join("\n");
}
