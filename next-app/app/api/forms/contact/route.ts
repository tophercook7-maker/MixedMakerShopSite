import { NextResponse } from "next/server";
import { handleInboundLeadSubmission } from "@/lib/crm/inbound-lead-submission";
import { contactFormSchema } from "@/lib/validations";

function parseContactMessageFields(message: string): { website?: string } {
  const websiteMatch = message.match(/^Website:\s*(.+)$/im);
  const w = websiteMatch?.[1]?.trim();
  if (w && !/^\(not provided\)$/i.test(w)) return { website: w };
  return {};
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { name, email, message } = parsed.data;
    const businessMatch = message.match(/^Business:\s*(.+)$/m);
    const businessFromMessage = businessMatch?.[1]?.trim();
    const { website: websiteFromMsg } = parseContactMessageFields(message);
    const inbound = await handleInboundLeadSubmission(
      {
        submission_type: "public_lead",
        source: "contact_form",
        name,
        business_name: businessFromMessage || name || "Contact form",
        email,
        website: websiteFromMsg,
        message,
        request: message,
      },
      { requestId },
    );
    if (!inbound.ok) {
      return NextResponse.json({ ok: false, error: inbound.error, details: inbound.details }, { status: inbound.status });
    }

    return NextResponse.json({ ok: true, id: inbound.lead_id, form_submission_id: inbound.form_submission_id, notification_sent: inbound.notification_sent });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
