"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Info } from "lucide-react";
import { buildLeadPath } from "@/lib/lead-route";
import { scoreScoutLead } from "@/lib/scout-conversion";
import type { ScoutLead } from "@/lib/scout/types";
import {
  bestWebDesignSortScore,
  matchesBestWebDesignPreset,
} from "@/lib/scout/scout-results-normalize";
import type { ScoutResultListItem, ScoutResultsCounts } from "@/lib/scout/scout-results-types";
import {
  compactOpportunityLineFromRow,
  labelFacebookFromRow,
  labelPhoneFromRow,
  labelWebsiteFromRow,
  openSourceHrefFromRow,
  sourceTypeLabel,
} from "@/lib/scout/scout-result-ui";

type Tri = "all" | "yes" | "no" | "unknown";

type PresetTab = "best" | "all";

type DetailPayload = {
  id: string;
  business_name: string;
  city: string | null;
  state: string | null;
  category: string | null;
  source_type: string;
  source_url: string | null;
  source_external_id: string | null;
  website_url: string | null;
  has_website: boolean | null;
  facebook_url: string | null;
  has_facebook: boolean | null;
  phone: string | null;
  has_phone: boolean | null;
  opportunity_reason: string | null;
  opportunity_rank: number;
  raw_source_payload: Record<string, unknown> | null;
  scout_notes: string | null;
  skipped: boolean;
  added_to_leads: boolean;
  linked_lead_id: string | null;
};

type Props = {
  rows: ScoutResultListItem[];
  counts: ScoutResultsCounts | null;
  loading: boolean;
  brainHadOpportunities: boolean;
  creatingLeadKey: string | null;
  showSkipped: boolean;
  onShowSkippedChange: (v: boolean) => void;
  includeSaved: boolean;
  onIncludeSavedChange: (v: boolean) => void;
  onRefresh: () => Promise<void>;
  onAddLead: (scoutResultId: string, opportunityId: string) => Promise<{ created: boolean; businessName: string } | null>;
  onToast: (message: string) => void;
  openExternal: (href: string) => void;
};

function drawerWhyFromRaw(raw: Record<string, unknown> | null): string {
  if (!raw) return "—";
  const lead = raw as unknown as ScoutLead;
  const contact = String(lead.best_contact_method || "").toLowerCase();
  const score = scoreScoutLead({
    business_name: lead.business_name,
    category: lead.category,
    website: lead.website,
    phone: contact === "phone" ? "phone" : "",
    email: contact === "email" ? "email@example.com" : "",
    review_count: null,
    issue_texts: [
      String(lead.opportunity_reason || ""),
      ...(Array.isArray(lead.opportunity_signals) ? lead.opportunity_signals : []),
    ],
    website_status: null,
  });
  return score.why_this_lead;
}

export function ScoutLitePanel({
  rows,
  counts,
  loading,
  brainHadOpportunities,
  creatingLeadKey,
  showSkipped,
  onShowSkippedChange,
  includeSaved,
  onIncludeSavedChange,
  onRefresh,
  onAddLead,
  onToast,
  openExternal,
}: Props) {
  const [presetTab, setPresetTab] = useState<PresetTab>("best");
  const [sourceTab, setSourceTab] = useState<"all" | "google" | "facebook">("all");
  const [websiteFilter, setWebsiteFilter] = useState<Tri>("all");
  const [phoneFilter, setPhoneFilter] = useState<"all" | "has" | "none">("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [noWebsiteOnly, setNoWebsiteOnly] = useState(false);
  const [facebookOnly, setFacebookOnly] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailFull, setDetailFull] = useState<DetailPayload | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!detailId) {
      setDetailFull(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    void (async () => {
      try {
        const res = await fetch(`/api/scout/results/${encodeURIComponent(detailId)}`);
        const data = (await res.json().catch(() => ({}))) as { result?: DetailPayload; error?: string };
        if (!cancelled && data.result) setDetailFull(data.result);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [detailId]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) {
      const c = String(r.category || "").trim();
      if (c) s.add(c);
    }
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    let base = [...rows];
    if (presetTab === "best") {
      base = base.filter((r) => matchesBestWebDesignPreset(r));
      base.sort(
        (a, b) =>
          bestWebDesignSortScore({ ...b, raw_source_payload: null }) -
          bestWebDesignSortScore({ ...a, raw_source_payload: null })
      );
    }
    const catExact = categoryFilter.trim();
    const cityQ = cityFilter.trim().toLowerCase();
    return base.filter((row) => {
      const st = String(row.source_type || "").toLowerCase();
      if (sourceTab === "google" && st !== "google" && st !== "mixed") return false;
      if (sourceTab === "facebook" && st !== "facebook" && st !== "mixed") return false;
      if (noWebsiteOnly && row.has_website !== false) return false;
      if (facebookOnly) {
        const web = String(row.website_url || "").trim();
        const fb = row.has_facebook || String(row.facebook_url || "").trim();
        const fbOnly = fb && (!web || /facebook\.|fb\.com/i.test(web) || row.has_website === false);
        if (!fbOnly) return false;
      }
      if (websiteFilter === "none" && row.has_website !== false) return false;
      if (websiteFilter === "has" && row.has_website !== true) return false;
      if (websiteFilter === "unknown" && row.has_website != null) return false;
      if (phoneFilter === "has" && !row.has_phone) return false;
      if (phoneFilter === "none" && row.has_phone) return false;
      if (catExact) {
        const c = String(row.category || "").trim();
        if (c.toLowerCase() !== catExact.toLowerCase()) return false;
      }
      if (cityQ) {
        const city = String(row.city || "").toLowerCase();
        if (!city.includes(cityQ)) return false;
      }
      return true;
    });
  }, [
    rows,
    presetTab,
    sourceTab,
    websiteFilter,
    phoneFilter,
    categoryFilter,
    cityFilter,
    noWebsiteOnly,
    facebookOnly,
  ]);

  const setSkippedServer = useCallback(
    async (id: string, skipped: boolean) => {
      const res = await fetch(`/api/scout/results/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skipped }),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        onToast(b.error || "Could not update.");
        return;
      }
      await onRefresh();
      onToast(skipped ? "Skipped" : "Back in your list");
    },
    [onRefresh, onToast]
  );

  const detail = detailFull;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
            Find businesses
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
            Your discovery list is saved to your account. Skip or save leads — you can pick up on any device.
          </p>
        </div>
        <button type="button" className="admin-btn-ghost text-xs" disabled={loading} onClick={() => void onRefresh()}>
          {loading ? "Refreshing…" : "Refresh list"}
        </button>
      </div>

      {counts ? (
        <div className="flex flex-wrap gap-2 text-[11px]" style={{ color: "var(--admin-muted)" }}>
          <span className="rounded border px-2 py-1" style={{ borderColor: "var(--admin-border)" }}>
            New in queue: <strong style={{ color: "var(--admin-fg)" }}>{counts.new_in_queue}</strong>
          </span>
          <span className="rounded border px-2 py-1" style={{ borderColor: "var(--admin-border)" }}>
            Saved to leads: <strong style={{ color: "var(--admin-fg)" }}>{counts.saved_to_leads}</strong>
          </span>
          <span className="rounded border px-2 py-1" style={{ borderColor: "var(--admin-border)" }}>
            Skipped: <strong style={{ color: "var(--admin-fg)" }}>{counts.skipped}</strong>
          </span>
          <span className="rounded border px-2 py-1" style={{ borderColor: "var(--admin-border)" }}>
            No website: <strong style={{ color: "var(--admin-fg)" }}>{counts.no_website}</strong>
          </span>
          <span className="rounded border px-2 py-1" style={{ borderColor: "var(--admin-border)" }}>
            Facebook-focused: <strong style={{ color: "var(--admin-fg)" }}>{counts.facebook_only}</strong>
          </span>
        </div>
      ) : null}

      <div
        className="inline-flex rounded-lg border p-0.5 gap-0.5 flex-wrap"
        style={{ borderColor: "var(--admin-border)" }}
        role="tablist"
        aria-label="Scout preset"
      >
        {(
          [
            { id: "best" as const, label: "Best web design targets" },
            { id: "all" as const, label: "All results" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={presetTab === t.id}
            className={presetTab === t.id ? "admin-btn-primary text-xs px-3 py-1.5 rounded-md" : "admin-btn-ghost text-xs px-3 py-1.5 rounded-md"}
            onClick={() => setPresetTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        className="inline-flex rounded-lg border p-0.5 gap-0.5 flex-wrap"
        style={{ borderColor: "var(--admin-border)" }}
        role="tablist"
        aria-label="Discovery source"
      >
        {(
          [
            { id: "all" as const, label: "All sources" },
            { id: "google" as const, label: "Google" },
            { id: "facebook" as const, label: "Facebook" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={sourceTab === t.id}
            className={sourceTab === t.id ? "admin-btn-primary text-xs px-3 py-1.5 rounded-md" : "admin-btn-ghost text-xs px-3 py-1.5 rounded-md"}
            onClick={() => setSourceTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center text-xs" style={{ color: "var(--admin-fg)" }}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showSkipped} onChange={(e) => onShowSkippedChange(e.target.checked)} />
          Show skipped
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={includeSaved} onChange={(e) => onIncludeSavedChange(e.target.checked)} />
          Show saved
        </label>
      </div>

      <div className="admin-card flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1 text-xs min-w-[140px]">
          <span style={{ color: "var(--admin-muted)" }}>Website</span>
          <select
            aria-label="Filter by website"
            className="rounded-lg border px-2 py-1.5 text-sm"
            style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.2)", color: "var(--admin-fg)" }}
            value={websiteFilter}
            onChange={(e) => setWebsiteFilter(e.target.value as Tri)}
          >
            <option value="all">All</option>
            <option value="none">No website</option>
            <option value="has">Has website</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs min-w-[120px]">
          <span style={{ color: "var(--admin-muted)" }}>Phone</span>
          <select
            aria-label="Filter by phone"
            className="rounded-lg border px-2 py-1.5 text-sm"
            style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.2)", color: "var(--admin-fg)" }}
            value={phoneFilter}
            onChange={(e) => setPhoneFilter(e.target.value as "all" | "has" | "none")}
          >
            <option value="all">All</option>
            <option value="has">Has phone</option>
            <option value="none">No phone</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs min-w-[160px]">
          <span style={{ color: "var(--admin-muted)" }}>Category</span>
          <select
            aria-label="Filter by category"
            className="rounded-lg border px-2 py-1.5 text-sm"
            style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.2)", color: "var(--admin-fg)" }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs flex-1 min-w-[140px]">
          <span style={{ color: "var(--admin-muted)" }}>City / area</span>
          <input
            className="rounded-lg border px-2 py-1.5 text-sm"
            style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.2)", color: "var(--admin-fg)" }}
            placeholder="e.g. Hot Springs"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer whitespace-nowrap" style={{ color: "var(--admin-fg)" }}>
          <input type="checkbox" checked={noWebsiteOnly} onChange={(e) => setNoWebsiteOnly(e.target.checked)} />
          No website only
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer whitespace-nowrap" style={{ color: "var(--admin-fg)" }}>
          <input type="checkbox" checked={facebookOnly} onChange={(e) => setFacebookOnly(e.target.checked)} />
          Facebook only
        </label>
      </div>

      {!brainHadOpportunities && rows.length === 0 && !loading ? (
        <section className="admin-card space-y-2 text-sm" style={{ color: "var(--admin-muted)" }}>
          <p className="font-medium" style={{ color: "var(--admin-fg)" }}>
            Nothing to scan yet
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pick a business type and a city, then run Scout above.</li>
            <li>Try Google or Facebook using the source tabs once results load.</li>
            <li>
              Start with <strong className="font-semibold text-[var(--admin-fg)]">Best web design targets</strong> for no-site and Facebook-first businesses.
            </li>
          </ul>
        </section>
      ) : filtered.length === 0 && !loading ? (
        <section className="admin-card text-sm" style={{ color: "var(--admin-muted)" }}>
          {presetTab === "best"
            ? "No best targets match right now. Try All results, or clear filters."
            : "No matches with these filters. Try All sources or adjust filters."}
        </section>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 list-none p-0 m-0">
          {filtered.map((row) => {
            const oppId = String(row.source_external_id || "").trim();
            const href = openSourceHrefFromRow(row);
            const saved = row.added_to_leads;
            const skippedRow = row.skipped;
            return (
              <li
                key={row.id}
                className="rounded-lg border p-3 flex flex-col gap-2"
                style={{
                  borderColor: "var(--admin-border)",
                  background: saved ? "rgba(34, 197, 94, 0.06)" : skippedRow ? "rgba(0,0,0,.08)" : "rgba(0,0,0,.12)",
                  opacity: skippedRow ? 0.75 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    className="text-left font-semibold text-sm leading-tight hover:underline"
                    style={{ color: "var(--admin-fg)" }}
                    onClick={() => setDetailId(row.id)}
                  >
                    {row.business_name || "Unknown business"}
                  </button>
                  <button
                    type="button"
                    className="shrink-0 p-1 rounded-md hover:bg-white/10"
                    aria-label="More details"
                    onClick={() => setDetailId(row.id)}
                  >
                    <Info className="h-4 w-4" style={{ color: "var(--admin-muted)" }} />
                  </button>
                </div>
                <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
                  {sourceTypeLabel(row.source_type)} · {labelWebsiteFromRow(row)} · {labelFacebookFromRow(row)} ·{" "}
                  {labelPhoneFromRow(row)}
                </p>
                <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                  {[row.city || "—", row.category || "—"].filter(Boolean).join(" · ")}
                </p>
                <p className="text-xs font-medium" style={{ color: "var(--admin-fg)" }}>
                  Why this business stands out: {compactOpportunityLineFromRow(row)}
                </p>
                {saved ? (
                  <p className="text-[11px] font-medium text-emerald-200/90">Saved to leads</p>
                ) : skippedRow ? (
                  <p className="text-[11px] font-medium text-white/50">Skipped</p>
                ) : null}
                <div className="flex flex-wrap gap-2 mt-auto pt-1">
                  {saved && row.linked_lead_id ? (
                    <Link
                      href={buildLeadPath(row.linked_lead_id, row.business_name)}
                      className="admin-btn-primary text-xs px-3 py-1.5"
                    >
                      Open lead
                    </Link>
                  ) : !saved && !skippedRow ? (
                    <>
                      <button
                        type="button"
                        className="admin-btn-primary text-xs px-3 py-1.5"
                        disabled={creatingLeadKey === row.id || !oppId}
                        title={!oppId ? "Run a fresh Scout run to link this row to an opportunity." : undefined}
                        onClick={async () => {
                          const res = await onAddLead(row.id, oppId);
                          if (res) onToast(res.created ? "Lead added" : "Already in CRM");
                        }}
                      >
                        Add lead
                      </button>
                      <button
                        type="button"
                        className="admin-btn-ghost text-xs px-3 py-1.5 border border-[var(--admin-border)]"
                        disabled={creatingLeadKey === row.id}
                        onClick={() => void setSkippedServer(row.id, true)}
                      >
                        Skip
                      </button>
                    </>
                  ) : skippedRow ? (
                    <button
                      type="button"
                      className="admin-btn-ghost text-xs px-3 py-1.5 border border-[var(--admin-border)]"
                      onClick={() => void setSkippedServer(row.id, false)}
                    >
                      Unskip
                    </button>
                  ) : null}
                  {href ? (
                    <button
                      type="button"
                      className="admin-btn-ghost text-[10px] px-2 py-1 inline-flex items-center gap-1 opacity-80"
                      onClick={() => openExternal(href)}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open source
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {detailId ? (
        <div
          className="fixed inset-0 z-[70] flex justify-end bg-black/60"
          role="dialog"
          aria-modal
          onClick={() => setDetailId(null)}
        >
          <div
            className="w-full max-w-md h-full overflow-y-auto border-l admin-card rounded-none"
            style={{ borderColor: "var(--admin-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-lg font-bold pr-2" style={{ color: "var(--admin-fg)" }}>
                {detail?.business_name || "…"}
              </h2>
              <button type="button" className="admin-btn-ghost text-xs shrink-0" onClick={() => setDetailId(null)}>
                Close
              </button>
            </div>
            {detailLoading || !detail ? (
              <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
                Loading details…
              </p>
            ) : (
              <>
                <dl className="space-y-3 text-sm" style={{ color: "var(--admin-muted)" }}>
                  <div>
                    <dt className="text-xs uppercase tracking-wide">Source</dt>
                    <dd className="mt-1" style={{ color: "var(--admin-fg)" }}>
                      {sourceTypeLabel(detail.source_type)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide">Area</dt>
                    <dd className="mt-1" style={{ color: "var(--admin-fg)" }}>
                      {[detail.city, detail.state, detail.category].filter(Boolean).join(" · ") || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide">Website</dt>
                    <dd className="mt-1 break-all" style={{ color: "var(--admin-fg)" }}>
                      {detail.website_url ? (
                        <button type="button" className="underline text-left" onClick={() => openExternal(detail.website_url!)}>
                          {detail.website_url}
                        </button>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide">Facebook</dt>
                    <dd className="mt-1 break-all" style={{ color: "var(--admin-fg)" }}>
                      {detail.facebook_url ? (
                        <button type="button" className="underline text-left" onClick={() => openExternal(detail.facebook_url!)}>
                          {detail.facebook_url}
                        </button>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide">Phone</dt>
                    <dd className="mt-1" style={{ color: "var(--admin-fg)" }}>
                      {String(detail.phone || "").trim() || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide">Why this business stands out</dt>
                    <dd className="mt-1" style={{ color: "var(--admin-fg)" }}>
                      {compactOpportunityLineFromRow(detail as ScoutResultListItem)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide">Opportunity reason</dt>
                    <dd className="mt-1 whitespace-pre-wrap" style={{ color: "var(--admin-fg)" }}>
                      {String(detail.opportunity_reason || "").trim() || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide">Suggested angle</dt>
                    <dd className="mt-1 text-sm" style={{ color: "var(--admin-fg)" }}>
                      {drawerWhyFromRaw(detail.raw_source_payload)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide">Score</dt>
                    <dd className="mt-1" style={{ color: "var(--admin-fg)" }}>
                      {detail.opportunity_rank ?? "—"}
                    </dd>
                  </div>
                  {detail.scout_notes ? (
                    <div>
                      <dt className="text-xs uppercase tracking-wide">Your notes</dt>
                      <dd className="mt-1 whitespace-pre-wrap" style={{ color: "var(--admin-fg)" }}>
                        {detail.scout_notes}
                      </dd>
                    </div>
                  ) : null}
                </dl>
                {detail.raw_source_payload && Object.keys(detail.raw_source_payload).length > 0 ? (
                  <details className="rounded border p-2 mt-3" style={{ borderColor: "var(--admin-border)" }}>
                    <summary className="text-xs cursor-pointer" style={{ color: "var(--admin-muted)" }}>
                      More technical detail
                    </summary>
                    <pre
                      className="text-[10px] overflow-x-auto mt-2 max-h-48 overflow-y-auto"
                      style={{ color: "var(--admin-fg)" }}
                    >
                      {JSON.stringify(detail.raw_source_payload, null, 2)}
                    </pre>
                  </details>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-2">
                  {detail.added_to_leads && detail.linked_lead_id ? (
                    <Link href={buildLeadPath(detail.linked_lead_id, detail.business_name)} className="admin-btn-primary text-sm">
                      Open lead
                    </Link>
                  ) : !detail.skipped ? (
                    <>
                      <button
                        type="button"
                        className="admin-btn-primary text-sm"
                        disabled={
                          creatingLeadKey === detail.id || !String(detail.source_external_id || "").trim()
                        }
                        onClick={async () => {
                          const oid = String(detail.source_external_id || "").trim();
                          const res = await onAddLead(detail.id, oid);
                          if (res) onToast(res.created ? "Lead added" : "Already in CRM");
                        }}
                      >
                        Add lead
                      </button>
                      <button
                        type="button"
                        className="admin-btn-ghost text-sm border border-[var(--admin-border)]"
                        onClick={() => void setSkippedServer(detail.id, true)}
                      >
                        Skip
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="admin-btn-ghost text-sm border border-[var(--admin-border)]"
                      onClick={() => void setSkippedServer(detail.id, false)}
                    >
                      Unskip
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
