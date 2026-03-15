"use client";

import { useState } from "react";

type BackfillResponse = {
  ok?: boolean;
  message?: string;
  workspace_id?: string;
  crm_supabase_host?: string;
  scout_supabase_host?: string;
  stats?: {
    evaluated?: number;
    created?: number;
    duplicate?: number;
    filtered?: number;
    insert_errors?: number;
    insert_error_samples?: string[];
    query_error?: string | null;
  };
  error?: string;
  detail?: string;
};

export function BackfillLeadsButton() {
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
        body: JSON.stringify({}),
      });
      const body = (await res.json().catch(() => ({}))) as BackfillResponse;
      if (!res.ok) {
        setError(body.detail || body.error || "Backfill failed.");
        return;
      }
      setResult(body);
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
            evaluated: {Number(result.stats?.evaluated || 0)} | created: {Number(result.stats?.created || 0)} | duplicate:{" "}
            {Number(result.stats?.duplicate || 0)} | filtered: {Number(result.stats?.filtered || 0)} | insert_errors:{" "}
            {Number(result.stats?.insert_errors || 0)}
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
