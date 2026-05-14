import { NextResponse } from "next/server";
import { handleInboundLeadSubmission } from "@/lib/crm/inbound-lead-submission";
import { quoteFormSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json();
    const parsed = quoteFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const data = parsed.data;
    const message = data.message || "General quote request";
    const inbound = await handleInboundLeadSubmission(
      {
        submission_type: "public_lead",
        source: "quote_request",
        name: data.name,
        business_name: data.business_name || data.name || "Quote request",
        email: data.email,
        phone: data.phone,
        website: data.website,
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
