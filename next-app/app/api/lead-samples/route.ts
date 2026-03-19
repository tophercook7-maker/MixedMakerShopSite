import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { normalizeLeadSampleRecord } from "@/lib/lead-samples";

const TABLE = "lead_samples";

const ALLOWED_SAMPLE_FIELDS = [
  "id",
  "lead_id",
  "template_key",
  "business_name",
  "business_type",
  "hero_headline",
  "hero_subheadline",
  "cta_text",
  "intro_text",
  "services",
  "image_urls",
  "primary_image_url",
  "gallery_image_urls",
  "accent_mode",
  "preview_slug",
  "status",
  "created_at",
  "updated_at",
  "owner_id",
] as const;

function buildSafeSamplePayload(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([key, value]) =>
      (ALLOWED_SAMPLE_FIELDS as readonly string[]).includes(key) && value !== undefined
    )
  );
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const leadId = String(request.nextUrl.searchParams.get("lead_id") || "").trim();
  if (!leadId) return NextResponse.json({ items: [] });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("owner_id", user.id)
    .eq("lead_id", leadId)
    .order("updated_at", { ascending: false })
    .limit(1);
  if (error) {
    console.error("[Lead Samples API] list failed", { lead_id: leadId, error: error.message });
    return NextResponse.json({ error: error.message, reason: "schema_or_table_missing" }, { status: 500 });
  }
  const item = Array.isArray(data) && data[0] ? normalizeLeadSampleRecord({ ...(data[0] as Record<string, unknown>), source: "server", isLocalOnly: false }) : null;
  return NextResponse.json({ items: item ? [item] : [] });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const normalized = normalizeLeadSampleRecord({
    ...body,
    source: "server",
    isLocalOnly: false,
    updated_at: new Date().toISOString(),
    created_at: String(body.created_at || "").trim() || new Date().toISOString(),
  });
  if (!normalized.lead_id) {
    return NextResponse.json({ error: "lead_id is required" }, { status: 400 });
  }
  const safePayload = buildSafeSamplePayload({
    ...normalized,
    owner_id: user.id,
  });
  console.info("[Lead Samples API] upsert payload", {
    lead_id: normalized.lead_id,
    sample_id: normalized.id,
    keys: Object.keys(safePayload),
  });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(safePayload, { onConflict: "id" })
    .select()
    .single();
  if (error || !data) {
    console.error("[Lead Samples API] upsert failed", { error: error?.message || "unknown" });
    return NextResponse.json(
      {
        error: String(error?.message || "Could not persist sample."),
        reason: "schema_or_table_missing",
      },
      { status: 500 }
    );
  }
  return NextResponse.json(normalizeLeadSampleRecord({ ...(data as Record<string, unknown>), source: "server", isLocalOnly: false }));
}
