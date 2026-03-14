import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ScoutJobStatusResponse } from "@/lib/scout/types";

const DEFAULT_TIMEOUT_MS = 10000;

function scoutBaseUrl() {
  return process.env.SCOUT_BRAIN_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
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
  if (!session?.access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaceId =
    request.headers.get("x-workspace-id")?.trim() ||
    process.env.SCOUT_BRAIN_WORKSPACE_ID?.trim() ||
    "";

  const headers: HeadersInit = {
    Authorization: `Bearer ${session.access_token}`,
  };
  if (workspaceId) headers["X-Workspace-Id"] = workspaceId;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    const response = await fetch(`${baseUrl}/job/${encodeURIComponent(id)}`, {
      method: "GET",
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? ((await response.json()) as ScoutJobStatusResponse)
      : ({ error: await response.text() } as { error: string });

    if (!response.ok) {
      console.error("[Scout Proxy] poll failed", id, response.status, body);
      return NextResponse.json(body, { status: response.status });
    }

    console.info(
      "[Scout Proxy] polling update",
      id,
      body.status,
      body.progress
    );

    let refreshTriggered = false;
    if (body.status === "finished" && !body.error) {
      revalidatePath("/admin");
      revalidatePath("/admin/scout");
      revalidatePath("/admin/leads");
      refreshTriggered = true;
      console.info("[Scout Proxy] polling finished, data refresh triggered", id);
    } else if (body.status === "failed") {
      console.info("[Scout Proxy] polling finished with failure", id);
    }

    return NextResponse.json({ ...body, refreshTriggered }, { status: 200 });
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
