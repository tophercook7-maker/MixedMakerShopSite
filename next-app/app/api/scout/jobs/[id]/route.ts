import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ScoutJobStatusResponse } from "@/lib/scout/types";
import { createCalendarEvent, resolveWorkspaceIdForOwner } from "@/lib/calendar-events";

const DEFAULT_TIMEOUT_MS = 10000;

function scoutBaseUrl() {
  return process.env.SCOUT_BRAIN_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
}

function pollJobCandidates(baseUrl: string, jobId: string): string[] {
  if (!baseUrl) return [];
  const safeId = encodeURIComponent(jobId);
  const out: string[] = [];
  out.push(`${baseUrl}/job/${safeId}`);
  try {
    const parsed = new URL(baseUrl);
    const originOnly = parsed.origin.replace(/\/+$/, "");
    const originPoll = `${originOnly}/job/${safeId}`;
    if (!out.includes(originPoll)) out.push(originPoll);
  } catch {
    // Ignore malformed base URL; downstream fetch will surface errors.
  }
  return out;
}

function isScoutJobStatusResponse(
  body: ScoutJobStatusResponse | { error: string }
): body is ScoutJobStatusResponse {
  return "status" in body && "progress" in body;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
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
  console.info("[Scout Proxy] session found for polling:", hasSession);
  console.info("[Scout Proxy] token found for polling:", hasAccessToken);
  console.info("[Scout Proxy] token source for polling:", tokenSource);
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
  console.info("[Scout Proxy] forwarding Authorization header for polling");
  if (workspaceId) headers["X-Workspace-Id"] = workspaceId;

  try {
    const candidates = pollJobCandidates(baseUrl, id);
    let body: ScoutJobStatusResponse | { error: string } = {
      error: "Scout polling failed.",
    };
    let responseStatus = 502;
    let success = false;
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
        ? ((await response.json()) as ScoutJobStatusResponse | { error: string })
        : ({ error: await response.text() } as { error: string });
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
      if (!isScoutJobStatusResponse(body)) {
        continue;
      }
      success = true;
      break;
    }

    if (!success) {
      console.error("[Scout Proxy] poll failed", id, responseStatus, body);
      if (isScoutJobStatusResponse(body)) {
        return NextResponse.json(body, { status: 200 });
      }
      return NextResponse.json(
        { error: body.error || "Invalid polling response from Scout backend." },
        { status: responseStatus >= 400 ? responseStatus : 502 }
      );
    }

    const statusBody = body as ScoutJobStatusResponse;
    console.info("[Scout Proxy] polling update", id, statusBody.status, statusBody.progress);

    let refreshTriggered = false;
    if (statusBody.status === "finished" && !statusBody.error) {
      revalidatePath("/admin");
      revalidatePath("/admin/scout");
      revalidatePath("/admin/leads");
      refreshTriggered = true;
      console.info("[Scout Proxy] polling finished, data refresh triggered", id);

      const ownerId = String(session?.user?.id || "").trim();
      if (ownerId) {
        const notesKey = `scout_job_id:${id}`;
        const { data: existing } = await supabase
          .from("calendar_events")
          .select("id")
          .eq("owner_id", ownerId)
          .eq("event_type", "scout")
          .eq("notes", notesKey)
          .limit(1);
        if (!((existing || []).length > 0)) {
          try {
            const workspaceForEvent = await resolveWorkspaceIdForOwner(ownerId);
            const startTime = String(statusBody.finished_at || new Date().toISOString());
            await createCalendarEvent({
              ownerId,
              workspaceId: workspaceForEvent,
              title: "Scout run completed",
              eventType: "scout",
              startTime,
              endTime: null,
              notes: notesKey,
            });
          } catch (calendarError) {
            console.warn("[Scout Proxy] scout completion event creation failed", calendarError);
          }
        }
      }
    } else if (statusBody.status === "failed") {
      console.info("[Scout Proxy] polling finished with failure", id);
    }

    return NextResponse.json({ ...statusBody, refreshTriggered }, { status: 200 });
  } catch (error) {
    console.error("[Scout Proxy] poll request exception", id, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Scout polling request failed.",
      },
      { status: 502 }
    );
  }
}
