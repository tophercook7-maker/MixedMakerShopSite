import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncLeadsFromOpportunities } from "@/lib/opportunity-lead-sync";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await syncLeadsFromOpportunities(supabase, ownerId);
    return NextResponse.json({ ok: true, stats });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Backfill from opportunities failed.",
      },
      { status: 500 }
    );
  }
}
