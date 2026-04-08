import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { insertCanonicalInboundLead } from "@/lib/crm/insert-canonical-lead-service";
import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";
import { quoteFormSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const supabase = createClient(url, key);

  try {
    const body = await request.json();
    const parsed = quoteFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const data = parsed.data;

    const { data: owner } = await supabase.from("profiles").select("id").limit(1).single();

    await supabase.from("form_submissions").insert({
      form_type: "quote",
      name: data.name ?? null,
      business_name: data.business_name ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      website: data.website || null,
      message: data.message ?? null,
      owner_id: owner?.id ?? null,
    });

    if (owner) {
      const website = data.website?.trim() || null;
      const crm = await insertCanonicalInboundLead(supabase, owner.id, {
        business_name: data.business_name || data.name || "Quote request",
        contact_name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        website,
        notes: data.message ?? null,
        why_this_lead_is_here: "Submitted general quote / services request form",
        source: "quote_request",
        lead_source: "quote_request",
        status: "new",
        has_website: website ? leadHasStandaloneWebsite(website) : false,
      });
      if (!crm.ok) {
        console.error("[quote form] CRM insert failed", crm.error);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
