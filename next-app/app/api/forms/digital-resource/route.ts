import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { insertCanonicalInboundLead } from "@/lib/crm/insert-canonical-lead-service";
import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";
import { digitalResourceRequestFormSchema } from "@/lib/validations";

function trimOpt(v: string | undefined): string | undefined {
  const t = String(v ?? "").trim();
  return t || undefined;
}

export async function POST(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !key) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const supabase = createClient(baseUrl, key);

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

    const { data: owner } = await supabase.from("profiles").select("id").limit(1).single();

    const { error: subErr } = await supabase
      .from("form_submissions")
      .insert({
        form_type: "digital_resource_request",
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
      const crm = await insertCanonicalInboundLead(supabase, owner.id, {
        business_name: businessName || `${data.name.trim()} — ${data.selectedResource}`,
        contact_name: data.name.trim(),
        email: data.email.trim(),
        website,
        notes: message,
        why_this_lead_is_here:
          "Requested a starter resource / checklist from mixedmakershop.com/websites-tools#templates-kits",
        source: "digital_resource_request",
        lead_source: "digital_resource_request",
        status: "new",
        has_website: website ? leadHasStandaloneWebsite(website) : false,
      });
      if (!crm.ok) {
        console.error("[digital-resource] CRM insert failed", crm.error);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
