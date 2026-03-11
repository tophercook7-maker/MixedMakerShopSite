import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations";

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

    await supabase.from("form_submissions").insert({
      form_type: "connect",
      name,
      email,
      message,
      owner_id: owner?.id ?? null,
    });

    if (owner) {
      await supabase.from("leads").insert({
        business_name: name || "Connect",
        contact_name: name,
        email,
        message: message ?? null,
        lead_source: "ring_connect",
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
