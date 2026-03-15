import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getProfile } from "@/lib/auth";

const DEFAULT_TIMEOUT_MS = 45000;

function scoutBaseUrl() {
  return process.env.SCOUT_BRAIN_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "No authenticated session found in admin proxy" },
      { status: 401 }
    );
  }
  const profile = await getProfile(user.id);
  const role = String(profile?.role || "");
  if (!["owner", "admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
  console.info("[Scout Proxy] session found for outreach test:", hasSession);
  console.info("[Scout Proxy] token found for outreach test:", hasAccessToken);
  console.info("[Scout Proxy] token source for outreach test:", tokenSource);
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
  console.info("[Scout Proxy] forwarding Authorization header for outreach test");
  if (workspaceId) headers["X-Workspace-Id"] = workspaceId;

  console.info("sending test email");
  console.info("[Scout Proxy] next proxy request started");
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    const response = await fetch(`${baseUrl}/outreach/test`, {
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
      console.error("test email failed", body);
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Scout authentication failed", detail: body },
          { status: 401 }
        );
      }
      return NextResponse.json(body, { status: response.status });
    }
    console.info("test email sent");
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    console.error("test email failed", error);
    const aborted =
      (error instanceof Error && error.name === "AbortError") ||
      (error instanceof Error && /aborted/i.test(error.message));
    if (aborted) {
      console.error("[Scout Proxy] proxy request aborted");
      return NextResponse.json(
        {
          error:
            "Proxy request aborted while waiting for Scout-Brain/Resend. Email may have been sent; client request ended before confirmation.",
          layer: "next-proxy",
          aborted: true,
          timeout_ms: DEFAULT_TIMEOUT_MS,
        },
        { status: 504 }
      );
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Test email request failed.",
      },
      { status: 502 }
    );
  }
}
