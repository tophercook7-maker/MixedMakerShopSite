import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_TIMEOUT_MS = 45000;

function scoutBaseUrl() {
  return process.env.SCOUT_BRAIN_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
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
  console.info("[Scout Proxy] session found for intake backfill:", Boolean(session));
  console.info("[Scout Proxy] token found for intake backfill:", Boolean(accessToken));
  console.info("[Scout Proxy] token source for intake backfill:", tokenSource);
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
  console.info("[Scout Proxy] forwarding Authorization header for intake backfill");
  if (workspaceId) headers["X-Workspace-Id"] = workspaceId;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    const response = await fetch(`${baseUrl}/crm/intake/backfill`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(timer));

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : { error: await response.text() };

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Scout authentication failed", detail: body },
          { status: 401 }
        );
      }
      return NextResponse.json(body, { status: response.status });
    }
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Scout intake backfill request failed.",
      },
      { status: 502 }
    );
  }
}
