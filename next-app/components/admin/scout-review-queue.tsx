"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import type { EnrichedScoutResultListItem, ScoutResultsCounts } from "@/lib/scout/scout-results-types";
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

function labelBadgeClass(label: string): string {
  const l = label.toLowerCase();
  if (l === "hot") return "bg-rose-500/25 text-rose-100 border-rose-400/40";
  if (l === "good") return "bg-amber-500/20 text-amber-100 border-amber-400/35";
  if (l === "maybe") return "bg-slate-500/25 text-slate-200 border-slate-400/30";
  return "bg-zinc-700/40 text-zinc-300 border-zinc-500/30";
}

export type ScoutReviewQueueProps = {
  /** When set, only show first N rows (e.g. on /admin/scout preview). */
  previewLimit?: number | null;
};

export function ScoutReviewQueue({ previewLimit = null }: ScoutReviewQueueProps) {
  const [rows, setRows] = useState<EnrichedScoutResultListItem[]>([]);
  const [counts, setCounts] = useState<ScoutResultsCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [view, setView] = useState<
    "queue" | "inbox" | "pulled" | "rejected" | "archived" | "all"
  >("queue");
  const [band, setBand] = useState<"all" | "hot" | "good" | "maybe" | "skip">("all");
  const [sort, setSort] = useState<"score" | "newest" | "location" | "category">("score");
  const [facebookOnly, setFacebookOnly] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [noWebsite, setNoWebsite] = useState(false);
  const [inTargetArea, setInTargetArea] = useState(false);
  const [targetCategory, setTargetCategory] = useState(false);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set("view", view);
    p.set("sort", sort);
    p.set("counts", "1");
    if (band !== "all") p.set("band", band);
    if (facebookOnly) p.set("facebook_only", "1");
    if (hasEmail) p.set("has_email", "1");
    if (hasPhone) p.set("has_phone", "yes");
    if (noWebsite) p.set("has_website", "no");
    if (inTargetArea) p.set("in_target_area", "1");
    if (targetCategory) p.set("target_category", "1");
    return p.toString();
  }, [view, band, sort, facebookOnly, hasEmail, hasPhone, noWebsite, inTargetArea, targetCategory]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scout/results?${queryString}`, { cache: "no-store" });
      const body = (await res.json().catch(() => ({}))) as {
        results?: EnrichedScoutResultListItem[];
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
  }, [queryString]);

  useEffect(() => {
    void load();
  }, [load]);

  const displayRows = useMemo(() => {
    if (previewLimit != null && previewLimit > 0) return rows.slice(0, previewLimit);
    return rows;
  }, [rows, previewLimit]);

  const patchRow = async (id: string, patch: Record<string, unknown>) => {
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

  const generatePreview = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/scout/results/${encodeURIComponent(id)}/generate-preview`, { method: "POST" });
      const b = (await res.json().catch(() => ({}))) as {
        error?: string;
        preview_url?: string;
        lead_id?: string;
        reason?: string;
      };
      if (!res.ok) {
        setError(b.error || "Could not generate preview.");
        return;
      }
      setError(null);
      await load();
      const url = String(b.preview_url || "").trim();
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setBusyId(null);
    }
  };

  const clearFilters = () => {
    setBand("all");
    setFacebookOnly(false);
    setHasEmail(false);
    setHasPhone(false);
    setNoWebsite(false);
    setInTargetArea(false);
    setTargetCategory(false);
  };

  return (
    <div className="space-y-6">
      <section className="admin-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--admin-fg)" }}>
              {previewLimit ? "Scout priority preview" : "Scout review"}
            </h1>
            <p className="text-sm max-w-3xl" style={{ color: "var(--admin-muted)" }}>
              Scored and sorted for fast decisions. Use <strong className="font-semibold">Generate preview</strong> for a
              one-click CRM lead + branded mockup link (opens in a new tab). Pull into CRM only adds the lead. Archive or
              mark not useful to keep junk out. No thumbnails—text only.
            </p>
            {previewLimit ? (
              <p className="text-xs mt-2">
                <Link href="/admin/scout/review" className="underline font-medium" style={{ color: "var(--admin-gold)" }}>
                  Open full Scout review →
                </Link>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button type="button" className="admin-btn-ghost text-sm inline-flex items-center gap-1.5" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link href="/admin/scout" className="admin-btn-ghost text-sm">
              Find businesses
            </Link>
            <Link href="/admin/leads" className="admin-btn-ghost text-sm">
              All leads
            </Link>
          </div>
        </div>
      </section>

      {!previewLimit && counts ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {[
            { k: "Total", v: counts.total_all, sub: "all Scout rows" },
            { k: "Unreviewed queue", v: counts.new_in_queue, sub: "not pulled, not skipped" },
            { k: "Hot", v: counts.hot_in_queue, sub: "in queue, score band" },
            { k: "Good", v: counts.good_in_queue, sub: "in queue" },
            { k: "Maybe / Skip", v: counts.maybe_in_queue + counts.skip_in_queue, sub: "in queue" },
            { k: "Pulled", v: counts.saved_to_leads, sub: "in CRM" },
            { k: "Rejected", v: counts.rejected, sub: "not useful" },
            { k: "Archived", v: counts.archived, sub: "archived" },
          ].map((c) => (
            <div
              key={c.k}
              className="admin-card py-3 px-4"
              style={{ borderColor: "var(--admin-border)" }}
            >
              <div className="text-xs uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
                {c.k}
              </div>
              <div className="text-2xl font-bold mt-1" style={{ color: "var(--admin-fg)" }}>
                {c.v}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--admin-muted)" }}>
                {c.sub}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {!previewLimit ? (
        <section className="admin-card space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold mr-1" style={{ color: "var(--admin-muted)" }}>
              View
            </span>
            {(
              [
                ["queue", "Unreviewed"],
                ["inbox", "Inbox (all open)"],
                ["pulled", "Pulled"],
                ["rejected", "Rejected"],
                ["archived", "Archived"],
                ["all", "All"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`text-xs px-2 py-1 rounded border ${view === id ? "admin-btn" : "admin-btn-ghost"}`}
                style={{ borderColor: "var(--admin-border)" }}
                onClick={() => setView(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold mr-1" style={{ color: "var(--admin-muted)" }}>
              Band
            </span>
            {(["all", "hot", "good", "maybe", "skip"] as const).map((b) => (
              <button
                key={b}
                type="button"
                className={`text-xs px-2 py-1 rounded border ${band === b ? "admin-btn" : "admin-btn-ghost"}`}
                style={{ borderColor: "var(--admin-border)" }}
                onClick={() => setBand(b)}
              >
                {b === "all" ? "All" : b[0]!.toUpperCase() + b.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold mr-1" style={{ color: "var(--admin-muted)" }}>
              Quick
            </span>
            <button
              type="button"
              className={`text-xs px-2 py-1 rounded border ${noWebsite ? "admin-btn" : "admin-btn-ghost"}`}
              onClick={() => setNoWebsite((v) => !v)}
            >
              No website
            </button>
            <button
              type="button"
              className={`text-xs px-2 py-1 rounded border ${facebookOnly ? "admin-btn" : "admin-btn-ghost"}`}
              onClick={() => setFacebookOnly((v) => !v)}
            >
              Facebook only
            </button>
            <button
              type="button"
              className={`text-xs px-2 py-1 rounded border ${hasEmail ? "admin-btn" : "admin-btn-ghost"}`}
              onClick={() => setHasEmail((v) => !v)}
            >
              Has email
            </button>
            <button
              type="button"
              className={`text-xs px-2 py-1 rounded border ${hasPhone ? "admin-btn" : "admin-btn-ghost"}`}
              onClick={() => setHasPhone((v) => !v)}
            >
              Has phone
            </button>
            <button
              type="button"
              className={`text-xs px-2 py-1 rounded border ${inTargetArea ? "admin-btn" : "admin-btn-ghost"}`}
              onClick={() => setInTargetArea((v) => !v)}
            >
              Target area
            </button>
            <button
              type="button"
              className={`text-xs px-2 py-1 rounded border ${targetCategory ? "admin-btn" : "admin-btn-ghost"}`}
              onClick={() => setTargetCategory((v) => !v)}
            >
              Target category
            </button>
            <button type="button" className="admin-btn-ghost text-xs px-2 py-1" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold mr-1" style={{ color: "var(--admin-muted)" }}>
              Sort
            </span>
            {(
              [
                ["score", "Score (high first)"],
                ["newest", "Newest"],
                ["location", "City / state"],
                ["category", "Category"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`text-xs px-2 py-1 rounded border ${sort === id ? "admin-btn" : "admin-btn-ghost"}`}
                style={{ borderColor: "var(--admin-border)" }}
                onClick={() => setSort(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

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
          Loading…
        </p>
      ) : null}

      {!loading && !unavailable && displayRows.length === 0 ? (
        <section className="admin-card text-sm" style={{ color: "var(--admin-muted)" }}>
          No rows match these filters. Try &quot;All&quot; view or clear filters.
        </section>
      ) : null}

      {!loading && !unavailable && displayRows.length > 0 ? (
        <section className="admin-card overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[960px]">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--admin-border)" }}>
                <th className="py-2 pr-2 font-semibold" style={{ color: "var(--admin-fg)" }}>
                  Score
                </th>
                <th className="py-2 pr-3 font-semibold" style={{ color: "var(--admin-fg)" }}>
                  Business
                </th>
                <th className="py-2 pr-3 font-semibold" style={{ color: "var(--admin-fg)" }}>
                  Location
                </th>
                <th className="py-2 pr-3 font-semibold" style={{ color: "var(--admin-fg)" }}>
                  URLs / contact
                </th>
                <th className="py-2 pr-3 font-semibold min-w-[220px]" style={{ color: "var(--admin-fg)" }}>
                  Reason
                </th>
                <th className="py-2 pl-2 font-semibold text-right" style={{ color: "var(--admin-fg)" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((r) => {
                const web = externalHref(r.website_url);
                const fb = externalHref(r.facebook_url);
                const disabled = busyId === r.id;
                const dup = r.crm_duplicate;
                return (
                  <tr
                    key={r.id}
                    className="border-b align-top"
                    style={{
                      borderColor: "var(--admin-border)",
                      opacity: dup ? 0.75 : 1,
                    }}
                  >
                    <td className="py-3 pr-2 whitespace-nowrap">
                      <div className="font-mono text-sm font-bold" style={{ color: "var(--admin-fg)" }}>
                        {r.opportunity_score}
                      </div>
                      <div
                        className={`text-[10px] uppercase tracking-wide mt-1 inline-block px-1.5 py-0.5 rounded border ${labelBadgeClass(
                          r.opportunity_label
                        )}`}
                      >
                        {r.opportunity_label}
                      </div>
                      {r.marked_priority ? (
                        <div className="text-[10px] mt-1 font-semibold" style={{ color: "var(--admin-gold)" }}>
                          Priority
                        </div>
                      ) : null}
                    </td>
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
                    <td className="py-3 pr-3 whitespace-nowrap text-xs" style={{ color: "var(--admin-muted)" }}>
                      {formatLocation(r.city, r.state)}
                    </td>
                    <td className="py-3 pr-3 text-xs space-y-1 max-w-[260px]">
                      {web ? (
                        <a href={web} target="_blank" rel="noreferrer" className="block truncate underline" style={{ color: "var(--admin-gold)" }}>
                          {r.website_url}
                        </a>
                      ) : (
                        <span style={{ color: "var(--admin-muted)" }}>— website</span>
                      )}
                      {fb ? (
                        <a href={fb} target="_blank" rel="noreferrer" className="block truncate underline" style={{ color: "var(--admin-gold)" }}>
                          Facebook
                        </a>
                      ) : null}
                      <div style={{ color: "var(--admin-fg)" }}>{r.email || "—"}</div>
                      <div style={{ color: "var(--admin-muted)" }}>{r.phone || "—"}</div>
                    </td>
                    <td className="py-3 pr-3 text-xs leading-snug" style={{ color: "var(--admin-muted)" }}>
                      {r.reason_summary}
                      {dup && r.duplicate_lead_id ? (
                        <div className="mt-1">
                          <Link
                            href={buildLeadPath(r.duplicate_lead_id, r.business_name)}
                            className="underline font-medium"
                            style={{ color: "var(--admin-gold)" }}
                          >
                            Open existing lead
                          </Link>
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 pl-2 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        {!r.skipped ? (
                          <button
                            type="button"
                            className="admin-btn text-xs px-2 py-1"
                            disabled={disabled}
                            onClick={() => void generatePreview(r.id)}
                          >
                            Generate preview
                          </button>
                        ) : null}
                        {!r.added_to_leads && !r.skipped ? (
                          <button
                            type="button"
                            className="admin-btn-ghost text-xs px-2 py-1"
                            style={{ borderColor: "var(--admin-border)" }}
                            disabled={disabled}
                            onClick={() => void pullIntoCrm(r.id)}
                          >
                            Pull into CRM
                          </button>
                        ) : r.added_to_leads && r.linked_lead_id ? (
                          <Link href={buildLeadPath(r.linked_lead_id, r.business_name)} className="admin-btn-ghost text-xs px-2 py-1">
                            In CRM
                          </Link>
                        ) : null}
                        {!r.added_to_leads ? (
                          <button
                            type="button"
                            className="admin-btn-ghost text-[11px] px-2 py-0.5"
                            disabled={disabled}
                            onClick={() =>
                              void patchRow(r.id, {
                                marked_priority: !r.marked_priority,
                              })
                            }
                          >
                            {r.marked_priority ? "Unmark priority" : "Mark priority"}
                          </button>
                        ) : null}
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
                          ) : null}
                          {fb ? (
                            <a
                              href={fb}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-btn-ghost text-[11px] px-2 py-0.5 inline-flex items-center gap-0.5"
                            >
                              Facebook <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : null}
                        </div>
                        {!r.added_to_leads ? (
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
                        ) : null}
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
