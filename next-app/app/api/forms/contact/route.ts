import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { insertCanonicalInboundLead } from "@/lib/crm/insert-canonical-lead-service";
import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";
import { contactFormSchema } from "@/lib/validations";

function parseContactMessageFields(message: string): { website?: string } {
  const websiteMatch = message.match(/^Website:\s*(.+)$/im);
  const w = websiteMatch?.[1]?.trim();
  if (w && !/^\(not provided\)$/i.test(w)) return { website: w };
  return {};
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const supabase = createClient(url, key);

  try {
    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { name, email, message } = parsed.data;

    const { data: owner } = await supabase.from("profiles").select("id").limit(1).single();

    const { error: subErr } = await supabase
      .from("form_submissions")
      .insert({ form_type: "contact", name, email, message, owner_id: owner?.id ?? null })
      .select("id")
      .single();
    if (subErr) throw subErr;

    if (owner) {
      const businessMatch = message.match(/^Business:\s*(.+)$/m);
      const businessFromMessage = businessMatch?.[1]?.trim();
      const business_name =
        businessFromMessage && businessFromMessage.length > 0 ? businessFromMessage : name || "Contact form";
      const { website: websiteFromMsg } = parseContactMessageFields(message);
      const website = websiteFromMsg || null;

      const crm = await insertCanonicalInboundLead(supabase, owner.id, {
        business_name,
        contact_name: name,
        email,
        website,
        notes: message,
        why_this_lead_is_here: "Submitted the public contact form on mixedmakershop.com",
        source: "contact_form",
        lead_source: "contact_form",
        status: "new",
        has_website: website ? leadHasStandaloneWebsite(website) : false,
      });
      if (!crm.ok) {
        console.error("[contact form] CRM insert failed", crm.error);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
