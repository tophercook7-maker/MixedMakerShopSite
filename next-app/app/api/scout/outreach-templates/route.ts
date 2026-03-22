import { NextResponse } from "next/server";

function scoutBaseUrl() {
  return process.env.SCOUT_BRAIN_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
}

function enrichHeaders(contentTypeJson?: boolean): HeadersInit {
  const k =
    process.env.SCOUT_ENRICH_API_KEY?.trim() || process.env.SCOUT_BRAIN_API_KEY?.trim() || "";
  const h: Record<string, string> = { Accept: "application/json" };
  if (k) h["X-Scout-Enrich-Key"] = k;
  if (contentTypeJson) h["Content-Type"] = "application/json";
  return h;
}

export async function GET() {
  const base = scoutBaseUrl();
  if (!base) {
    return NextResponse.json({ error: "SCOUT_BRAIN_API_BASE_URL is not configured." }, { status: 500 });
  }
  const res = await fetch(`${base}/api/outreach-templates`, { headers: enrichHeaders(), cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: Request) {
  const base = scoutBaseUrl();
  if (!base) {
    return NextResponse.json({ error: "SCOUT_BRAIN_API_BASE_URL is not configured." }, { status: 500 });
  }
  const bodyText = await request.text();
  const res = await fetch(`${base}/api/outreach-templates`, {
    method: "POST",
    headers: enrichHeaders(true),
    body: bodyText || "{}",
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
