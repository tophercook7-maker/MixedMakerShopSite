import {
  buildPrintInvoiceHtmlFromLead,
  buildPrintInvoicePlainTextFromLead,
  printInvoiceNumber,
  type PrintInvoiceLeadInput,
} from "@/lib/crm/print-invoice";
import { sendPrintInvoiceEmail } from "@/lib/crm/send-print-invoice-email";
import { isThreeDPrintLead, normalizePrintPipelineStatus } from "@/lib/crm/three-d-print-lead";

function transitionIntoInvoiceStage(prevRaw: string | null | undefined, nextRaw: string | null | undefined): boolean {
  const prev = normalizePrintPipelineStatus(prevRaw);
  const next = normalizePrintPipelineStatus(nextRaw);
  if (prev === next) return false;
  return next === "approved" || next === "ready";
}

/**
 * Fire-and-forget when print pipeline moves into Approved or Ready.
 */
export async function maybeAutoEmailPrintInvoiceOnPipelineChange(args: {
  leadRow: Record<string, unknown>;
  prevPrintPipeline: string | null | undefined;
  nextPrintPipeline: string | null | undefined;
}): Promise<void> {
  if (!isThreeDPrintLead(args.leadRow as Parameters<typeof isThreeDPrintLead>[0])) return;
  if (!transitionIntoInvoiceStage(args.prevPrintPipeline, args.nextPrintPipeline)) return;

  const email = String(args.leadRow.email || "").trim();
  if (!email) {
    console.info("[print-invoice] auto-send skipped: no customer email", { leadId: args.leadRow.id });
    return;
  }

  const issuedAt = new Date();
  const leadId = String(args.leadRow.id || "");
  const row = args.leadRow as PrintInvoiceLeadInput;
  const html = buildPrintInvoiceHtmlFromLead(row, issuedAt);
  const text = buildPrintInvoicePlainTextFromLead(row, issuedAt);
  const invoiceNumber = printInvoiceNumber(leadId, issuedAt);
  const replyTo =
    process.env.PRINT_REQUEST_NOTIFY_EMAIL?.trim() ||
    process.env.BOOKING_NOTIFY_EMAIL?.trim() ||
    null;

  const result = await sendPrintInvoiceEmail({
    to: email,
    subject: `Invoice ${invoiceNumber} — MixedMakerShop`,
    html,
    text,
    replyTo,
  });

  if (!result.ok) {
    console.error("[print-invoice] auto-send failed", { leadId, error: result.error });
    return;
  }
  console.info("[print-invoice] auto-sent", { leadId, to: email, invoiceNumber });
}
