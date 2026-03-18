"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BackfillResponse = {
  ok?: boolean;
  summary_reason?: string;
  db_opportunities_count?: number;
  db_leads_count?: number;
  stats?: {
    opportunities_scanned?: number;
    opportunities_found?: number;
    opportunities_eligible?: number;
    leads_created?: number;
    already_existing?: number;
    skipped_missing_business_name?: number;
    skipped_missing_workspace_id?: number;
    skipped_missing_contact_path?: number;
    skipped_missing_opportunity?: number;
    skipped_duplicate?: number;
    insert_failed?: number;
    exact_insert_errors?: string[];
    failing_records?: Array<{
      id?: string | null;
      business_name?: string | null;
      workspace_id?: string | null;
      website?: string | null;
      email?: string | null;
      phone?: string | null;
      reason_skipped_or_failed?: string;
    }>;
    failed?: number;
  };
  error?: string;
};

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
      const res = await fetch("/api/leads/backfill-from-opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const body = (await res.json().catch(() => ({}))) as BackfillResponse;
      if (!res.ok) {
        setError(body.error || "Backfill failed.");
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
            Backfill completed.
          </div>
          {result.summary_reason ? (
            <div style={{ color: "#fcd34d" }}>
              summary_reason: {result.summary_reason}
            </div>
          ) : null}
          <div>
            db_opportunities_count: {Number(result.db_opportunities_count || 0)} | db_leads_count: {Number(result.db_leads_count || 0)}
          </div>
          <div>
            opportunities_scanned: {Number(result.stats?.opportunities_scanned || 0)} | opportunities_found: {Number(result.stats?.opportunities_found || 0)} | opportunities_eligible:{" "}
            {Number(result.stats?.opportunities_eligible || 0)}
          </div>
          <div>
            leads_created: {Number(result.stats?.leads_created || 0)} | already_existing: {Number(result.stats?.already_existing || 0)} | skipped_duplicate:{" "}
            {Number(result.stats?.skipped_duplicate || 0)} | insert_failed: {Number(result.stats?.insert_failed || 0)}
          </div>
          <div>
            skipped_missing_business_name: {Number(result.stats?.skipped_missing_business_name || 0)} | skipped_missing_workspace_id:{" "}
            {Number(result.stats?.skipped_missing_workspace_id || 0)} | skipped_missing_contact_path: {Number(result.stats?.skipped_missing_contact_path || 0)} | skipped_missing_opportunity:{" "}
            {Number(result.stats?.skipped_missing_opportunity || 0)}
          </div>
          {Array.isArray(result.stats?.exact_insert_errors) && result.stats?.exact_insert_errors.length > 0 ? (
            <div style={{ color: "#fca5a5" }}>
              exact_insert_errors: {result.stats?.exact_insert_errors.slice(0, 10).join(" | ")}
            </div>
          ) : null}
          {Array.isArray(result.stats?.failing_records) && result.stats?.failing_records.length > 0 ? (
            <div>
              first_failing_records:{" "}
              {result.stats.failing_records
                .slice(0, 10)
                .map((row) =>
                  `${row.id || "no-id"} / ${row.business_name || "no-name"} / ws=${row.workspace_id || "none"} / web=${row.website || "none"} / email=${row.email || "none"} / phone=${row.phone || "none"} / reason=${row.reason_skipped_or_failed || "unknown"}`
                )
                .join(" || ")}
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
