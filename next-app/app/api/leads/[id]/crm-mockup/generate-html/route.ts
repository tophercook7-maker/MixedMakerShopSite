import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { PublicCrmMockupRow } from "@/lib/crm-mockup";
import { generateMockupHtmlDocument } from "@/lib/generate-mockup-html-document";

const TABLE = "crm_mockups";

function dbRowToPublicMockup(row: Record<string, unknown>): PublicCrmMockupRow {
  const raw = row.raw_payload;
  return {
    id: String(row.id ?? ""),
    template_key: String(row.template_key ?? ""),
    business_name: String(row.business_name ?? ""),
    city: row.city == null ? null : String(row.city),
    category: row.category == null ? null : String(row.category),
    phone: row.phone == null ? null : String(row.phone),
    email: row.email == null ? null : String(row.email),
    facebook_url: row.facebook_url == null ? null : String(row.facebook_url),
    headline: String(row.headline ?? ""),
    subheadline: String(row.subheadline ?? ""),
    cta_text: String(row.cta_text ?? ""),
    mockup_slug: String(row.mockup_slug ?? ""),
    raw_payload: raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null,
  };
}

async function leadIdFromParams(params: Promise<{ id: string }> | { id: string }): Promise<string> {
  const resolved = await Promise.resolve(params);
  return String(resolved?.id || "").trim();
}

/**
 * POST: regenerate static HTML from the stored CRM mockup row and persist to crm_mockups.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized", ok: false }, { status: 401 });

  const leadId = await leadIdFromParams(params);
  if (!leadId) return NextResponse.json({ error: "Lead id required", ok: false }, { status: 400 });

  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();

  const { data: row, error: fetchErr } = await supabase
    .from(TABLE)
    .select("*")
    .eq("owner_id", ownerId)
    .eq("lead_id", leadId)
    .maybeSingle();

  if (fetchErr) {
    console.error("[crm-mockup generate-html] fetch", fetchErr.message);
    return NextResponse.json({ error: fetchErr.message, ok: false, reason: "query_failed" }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json(
      { error: "No mockup for this lead. Generate a shareable mockup first.", ok: false, reason: "no_mockup" },
      { status: 404 },
    );
  }

  const rec = row as Record<string, unknown>;
  const id = String(rec.id || "").trim();
  if (!id) {
    return NextResponse.json({ error: "Invalid mockup row", ok: false, reason: "invalid_row" }, { status: 500 });
  }

  let html: string;
  try {
    html = await generateMockupHtmlDocument(dbRowToPublicMockup(rec));
  } catch (e) {
    const message = e instanceof Error ? e.message : "HTML generation failed";
    console.error("[crm-mockup generate-html]", e);
    return NextResponse.json({ error: message, ok: false, reason: "render_failed" }, { status: 500 });
  }

  const html_generated_at = new Date().toISOString();
  const { data: updated, error: upErr } = await supabase
    .from(TABLE)
    .update({ generated_html: html, html_generated_at })
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select()
    .single();

  if (upErr || !updated) {
    console.error("[crm-mockup generate-html] update", upErr?.message);
    return NextResponse.json(
      { error: upErr?.message || "Could not save generated HTML", ok: false, reason: "update_failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    mockup: { ...(updated as Record<string, unknown>) },
    html_generated_at,
  });
}
