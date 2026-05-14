import { NextResponse } from "next/server";
import { handleInboundLeadSubmission } from "@/lib/crm/inbound-lead-submission";
import { contactFormSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { name, email, message } = parsed.data;
    const inbound = await handleInboundLeadSubmission(
      {
        submission_type: "public_lead",
        source: "ring_connect",
        name,
        business_name: name || "Connect",
        email,
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
