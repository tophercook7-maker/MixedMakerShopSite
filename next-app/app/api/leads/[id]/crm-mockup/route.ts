import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { absolutePreviewUrl } from "@/lib/mockup-branded-slug";
import { upsertCrmMockupForLead } from "@/lib/crm-mockup-upsert-server";

const TABLE = "crm_mockups";

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const leadId = await leadIdFromParams(params);
  if (!leadId) return NextResponse.json({ error: "Lead id required" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("owner_id", user.id)
    .eq("lead_id", leadId)
    .maybeSingle();

  if (error) {
    console.error("[crm-mockup GET]", error.message);
    return NextResponse.json({ error: error.message, reason: "query_failed" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ mockup: null });

  const origin = requestOrigin(req);
  const slug = String((data as { mockup_slug?: string }).mockup_slug || "").trim();
  const mockup_url_resolved = slug ? absolutePreviewUrl(origin, slug) : null;
  return NextResponse.json({ mockup: { ...(data as Record<string, unknown>), mockup_url_resolved } });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const leadId = await leadIdFromParams(params);
  if (!leadId) return NextResponse.json({ error: "Lead id required" }, { status: 400 });

  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();
  const origin = requestOrigin(req);

  const result = await upsertCrmMockupForLead(supabase, ownerId, leadId, origin);
  if ("error" in result) {
    const status = result.reason === "not_found" ? 404 : 500;
    return NextResponse.json({ error: result.error, reason: result.reason }, { status });
  }

  return NextResponse.json({ mockup: result.mockup });
}
