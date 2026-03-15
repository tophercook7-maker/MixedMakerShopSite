"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Crosshair, ExternalLink, RefreshCw } from "lucide-react";
import type { ScoutLead, ScoutSummary } from "@/lib/scout/types";
import { useGlobalScoutJob } from "@/components/admin/scout-job-provider";

type Props = {
  integrationReady: boolean;
  initialSummary: ScoutSummary | null;
  initialTopLeads: ScoutLead[];
  initialError: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "No run recorded";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function ScoutConsole({
  integrationReady,
  initialSummary,
  initialTopLeads,
  initialError,
}: Props) {
  const scout = useGlobalScoutJob();
  const [pageError, setPageError] = useState<string | null>(initialError);

  const runScout = async () => {
    setPageError(null);
    const result = await scout.startScout(integrationReady);
    if (!result.ok && result.error) {
      setPageError(result.error);
    }
  };

  const statusClass = useMemo(() => {
    if (scout.jobStatus === "finished") return "admin-badge admin-badge-won";
    if (scout.jobStatus === "cancelled") return "admin-badge admin-badge-cancelled";
    if (scout.jobStatus === "failed") return "admin-badge admin-badge-lost";
    if (scout.jobStatus === "idle") return "admin-badge admin-badge-pending";
    return "admin-badge admin-badge-progress";
  }, [scout.jobStatus]);

  const tierBadgeClass = (tier: string | null | undefined) => {
    const normalized = String(tier || "").trim().toLowerCase();
    if (normalized === "hot_lead" || normalized === "hot lead") return "admin-badge admin-badge-tier-hot";
    if (normalized === "warm_lead" || normalized === "warm lead") return "admin-badge admin-badge-tier-warm";
    return "admin-badge admin-badge-tier-low";
  };

  return (
    <div className="space-y-6">
      <section className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crosshair className="h-5 w-5" style={{ color: "var(--admin-gold)" }} />
              <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
                Scout
              </h1>
            </div>
            <p style={{ color: "var(--admin-muted)" }}>
              MixedMakerShop admin shell + Scout-Brain engine. Run Scout jobs from here and monitor progress live.
            </p>
          </div>
          <button
            type="button"
            className="admin-btn-primary"
            onClick={runScout}
            disabled={!integrationReady || scout.isBusy}
          >
            {scout.isBusy ? "Running..." : "Run Scout"}
          </button>
          {(scout.jobStatus === "queued" || scout.jobStatus === "running" || scout.jobStatus === "analyzing") && (
            <button
              type="button"
              className="admin-btn-ghost"
              onClick={() => {
                void scout.cancelScout();
              }}
            >
              Cancel Scout
            </button>
          )}
        </div>
      </section>

      {!integrationReady && (
        <section className="admin-card">
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
            Integration not configured
          </h2>
          <p style={{ color: "var(--admin-muted)" }}>
            Set <code>SCOUT_BRAIN_API_BASE_URL</code> in `next-app/.env.local` to connect this admin to Scout-Brain.
          </p>
        </section>
      )}

      {integrationReady && (
        <section className="admin-card">
          <div className="flex flex-wrap items-center gap-3">
            <span className={statusClass}>{scout.jobStatus}</span>
            {(scout.jobStatus === "queued" || scout.jobStatus === "running" || scout.jobStatus === "analyzing") && (
              <RefreshCw className="h-4 w-4 animate-spin" style={{ color: "var(--admin-gold)" }} />
            )}
            <span className="text-sm" style={{ color: "var(--admin-muted)" }}>
              {scout.statusMessage}
            </span>
            {scout.jobId && (
              <span className="text-xs" style={{ color: "var(--admin-muted-2)" }}>
                Job: {scout.jobId}
              </span>
            )}
          </div>
          {(scout.jobStatus === "running" || scout.jobStatus === "analyzing" || scout.jobStatus === "queued") && (
            <div className="mt-3">
              <div className="w-full h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${Math.max(0, Math.min(100, scout.jobProgress))}%`,
                    background: "linear-gradient(90deg, rgba(240,165,26,1), rgba(198,90,30,0.95))",
                  }}
                />
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--admin-muted)" }}>
                Progress: {scout.jobProgress}% - Phase: {String(scout.stage || "working").replace(/[_-]+/g, " ")}
              </p>
            </div>
          )}
          {scout.jobMessage && (
            <p className="text-sm mt-3" style={{ color: "var(--admin-muted)" }}>
              {scout.jobMessage}
            </p>
          )}
          {(pageError || scout.jobError) && (
            <p className="text-sm mt-3" style={{ color: "#fca5a5" }}>
              {pageError || scout.jobError}
            </p>
          )}
        </section>
      )}

      {integrationReady && initialSummary && (
        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Last scout run</div>
            <div className="admin-stat-value" style={{ fontSize: "1rem" }}>
              {formatDate(initialSummary.last_run_time)}
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Leads found today</div>
            <div className="admin-stat-value">{initialSummary.leads_found_today}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Top opportunities</div>
            <div className="admin-stat-value">{initialSummary.top_opportunities_count}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Follow-ups due</div>
            <div className="admin-stat-value">{initialSummary.followups_due}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Websites audited</div>
            <div className="admin-stat-value">{initialSummary.dashboard_websites_audited}</div>
          </div>
        </section>
      )}

      {integrationReady && (
        <section className="admin-card">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
              Top Opportunities
            </h2>
            <Link href="/admin/leads" className="admin-btn-ghost inline-flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Open Leads
            </Link>
          </div>
          {initialTopLeads.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
              No opportunities returned yet. Run Scout to refresh opportunities.
            </p>
          ) : (
            <div className="admin-table-wrap overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Category</th>
                    <th>City</th>
                    <th>Score</th>
                    <th>Tier</th>
                    <th>Detected Issues</th>
                    <th>Best Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {initialTopLeads.slice(0, 10).map((lead, idx) => (
                    <tr key={`${lead.slug ?? lead.business_name ?? "lead"}-${idx}`}>
                      <td>{lead.business_name ?? "Unknown"}</td>
                      <td>{lead.category ?? "—"}</td>
                      <td>{lead.city ?? "—"}</td>
                      <td>{lead.score ?? "—"}</td>
                      <td>
                        <span className={tierBadgeClass(lead.lead_tier)}>
                          {String(lead.lead_tier || "—").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>
                        {Array.isArray(lead.opportunity_signals) && lead.opportunity_signals.length
                          ? lead.opportunity_signals.slice(0, 3).join(", ")
                          : "—"}
                      </td>
                      <td>{lead.best_contact_method ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Link href="/admin/outreach" className="admin-btn-ghost inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Next: Wire Outreach Queue
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
