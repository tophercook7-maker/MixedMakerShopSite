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
    evaluated?: number;
    eligible?: number;
    created?: number;
    duplicate_skipped?: number;
    filtered_low_score?: number;
    filtered_missing_contact_path?: number;
    filtered_missing_workspace?: number;
    filtered_existing_linked_opportunity?: number;
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
            opportunities evaluated: {Number(result.stats?.evaluated || 0)} | leads eligible: {Number(result.stats?.eligible || 0)} | leads created:{" "}
            {Number(result.stats?.created || 0)} | duplicates skipped: {Number(result.stats?.duplicate_skipped || 0)} | insert failures:{" "}
            {Number(result.stats?.insert_failed || 0)}
          </div>
          <div>
            filtered_low_score: {Number(result.stats?.filtered_low_score || 0)} | filtered_missing_contact_path:{" "}
            {Number(result.stats?.filtered_missing_contact_path || 0)} | filtered_existing_linked_opportunity:{" "}
            {Number(result.stats?.filtered_existing_linked_opportunity || 0)}
          </div>
          <div>
            insert_attempted: {Number(result.stats?.insert_attempted || 0)} | insert_succeeded:{" "}
            {Number(result.stats?.insert_succeeded || 0)} | insert_errors: {Number(result.stats?.insert_errors || 0)}
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
