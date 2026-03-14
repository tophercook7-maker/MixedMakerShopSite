import { createClient } from "@/lib/supabase/server";
import type { ScoutIntegrationResult, ScoutSummary, TopOpportunitiesResponse } from "./types";

const DEFAULT_SCOUT_TIMEOUT_MS = 12000;

function getScoutApiBaseUrl(): string | null {
  const raw = process.env.SCOUT_BRAIN_API_BASE_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}

async function getScoutHeaders(): Promise<HeadersInit | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) return null;

  const headers: HeadersInit = {
    Authorization: `Bearer ${session.access_token}`,
  };

  const workspaceId = process.env.SCOUT_BRAIN_WORKSPACE_ID?.trim();
  if (workspaceId) {
    headers["X-Workspace-Id"] = workspaceId;
  }

  return headers;
}

async function fetchScout<T>(path: string): Promise<ScoutIntegrationResult<T>> {
  const baseUrl = getScoutApiBaseUrl();
  if (!baseUrl) {
    return {
      configured: false,
      data: null,
      error: "Set SCOUT_BRAIN_API_BASE_URL to enable Scout-Brain integration.",
    };
  }

  const headers = await getScoutHeaders();
  if (!headers) {
    return {
      configured: true,
      data: null,
      error: "Missing authenticated Supabase session for Scout request.",
    };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_SCOUT_TIMEOUT_MS);
    const response = await fetch(`${baseUrl}${path}`, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      const body = await response.text();
      return {
        configured: true,
        data: null,
        error: `Scout API ${response.status}: ${body || "Unknown error"}`,
      };
    }

    return {
      configured: true,
      data: (await response.json()) as T,
      error: null,
    };
  } catch (error) {
    return {
      configured: true,
      data: null,
      error: error instanceof Error ? error.message : "Failed to reach Scout API.",
    };
  }
}

export async function getScoutSummary(): Promise<ScoutIntegrationResult<ScoutSummary>> {
  return fetchScout<ScoutSummary>("/scout-summary");
}

export async function getTopOpportunities(): Promise<ScoutIntegrationResult<TopOpportunitiesResponse>> {
  return fetchScout<TopOpportunitiesResponse>("/top-opportunities");
}
