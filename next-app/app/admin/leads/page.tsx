import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { BackfillLeadsButton } from "@/components/admin/backfill-leads-button";
import { ManualPicksBulkImport } from "@/components/admin/crm/manual-picks-bulk-import";
import { LeadsWorkflowView } from "@/components/admin/leads-workflow-view";
import { LeadsCardBrowser } from "@/components/admin/crm/leads-card-browser";
import { FollowUpTodayTable } from "@/components/admin/crm/follow-up-today-table";
import { CapturedLeadsSection } from "@/components/admin/crm/captured-leads-section";
import { computeCapturedLeads } from "@/lib/crm/captured-leads";
import { parsePrintPaymentFilterQuery, parsePrintStageQuery } from "@/lib/crm/print-dashboard-metrics";
import {
  FACEBOOK_NO_WEBSITE_REACHABLE_TARGET_PARAM,
  matchesFacebookNoWebsiteReachableFromRow,
} from "@/lib/crm/facebook-no-website-reachable";
import { printCashAppDisplayLineFromEnv, printCashAppPaymentUrlFromEnv } from "@/lib/crm/print-cashapp-config";
import { isMissingColumnError, toWorkflowLead, type LeadRowForWorkflow } from "@/lib/crm/workflow-lead-mapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    detail?: string;
    add?: string;
    view?: string;
    density?: string;
    highlight?: string;
    lane?: string;
    sort?: string;
    /** Preset: `facebook_no_website_reachable` — see `lib/crm/facebook-no-website-reachable.ts` */
    target?: string;
    /** Lead pool: `all` | `top_picks` | `scout` — card view reads this via URL */
    pool?: string;
    /** Deep-link card view to 3D print lane: `3d_printing` */
    crm_source?: string;
    /** 3D print pipeline preset: `new`, `quoted`, `approved`, … */
    print_stage?: string;
    /** 3D print payment filter: `unpaid`, `deposit_requested`, … */
    print_payment?: string;
    /** `1` = reply / follow-up queue filter */
    needs_reply?: string;
    /** `1` = leads whose next_follow_up_at is today (UTC date) */
    follow_up_today?: string;
  }>;
}) {
  const {
    error,
    detail,
    add,
    view,
    density,
    highlight,
    lane,
    sort: sortParam,
    target,
    crm_source,
    print_stage,
    print_payment,
    needs_reply,
    follow_up_today,
  } = await searchParams;
  const highlightLeadId = String(highlight || "").trim() || null;
  const classicWorkflow = String(view || "").toLowerCase() === "workflow";
  const cardDensity = String(density || "").toLowerCase() === "detailed" ? "detailed" : "compact";
  const sortRaw = String(sortParam || "").trim().toLowerCase();
  const initialListSort =
    sortRaw === "score" || sortRaw === "follow_up" || sortRaw === "business" ? sortRaw : ("created" as const);
  const targetFacebookMode = String(target || "").trim().toLowerCase() === FACEBOOK_NO_WEBSITE_REACHABLE_TARGET_PARAM;
  const crmSourceRaw = String(crm_source || "").trim().toLowerCase().replace(/-/g, "_");
  const initialCrmSourceTab =
    crmSourceRaw === "3d_printing" || crmSourceRaw === "three_d_printing" ? "three_d_printing" : null;
  const initialPrintStageFilter = parsePrintStageQuery(String(print_stage || "").trim());
  const initialPrintPaymentFilter = parsePrintPaymentFilterQuery(String(print_payment || "").trim());
  const initialNeedsReply = String(needs_reply || "").trim() === "1";
  const followUpTodayMode = String(follow_up_today || "").trim() === "1";
  /** Use card browser for 3D + follow-up-today so the 3D pipeline UI is available. */
  const threeDFollowUpToday =
    followUpTodayMode && (crmSourceRaw === "3d_printing" || crmSourceRaw === "three_d_printing");
  const printCashAppPaymentUrl = printCashAppPaymentUrlFromEnv();
  const printCashAppDisplayLine = printCashAppDisplayLineFromEnv();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view leads.
        </p>
      </section>
    );
  }

  let totalLeadsCount = 0;
  let totalOpportunitiesCount = 0;
  try {
    const leadCountRes = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId);
    totalLeadsCount = Number(leadCountRes.count || 0);
  } catch (countError) {
    console.error("[Leads Page] lead count failed", { owner_id: ownerId, error: countError });
  }

  try {
    const oppByUser = await supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("user_id", ownerId);
    if (!oppByUser.error) {
      totalOpportunitiesCount = Number(oppByUser.count || 0);
    } else {
      const oppByOwner = await supabase
        .from("opportunities")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", ownerId);
      totalOpportunitiesCount = Number(oppByOwner.count || 0);
    }
  } catch (countError) {
    console.error("[Leads Page] opportunities count failed", { owner_id: ownerId, error: countError });
  }

  let rows: LeadRowForWorkflow[] = [];
  try {
    const selectVariants = [
      "*",
      "id,owner_id,workspace_id,created_at,status,business_name,contact_name,primary_contact_name,email,phone,website,has_website,industry,category,city,state,notes,address,contact_page,facebook_url,best_contact_method,opportunity_reason,opportunity_score,conversion_score,why_this_lead_is_here,visual_business,last_contacted_at,follow_up_stage,next_follow_up_at,follow_up_status,last_outreach_channel,last_outreach_status,last_outreach_sent_at,preview_sent,email_sent,facebook_sent,text_sent,last_reply_preview,last_reply_at,is_hot_lead,unread_reply_count,source,service_type,first_outreach_message,first_outreach_sent_at,lead_source,source_url,source_label,lead_tags,print_pipeline_status,print_request_type,print_tags,print_material,print_dimensions,print_quantity,print_deadline,print_attachment_url,print_estimate_summary,print_request_summary,print_design_help_requested,print_timer_started_at,print_timer_running,print_tracked_minutes,print_manual_time_minutes,print_labor_level,print_labor_cost,price_charged,filament_cost,filament_grams_used,filament_cost_per_kg,filament_use_weight_calc,estimated_time_hours,quoted_amount,deposit_amount,final_amount,payment_request_type,payment_status,payment_method,payment_link,paid_at,last_response_at",
      "id,owner_id,workspace_id,created_at,status,business_name,email,phone,website,industry,category,notes,address,contact_page,facebook_url,best_contact_method,opportunity_reason,opportunity_score,conversion_score,last_contacted_at,next_follow_up_at,source,service_type,first_outreach_message,first_outreach_sent_at,lead_source,source_url,source_label",
      "id,owner_id,workspace_id,created_at,status,business_name,email,phone,website,industry,category,city,notes,address,contact_page,facebook_url,best_contact_method,opportunity_score,last_contacted_at,next_follow_up_at,source,service_type,first_outreach_message,first_outreach_sent_at,lead_source,source_url,source_label",
      "id,owner_id,workspace_id,created_at,status,business_name,email,email_source,phone,website,industry,category,notes,address,contact_page,facebook_url,best_contact_method,opportunity_reason,opportunity_score,last_contacted_at,next_follow_up_at,source,service_type,first_outreach_message,first_outreach_sent_at,lead_source,source_url,source_label",
      "id,owner_id,workspace_id,created_at,status,business_name,email,phone,website,industry,notes,address,opportunity_score,source,service_type,first_outreach_message,first_outreach_sent_at,lead_source,source_url,source_label",
    ];
    for (const selectClause of selectVariants) {
      const { data, error: leadsError } = await supabase
        .from("leads")
        .select(selectClause)
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });
      if (!leadsError) {
        rows = (data || []) as unknown as LeadRowForWorkflow[];
        break;
      }
      const errorMessage = String(leadsError.message || "unknown");
      if (!isMissingColumnError(errorMessage)) {
        console.error("Leads query variant failed:", { selectClause, error: leadsError });
      }
    }
  } catch (err) {
    console.error("Leads load failed:", err);
  }

  const dedupedRows = Array.from(
    new Map(
      rows
        .map((row) => [String(row.id || "").trim(), row] as const)
        .filter(([id]) => Boolean(id))
    ).values()
  );
  let rowsForUi = dedupedRows;
  if (followUpTodayMode) {
    const todayKey = new Date().toISOString().slice(0, 10);
    rowsForUi = rowsForUi.filter((r) => {
      const raw = (r as { next_follow_up_at?: string | null }).next_follow_up_at;
      if (!raw || !String(raw).trim()) return false;
      const key = new Date(String(raw)).toISOString().slice(0, 10);
      return key === todayKey;
    });
  }
  if (totalLeadsCount > 0 && rowsForUi.length > totalLeadsCount) {
    console.error("[Leads Page] rendered rows exceeded db leads count; trimming to db count", {
      owner_id: ownerId,
      db_leads_count: totalLeadsCount,
      rendered_leads_count: rowsForUi.length,
    });
    rowsForUi = rowsForUi.slice(0, totalLeadsCount);
  }
  const allCapturedLeads = computeCapturedLeads(rowsForUi, 6);
  const rowsForCaptured = targetFacebookMode ? rowsForUi.filter(matchesFacebookNoWebsiteReachableFromRow) : rowsForUi;
  const capturedLeads = computeCapturedLeads(rowsForCaptured, 6);
  const capturedFilteredEmptyMessage =
    targetFacebookMode && capturedLeads.length === 0 && allCapturedLeads.length > 0
      ? "None of your captured leads match Facebook No-Website Reachable right now."
      : undefined;
  let workflowLeads = rowsForUi.map(toWorkflowLead);
  const renderedLeadsCount = workflowLeads.length;
  const emptyStateReason =
    workflowLeads.length === 0
      ? "You have not saved any businesses yet."
      : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
            Leads
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
            Your saved businesses — use <strong className="text-emerald-200/90 font-medium">Top Picks</strong> for your hand-picked list,{" "}
            <strong className="text-sky-200/85 font-medium">Scout</strong> for discovery leads, then open a lead to work it.
          </p>
          {targetFacebookMode ? (
            <p className="text-xs mt-2 opacity-90" style={{ color: "var(--admin-muted)" }}>
              Showing only Facebook leads with no website and a contact path.
            </p>
          ) : null}
          {followUpTodayMode ? (
            <p className="text-xs mt-2 opacity-90" style={{ color: "var(--admin-muted)" }}>
              Showing leads with follow-up due today (UTC date).
              {threeDFollowUpToday ? " 3D print view — use list, board, or table below." : null}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {classicWorkflow ? (
            <Link href="/admin/leads" className="admin-btn-ghost text-sm">
              Card view
            </Link>
          ) : (
            <Link href="/admin/leads?view=workflow" className="admin-btn-ghost text-sm">
              Classic workflow
            </Link>
          )}
        </div>
      </div>

      {error ? (
        <section
          className="admin-card border"
          style={{ borderColor: "rgba(251, 191, 36, 0.35)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--admin-fg)" }}>
            We couldn&apos;t complete that action.
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
            Expand <span className="font-semibold text-[var(--admin-gold)]">Admin tools</span> at the bottom of this page for technical details.
          </p>
        </section>
      ) : null}

      <CapturedLeadsSection items={capturedLeads} filteredEmptyMessage={capturedFilteredEmptyMessage} />

      {classicWorkflow ? (
        <LeadsWorkflowView
          initialLeads={workflowLeads}
          emptyStateReason={emptyStateReason}
          initialAddOpen={String(add || "") === "1"}
        />
      ) : followUpTodayMode && !threeDFollowUpToday ? (
        <Suspense fallback={<div className="admin-card text-sm text-[var(--admin-muted)]">Loading follow-ups…</div>}>
          <FollowUpTodayTable initialLeads={workflowLeads} />
        </Suspense>
      ) : (
        <Suspense fallback={<div className="admin-card text-sm text-[var(--admin-muted)]">Loading leads…</div>}>
          <LeadsCardBrowser
            initialLeads={workflowLeads}
            emptyStateReason={emptyStateReason}
            initialAddOpen={String(add || "") === "1"}
            initialDensity={cardDensity}
            initialHighlightLeadId={highlightLeadId}
            initialLane={String(lane || "").trim() || null}
            initialSort={initialListSort}
            initialSourceTab={initialCrmSourceTab}
            initialPrintStageFilter={initialPrintStageFilter}
            initialPrintPaymentFilter={initialPrintPaymentFilter}
            initialNeedsReply={initialNeedsReply}
            printCashAppPaymentUrl={printCashAppPaymentUrl}
            printCashAppDisplayLine={printCashAppDisplayLine}
          />
        </Suspense>
      )}

      <details className="admin-card">
        <summary
          className="cursor-pointer text-sm font-semibold list-none flex items-center gap-2 [&::-webkit-details-marker]:hidden"
          style={{ color: "var(--admin-muted)" }}
        >
          <span aria-hidden className="text-[var(--admin-gold)]">
            ▶
          </span>
          Admin tools
        </summary>
        <div className="mt-4 space-y-5 pt-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
          {error ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--admin-muted)" }}>
                Last action (technical)
              </p>
              <p className="text-xs font-mono break-words" style={{ color: "#fca5a5" }}>
                {String(detail || error || "unknown error")}
              </p>
            </div>
          ) : null}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--admin-muted)" }}>
              Counts (debug)
            </p>
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              Saved leads: {totalLeadsCount} · Rows shown: {renderedLeadsCount} · Scout opportunities:{" "}
              {totalOpportunitiesCount}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--admin-muted)" }}>
              Import from opportunities
            </p>
            <BackfillLeadsButton />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--admin-muted)" }}>
              Import Top Picks (JSON)
            </p>
            <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
              Bulk-add hand-picked leads as <code className="text-[10px] opacity-90">manual_pick</code> (not Scout). Same as{" "}
              <code className="text-[10px] opacity-90">POST /api/admin/import-manual-leads</code> (alias:{" "}
              <code className="text-[10px] opacity-90">/api/leads/bulk-manual-picks</code>).
            </p>
            <ManualPicksBulkImport />
          </div>
        </div>
      </details>
    </div>
  );
}
