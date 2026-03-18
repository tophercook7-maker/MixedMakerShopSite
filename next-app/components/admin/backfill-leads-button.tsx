"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BackfillResponse = {
  ok?: boolean;
  stats?: {
    opportunities_scanned?: number;
    leads_created?: number;
    already_existing?: number;
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
          <div>
            opportunities_scanned: {Number(result.stats?.opportunities_scanned || 0)} | leads_created: {Number(result.stats?.leads_created || 0)} | already_existing:{" "}
            {Number(result.stats?.already_existing || 0)} | failed: {Number(result.stats?.failed || 0)}
          </div>
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
