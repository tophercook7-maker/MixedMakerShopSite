/**
 * Simple HTML/text invoices for 3D printing CRM leads (server-safe).
 */

import {
  extractPrintRequestDescription,
  normalizePrintPipelineStatus,
  THREE_D_PRINT_PIPELINE_LABELS,
  type ThreeDPrintPipelineStatus,
} from "@/lib/crm/three-d-print-lead";

export type PrintInvoiceLeadInput = {
  id: string;
  contact_name?: string | null;
  primary_contact_name?: string | null;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  print_request_summary?: string | null;
  print_quantity?: string | null;
  price_charged?: unknown;
  print_pipeline_status?: string | null;
};

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function displayCustomerName(lead: PrintInvoiceLeadInput): string {
  const primary = String(lead.primary_contact_name || "").trim();
  if (primary) return primary;
  const n = String(lead.contact_name || "").trim();
  if (n) return n;
  const b = String(lead.business_name || "").trim();
  if (b.startsWith("3D Print Quote")) return b.replace(/^3D Print Quote —\s*/i, "").trim() || b;
  return b || "Customer";
}

function parsePrice(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function formatUsd(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n));
}

export function printShopPublicSite(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim() ||
    process.env.PUBLIC_SITE_URL?.replace(/\/$/, "").trim() ||
    "https://mixedmakershop.com"
  );
}

export function printShopContactEmail(): string {
  return (
    process.env.PRINT_REQUEST_NOTIFY_EMAIL?.trim() ||
    process.env.BOOKING_NOTIFY_EMAIL?.trim() ||
    "Topher@mixedmakershop.com"
  );
}

export function printInvoiceNumber(leadId: string, issuedAt: Date): string {
  const d = issuedAt.toISOString().slice(0, 10).replace(/-/g, "");
  const short = leadId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `INV-${d}-${short}`;
}

export type PrintInvoiceModel = {
  invoiceNumber: string;
  issuedDate: string;
  customerName: string;
  email: string;
  phone: string;
  description: string;
  quantityLabel: string;
  priceCharged: number | null;
  pipelineKey: ThreeDPrintPipelineStatus;
  pipelineLabel: string;
  shopName: string;
  shopSite: string;
  shopEmail: string;
};

export function buildPrintInvoiceModel(lead: PrintInvoiceLeadInput, issuedAt: Date): PrintInvoiceModel {
  const description = extractPrintRequestDescription(lead.notes ?? null, lead.print_request_summary ?? null);
  const qtyRaw = String(lead.print_quantity || "").trim();
  const quantityLabel = qtyRaw || "1";
  const priceCharged = parsePrice(lead.price_charged);
  const pipelineKey = normalizePrintPipelineStatus(lead.print_pipeline_status);
  return {
    invoiceNumber: printInvoiceNumber(lead.id, issuedAt),
    issuedDate: issuedAt.toLocaleDateString("en-US", { dateStyle: "long" }),
    customerName: displayCustomerName(lead),
    email: String(lead.email || "").trim(),
    phone: String(lead.phone || "").trim(),
    description,
    quantityLabel,
    priceCharged,
    pipelineKey,
    pipelineLabel: THREE_D_PRINT_PIPELINE_LABELS[pipelineKey],
    shopName: "MixedMakerShop",
    shopSite: printShopPublicSite(),
    shopEmail: printShopContactEmail(),
  };
}

export function buildPrintInvoiceHtml(m: PrintInvoiceModel): string {
  const totalLine = m.priceCharged == null ? "Total due: To be confirmed" : `Total due: ${formatUsd(m.priceCharged)}`;
  const desc = escapeHtml(m.description).replace(/\r\n/g, "\n").replace(/\n/g, "<br/>");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Invoice ${escapeHtml(m.invoiceNumber)} — ${escapeHtml(m.shopName)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 32px 20px; color: #111827; background: #f3f4f6; }
    .sheet { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px 36px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    h1 { font-size: 1.35rem; letter-spacing: .04em; margin: 0 0 6px; text-transform: uppercase; font-weight: 700; color: #0f172a; }
    .meta { font-size: .9rem; color: #64748b; margin-bottom: 28px; }
    .brand { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .brand-sub { font-size: .85rem; color: #64748b; line-height: 1.45; margin-bottom: 28px; }
    .grid { display: table; width: 100%; border-collapse: collapse; margin: 24px 0 8px; }
    .grid-row { display: table-row; }
    .grid dt, .grid dd { display: table-cell; padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: .9rem; vertical-align: top; }
    .grid dt { width: 34%; color: #64748b; font-weight: 600; }
    .grid dd { color: #111827; }
    table.items { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: .9rem; }
    table.items th { text-align: left; padding: 10px 12px; background: #f8fafc; color: #475569; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
    table.items td { padding: 12px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
    table.items td.num { text-align: right; white-space: nowrap; }
    .total { margin-top: 20px; text-align: right; font-size: 1.05rem; font-weight: 700; color: #0f172a; }
    .note { margin-top: 32px; font-size: .8rem; color: #94a3b8; }
    @media print { body { background: #fff; } .sheet { box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="sheet">
    <h1>Invoice</h1>
    <p class="meta">${escapeHtml(m.invoiceNumber)} · ${escapeHtml(m.issuedDate)} · ${escapeHtml(m.pipelineLabel)}</p>
    <div class="brand">${escapeHtml(m.shopName)}</div>
    <div class="brand-sub">
      ${escapeHtml(m.shopSite)}<br/>
      ${escapeHtml(m.shopEmail)}
    </div>

    <div class="grid">
      <div class="grid-row"><dt>Bill to</dt><dd>${escapeHtml(m.customerName)}</dd></div>
      ${
        m.email
          ? `<div class="grid-row"><dt>Email</dt><dd><a href="mailto:${escapeHtml(m.email)}">${escapeHtml(m.email)}</a></dd></div>`
          : ""
      }
      ${m.phone ? `<div class="grid-row"><dt>Phone</dt><dd>${escapeHtml(m.phone)}</dd></div>` : ""}
    </div>

    <table class="items">
      <thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Amount</th></tr></thead>
      <tbody>
        <tr>
          <td>${desc}</td>
          <td class="num">${escapeHtml(m.quantityLabel)}</td>
          <td class="num">${m.priceCharged == null ? "—" : escapeHtml(formatUsd(m.priceCharged))}</td>
        </tr>
      </tbody>
    </table>
    <p class="total">${escapeHtml(totalLine)}</p>
    <p class="note">Thank you for your business. Questions about this invoice? Reply to this email or contact us at the address above.</p>
  </div>
</body>
</html>`;
}

export function buildPrintInvoicePlainText(m: PrintInvoiceModel): string {
  const totalLine = m.priceCharged == null ? "Total due: To be confirmed" : `Total due: ${formatUsd(m.priceCharged)}`;
  const lines = [
    "INVOICE",
    `${m.invoiceNumber} · ${m.issuedDate} · ${m.pipelineLabel}`,
    "",
    m.shopName,
    m.shopSite,
    m.shopEmail,
    "",
    "Bill to",
    `  ${m.customerName}`,
    m.email ? `  Email: ${m.email}` : "",
    m.phone ? `  Phone: ${m.phone}` : "",
    "",
    "Line items",
    `  Description: ${m.description.replace(/\s+/g, " ").trim()}`,
    `  Quantity: ${m.quantityLabel}`,
    `  Amount: ${m.priceCharged == null ? "—" : formatUsd(m.priceCharged)}`,
    "",
    totalLine,
    "",
    "Thank you for your business.",
  ];
  return lines.filter((x) => x !== "").join("\n");
}

export function buildPrintInvoiceHtmlFromLead(lead: PrintInvoiceLeadInput, issuedAt: Date): string {
  return buildPrintInvoiceHtml(buildPrintInvoiceModel(lead, issuedAt));
}

export function buildPrintInvoicePlainTextFromLead(lead: PrintInvoiceLeadInput, issuedAt: Date): string {
  return buildPrintInvoicePlainText(buildPrintInvoiceModel(lead, issuedAt));
}
