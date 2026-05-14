import { NextResponse } from "next/server";
import { handleInboundLeadSubmission } from "@/lib/crm/inbound-lead-submission";
import { aiAutomationInquiryFormSchema } from "@/lib/validations";

function trimOpt(v: string | undefined): string | undefined {
  const t = String(v ?? "").trim();
  return t || undefined;
}

function buildAiAutomationMessage(parts: {
  automationInterest: string;
  currentProblem: string;
  urgency?: string;
  notes?: string;
}): string {
  const lines = [
    `Automation interest:\n${parts.automationInterest.trim()}`,
    `Current problem / workflow:\n${parts.currentProblem.trim()}`,
    parts.urgency ? `Urgency:\n${parts.urgency.trim()}` : null,
    parts.notes ? `Additional notes:\n${parts.notes.trim()}` : null,
  ].filter(Boolean) as string[];
  return lines.join("\n\n");
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    const body = await request.json();
    const parsed = aiAutomationInquiryFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const data = parsed.data;
    const businessName = trimOpt(data.businessName);
    const websiteRaw = trimOpt(data.website);
    const urgency = trimOpt(data.urgency);
    const notes = trimOpt(data.notes);
    const website = websiteRaw || null;

    const message = buildAiAutomationMessage({
      automationInterest: data.automationInterest,
      currentProblem: data.currentProblem,
      urgency,
      notes,
    });

    const inbound = await handleInboundLeadSubmission(
      {
        submission_type: "public_lead",
        source: "ai_automation_inquiry",
        name: data.name,
        business_name: businessName || data.name.trim() || "AI automation inquiry",
        email: data.email,
        website,
        category: "AI automation inquiry",
        service_type: "ai_automation",
        message,
        request: data.automationInterest,
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
