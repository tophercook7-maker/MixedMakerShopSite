"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Crosshair, ExternalLink, RefreshCw } from "lucide-react";
import type {
  RunScoutResponse,
  ScoutJobStatusResponse,
  ScoutLead,
  ScoutSummary,
} from "@/lib/scout/types";

type Props = {
  integrationReady: boolean;
  initialSummary: ScoutSummary | null;
  initialTopLeads: ScoutLead[];
  initialError: string | null;
};

type JobUiStatus = "idle" | "queued" | "running" | "analyzing" | "finished" | "failed";

function formatDate(value: string | null) {
  if (!value) return "No run recorded";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function deriveUiStatus(job: ScoutJobStatusResponse): JobUiStatus {
  if (job.status === "queued") return "queued";
  if (job.status === "failed") return "failed";
  if (job.status === "finished" || job.status === "completed") return "finished";
  if (job.status === "running") {
    if ((job.progress ?? 0) >= 60) return "analyzing";
    return "running";
  }
  return "running";
}

function friendlyStatusMessage(status: JobUiStatus, summary: string | null, error: string | null) {
  if (status === "queued") return "Scout job started";
  if (status === "running") return summary || "Scout running...";
  if (status === "analyzing") return "Scout analyzing businesses...";
  if (status === "finished") return summary || "Scout complete";
  if (status === "failed") return error || "Scout failed";
  return "Ready";
}

export function ScoutConsole({
  integrationReady,
  initialSummary,
  initialTopLeads,
  initialError,
}: Props) {
  const router = useRouter();
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingRef = useRef(false);

  const [summary, setSummary] = useState<ScoutSummary | null>(initialSummary);
  const [topLeads, setTopLeads] = useState<ScoutLead[]>(initialTopLeads);
  const [pageError, setPageError] = useState<string | null>(initialError);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobUiStatus>("idle");
  const [jobProgress, setJobProgress] = useState(0);
  const [jobSummary, setJobSummary] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("Ready");

  const isBusy = isStarting || jobStatus === "queued" || jobStatus === "running" || jobStatus === "analyzing";

  const refreshLocalData = async () => {
    console.info("[Scout UI] data refresh triggered");
    router.refresh();
  };

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    pollingRef.current = false;
  };

  useEffect(() => {
    setSummary(initialSummary);
  }, [initialSummary]);

  useEffect(() => {
    setTopLeads(initialTopLeads);
  }, [initialTopLeads]);

  useEffect(() => {
    setPageError(initialError);
  }, [initialError]);

  useEffect(() => {
    return () => stopPolling();
    // stopPolling is intentionally stable from this component scope.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pollJob = async (id: string) => {
    if (pollingRef.current) return;
    pollingRef.current = true;
    console.info("[Scout UI] polling started", id);

    const tick = async () => {
      try {
        const res = await fetch(`/api/scout/jobs/${id}`, {
          method: "GET",
          cache: "no-store",
        });
        const body = (await res.json()) as (ScoutJobStatusResponse & { error?: string; refreshTriggered?: boolean });

        if (!res.ok) {
          console.error("[Scout UI] polling failed", id, body);
          setJobStatus("failed");
          setJobError(body.error ?? "Scout polling failed.");
          setStatusMessage("Scout failed");
          stopPolling();
          return;
        }

        const uiStatus = deriveUiStatus(body);
        setJobStatus(uiStatus);
        setJobProgress(body.progress ?? 0);
        setJobSummary(body.summary ?? null);
        setJobError(body.error ?? null);
        setStatusMessage(friendlyStatusMessage(uiStatus, body.summary ?? null, body.error ?? null));

        console.info("[Scout UI] polling update", id, body.status, body.progress);

        if (uiStatus === "finished") {
          console.info("[Scout UI] polling finished", id);
          const leadsMatch = (body.summary ?? "").match(/(\d+)\s+leads?\s+discovered/i);
          const refreshedCount = leadsMatch ? Number(leadsMatch[1]) : null;
          await refreshLocalData();
          setStatusMessage(
            refreshedCount !== null
              ? `Scout complete — ${refreshedCount} leads refreshed`
              : "Scout complete — leads refreshed"
          );
          stopPolling();
          return;
        }

        if (uiStatus === "failed") {
          console.info("[Scout UI] polling finished with failure", id);
          setStatusMessage("Scout failed");
          stopPolling();
          return;
        }

        pollTimerRef.current = setTimeout(tick, 2500);
      } catch (error) {
        console.error("[Scout UI] polling exception", id, error);
        setJobStatus("failed");
        setJobError(error instanceof Error ? error.message : "Scout polling failed.");
        setStatusMessage("Scout failed");
        stopPolling();
      }
    };

    await tick();
  };

  const runScout = async () => {
    if (!integrationReady || isBusy) return;
    setIsStarting(true);
    setPageError(null);
    setJobError(null);
    setStatusMessage("Starting scout job...");
    try {
      const res = await fetch("/api/scout/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await res.json()) as RunScoutResponse;

      if (!res.ok || !body.job_id) {
        const err = body.user_message || body.message || body.error || "Could not start Scout job.";
        console.error("[Scout UI] run failed", body);
        setPageError(err);
        setStatusMessage("Scout failed");
        setJobStatus("failed");
        return;
      }

      console.info("[Scout UI] scout job started", body.job_id);
      setJobId(body.job_id);
      setJobStatus("queued");
      setJobProgress(body.progress ?? 0);
      setJobSummary("Scout job started");
      setStatusMessage("Scout job started");
      await pollJob(body.job_id);
    } catch (error) {
      console.error("[Scout UI] run exception", error);
      setPageError(error instanceof Error ? error.message : "Failed to start Scout.");
      setStatusMessage("Scout failed");
      setJobStatus("failed");
    } finally {
      setIsStarting(false);
    }
  };

  const statusClass = useMemo(() => {
    if (jobStatus === "finished") return "admin-badge admin-badge-won";
    if (jobStatus === "failed") return "admin-badge admin-badge-lost";
    if (jobStatus === "idle") return "admin-badge admin-badge-pending";
    return "admin-badge admin-badge-progress";
  }, [jobStatus]);

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
          <button type="button" className="admin-btn-primary" onClick={runScout} disabled={!integrationReady || isBusy}>
            {isBusy ? "Running..." : "Run Scout"}
          </button>
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
            <span className={statusClass}>{jobStatus}</span>
            <span className="text-sm" style={{ color: "var(--admin-muted)" }}>
              {statusMessage}
            </span>
            {jobId && (
              <span className="text-xs" style={{ color: "var(--admin-muted-2)" }}>
                Job: {jobId}
              </span>
            )}
          </div>
          {(jobStatus === "running" || jobStatus === "analyzing" || jobStatus === "queued") && (
            <div className="mt-3">
              <div className="w-full h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${Math.max(0, Math.min(100, jobProgress))}%`,
                    background: "linear-gradient(90deg, rgba(240,165,26,1), rgba(198,90,30,0.95))",
                  }}
                />
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--admin-muted)" }}>
                Progress: {jobProgress}%
              </p>
            </div>
          )}
          {jobSummary && (
            <p className="text-sm mt-3" style={{ color: "var(--admin-muted)" }}>
              {jobSummary}
            </p>
          )}
          {(pageError || jobError) && (
            <p className="text-sm mt-3" style={{ color: "#fca5a5" }}>
              {pageError || jobError}
            </p>
          )}
        </section>
      )}

      {integrationReady && summary && (
        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Last scout run</div>
            <div className="admin-stat-value" style={{ fontSize: "1rem" }}>
              {formatDate(summary.last_run_time)}
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Leads found today</div>
            <div className="admin-stat-value">{summary.leads_found_today}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Top opportunities</div>
            <div className="admin-stat-value">{summary.top_opportunities_count}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Follow-ups due</div>
            <div className="admin-stat-value">{summary.followups_due}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Websites audited</div>
            <div className="admin-stat-value">{summary.dashboard_websites_audited}</div>
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
          {topLeads.length === 0 ? (
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
                    <th>Best Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {topLeads.slice(0, 10).map((lead, idx) => (
                    <tr key={`${lead.slug ?? lead.business_name ?? "lead"}-${idx}`}>
                      <td>{lead.business_name ?? "Unknown"}</td>
                      <td>{lead.category ?? "—"}</td>
                      <td>{lead.city ?? "—"}</td>
                      <td>{lead.score ?? "—"}</td>
                      <td>{lead.lead_tier ?? "—"}</td>
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
