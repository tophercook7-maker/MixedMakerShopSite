"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import type { ScoutResultListItem, ScoutResultsCounts } from "@/lib/scout/scout-results-types";
import { formatLeadSourceBadge, mapScoutSourceTypeToLeadSource } from "@/lib/crm/lead-source";
import { buildLeadPath } from "@/lib/lead-route";

function externalHref(url: string | null | undefined): string | null {
  const u = String(url || "").trim();
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `https://${u}`;
}

function formatLocation(city: string | null, state: string | null): string {
  const c = String(city || "").trim();
  const s = String(state || "").trim();
  if (c && s) return `${c}, ${s}`;
  return c || s || "—";
}

export function ScoutReviewQueue() {
  const [rows, setRows] = useState<ScoutResultListItem[]>([]);
  const [counts, setCounts] = useState<ScoutResultsCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scout/results?counts=1", { cache: "no-store" });
      const body = (await res.json().catch(() => ({}))) as {
        results?: ScoutResultListItem[];
        counts?: ScoutResultsCounts | null;
        scoutResultsUnavailable?: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(body.error || "Could not load Scout queue.");
        setRows([]);
        setCounts(null);
        return;
      }
      if (body.scoutResultsUnavailable) {
        setUnavailable(true);
        setRows([]);
        setCounts(null);
        return;
      }
      setUnavailable(false);
      setRows(Array.isArray(body.results) ? body.results : []);
      setCounts(body.counts ?? null);
    } catch {
      setError("Could not load Scout queue.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const queueLabel = useMemo(() => {
    const n = counts?.new_in_queue;
    if (typeof n === "number") return `${n} unpulled`;
    return null;
  }, [counts]);

  const patchRow = async (id: string, patch: { skipped?: boolean; scout_notes?: string | null }) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/scout/results/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        setError(b.error || "Update failed.");
        return;
      }
      setError(null);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const pullIntoCrm = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/scout/results/${encodeURIComponent(id)}/pull`, { method: "POST" });
      const b = (await res.json().catch(() => ({}))) as {
        error?: string;
        lead_id?: string;
        business_name?: string;
        message?: string;
      };
      if (!res.ok) {
        setError(b.error || "Could not pull into CRM.");
        return;
      }
      setError(null);
      await load();
      if (b.lead_id) {
        window.location.href = buildLeadPath(String(b.lead_id), String(b.business_name || ""));
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="admin-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--admin-fg)" }}>
              Scout review queue
            </h1>
            <p className="text-sm max-w-3xl" style={{ color: "var(--admin-muted)" }}>
              Unpulled Scout finds stay here until you pull them into the main CRM. This list is text-only—no thumbnails—so
              you can scan quickly.
            </p>
            {queueLabel ? (
              <p className="text-xs mt-2 font-semibold" style={{ color: "var(--admin-gold)" }}>
                {queueLabel}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button type="button" className="admin-btn-ghost text-sm inline-flex items-center gap-1.5" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link href="/admin/scout" className="admin-btn-ghost text-sm inline-flex items-center gap-1.5">
              Scout tools
            </Link>
            <Link href="/admin/leads" className="admin-btn-ghost text-sm">
              All leads
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <p className="text-sm rounded-lg border px-3 py-2" style={{ borderColor: "rgba(252,165,165,0.45)", color: "#fecaca" }}>
          {error}
        </p>
      ) : null}

      {unavailable ? (
        <section className="admin-card text-sm" style={{ color: "var(--admin-muted)" }}>
          The <code className="text-[11px]">scout_results</code> table is not available in this environment. Apply Supabase
          migrations, then reload.
        </section>
      ) : null}

      {loading && !unavailable ? (
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Loading queue…
        </p>
      ) : null}

      {!loading && !unavailable && rows.length === 0 ? (
        <section className="admin-card text-sm" style={{ color: "var(--admin-muted)" }}>
          Nothing in the Scout queue right now. Run Scout from{" "}
          <Link href="/admin/scout" className="underline" style={{ color: "var(--admin-gold)" }}>
            Find businesses
          </Link>{" "}
          or sync results when your pipeline posts to <code className="text-[11px]">/api/scout/results</code>.
        </section>
      ) : null}

      {!loading && !unavailable && rows.length > 0 ? (
        <section className="admin-card overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--admin-border)" }}>
                <th className="py-2 pr-3 font-semibold" style={{ color: "var(--admin-fg)" }}>
                  Business
                </th>
                <th className="py-2 pr-3 font-semibold" style={{ color: "var(--admin-fg)" }}>
                  Location
                </th>
                <th className="py-2 pr-3 font-semibold" style={{ color: "var(--admin-fg)" }}>
                  Contact
                </th>
                <th className="py-2 pr-3 font-semibold" style={{ color: "var(--admin-fg)" }}>
                  Source
                </th>
                <th className="py-2 pr-3 font-semibold min-w-[200px]" style={{ color: "var(--admin-fg)" }}>
                  Why it matters
                </th>
                <th className="py-2 pl-2 font-semibold text-right" style={{ color: "var(--admin-fg)" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const web = externalHref(r.website_url);
                const fb = externalHref(r.facebook_url);
                const sourceLine = formatLeadSourceBadge({
                  lead_source: mapScoutSourceTypeToLeadSource(r.source_type),
                });
                const disabled = busyId === r.id;
                return (
                  <tr key={r.id} className="border-b align-top" style={{ borderColor: "var(--admin-border)" }}>
                    <td className="py-3 pr-3">
                      <div className="font-medium" style={{ color: "var(--admin-fg)" }}>
                        {r.business_name || "—"}
                      </div>
                      {r.category ? (
                        <div className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
                          {r.category}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 pr-3 whitespace-nowrap" style={{ color: "var(--admin-muted)" }}>
                      {formatLocation(r.city, r.state)}
                    </td>
                    <td className="py-3 pr-3 text-xs space-y-1 max-w-[220px]">
                      <div style={{ color: "var(--admin-fg)" }}>{r.email || "—"}</div>
                      <div style={{ color: "var(--admin-muted)" }}>{r.phone || "—"}</div>
                    </td>
                    <td className="py-3 pr-3 text-xs" style={{ color: "var(--admin-muted)" }}>
                      {sourceLine}
                    </td>
                    <td className="py-3 pr-3 text-xs leading-snug" style={{ color: "var(--admin-muted)" }}>
                      {r.opportunity_reason?.trim() || "—"}
                    </td>
                    <td className="py-3 pl-2 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <button
                          type="button"
                          className="admin-btn text-xs px-2 py-1"
                          disabled={disabled}
                          onClick={() => void pullIntoCrm(r.id)}
                        >
                          Pull into CRM
                        </button>
                        <div className="flex flex-wrap justify-end gap-1">
                          {web ? (
                            <a
                              href={web}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-btn-ghost text-[11px] px-2 py-0.5 inline-flex items-center gap-0.5"
                            >
                              Website <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-[11px] opacity-50">No website</span>
                          )}
                          {fb ? (
                            <a
                              href={fb}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-btn-ghost text-[11px] px-2 py-0.5 inline-flex items-center gap-0.5"
                            >
                              Facebook <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-[11px] opacity-50">No Facebook</span>
                          )}
                        </div>
                        <div className="flex flex-wrap justify-end gap-1">
                          <button
                            type="button"
                            className="admin-btn-ghost text-[11px] px-2 py-0.5"
                            disabled={disabled}
                            onClick={() => void patchRow(r.id, { skipped: true, scout_notes: "scout_review:archived" })}
                          >
                            Archive
                          </button>
                          <button
                            type="button"
                            className="admin-btn-ghost text-[11px] px-2 py-0.5"
                            disabled={disabled}
                            onClick={() => void patchRow(r.id, { skipped: true, scout_notes: "scout_review:not_useful" })}
                          >
                            Not useful
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}
