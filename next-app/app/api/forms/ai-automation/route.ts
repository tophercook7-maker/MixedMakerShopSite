import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { insertCanonicalInboundLead } from "@/lib/crm/insert-canonical-lead-service";
import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";
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
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !key) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const supabase = createClient(baseUrl, key);

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

    const { data: owner } = await supabase.from("profiles").select("id").limit(1).single();

    const { error: subErr } = await supabase
      .from("form_submissions")
      .insert({
        form_type: "ai_automation_inquiry",
        name: data.name,
        business_name: businessName ?? null,
        email: data.email,
        website,
        message,
        owner_id: owner?.id ?? null,
      })
      .select("id")
      .single();
    if (subErr) throw subErr;

    if (owner) {
      const crmNotes = message;
      const crm = await insertCanonicalInboundLead(supabase, owner.id, {
        business_name: businessName || data.name.trim() || "AI automation inquiry",
        contact_name: data.name.trim(),
        email: data.email.trim(),
        website,
        notes: crmNotes,
        why_this_lead_is_here: "Submitted AI automation inquiry from mixedmakershop.com/websites-tools#ai-automation",
        source: "ai_automation_inquiry",
        lead_source: "ai_automation_inquiry",
        status: "new",
        has_website: website ? leadHasStandaloneWebsite(website) : false,
      });
      if (!crm.ok) {
        console.error("[ai-automation] CRM insert failed", crm.error);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
