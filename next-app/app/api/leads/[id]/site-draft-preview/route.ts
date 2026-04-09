import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { absolutePreviewUrl, allocateUniqueSiteDraftPreviewSlug } from "@/lib/mockup-branded-slug";

function requestOrigin(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return String(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
}

async function leadIdFromParams(params: Promise<{ id: string }> | { id: string }): Promise<string> {
  const resolved = await Promise.resolve(params);
  return String(resolved?.id || "").trim();
}

/**
 * GET: current branded client site draft URL (does not allocate).
 * POST: ensure `site_draft_preview_slug` exists and return canonical `/preview/{slug}` URL.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const leadId = await leadIdFromParams(params);
  if (!leadId) return NextResponse.json({ error: "Lead id required" }, { status: 400 });

  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();
  const { data: row, error } = await supabase
    .from("leads")
    .select("id,site_draft_preview_slug,business_name")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json({ error: error?.message || "Lead not found" }, { status: error ? 500 : 404 });
  }

  const slug = String((row as { site_draft_preview_slug?: string | null }).site_draft_preview_slug || "").trim();
  const origin = requestOrigin(req);
  const url = slug ? absolutePreviewUrl(origin, slug) : "";
  return NextResponse.json({
    slug: slug || null,
    preview_url: url || null,
    business_name: String((row as { business_name?: string | null }).business_name || "").trim(),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const leadId = await leadIdFromParams(params);
  if (!leadId) return NextResponse.json({ error: "Lead id required" }, { status: 400 });

  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();
  const { data: leadRow, error: leadErr } = await supabase
    .from("leads")
    .select("id,business_name,city,site_draft_preview_slug")
    .eq("id", leadId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (leadErr || !leadRow) {
    return NextResponse.json({ error: leadErr?.message || "Lead not found" }, { status: leadErr ? 500 : 404 });
  }

  let slug = String((leadRow as { site_draft_preview_slug?: string | null }).site_draft_preview_slug || "").trim();
  if (!slug) {
    const businessName = String((leadRow as { business_name?: string | null }).business_name || "").trim() || "Business";
    const city = (leadRow as { city?: string | null }).city;
    slug = await allocateUniqueSiteDraftPreviewSlug(supabase, businessName, city);
    const { error: upErr } = await supabase
      .from("leads")
      .update({ site_draft_preview_slug: slug, last_updated_at: new Date().toISOString() })
      .eq("id", leadId)
      .eq("owner_id", ownerId);
    if (upErr) {
      return NextResponse.json({ error: upErr.message || "Could not save preview slug" }, { status: 500 });
    }
  }

  const origin = requestOrigin(req);
  return NextResponse.json({
    slug,
    preview_url: absolutePreviewUrl(origin, slug),
  });
}
