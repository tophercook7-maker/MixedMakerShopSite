"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Info } from "lucide-react";
import type { ScoutLead } from "@/lib/scout/types";
import { scoreScoutLead } from "@/lib/scout-conversion";
import {
  compactOpportunityLine,
  inferDiscoverySource,
  labelFacebookStatus,
  labelPhoneStatus,
  labelWebsiteStatus,
  openSourceHref,
  opportunityId,
  rankScoreForSort,
  sourceLabel,
  websiteBucket,
  facebookOnlyBusiness,
  hasFacebookPresence,
  hasPhonePresence,
} from "@/lib/scout/scout-lite";

const SKIPPED_KEY = "mixedmakershop.scout.lite.skipped.v1";

function loadSkipped(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(SKIPPED_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map((x) => String(x)));
  } catch {
    return new Set();
  }
}

function saveSkipped(ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SKIPPED_KEY, JSON.stringify([...ids]));
}

type Tri = "all" | "yes" | "no" | "unknown";

type Props = {
  leads: ScoutLead[];
  creatingLeadForOppId: string | null;
  onAddLead: (opportunityId: string) => Promise<{ created: boolean; businessName: string } | null>;
  onToast: (message: string) => void;
  openExternal: (href: string) => void;
};

function drawerWhy(lead: ScoutLead): string {
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

export function ScoutLitePanel({ leads, creatingLeadForOppId, onAddLead, onToast, openExternal }: Props) {
  const [skipped, setSkipped] = useState<Set<string>>(() => loadSkipped());
  const [sourceTab, setSourceTab] = useState<"all" | "google" | "facebook">("all");
  const [websiteFilter, setWebsiteFilter] = useState<Tri>("all");
  const [phoneFilter, setPhoneFilter] = useState<"all" | "has" | "none">("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [noWebsiteOnly, setNoWebsiteOnly] = useState(false);
  const [facebookOnly, setFacebookOnly] = useState(false);
  const [detail, setDetail] = useState<ScoutLead | null>(null);

  useEffect(() => {
    saveSkipped(skipped);
  }, [skipped]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    for (const l of leads) {
      const c = String(l.category || "").trim();
      if (c) s.add(c);
    }
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [leads]);

  const filtered = useMemo(() => {
    const catExact = categoryFilter.trim();
    const cityQ = cityFilter.trim().toLowerCase();
    return [...leads]
      .filter((lead) => {
        const id = opportunityId(lead);
        if (!id || skipped.has(id)) return false;
        const src = inferDiscoverySource(lead);
        if (sourceTab === "google" && src !== "google" && src !== "mixed") return false;
        if (sourceTab === "facebook" && src !== "facebook" && src !== "mixed") return false;
        if (noWebsiteOnly && websiteBucket(lead) !== "none") return false;
        if (facebookOnly && !facebookOnlyBusiness(lead)) return false;
        const wb = websiteBucket(lead);
        if (websiteFilter === "none" && wb !== "none") return false;
        if (websiteFilter === "has" && wb !== "has") return false;
        if (websiteFilter === "unknown" && wb !== "unknown") return false;
        const ph = hasPhonePresence(lead);
        if (phoneFilter === "has" && !ph) return false;
        if (phoneFilter === "none" && ph) return false;
        if (catExact) {
          const c = String(lead.category || "").trim();
          if (c.toLowerCase() !== catExact.toLowerCase()) return false;
        }
        if (cityQ) {
          const city = String(lead.city || "").toLowerCase();
          if (!city.includes(cityQ)) return false;
        }
        return true;
      })
      .sort((a, b) => rankScoreForSort(b) - rankScoreForSort(a));
  }, [
    leads,
    skipped,
    sourceTab,
    websiteFilter,
    phoneFilter,
    categoryFilter,
    cityFilter,
    noWebsiteOnly,
    facebookOnly,
  ]);

  const skipOne = useCallback((lead: ScoutLead) => {
    const id = opportunityId(lead);
    if (!id) return;
    setSkipped((prev) => new Set(prev).add(id));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
            Find businesses
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
            Scan quickly, then save with one tap. Full notes stay in the details panel until you need them.
          </p>
        </div>
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
            aria-selected={sourceTab === t.id ? "true" : "false"}
            className={sourceTab === t.id ? "admin-btn-primary text-xs px-3 py-1.5 rounded-md" : "admin-btn-ghost text-xs px-3 py-1.5 rounded-md"}
            onClick={() => setSourceTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-card flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1 text-xs min-w-[140px]">
          <span style={{ color: "var(--admin-muted)" }}>Website</span>
          <select
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

      {leads.length === 0 ? (
        <section className="admin-card space-y-2 text-sm" style={{ color: "var(--admin-muted)" }}>
          <p className="font-medium" style={{ color: "var(--admin-fg)" }}>
            Nothing to scan yet
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pick a business type and a city, then run Scout above.</li>
            <li>Try Google or Facebook using the source tabs once results load.</li>
            <li>
              Turn on <strong className="font-semibold text-[var(--admin-fg)]">No website only</strong> first — that’s usually the best fit for web design outreach.
            </li>
          </ul>
        </section>
      ) : filtered.length === 0 ? (
        <section className="admin-card text-sm" style={{ color: "var(--admin-muted)" }}>
          No matches with these filters. Try All sources, or clear “No website only” / “Facebook only”.
        </section>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 list-none p-0 m-0">
          {filtered.map((lead) => {
            const id = opportunityId(lead);
            const src = inferDiscoverySource(lead);
            const srcUi = sourceLabel(src);
            const href = openSourceHref(lead);
            return (
              <li
                key={id}
                className="rounded-lg border p-3 flex flex-col gap-2"
                style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.12)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    className="text-left font-semibold text-sm leading-tight hover:underline"
                    style={{ color: "var(--admin-fg)" }}
                    onClick={() => setDetail(lead)}
                  >
                    {lead.business_name || "Unknown business"}
                  </button>
                  <button
                    type="button"
                    className="shrink-0 p-1 rounded-md hover:bg-white/10"
                    aria-label="More details"
                    onClick={() => setDetail(lead)}
                  >
                    <Info className="h-4 w-4" style={{ color: "var(--admin-muted)" }} />
                  </button>
                </div>
                <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
                  {srcUi} · {labelWebsiteStatus(lead)} · {labelFacebookStatus(lead)} · {labelPhoneStatus(lead)}
                </p>
                <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
                  {[lead.city || "—", lead.category || "—"].filter(Boolean).join(" · ")}
                </p>
                <p className="text-xs font-medium" style={{ color: "var(--admin-fg)" }}>
                  Why this business stands out: {compactOpportunityLine(lead)}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto pt-1">
                  <button
                    type="button"
                    className="admin-btn-primary text-xs px-3 py-1.5"
                    disabled={creatingLeadForOppId === id}
                    onClick={async () => {
                      const res = await onAddLead(id);
                      if (res) onToast(res.created ? "Saved to your leads" : "Already in your leads");
                    }}
                  >
                    Add lead
                  </button>
                  <button type="button" className="admin-btn-ghost text-xs px-3 py-1.5 border border-[var(--admin-border)]" onClick={() => skipOne(lead)}>
                    Skip
                  </button>
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

      {detail ? (
        <div
          className="fixed inset-0 z-[70] flex justify-end bg-black/60"
          role="dialog"
          aria-modal
          onClick={() => setDetail(null)}
        >
          <div
            className="w-full max-w-md h-full overflow-y-auto border-l admin-card rounded-none"
            style={{ borderColor: "var(--admin-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-lg font-bold pr-2" style={{ color: "var(--admin-fg)" }}>
                {detail.business_name}
              </h2>
              <button type="button" className="admin-btn-ghost text-xs shrink-0" onClick={() => setDetail(null)}>
                Close
              </button>
            </div>
            <dl className="space-y-3 text-sm" style={{ color: "var(--admin-muted)" }}>
              <div>
                <dt className="text-xs uppercase tracking-wide">Source</dt>
                <dd className="mt-1" style={{ color: "var(--admin-fg)" }}>
                  {sourceLabel(inferDiscoverySource(detail))}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Area</dt>
                <dd className="mt-1" style={{ color: "var(--admin-fg)" }}>
                  {[detail.city, detail.category].filter(Boolean).join(" · ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Website</dt>
                <dd className="mt-1 break-all" style={{ color: "var(--admin-fg)" }}>
                  {detail.website ? (
                    <button type="button" className="underline text-left" onClick={() => openExternal(String(detail.website))}>
                      {detail.website}
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
                    <button type="button" className="underline text-left" onClick={() => openExternal(String(detail.facebook_url))}>
                      {detail.facebook_url}
                    </button>
                  ) : hasFacebookPresence(detail) ? (
                    "Facebook is their contact path on the listing."
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
                  {compactOpportunityLine(detail)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Opportunity reason</dt>
                <dd className="mt-1 whitespace-pre-wrap" style={{ color: "var(--admin-fg)" }}>
                  {String(detail.opportunity_reason || "").trim() || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Signals</dt>
                <dd className="mt-1" style={{ color: "var(--admin-fg)" }}>
                  {Array.isArray(detail.opportunity_signals) && detail.opportunity_signals.length
                    ? detail.opportunity_signals.join(", ")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Suggested angle</dt>
                <dd className="mt-1 text-sm" style={{ color: "var(--admin-fg)" }}>
                  {drawerWhy(detail)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Score</dt>
                <dd className="mt-1" style={{ color: "var(--admin-fg)" }}>
                  {detail.opportunity_score ?? detail.score ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Best contact path</dt>
                <dd className="mt-1" style={{ color: "var(--admin-fg)" }}>
                  {detail.best_contact_method ?? "—"}
                </dd>
              </div>
              {detail.raw_source_payload && Object.keys(detail.raw_source_payload).length > 0 ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide">Raw info</dt>
                  <dd className="mt-1">
                    <pre
                      className="text-[10px] overflow-x-auto p-2 rounded border max-h-48 overflow-y-auto"
                      style={{ borderColor: "var(--admin-border)", color: "var(--admin-fg)" }}
                    >
                      {JSON.stringify(detail.raw_source_payload, null, 2)}
                    </pre>
                  </dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                className="admin-btn-primary text-sm"
                disabled={creatingLeadForOppId === opportunityId(detail)}
                onClick={async () => {
                  const res = await onAddLead(opportunityId(detail));
                  if (res) onToast(res.created ? "Saved to your leads" : "Already in your leads");
                }}
              >
                Add lead
              </button>
              <button type="button" className="admin-btn-ghost text-sm border border-[var(--admin-border)]" onClick={() => skipOne(detail)}>
                Skip
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
