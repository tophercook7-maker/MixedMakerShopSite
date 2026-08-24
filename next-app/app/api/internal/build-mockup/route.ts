import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleSupabase } from "@/lib/supabase/service-role";
import { upsertCrmMockupForLead } from "@/lib/crm-mockup-upsert-server";

/**
 * POST /api/internal/build-mockup  — headless preview builder for the auto-mailer.
 * Gated by a shared secret (x-internal-secret === INTERNAL_API_SECRET), NOT user auth,
 * so the send-queue cron can build a preview for a lead before emailing it. Builds via
 * the same template-based upsertCrmMockupForLead the admin UI uses. Returns previewUrl.
 */
function siteOrigin(): string {
  return String(process.env.NEXT_PUBLIC_SITE_URL || "https://mixedmakershop.com").replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
  const secret = String(process.env.INTERNAL_API_SECRET || "").trim();
  if (!secret || req.headers.get("x-internal-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { lead_id?: string };
  const leadId = String(body?.lead_id || "").trim();
  if (!leadId) return NextResponse.json({ error: "lead_id required" }, { status: 400 });

  const svc = getServiceRoleSupabase();
  if (!svc.ok) return NextResponse.json({ error: `missing ${svc.missing}` }, { status: 500 });
  const supabase = svc.supabase;

  const { data: owner } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
  const ownerId = String((owner as { id?: string } | null)?.id || "").trim();
  if (!ownerId) return NextResponse.json({ error: "No owner profile" }, { status: 500 });

  const result = await upsertCrmMockupForLead(supabase, ownerId, leadId, siteOrigin());
  if ("error" in result) {
    return NextResponse.json({ error: result.error, reason: result.reason }, { status: 500 });
  }
  return NextResponse.json({ ok: true, previewUrl: result.previewUrl, slug: result.slug });
}
