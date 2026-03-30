import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { recordLeadActivity } from "@/lib/lead-activity";
import { sendMockupPreviewEmail } from "@/lib/send-mockup-preview-email";

const TABLE = "crm_mockups";

function requestOrigin(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return String(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
}

function mockupAbsoluteUrl(origin: string, slug: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/mockup/${encodeURIComponent(slug)}`;
}

async function leadIdFromParams(params: Promise<{ id: string }> | { id: string }): Promise<string> {
  const resolved = await Promise.resolve(params);
  return String(resolved?.id || "").trim();
}

/**
 * POST: email the shareable mockup preview link to the lead (Resend).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized", ok: false }, { status: 401 });

  const leadId = await leadIdFromParams(params);
  if (!leadId) return NextResponse.json({ error: "Lead id required", ok: false }, { status: 400 });

  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();

  const { data: leadRow, error: leadErr } = await supabase
    .from("leads")
    .select("id,business_name,email,contact_name")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (leadErr || !leadRow) {
    return NextResponse.json(
      { error: leadErr?.message || "Lead not found", ok: false },
      { status: leadErr ? 500 : 404 },
    );
  }

  const leadEmail = String((leadRow as { email?: string | null }).email || "").trim();
  if (!leadEmail) {
    return NextResponse.json(
      { error: "Lead has no email address. Add an email before sending.", ok: false, reason: "no_email" },
      { status: 400 },
    );
  }

  const { data: mockupRow, error: mockupErr } = await supabase
    .from(TABLE)
    .select("id,mockup_slug,mockup_url,business_name")
    .eq("owner_id", ownerId)
    .eq("lead_id", leadId)
    .maybeSingle();

  if (mockupErr) {
    console.error("[crm-mockup send]", mockupErr.message);
    return NextResponse.json({ error: mockupErr.message, ok: false }, { status: 500 });
  }
  if (!mockupRow) {
    return NextResponse.json(
      { error: "No mockup for this lead. Generate a mockup first.", ok: false, reason: "no_mockup" },
      { status: 400 },
    );
  }

  const slug = String((mockupRow as { mockup_slug?: string }).mockup_slug || "").trim();
  if (!slug) {
    return NextResponse.json(
      { error: "Mockup has no preview link yet. Regenerate the mockup.", ok: false, reason: "no_preview" },
      { status: 400 },
    );
  }

  const origin = requestOrigin(req);
  const storedUrl = String((mockupRow as { mockup_url?: string | null }).mockup_url || "").trim();
  const previewUrl =
    storedUrl && /^https?:\/\//i.test(storedUrl) ? storedUrl : mockupAbsoluteUrl(origin, slug);

  if (!previewUrl) {
    return NextResponse.json(
      { error: "Could not build preview URL.", ok: false, reason: "no_preview" },
      { status: 400 },
    );
  }

  const contactName = String((leadRow as { contact_name?: string | null }).contact_name || "").trim();
  const businessName =
    String((leadRow as { business_name?: string | null }).business_name || "").trim() ||
    String((mockupRow as { business_name?: string | null }).business_name || "").trim();

  const sendResult = await sendMockupPreviewEmail({
    to: leadEmail,
    contactName,
    businessName,
    previewUrl,
  });

  if (!sendResult.ok) {
    void recordLeadActivity(supabase, {
      ownerId,
      leadId,
      eventType: "email_failed",
      message: "Mockup preview email failed",
      meta: { reason: "mockup_preview", error: sendResult.error },
    });
    return NextResponse.json({ error: sendResult.error, ok: false }, { status: 502 });
  }

  const now = new Date().toISOString();
  const mockupId = String((mockupRow as { id?: string }).id || "").trim();

  const { data: updated, error: updateErr } = await supabase
    .from(TABLE)
    .update({ sent_at: now, last_sent_to: leadEmail, updated_at: now })
    .eq("id", mockupId)
    .eq("owner_id", ownerId)
    .select()
    .single();

  if (updateErr || !updated) {
    console.error("[crm-mockup send] update after send", updateErr?.message);
    return NextResponse.json(
      {
        error:
          "Email was sent but the database could not be updated. Check Resend dashboard and try again or update manually.",
        ok: false,
        reason: "db_update_failed",
      },
      { status: 500 },
    );
  }

  void recordLeadActivity(supabase, {
    ownerId,
    leadId,
    eventType: "preview_email_sent",
    message: "Mockup preview link emailed to lead",
    meta: { to: leadEmail, mockup_slug: slug },
  });

  const resolved = mockupAbsoluteUrl(origin, slug);
  return NextResponse.json({
    ok: true,
    mockup: { ...(updated as Record<string, unknown>), mockup_url_resolved: resolved },
  });
}
