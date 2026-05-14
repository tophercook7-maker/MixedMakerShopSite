import { NextResponse } from "next/server";
import { handleInboundLeadSubmission } from "@/lib/crm/inbound-lead-submission";
import { digitalResourceRequestFormSchema } from "@/lib/validations";

function trimOpt(v: string | undefined): string | undefined {
  const t = String(v ?? "").trim();
  return t || undefined;
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json();
    const parsed = digitalResourceRequestFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const data = parsed.data;
    const businessName = trimOpt(data.businessName);
    const websiteRaw = trimOpt(data.website);
    const notes = trimOpt(data.notes);
    const website = websiteRaw || null;

    const message = [
      `Requested resource: ${data.selectedResource}`,
      businessName ? `Business: ${businessName}` : null,
      website ? `Website: ${website}` : null,
      notes ? `Notes:\n${notes}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const inbound = await handleInboundLeadSubmission(
      {
        submission_type: "public_lead",
        source: "digital_resource_request",
        name: data.name,
        business_name: businessName || `${data.name.trim()} - ${data.selectedResource}`,
        email: data.email,
        website,
        category: "Digital resource request",
        service_type: "digital_resource",
        message,
        request: `Requested resource: ${data.selectedResource}`,
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
