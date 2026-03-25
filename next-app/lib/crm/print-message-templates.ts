/**
 * CRM quick-copy message templates for 3D print leads (stored in code — edit here to change copy).
 * Placeholders: {name}, {payment_link}, {amount}, {cash_app_url}
 */

export type PrintMessageTemplateId =
  | "deposit_request"
  | "full_payment_request"
  | "ready_for_pickup"
  | "cash_app_payment"
  | "payment_reminder"
  | "final_follow_up";

export type PrintMessageTemplateContext = {
  name: string;
  payment_link: string;
  /** Preformatted currency, e.g. $42.00 or — */
  amount_deposit: string;
  amount_full: string;
  cash_app_url: string;
};

const T: Record<PrintMessageTemplateId, { label: string; body: string }> = {
  deposit_request: {
    label: "Deposit request",
    body: [
      "Hi {name},",
      "",
      "To get your 3D print job queued, here’s the deposit link:",
      "{payment_link}",
      "",
      "Deposit amount: {amount}",
      "",
      "Once that comes through, I’ll lock you in and keep you posted.",
      "",
      "– Topher",
      "MixedMakerShop",
    ].join("\n"),
  },
  full_payment_request: {
    label: "Full payment request",
    body: [
      "Hi {name},",
      "",
      "Here’s your payment link for the 3D print job:",
      "{payment_link}",
      "",
      "Amount: {amount}",
      "",
      "Once it’s paid, I’ll move it forward.",
      "",
      "– Topher",
      "MixedMakerShop",
    ].join("\n"),
  },
  ready_for_pickup: {
    label: "Ready for pickup",
    body: [
      "Hi {name},",
      "",
      "Your 3D print is ready for pickup.",
      "",
      "If anything’s still open on payment ({amount}), you can use the same link if we sent one:",
      "{payment_link}",
      "",
      "Reply with a time that works for you or if you need shipping instead.",
      "",
      "– Topher",
      "MixedMakerShop",
    ].join("\n"),
  },
  cash_app_payment: {
    label: "Cash App payment",
    body: [
      "Hi {name},",
      "",
      "You can send {amount} via Cash App here:",
      "{cash_app_url}",
      "",
      "After you send it, reply with a quick “sent” so I can confirm on my side.",
      "",
      "– Topher",
      "MixedMakerShop",
    ].join("\n"),
  },
  payment_reminder: {
    label: "Payment reminder",
    body: [
      "Hi {name},",
      "",
      "Quick reminder — the 3D print job is waiting on payment.",
      "",
      "Link: {payment_link}",
      "Amount: {amount}",
      "",
      "If anything’s off with the link or amount, just reply and we’ll sort it.",
      "",
      "– Topher",
      "MixedMakerShop",
    ].join("\n"),
  },
  final_follow_up: {
    label: "Final follow-up",
    body: [
      "Hi {name},",
      "",
      "Checking in one last time on the 3D print job ({amount}). If you still want it, use the link below or let me know:",
      "{payment_link}",
      "",
      "If plans changed, no worries — just say the word.",
      "",
      "– Topher",
      "MixedMakerShop",
    ].join("\n"),
  },
};

export const PRINT_MESSAGE_TEMPLATE_ORDER: PrintMessageTemplateId[] = [
  "deposit_request",
  "full_payment_request",
  "ready_for_pickup",
  "cash_app_payment",
  "payment_reminder",
  "final_follow_up",
];

export function printMessageTemplateLabel(id: PrintMessageTemplateId): string {
  return T[id].label;
}

/** Replace all supported placeholders (case-sensitive keys as documented). */
export function fillPrintMessageTemplate(
  body: string,
  vars: {
    name: string;
    payment_link: string;
    amount: string;
    cash_app_url: string;
  },
): string {
  return body
    .replace(/\{name\}/g, vars.name)
    .replace(/\{payment_link\}/g, vars.payment_link)
    .replace(/\{amount\}/g, vars.amount)
    .replace(/\{cash_app_url\}/g, vars.cash_app_url);
}

function resolveAmountForTemplate(id: PrintMessageTemplateId, ctx: PrintMessageTemplateContext): string {
  const dep = ctx.amount_deposit;
  const full = ctx.amount_full;
  if (id === "deposit_request") {
    return dep !== "—" ? dep : full;
  }
  return full !== "—" ? full : dep;
}

/** Build the final message for copy/paste using live CRM context. */
export function buildPrintMessageFromTemplate(
  id: PrintMessageTemplateId,
  ctx: PrintMessageTemplateContext,
): string {
  const body = T[id].body;
  const amount = resolveAmountForTemplate(id, ctx);
  return fillPrintMessageTemplate(body, {
    name: String(ctx.name || "").trim() || "there",
    payment_link: String(ctx.payment_link || "").trim() || "(add payment link)",
    amount: amount !== "—" ? amount : "(set amounts above)",
    cash_app_url: String(ctx.cash_app_url || "").trim() || "(add Cash App URL in env or paste for customer)",
  });
}
