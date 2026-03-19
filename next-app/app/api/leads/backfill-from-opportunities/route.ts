import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncLeadsFromOpportunities } from "@/lib/opportunity-lead-sync";

export async function POST() {
  const requestId = crypto.randomUUID();
  console.info("[Backfill API] request received", {
    request_id: requestId,
    method: "POST",
  });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    console.info("[Backfill API] response sent", {
      request_id: requestId,
      status: 401,
      body: { error: "Unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let db_opportunities_count = 0;
    let db_leads_count = 0;
    try {
      const oppByUser = await supabase
        .from("opportunities")
        .select("id", { count: "exact", head: true })
        .eq("user_id", ownerId);
      if (!oppByUser.error) {
        db_opportunities_count = Number(oppByUser.count || 0);
      } else {
        const oppByOwner = await supabase
          .from("opportunities")
          .select("id", { count: "exact", head: true })
          .eq("owner_id", ownerId);
        db_opportunities_count = Number(oppByOwner.count || 0);
      }
      console.info("[Backfill API] DB query result", {
        request_id: requestId,
        query: "opportunities count by owner scope",
        row_count: db_opportunities_count,
      });
    } catch {
      db_opportunities_count = 0;
    }
    try {
      const leadsCount = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", ownerId);
      db_leads_count = Number(leadsCount.count || 0);
      console.info("[Backfill API] DB query result", {
        request_id: requestId,
        query: "leads count by owner scope",
        row_count: db_leads_count,
      });
    } catch {
      db_leads_count = 0;
    }

    const stats = await syncLeadsFromOpportunities(supabase, ownerId);
    let summary_reason = "";
    if (Number(stats.leads_created || 0) > 0) {
      summary_reason = "Leads were created successfully.";
    } else if (db_opportunities_count <= 0) {
      summary_reason = "No opportunities exist in public.opportunities";
    } else if (Number(stats.already_existing || 0) >= Number(stats.opportunities_found || 0)) {
      summary_reason = "All opportunities were already converted";
    } else if (Number(stats.insert_failed || 0) > 0 && Number(stats.opportunities_eligible || 0) > 0) {
      summary_reason = "All inserts failed";
    } else if (Number(stats.skipped_missing_workspace_id || 0) >= Number(stats.opportunities_found || 0)) {
      summary_reason = "Workspace mismatch prevented inserts";
    } else if (
      Number(stats.skipped_missing_business_name || 0) +
        Number(stats.skipped_missing_workspace_id || 0) +
        Number(stats.skipped_missing_contact_path || 0) +
        Number((stats as { skipped_low_conversion?: number }).skipped_low_conversion || 0) +
        Number((stats as { skipped_excluded?: number }).skipped_excluded || 0) >=
      Number(stats.opportunities_found || 0)
    ) {
      summary_reason = "All opportunities were filtered by qualification rules";
    } else {
      summary_reason = "No leads were created. Inspect failing records and exact_insert_errors.";
    }

    const responseBody = {
      ok: true,
      summary_reason,
      db_opportunities_count,
      db_leads_count,
      stats: {
        opportunities_scanned: stats.opportunities_scanned,
        opportunities_found: stats.opportunities_found,
        opportunities_eligible: stats.opportunities_eligible,
        leads_created: stats.leads_created,
        already_existing: stats.already_existing,
        skipped_missing_business_name: stats.skipped_missing_business_name,
        skipped_missing_workspace_id: stats.skipped_missing_workspace_id,
        skipped_owner_mismatch: stats.skipped_owner_mismatch,
        skipped_missing_contact_path: stats.skipped_missing_contact_path,
        skipped_low_conversion: (stats as { skipped_low_conversion?: number }).skipped_low_conversion || 0,
        skipped_excluded: (stats as { skipped_excluded?: number }).skipped_excluded || 0,
        skipped_missing_opportunity: stats.skipped_missing_opportunity,
        skipped_duplicate: stats.skipped_duplicate,
        insert_failed: stats.insert_failed,
        exact_insert_errors: stats.exact_insert_errors,
        failing_records: stats.failing_records,
        failed: stats.failed,
      },
    };
    console.info("[Backfill API] response sent", {
      request_id: requestId,
      status: 200,
      body: {
        ok: true,
        summary_reason,
        db_opportunities_count,
        db_leads_count,
        leads_created: Number(stats.leads_created || 0),
        insert_failed: Number(stats.insert_failed || 0),
      },
    });
    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("[Backfill API] request failed", {
      request_id: requestId,
      error: error instanceof Error ? error.message : "Backfill from opportunities failed.",
    });
    const errorBody = {
      error: error instanceof Error ? error.message : "Backfill from opportunities failed.",
    };
    console.info("[Backfill API] response sent", {
      request_id: requestId,
      status: 500,
      body: errorBody,
    });
    return NextResponse.json(
      errorBody,
      { status: 500 }
    );
  }
}
