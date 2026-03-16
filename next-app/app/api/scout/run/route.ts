import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { RunScoutResponse } from "@/lib/scout/types";

const DEFAULT_TIMEOUT_MS = 15000;

function scoutBaseUrl() {
  return process.env.SCOUT_BRAIN_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
}

function runScoutCandidates(baseUrl: string): string[] {
  if (!baseUrl) return [];
  const out: string[] = [];
  if (baseUrl.endsWith("/run-scout")) out.push(baseUrl);
  else out.push(`${baseUrl}/run-scout`);
  try {
    const parsed = new URL(baseUrl);
    const originOnly = parsed.origin.replace(/\/+$/, "");
    const originRun = `${originOnly}/run-scout`;
    if (!out.includes(originRun)) out.push(originRun);
  } catch {
    // Ignore URL parse errors; caller validates via fetch failures.
  }
  return out;
}

function isRootHealthLikePayload(value: unknown): value is { ok?: boolean; service?: string; mode?: string } {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    (typeof row.ok === "boolean" || row.ok === true) &&
    typeof row.service === "string" &&
    typeof row.mode === "string" &&
    !("job_id" in row)
  );
}

export async function POST(request: Request) {
  const baseUrl = scoutBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      { error: "SCOUT_BRAIN_API_BASE_URL is not configured." },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const requestAuth = request.headers.get("authorization") || "";
  const requestBearerToken =
    requestAuth.startsWith("Bearer ") ? requestAuth.slice(7).trim() : "";
  const accessToken = session?.access_token || requestBearerToken;
  const tokenSource = session?.access_token
    ? "session"
    : requestBearerToken
      ? "request-header"
      : "none";
  const hasSession = Boolean(session);
  const hasAccessToken = Boolean(accessToken);
  console.info("[Scout Proxy] session found for run:", hasSession);
  console.info("[Scout Proxy] token found for run:", hasAccessToken);
  console.info("[Scout Proxy] token source for run:", tokenSource);
  if (!accessToken) {
    return NextResponse.json(
      { error: "No authenticated session found in admin proxy" },
      { status: 401 }
    );
  }

  const payload = await request
    .json()
    .catch((): Record<string, unknown> => ({}));

  const workspaceId =
    request.headers.get("x-workspace-id")?.trim() ||
    process.env.SCOUT_BRAIN_WORKSPACE_ID?.trim() ||
    "";

  const headers: HeadersInit = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
  console.info("[Scout Proxy] forwarding Authorization header for run");
  if (workspaceId) headers["X-Workspace-Id"] = workspaceId;

  console.info("[Scout Proxy] scout job started request");

  try {
    const candidates = runScoutCandidates(baseUrl);
    let lastStatus = 502;
    let lastBody: RunScoutResponse & Record<string, unknown> = {
      error: "Scout run endpoint request failed.",
    };
    for (const targetUrl of candidates) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
      const response = await fetch(targetUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timer);

      const contentType = response.headers.get("content-type") || "";
      const body = contentType.includes("application/json")
        ? ((await response.json()) as RunScoutResponse & Record<string, unknown>)
        : ({ error: await response.text() } as RunScoutResponse & Record<string, unknown>);

      if (!response.ok) {
        lastStatus = response.status;
        lastBody = body;
        if (response.status === 401) {
          return NextResponse.json(
            { error: "Scout authentication failed", detail: body },
            { status: 401 }
          );
        }
        continue;
      }

      if (body.job_id) {
        console.info("[Scout Proxy] job id received", body.job_id);
        return NextResponse.json(body, { status: 200 });
      }

      if (isRootHealthLikePayload(body)) {
        lastStatus = 502;
        lastBody = {
          error:
            "Scout proxy hit backend root instead of run endpoint. Check SCOUT_BRAIN_API_BASE_URL and run endpoint routing.",
          detail: body,
          attempted_url: targetUrl,
        };
        continue;
      }

      lastStatus = 502;
      lastBody = {
        error: "Scout backend returned an unexpected run payload (missing job_id).",
        detail: body,
        attempted_url: targetUrl,
      };
    }

    console.error("[Scout Proxy] run failed", lastStatus, lastBody);
    return NextResponse.json(lastBody, { status: lastStatus });
  } catch (error) {
    console.error("[Scout Proxy] run request exception", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Scout backend request failed.",
      },
      { status: 502 }
    );
  }
}
