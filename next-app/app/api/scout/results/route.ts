import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ScoutLead } from "@/lib/scout/types";
import {
  fetchScoutResultsCounts,
  fetchScoutResultsForOwner,
  isScoutResultsTableMissingError,
  SCOUT_RESULTS_TABLE_MISSING_HINT,
  SCOUT_RESULTS_TABLE_MISSING_MESSAGE,
  syncOpportunitiesToScoutResults,
} from "@/lib/scout/scout-results-service";
import type { ScoutResultsSyncBody } from "@/lib/scout/scout-results-types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const include_skipped = url.searchParams.get("include_skipped") === "1";
  const include_saved = url.searchParams.get("include_saved") === "1";
  const source_type = url.searchParams.get("source_type") || undefined;
  const has_website = url.searchParams.get("has_website") as "yes" | "no" | "unknown" | undefined;
  const has_phone = url.searchParams.get("has_phone") as "yes" | "no" | undefined;
  const city_q = url.searchParams.get("city") || undefined;
  const category = url.searchParams.get("category") || undefined;
  const with_counts = url.searchParams.get("counts") !== "0";

  const { rows, error, tableMissing } = await fetchScoutResultsForOwner(supabase, ownerId, {
    include_skipped,
    include_saved,
    source_type: source_type === "all" ? undefined : source_type,
    has_website: has_website && ["yes", "no", "unknown"].includes(has_website) ? has_website : undefined,
    has_phone: has_phone && ["yes", "no"].includes(has_phone) ? has_phone : undefined,
    city_q,
    category,
    limit: 500,
  });

  if (tableMissing) {
    return NextResponse.json({
      results: [],
      counts: null,
      scoutResultsUnavailable: true,
      message: SCOUT_RESULTS_TABLE_MISSING_MESSAGE,
      hint: SCOUT_RESULTS_TABLE_MISSING_HINT,
    });
  }

  if (error) {
    if (isScoutResultsTableMissingError(error)) {
      return NextResponse.json({
        results: [],
        counts: null,
        scoutResultsUnavailable: true,
        message: SCOUT_RESULTS_TABLE_MISSING_MESSAGE,
        hint: SCOUT_RESULTS_TABLE_MISSING_HINT,
      });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  let counts = null;
  if (with_counts) {
    counts = await fetchScoutResultsCounts(supabase, ownerId);
  }

  return NextResponse.json({ results: rows, counts });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as ScoutResultsSyncBody;
  const leads = (body.opportunities || body.leads || []) as ScoutLead[];
  if (!Array.isArray(leads)) {
    return NextResponse.json({ error: "Expected opportunities or leads array." }, { status: 400 });
  }

  const { upserted, error, tableMissing } = await syncOpportunitiesToScoutResults(supabase, ownerId, leads);
  if (tableMissing) {
    return NextResponse.json({
      ok: false,
      upserted: 0,
      scoutResultsUnavailable: true,
      message: SCOUT_RESULTS_TABLE_MISSING_MESSAGE,
      hint: SCOUT_RESULTS_TABLE_MISSING_HINT,
    });
  }
  if (error) {
    if (isScoutResultsTableMissingError(error)) {
      return NextResponse.json({
        ok: false,
        upserted: 0,
        scoutResultsUnavailable: true,
        message: SCOUT_RESULTS_TABLE_MISSING_MESSAGE,
        hint: SCOUT_RESULTS_TABLE_MISSING_HINT,
      });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, upserted });
}
