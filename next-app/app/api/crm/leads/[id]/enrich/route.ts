import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { runCrmLeadEnrichmentAfterSave } from "@/lib/crm/run-crm-lead-enrichment";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const ownerId = String(user.id || "").trim();
  const { id: rawId } = await context.params;
  const leadId = String(rawId || "").trim();
  if (!leadId) {
    return NextResponse.json({ ok: false, error: "Missing lead id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: exists, error: exErr } = await supabase
    .from("leads")
    .select("id")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (exErr || !exists) {
    return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  }

  const result = await runCrmLeadEnrichmentAfterSave(supabase, ownerId, leadId);

  return NextResponse.json({
    ok: true,
    leadId,
    enriched: result.enriched,
    updatedFields: result.updatedFields,
    message: result.message,
    source: result.source,
  });
}
