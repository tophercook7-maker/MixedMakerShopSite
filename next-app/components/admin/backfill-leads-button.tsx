"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BackfillResponse = {
  ok?: boolean;
  message?: string;
  workspace_id?: string;
  crm_supabase_host?: string;
  scout_supabase_host?: string;
  stats?: {
    opportunities_found?: number;
    opportunities_evaluated?: number;
    eligible_for_lead_creation?: number;
    leads_created?: number;
    duplicates_skipped?: number;
    filtered_out?: number;
    evaluated?: number;
    eligible?: number;
    created?: number;
    duplicate_skipped?: number;
    filtered_low_score?: number;
    filtered_missing_business_name?: number;
    filtered_missing_contact_path?: number;
    filtered_missing_email?: number;
    filtered_missing_opportunity_reason?: number;
    filtered_missing_workspace?: number;
    filtered_existing_linked_opportunity?: number;
    duplicate_by_website?: number;
    duplicate_by_phone?: number;
    duplicate_by_business_name_city?: number;
    leads_with_email?: number;
    leads_with_phone?: number;
    leads_with_contact_page?: number;
    leads_with_facebook?: number;
    leads_with_no_contact_path?: number;
    actionable_email_leads_created?: number;
    leads_skipped_due_no_email?: number;
    insert_attempted?: number;
    insert_succeeded?: number;
    insert_failed?: number;
    debug_mode?: boolean;
    intake_threshold_used?: number;
    contact_rule_used?: string;
    debug_decisions?: Array<{
      opportunity_id?: string | null;
      business_name?: string | null;
      score?: number;
      decision?: string;
      reason?: string;
    }>;
    exclusion_samples?: Array<{
      business_name?: string | null;
      score?: number;
      exclusion_reason?: string;
    }>;
    insert_errors?: number;
    insert_error_samples?: string[];
    query_error?: string | null;
    reason_counts?: {
      missing_business_name?: number;
      missing_workspace_id?: number;
      missing_contact_path?: number;
      missing_email?: number;
      missing_opportunity_reason?: number;
      score_below_threshold?: number;
      duplicate_by_linked_opportunity_id?: number;
      duplicate_by_website?: number;
      duplicate_by_phone?: number;
      duplicate_by_business_name_city?: number;
      insert_error?: number;
    };
  };
  error?: string;
  detail?: string;
};

function emptyCreationReason(result: BackfillResponse | null): string | null {
  if (!result) return null;
  const created = Number(result.stats?.created || 0);
  if (created > 0) return null;
  const queryError = String(result.stats?.query_error || "").trim();
  if (queryError) return queryError;
  const sample = Array.isArray(result.stats?.insert_error_samples)
    ? String(result.stats?.insert_error_samples[0] || "").trim()
    : "";
  if (sample) return sample;
  if (Number(result.stats?.filtered_existing_linked_opportunity || 0) > 0) {
    return "All eligible opportunities were already linked to leads (duplicates skipped).";
  }
  if (Number(result.stats?.filtered_missing_contact_path || 0) > 0) {
    return "Most opportunities were missing contact paths (email/phone/contact page).";
  }
  if (Number(result.stats?.filtered_missing_email || 0) > 0) {
    return "Most opportunities were skipped from actionable queues because no email was found.";
  }
  if (Number(result.stats?.filtered_low_score || 0) > 0) {
    return "Most opportunities were filtered below the intake threshold.";
  }
  return "No leads were created. Review debug samples below for the first exclusion/insert failure.";
}

export function BackfillLeadsButton() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BackfillResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runBackfill() {
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/scout/intake/backfill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debug_mode: true }),
      });
      const body = (await res.json().catch(() => ({}))) as BackfillResponse;
      if (!res.ok) {
        setError(body.detail || body.error || "Backfill failed.");
        return;
      }
      setResult(body);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Backfill failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="admin-btn-ghost text-xs" disabled={running} onClick={() => void runBackfill()}>
        {running ? "Backfilling..." : "Backfill Leads From Opportunities"}
      </button>
      {result ? (
        <div className="text-xs space-y-1" style={{ color: "var(--admin-muted)" }}>
          <div style={{ color: "#4ade80" }}>
            {result.message || "Backfill completed."}
          </div>
          <div>
            opportunities_found: {Number(result.stats?.opportunities_found || 0)} | opportunities_evaluated:{" "}
            {Number(result.stats?.opportunities_evaluated || result.stats?.evaluated || 0)} | eligible_for_lead_creation:{" "}
            {Number(result.stats?.eligible_for_lead_creation || result.stats?.eligible || 0)} | leads_created:{" "}
            {Number(result.stats?.leads_created || result.stats?.created || 0)} | duplicates_skipped:{" "}
            {Number(result.stats?.duplicates_skipped || result.stats?.duplicate_skipped || 0)} | insert_failed:{" "}
            {Number(result.stats?.insert_failed || 0)} | filtered_out: {Number(result.stats?.filtered_out || 0)}
          </div>
          <div>
            missing_business_name: {Number(result.stats?.reason_counts?.missing_business_name || result.stats?.filtered_missing_business_name || 0)} | missing_workspace_id:{" "}
            {Number(result.stats?.reason_counts?.missing_workspace_id || result.stats?.filtered_missing_workspace || 0)} | missing_contact_path:{" "}
            {Number(result.stats?.reason_counts?.missing_contact_path || result.stats?.filtered_missing_contact_path || 0)} | score_below_threshold:{" "}
            {Number(result.stats?.reason_counts?.score_below_threshold || result.stats?.filtered_low_score || 0)}
          </div>
          <div>
            missing_email: {Number(result.stats?.reason_counts?.missing_email || result.stats?.filtered_missing_email || 0)} | missing_opportunity_reason:{" "}
            {Number(result.stats?.reason_counts?.missing_opportunity_reason || result.stats?.filtered_missing_opportunity_reason || 0)}
          </div>
          <div>
            duplicate_by_linked_opportunity_id:{" "}
            {Number(result.stats?.reason_counts?.duplicate_by_linked_opportunity_id || result.stats?.filtered_existing_linked_opportunity || 0)} | duplicate_by_website:{" "}
            {Number(result.stats?.reason_counts?.duplicate_by_website || result.stats?.duplicate_by_website || 0)} | duplicate_by_phone:{" "}
            {Number(result.stats?.reason_counts?.duplicate_by_phone || result.stats?.duplicate_by_phone || 0)} | duplicate_by_business_name_city:{" "}
            {Number(result.stats?.reason_counts?.duplicate_by_business_name_city || result.stats?.duplicate_by_business_name_city || 0)} | insert_error:{" "}
            {Number(result.stats?.reason_counts?.insert_error || result.stats?.insert_failed || 0)}
          </div>
          <div>
            insert_attempted: {Number(result.stats?.insert_attempted || 0)} | insert_succeeded:{" "}
            {Number(result.stats?.insert_succeeded || 0)} | insert_errors: {Number(result.stats?.insert_errors || 0)}
          </div>
          <div>
            leads_with_email: {Number(result.stats?.leads_with_email || 0)} | leads_with_phone:{" "}
            {Number(result.stats?.leads_with_phone || 0)} | leads_with_contact_page:{" "}
            {Number(result.stats?.leads_with_contact_page || 0)} | leads_with_facebook:{" "}
            {Number(result.stats?.leads_with_facebook || 0)} | leads_with_no_contact_path:{" "}
            {Number(result.stats?.leads_with_no_contact_path || 0)}
          </div>
          <div>
            actionable_email_leads_created: {Number(result.stats?.actionable_email_leads_created || 0)} | leads_skipped_due_no_email:{" "}
            {Number(result.stats?.leads_skipped_due_no_email || 0)}
          </div>
          <div>
            debug_mode: {String(Boolean(result.stats?.debug_mode))} | threshold: {Number(result.stats?.intake_threshold_used || 0)} | contact_rule:{" "}
            {result.stats?.contact_rule_used || "unknown"}
          </div>
          <div>
            workspace_id: {result.workspace_id || "unknown"} | crm_host: {result.crm_supabase_host || "unknown"} | scout_host:{" "}
            {result.scout_supabase_host || "unknown"}
          </div>
          {result.stats?.query_error ? (
            <div style={{ color: "#fca5a5" }}>query_error: {result.stats.query_error}</div>
          ) : null}
          {Array.isArray(result.stats?.insert_error_samples) && result.stats?.insert_error_samples.length > 0 ? (
            <div style={{ color: "#fca5a5" }}>
              insert_error_samples: {result.stats?.insert_error_samples.slice(0, 3).join(" | ")}
            </div>
          ) : null}
          {Array.isArray(result.stats?.debug_decisions) && result.stats?.debug_decisions.length > 0 ? (
            <div>
              decision_samples:{" "}
              {result.stats.debug_decisions
                .slice(0, 3)
                .map(
                  (d) =>
                    `${d.decision || "unknown"}(${d.business_name || d.opportunity_id || "n/a"}): ${d.reason || "n/a"} (opportunity_score=${Number(
                      d.score ?? 0
                    ).toFixed(0)})`
                )
                .join(" | ")}
            </div>
          ) : null}
          {Array.isArray(result.stats?.exclusion_samples) && result.stats?.exclusion_samples.length > 0 ? (
            <div>
              exclusion_samples:{" "}
              {result.stats.exclusion_samples
                .slice(0, 3)
                .map(
                  (d) =>
                    `${d.business_name || "n/a"} (${Number(d.score ?? 0).toFixed(0)}): ${d.exclusion_reason || "unknown"}`
                )
                .join(" | ")}
            </div>
          ) : null}
          {emptyCreationReason(result) ? (
            <div style={{ color: "#fca5a5" }}>
              no_leads_created_reason: {emptyCreationReason(result)}
            </div>
          ) : null}
          <details className="mt-2">
            <summary className="cursor-pointer text-[var(--admin-gold)]">Show full backfill result JSON</summary>
            <pre className="mt-1 p-2 rounded-md overflow-x-auto" style={{ background: "rgba(255,255,255,0.04)" }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      ) : null}
      {error ? <span className="text-xs" style={{ color: "#fca5a5" }}>{error}</span> : null}
    </div>
  );
}
