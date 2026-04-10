import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertCrmMockupForLead } from "@/lib/crm-mockup-upsert-server";
import { recordLeadActivity } from "@/lib/lead-activity";
import { resolveOrCreateLeadFromScoutResult } from "@/lib/scout/scout-result-to-crm-lead";

export const dynamic = "force-dynamic";

function requestOrigin(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return String(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
}

/**
 * One-click: ensure CRM lead for Scout row, generate branded CRM mockup preview, store `preview_url` on lead.
 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const scoutId = String(id || "").trim();
  if (!scoutId) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolved = await resolveOrCreateLeadFromScoutResult(supabase, ownerId, scoutId);
  if (!resolved.ok) {
    return NextResponse.json(
      { error: resolved.error, reason: resolved.reason },
      { status: resolved.status }
    );
  }

  const origin = requestOrigin(request);
  const mock = await upsertCrmMockupForLead(supabase, ownerId, resolved.leadId, origin);
  if ("error" in mock) {
    return NextResponse.json(
      { error: mock.error, reason: mock.reason || "mockup_failed" },
      { status: 500 }
    );
  }

  const now = new Date().toISOString();
  const { error: leadUpdErr } = await supabase
    .from("leads")
    .update({
      preview_url: mock.previewUrl,
      last_updated_at: now,
    })
    .eq("id", resolved.leadId)
    .eq("owner_id", ownerId);

  if (leadUpdErr) {
    console.warn("[scout generate-preview] leads.preview_url update failed", leadUpdErr.message);
  }

  void recordLeadActivity(supabase, {
    ownerId,
    leadId: resolved.leadId,
    eventType: "preview_generated",
    message: "Branded mockup preview generated from Scout",
    meta: {
      preview_url: mock.previewUrl,
      mockup_slug: mock.slug,
      scout_result_id: scoutId,
      source: "scout_generate_preview",
    },
  });

  return NextResponse.json({
    ok: true,
    lead_id: resolved.leadId,
    created_lead: resolved.created,
    reason: resolved.reason,
    duplicate_reason: resolved.duplicate_reason,
    preview_url: mock.previewUrl,
    mockup_slug: mock.slug,
    business_name: resolved.businessName,
    mockup: mock.mockup,
  });
}
