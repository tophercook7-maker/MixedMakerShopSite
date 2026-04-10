import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveOrCreateLeadFromScoutResult } from "@/lib/scout/scout-result-to-crm-lead";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const scoutId = String(id || "").trim();
  if (!scoutId) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const r = await resolveOrCreateLeadFromScoutResult(supabase, ownerId, scoutId);
  if (!r.ok) {
    return NextResponse.json({ error: r.error, reason: r.reason }, { status: r.status });
  }

  if (r.reason === "already_in_crm") {
    return NextResponse.json({
      ok: true,
      created: false,
      reason: "already_in_crm",
      lead_id: r.leadId,
    });
  }

  if (r.reason === "duplicate_existing_lead") {
    return NextResponse.json({
      ok: true,
      created: false,
      reason: "duplicate_existing_lead",
      lead_id: r.leadId,
      duplicate_reason: r.duplicate_reason,
      message: "Linked to existing CRM lead.",
    });
  }

  return NextResponse.json({
    ok: true,
    created: true,
    reason: "created",
    lead_id: r.leadId,
    business_name: r.businessName,
  });
}
