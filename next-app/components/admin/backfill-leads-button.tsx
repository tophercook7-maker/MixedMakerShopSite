"use client";

import { useState } from "react";

type BackfillResponse = {
  ok?: boolean;
  message?: string;
  stats?: {
    evaluated?: number;
    created?: number;
    duplicate?: number;
    filtered?: number;
  };
  error?: string;
  detail?: string;
};

export function BackfillLeadsButton() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
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
      const created = Number(body?.stats?.created || 0);
      const evaluated = Number(body?.stats?.evaluated || 0);
      setResult(body.message || `Backfill complete: created ${created} leads from ${evaluated} opportunities.`);
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
      {result ? <span className="text-xs" style={{ color: "#4ade80" }}>{result}</span> : null}
      {error ? <span className="text-xs" style={{ color: "#fca5a5" }}>{error}</span> : null}
    </div>
  );
}
