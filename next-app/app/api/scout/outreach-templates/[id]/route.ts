import { NextResponse } from "next/server";

function scoutBaseUrl() {
  return process.env.SCOUT_BRAIN_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
}

function enrichHeaders(): HeadersInit {
  const k =
    process.env.SCOUT_ENRICH_API_KEY?.trim() || process.env.SCOUT_BRAIN_API_KEY?.trim() || "";
  const h: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (k) h["X-Scout-Enrich-Key"] = k;
  return h;
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const base = scoutBaseUrl();
  if (!base) {
    return NextResponse.json({ error: "SCOUT_BRAIN_API_BASE_URL is not configured." }, { status: 500 });
  }
  const { id } = await ctx.params;
  const tid = String(id || "").trim();
  if (!tid) {
    return NextResponse.json({ error: "Missing template id" }, { status: 400 });
  }
  const bodyText = await request.text();
  const res = await fetch(`${base}/api/outreach-templates/${encodeURIComponent(tid)}`, {
    method: "PATCH",
    headers: enrichHeaders(),
    body: bodyText || "{}",
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
