import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { normalizeLeadSampleRecord } from "@/lib/lead-samples";

const TABLE = "lead_samples";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const sampleId = String(id || "").trim();
  if (!sampleId) return NextResponse.json({ error: "sample id is required" }, { status: 400 });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("owner_id", user.id)
    .eq("id", sampleId)
    .maybeSingle();
  if (error) {
    console.error("[Lead Samples API] get failed", { sample_id: sampleId, error: error.message });
    return NextResponse.json({ error: error.message, reason: "schema_or_table_missing" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Sample not found", reason: "not_found" }, { status: 404 });
  return NextResponse.json(normalizeLeadSampleRecord({ ...(data as Record<string, unknown>), source: "server", isLocalOnly: false }));
}
