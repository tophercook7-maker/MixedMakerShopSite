import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { executeManualPickBulkImport, manualPickBulkBodySchema } from "@/lib/crm/bulk-manual-picks-import";

/**
 * Admin alias for manual Top Picks bulk insert — same body and rules as
 * `POST /api/leads/bulk-manual-picks` (`{ "leads": [ ... ] }`).
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = manualPickBulkBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();
  const { created, skipped_duplicates, errors } = await executeManualPickBulkImport(
    supabase,
    ownerId,
    parsed.data.leads
  );

  return NextResponse.json({
    ok: true,
    created_count: created.length,
    created_ids: created,
    skipped_duplicates,
    errors,
  });
}
