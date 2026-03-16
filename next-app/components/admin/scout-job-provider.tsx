"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import type { RunScoutResponse, ScoutJobStatusResponse, ScoutScanSettings } from "@/lib/scout/types";

type JobUiStatus =
  | "idle"
  | "queued"
  | "running"
  | "analyzing"
  | "finished"
  | "failed"
  | "cancelled";

type StoredScoutJobState = {
  jobId: string | null;
  jobStatus: JobUiStatus;
  jobProgress: number;
  jobMessage: string | null;
  jobError: string | null;
  stage: string | null;
  persistenceDebug: ScoutJobStatusResponse["persistence_debug"] | null;
  scanSettings: ScoutScanSettings | null;
  updatedAt: number;
};

type StartScoutResult = {
  ok: boolean;
  error?: string;
};

type CancelScoutResult = {
  ok: boolean;
  error?: string;
};

type ActiveScoutJobResponse = {
  active_job?: ScoutJobStatusResponse | null;
  error?: string;
};

type GlobalScoutJobContextValue = {
  jobId: string | null;
  jobStatus: JobUiStatus;
  jobProgress: number;
  jobMessage: string | null;
  jobError: string | null;
  stage: string | null;
  persistenceDebug: ScoutJobStatusResponse["persistence_debug"] | null;
  scanSettings: ScoutScanSettings | null;
  statusMessage: string;
  isStarting: boolean;
  isBusy: boolean;
  startScout: (integrationReady: boolean, scanSettings?: ScoutScanSettings | null) => Promise<StartScoutResult>;
  cancelScout: () => Promise<CancelScoutResult>;
  clearScoutState: () => void;
};

const STORAGE_KEY = "mixedmakershop.activeScoutJob.v1";

const GlobalScoutJobContext = createContext<GlobalScoutJobContextValue | null>(null);

function deriveUiStatus(job: ScoutJobStatusResponse): JobUiStatus {
  if (job.status === "queued") return "queued";
  if (job.status === "cancelled") return "cancelled";
  if (job.status === "failed") return "failed";
  if (job.status === "finished" || job.status === "completed") return "finished";
  if (job.status === "running") {
    if ((job.progress ?? 0) >= 60) return "analyzing";
    return "running";
  }
  return "running";
}

function stageLabel(stage: string | null) {
  const normalized = String(stage || "").trim();
  if (!normalized) return "Working";
  return normalized
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function friendlyStatusMessage(status: JobUiStatus, message: string | null, error: string | null) {
  if (status === "queued") return message || "Scout job started";
  if (status === "running") return message || "Scout running...";
  if (status === "analyzing") return message || "Scout analyzing businesses...";
  if (status === "finished") return message || "Scout complete";
  if (status === "cancelled") return message || "Scout cancelled";
  if (status === "failed") return error || "Scout failed";
  return "Ready";
}

export function GlobalScoutJobProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingJobIdRef = useRef<string | null>(null);
  const lastProgressRef = useRef(0);
  const lastProgressAtRef = useRef(0);
  const completionNotifiedJobIdRef = useRef<string | null>(null);
  const clearCompletedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobUiStatus>("idle");
  const [jobProgress, setJobProgress] = useState<number>(0);
  const [jobMessage, setJobMessage] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [persistenceDebug, setPersistenceDebug] = useState<ScoutJobStatusResponse["persistence_debug"] | null>(null);
  const [scanSettings, setScanSettings] = useState<ScoutScanSettings | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const isBusy = isStarting || jobStatus === "queued" || jobStatus === "running" || jobStatus === "analyzing";

  const persistScoutState = useCallback((state: StoredScoutJobState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore local storage write failures.
    }
  }, []);

  const clearScoutState = useCallback(() => {
    setJobId(null);
    setJobStatus("idle");
    setJobProgress(0);
    setJobMessage(null);
    setJobError(null);
    setStage(null);
    setPersistenceDebug(null);
    setScanSettings(null);
    pollingJobIdRef.current = null;
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (clearCompletedTimerRef.current) {
      clearTimeout(clearCompletedTimerRef.current);
      clearCompletedTimerRef.current = null;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore local storage write failures.
    }
  }, []);

  const writeAndSetState = useCallback(
    (next: Partial<StoredScoutJobState>) => {
      setJobId((prev) => next.jobId ?? prev);
      setJobStatus((prev) => next.jobStatus ?? prev);
      setJobProgress((prev) => (typeof next.jobProgress === "number" ? next.jobProgress : prev));
      setJobMessage((prev) => next.jobMessage ?? prev ?? null);
      setJobError((prev) => next.jobError ?? prev ?? null);
      setStage((prev) => next.stage ?? prev ?? null);
      setPersistenceDebug((prev) => next.persistenceDebug ?? prev ?? null);
      setScanSettings((prev) => next.scanSettings ?? prev ?? null);

      const state: StoredScoutJobState = {
        jobId: next.jobId ?? jobId,
        jobStatus: next.jobStatus ?? jobStatus,
        jobProgress: typeof next.jobProgress === "number" ? next.jobProgress : jobProgress,
        jobMessage: next.jobMessage ?? jobMessage ?? null,
        jobError: next.jobError ?? jobError ?? null,
        stage: next.stage ?? stage ?? null,
        persistenceDebug: next.persistenceDebug ?? persistenceDebug ?? null,
        scanSettings: next.scanSettings ?? scanSettings ?? null,
        updatedAt: Date.now(),
      };
      persistScoutState(state);
    },
    [jobError, jobId, jobMessage, jobProgress, jobStatus, persistScoutState, stage, persistenceDebug, scanSettings]
  );

  const stopPolling = useCallback(() => {
    pollingJobIdRef.current = null;
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const pollJob = useCallback(
    async (id: string) => {
      if (pollingJobIdRef.current === id) return;
      pollingJobIdRef.current = id;
      console.info("global scout polling active", id);

      const tick = async () => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          const res = await fetch(`/api/scout/jobs/${id}`, {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          });
          clearTimeout(timeout);
          const body = (await res
            .json()
            .catch(() => ({ error: "Load failed while parsing Scout polling response." }))) as ScoutJobStatusResponse & {
            error?: string;
            refreshTriggered?: boolean;
          };

          if (!res.ok) {
            writeAndSetState({
              jobId: id,
              jobStatus: "failed",
              jobError: body.error ?? "Scout polling failed.",
              jobMessage: body.error ?? "Scout polling failed.",
            });
            stopPolling();
            return;
          }

          const uiStatus = deriveUiStatus(body);
          const nextProgress = Math.max(0, Math.min(100, Number(body.progress ?? 0)));
          const now = Date.now();
          if (nextProgress > lastProgressRef.current) {
            lastProgressRef.current = nextProgress;
            lastProgressAtRef.current = now;
          } else if (!lastProgressAtRef.current) {
            lastProgressAtRef.current = now;
          }
          const staleMs = now - lastProgressAtRef.current;
          const backendMessage = body.message ?? body.summary ?? null;
          const message =
            (uiStatus === "queued" || uiStatus === "running" || uiStatus === "analyzing") && staleMs >= 15000
              ? `${backendMessage || "Still running..."} Still running...`
              : backendMessage;

          writeAndSetState({
            jobId: id,
            jobStatus: uiStatus,
            jobProgress: nextProgress,
            jobMessage: message,
            jobError: body.error ?? null,
            stage: body.stage ?? null,
            persistenceDebug: body.persistence_debug ?? null,
            scanSettings: body.scan_settings ?? null,
          });

          if (uiStatus === "finished") {
            console.info("scout job finished, refreshing admin data", id);
            router.refresh();
            if (completionNotifiedJobIdRef.current !== id) {
              completionNotifiedJobIdRef.current = id;
              const leadsMatch = (body.summary ?? "").match(/(\d+)\s+leads?\s+discovered/i);
              const refreshedCount = leadsMatch ? Number(leadsMatch[1]) : null;
              const completionMessage =
                refreshedCount !== null
                  ? `Scout complete — ${refreshedCount} leads refreshed`
                  : "Scout complete — leads refreshed";
              writeAndSetState({
                jobId: id,
                jobStatus: "finished",
                jobProgress: 100,
                jobMessage: completionMessage,
                jobError: null,
                stage: body.stage ?? "finished",
                persistenceDebug: body.persistence_debug ?? null,
                scanSettings: body.scan_settings ?? null,
              });
            }
            stopPolling();
            if (clearCompletedTimerRef.current) {
              clearTimeout(clearCompletedTimerRef.current);
            }
            clearCompletedTimerRef.current = setTimeout(() => {
              clearScoutState();
            }, 3000);
            return;
          }

          if (uiStatus === "cancelled") {
            stopPolling();
            return;
          }

          if (uiStatus === "failed") {
            stopPolling();
            return;
          }

          pollTimerRef.current = setTimeout(tick, 2500);
        } catch (error) {
          writeAndSetState({
            jobId: id,
            jobStatus: "failed",
            jobError: error instanceof Error ? error.message : "Scout polling failed.",
            jobMessage: "Scout polling failed.",
          });
          stopPolling();
        }
      };

      await tick();
    },
    [clearScoutState, router, stopPolling, writeAndSetState]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as StoredScoutJobState;
      if (!saved?.jobId) return;
      setJobId(saved.jobId);
      setJobStatus(saved.jobStatus || "queued");
      setJobProgress(Number(saved.jobProgress || 0));
      setJobMessage(saved.jobMessage || null);
      setJobError(saved.jobError || null);
      setStage(saved.stage || null);
      setPersistenceDebug(saved.persistenceDebug || null);
      setScanSettings(saved.scanSettings || null);
      lastProgressRef.current = Number(saved.jobProgress || 0);
      lastProgressAtRef.current = Date.now();
      console.info("scout job restored after navigation", saved.jobId);
      if (saved.jobStatus === "queued" || saved.jobStatus === "running" || saved.jobStatus === "analyzing") {
        void pollJob(saved.jobId);
      }
    } catch {
      // Ignore local storage parse failures.
    }
  }, [pollJob]);

  const restoreActiveJobFromWorkspace = useCallback(async () => {
    try {
      console.info("restoring active scout job from jobs table");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch("/api/scout/jobs/active", {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const body = (await res
        .json()
        .catch(() => ({ error: "Load failed while parsing active Scout job response." }))) as ActiveScoutJobResponse;
      if (!res.ok) {
        console.error("[Admin Bootstrap] scout.jobs.active failed", {
          status: res.status,
          error: body.error || "Unknown active-job proxy failure.",
        });
        return false;
      }
      const active = body.active_job;
      if (!active?.id) return false;
      const uiStatus = deriveUiStatus(active);
      if (!(uiStatus === "queued" || uiStatus === "running" || uiStatus === "analyzing")) return false;
      const nextProgress = Math.max(0, Math.min(100, Number(active.progress ?? 0)));
      lastProgressRef.current = nextProgress;
      lastProgressAtRef.current = Date.now();
      writeAndSetState({
        jobId: active.id,
        jobStatus: uiStatus,
        jobProgress: nextProgress,
        jobMessage: active.message ?? active.summary ?? "Scout running...",
        jobError: active.error ?? null,
        stage: active.stage ?? null,
        persistenceDebug: active.persistence_debug ?? null,
        scanSettings: active.scan_settings ?? null,
      });
      console.info("cross-device scout restore success", active.id);
      void pollJob(active.id);
      return true;
    } catch (error) {
      console.error("[Admin Bootstrap] scout.jobs.active request threw", {
        message: error instanceof Error ? error.message : "Active job restore failed.",
      });
      return false;
    }
  }, [pollJob, writeAndSetState]);

  useEffect(() => {
    let cancelled = false;
    async function runRestore() {
      if (cancelled) return;
      await restoreActiveJobFromWorkspace();
    }
    void runRestore();
    return () => {
      cancelled = true;
    };
  }, [restoreActiveJobFromWorkspace]);

  useEffect(() => {
    if (isBusy || jobId) return;
    const timer = setInterval(() => {
      void restoreActiveJobFromWorkspace();
    }, 8000);
    return () => clearInterval(timer);
  }, [isBusy, jobId, restoreActiveJobFromWorkspace]);

  useEffect(() => {
    if (isBusy) {
      console.info("route changed, scout continues", pathname);
    }
  }, [isBusy, pathname]);

  const startScout = useCallback(
    async (integrationReady: boolean, selectedScanSettings?: ScoutScanSettings | null): Promise<StartScoutResult> => {
      if (!integrationReady) return { ok: false, error: "Scout integration is not configured." };
      if (isBusy) return { ok: false, error: "Scout is already running." };

      setIsStarting(true);
      writeAndSetState({
        jobError: null,
        jobMessage: "Starting scout job...",
      });

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        const res = await fetch("/api/scout/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scan_settings: selectedScanSettings || null,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const body = (await res.json()) as RunScoutResponse;

        if (!res.ok || !body.job_id) {
          const err = body.user_message || body.message || body.error || "Could not start Scout job.";
          writeAndSetState({
            jobStatus: "failed",
            jobError: err,
            jobMessage: err,
          });
          return { ok: false, error: err };
        }

        const initialProgress = Math.max(0, Math.min(100, Number(body.progress ?? 10)));
        lastProgressRef.current = initialProgress;
        lastProgressAtRef.current = Date.now();
        completionNotifiedJobIdRef.current = null;
        writeAndSetState({
          jobId: body.job_id,
          jobStatus: "queued",
          jobProgress: initialProgress,
          jobMessage: body.message || "Scout job started",
          stage: "queued",
          jobError: null,
          scanSettings: selectedScanSettings || null,
        });
        console.info("global scout job started", body.job_id);
        void pollJob(body.job_id);
        return { ok: true };
      } catch (error) {
        const err = error instanceof Error ? error.message : "Failed to start Scout.";
        writeAndSetState({
          jobStatus: "failed",
          jobError: err,
          jobMessage: err,
        });
        return { ok: false, error: err };
      } finally {
        setIsStarting(false);
      }
    },
    [isBusy, pollJob, writeAndSetState]
  );

  const cancelScout = useCallback(async (): Promise<CancelScoutResult> => {
    if (!jobId) return { ok: false, error: "No active Scout job." };
    if (!(jobStatus === "queued" || jobStatus === "running" || jobStatus === "analyzing")) {
      return { ok: false, error: "Scout is not running." };
    }
    writeAndSetState({
      jobId,
      jobMessage: "Stopping scout...",
      stage: "cancelling",
    });
    try {
      const res = await fetch(`/api/scout/jobs/${encodeURIComponent(jobId)}/cancel`, {
        method: "POST",
        cache: "no-store",
      });
      const body = (await res.json().catch(() => ({}))) as {
        status?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        return { ok: false, error: body.error || "Could not cancel Scout job." };
      }
      const cancelled = String(body.status || "").toLowerCase() === "cancelled";
      if (cancelled) {
        writeAndSetState({
          jobId,
          jobStatus: "cancelled",
          jobProgress: 100,
          jobMessage: body.message || "Scout cancelled",
          stage: "cancelled",
          jobError: null,
        });
        stopPolling();
      } else {
        writeAndSetState({
          jobId,
          jobMessage: body.message || "Stopping scout...",
          stage: "cancelling",
        });
      }
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Could not cancel Scout job.",
      };
    }
  }, [jobId, jobStatus, stopPolling, writeAndSetState]);

  const statusMessage = useMemo(
    () => friendlyStatusMessage(jobStatus, jobMessage, jobError),
    [jobError, jobMessage, jobStatus]
  );

  const contextValue = useMemo<GlobalScoutJobContextValue>(
    () => ({
      jobId,
      jobStatus,
      jobProgress,
      jobMessage,
      jobError,
      stage,
      persistenceDebug,
      scanSettings,
      statusMessage,
      isStarting,
      isBusy,
      startScout,
      cancelScout,
      clearScoutState,
    }),
    [
      clearScoutState,
      isBusy,
      isStarting,
      jobError,
      jobId,
      jobMessage,
      jobProgress,
      jobStatus,
      stage,
      persistenceDebug,
      scanSettings,
      startScout,
      cancelScout,
      statusMessage,
    ]
  );

  const showWidget = Boolean(jobId) && (jobStatus !== "idle" || isStarting);
  const widgetStyle =
    jobStatus === "cancelled"
      ? {
          borderColor: "rgba(250, 204, 21, 0.5)",
          background: "rgba(66, 52, 12, 0.96)",
          color: "var(--admin-fg)",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.35)",
        }
      : {
          borderColor: "var(--admin-border)",
          background: "rgba(15, 18, 24, 0.95)",
          color: "var(--admin-fg)",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.35)",
        };

  return (
    <GlobalScoutJobContext.Provider value={contextValue}>
      {children}
      {showWidget && (
        <div
          className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-xl border p-3"
          style={widgetStyle}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            {(jobStatus === "queued" || jobStatus === "running" || jobStatus === "analyzing" || isStarting) && (
              <RefreshCw className="h-4 w-4 animate-spin" style={{ color: "var(--admin-gold)" }} />
            )}
            <span>Scout {jobStatus === "finished" ? "complete" : jobStatus}</span>
            <span style={{ color: "var(--admin-muted)" }}>- {jobProgress}%</span>
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--admin-muted)" }}>
            {statusMessage}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--admin-muted-2)" }}>
            Phase: {stageLabel(stage)}
          </p>
          {(jobStatus === "queued" || jobStatus === "running" || jobStatus === "analyzing") && (
            <div className="mt-2">
              <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${Math.max(0, Math.min(100, jobProgress))}%`,
                    background: "linear-gradient(90deg, rgba(240,165,26,1), rgba(198,90,30,0.95))",
                  }}
                />
              </div>
            </div>
          )}
          {(jobStatus === "queued" || jobStatus === "running" || jobStatus === "analyzing") && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className="admin-btn-ghost text-xs"
                onClick={() => {
                  void cancelScout();
                }}
              >
                Cancel Scout
              </button>
            </div>
          )}
        </div>
      )}
    </GlobalScoutJobContext.Provider>
  );
}

export function useGlobalScoutJob() {
  const ctx = useContext(GlobalScoutJobContext);
  if (!ctx) {
    throw new Error("useGlobalScoutJob must be used within GlobalScoutJobProvider");
  }
  return ctx;
}
