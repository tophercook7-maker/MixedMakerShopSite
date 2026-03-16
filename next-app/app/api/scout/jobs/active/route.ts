import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_TIMEOUT_MS = 10000;

function scoutBaseUrl() {
  return process.env.SCOUT_BRAIN_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
}

function activeJobCandidates(baseUrl: string): string[] {
  if (!baseUrl) return [];
  const out: string[] = [];
  out.push(`${baseUrl}/jobs/active`);
  try {
    const parsed = new URL(baseUrl);
    const originOnly = parsed.origin.replace(/\/+$/, "");
    const originActive = `${originOnly}/jobs/active`;
    if (!out.includes(originActive)) out.push(originActive);
  } catch {
    // Ignore malformed base URL; downstream fetch surfaces error.
  }
  return out;
}

export async function GET(request: Request) {
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
  const requestBearerToken = requestAuth.startsWith("Bearer ")
    ? requestAuth.slice(7).trim()
    : "";
  const accessToken = session?.access_token || requestBearerToken;
  const hasSession = Boolean(session);
  const hasAccessToken = Boolean(accessToken);
  console.info("[Scout Proxy] session found for active job:", hasSession);
  console.info("[Scout Proxy] token found for active job:", hasAccessToken);
  if (!accessToken) {
    return NextResponse.json(
      { error: "No authenticated session found in admin proxy" },
      { status: 401 }
    );
  }

  const workspaceId =
    request.headers.get("x-workspace-id")?.trim() ||
    process.env.SCOUT_BRAIN_WORKSPACE_ID?.trim() ||
    "";

  const headers: HeadersInit = {
    Authorization: `Bearer ${accessToken}`,
  };
  console.info("[Scout Proxy] forwarding Authorization header for active job");
  if (workspaceId) headers["X-Workspace-Id"] = workspaceId;

  try {
    const candidates = activeJobCandidates(baseUrl);
    let body: Record<string, unknown> = { error: "Scout active job request failed." };
    let responseStatus = 502;
    for (const targetUrl of candidates) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
      const response = await fetch(targetUrl, {
        method: "GET",
        headers,
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timer);

      const contentType = response.headers.get("content-type") || "";
      body = contentType.includes("application/json")
        ? (await response.json()) as Record<string, unknown>
        : { error: await response.text() };
      responseStatus = response.status;

      if (!response.ok) {
        if (response.status === 401) {
          return NextResponse.json(
            { error: "Scout authentication failed", detail: body },
            { status: 401 }
          );
        }
        continue;
      }
      return NextResponse.json(body, { status: 200 });
    }
    return NextResponse.json(body, { status: responseStatus >= 400 ? responseStatus : 502 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Scout active job request failed.",
      },
      { status: 502 }
    );
  }
}
