import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const leadId = body.leadId as string | undefined;
  const markWon = body.markWon !== false;
  if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

  const supabase = await createClient();
  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();
  if (leadErr || !lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const { data: client, error: clientErr } = await supabase
    .from("clients")
    .insert({
      business_name: lead.business_name,
      contact_name: lead.contact_name,
      email: lead.email,
      phone: lead.phone,
      website: lead.website,
      notes: lead.notes,
      owner_id: user.id,
    })
    .select()
    .single();
  if (clientErr) return NextResponse.json({ error: clientErr.message }, { status: 500 });

  if (markWon) {
    await supabase.from("leads").update({ status: "won" }).eq("id", leadId);
  }

  return NextResponse.json({ client, leadId });
}
