import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { websiteCheckFormSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !key) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const supabase = createClient(baseUrl, key);

  try {
    const body = await request.json();
    const parsed = websiteCheckFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const data = parsed.data;

    const { data: owner } = await supabase.from("profiles").select("id").limit(1).single();

    const { data: submission, error: subErr } = await supabase
      .from("form_submissions")
      .insert({
        form_type: "website_check",
        name: data.name ?? null,
        business_name: data.business_name ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        website: data.website || null,
        message: data.message ?? null,
        owner_id: owner?.id ?? null,
      })
      .select("id")
      .single();
    if (subErr) throw subErr;

    if (owner) {
      await supabase.from("leads").insert({
        business_name: data.business_name || data.name || "Website check",
        contact_name: data.name ?? null,
        email: data.email,
        phone: data.phone ?? null,
        website: data.website || null,
        message: data.message ?? null,
        lead_source: "website_check",
        status: "new",
        owner_id: owner.id,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
