import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import {
  buildPrintInvoiceHtmlFromLead,
  buildPrintInvoicePlainTextFromLead,
  printInvoiceNumber,
  type PrintInvoiceLeadInput,
} from "@/lib/crm/print-invoice";
import { sendPrintInvoiceEmail } from "@/lib/crm/send-print-invoice-email";
import { isThreeDPrintLead } from "@/lib/crm/three-d-print-lead";

async function leadIdFromParams(params: Promise<{ id: string }> | { id: string }): Promise<string> {
  const resolved = await Promise.resolve(params);
  return String(resolved?.id || "").trim();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leadId = await leadIdFromParams(params);
  if (!leadId) {
    return NextResponse.json({ error: "Lead id is required." }, { status: 400 });
  }
  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("id", leadId)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Lead not found in your workspace." }, { status: 404 });
  }
  if (!isThreeDPrintLead(data)) {
    return NextResponse.json({ error: "Invoices are only available for 3D printing jobs." }, { status: 400 });
  }

  const issuedAt = new Date();
  const html = buildPrintInvoiceHtmlFromLead(data as PrintInvoiceLeadInput, issuedAt);
  const url = new URL(request.url);
  const download =
    url.searchParams.get("download") === "1" || url.searchParams.get("format") === "download";
  const filename = `MixedMakerShop-${printInvoiceNumber(String((data as { id: string }).id), issuedAt)}.html`;

  const headers = new Headers();
  headers.set("Content-Type", "text/html; charset=utf-8");
  if (download) {
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  }
  return new NextResponse(html, { headers });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leadId = await leadIdFromParams(params);
  if (!leadId) {
    return NextResponse.json({ error: "Lead id is required." }, { status: 400 });
  }
  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("id", leadId)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Lead not found in your workspace." }, { status: 404 });
  }
  if (!isThreeDPrintLead(data)) {
    return NextResponse.json({ error: "Invoices are only available for 3D printing jobs." }, { status: 400 });
  }

  const email = String((data as { email?: string | null }).email || "").trim();
  if (!email) {
    return NextResponse.json({ error: "Lead has no email address." }, { status: 400 });
  }

  const issuedAt = new Date();
  const row = data as PrintInvoiceLeadInput;
  const html = buildPrintInvoiceHtmlFromLead(row, issuedAt);
  const text = buildPrintInvoicePlainTextFromLead(row, issuedAt);
  const invoiceNumber = printInvoiceNumber(String(row.id), issuedAt);
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
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true, invoiceNumber });
}
