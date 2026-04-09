import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { processStaleFollowUpGraces } from "@/lib/crm/process-follow-up-automation";
import { isManualOnlyMode } from "@/lib/manual-mode";

/** Admin-triggered pass: closes grace-window `no_response` leads (same as list-load automation). */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isManualOnlyMode()) {
    return NextResponse.json({ ok: true, skipped: true, reason: "manual_only_mode" });
  }
  const supabase = await createClient();
  const ownerId = String(user.id || "").trim();
  const { closed } = await processStaleFollowUpGraces(supabase, ownerId);
  return NextResponse.json({ ok: true, closed });
}
