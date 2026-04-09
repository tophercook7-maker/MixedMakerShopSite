import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { dealLeadStatusTouchesLastContacted, normalizeDealLeadStatus } from "@/lib/crm/deal-lead-status";
import { pickLeadPatchFields } from "@/lib/crm-lead-schema";
import { recordLeadActivity } from "@/lib/lead-activity";

const bodySchema = z.object({
  lead_status: z.enum(["new", "mockup_sent", "replied", "interested", "closed_won", "closed_lost"]),
});

async function leadIdFromParams(params: Promise<{ id: string }> | { id: string }): Promise<string> {
  const resolved = await Promise.resolve(params);
  return String(resolved?.id || "").trim();
}

/**
 * PATCH: update `leads.lead_status` (deal / follow-up tracking).
 * Bumps `last_contacted_at` when moving to replied, interested, closed_won, or closed_lost.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leadId = await leadIdFromParams(params);
  if (!leadId) return NextResponse.json({ error: "Lead id required" }, { status: 400 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const nextStatus = normalizeDealLeadStatus(parsed.data.lead_status);
  const nowIso = new Date().toISOString();
  const ownerId = String(user.id || "").trim();
  const supabase = await createClient();

  const { data: existing, error: loadErr } = await supabase
    .from("leads")
    .select("id,lead_status")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (loadErr || !existing) {
    return NextResponse.json({ error: loadErr?.message || "Lead not found" }, { status: 404 });
  }

  const prev = normalizeDealLeadStatus((existing as { lead_status?: string | null }).lead_status);

  const patch: Record<string, unknown> = {
    lead_status: nextStatus,
    last_updated_at: nowIso,
  };
  if (dealLeadStatusTouchesLastContacted(nextStatus)) {
    patch.last_contacted_at = nowIso;
  }

  const safe = pickLeadPatchFields(patch);
  const { data: updated, error: upErr } = await supabase
    .from("leads")
    .update(safe)
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .select()
    .maybeSingle();

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  void recordLeadActivity(supabase, {
    ownerId,
    leadId,
    eventType: "lead_status_changed",
    message: `Deal lead_status: ${prev} → ${nextStatus}`,
    meta: { field: "lead_status", from: prev, to: nextStatus },
  });

  return NextResponse.json({ ok: true, lead: updated });
}
