import { NextResponse } from "next/server";
import { auditSite } from "@/lib/audit/site-audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Runs the free website check for real.
 *
 * Rate limited because this makes several outbound requests per call and the
 * endpoint is public. The limiter is per-IP and in-memory, which resets on
 * deploy — a brake on casual abuse, not a security control.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 6;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) {
    Array.from(hits.entries()).forEach(([k, v]) => {
      if (v.every((t: number) => now - t >= WINDOW_MS)) hits.delete(k);
    });
  }
  return recent.length > MAX_PER_WINDOW;
}

/** Refuse anything that isn't a public website — no localhost, no LAN. */
function publicHttpUrl(raw: string): URL | null {
  let candidate = raw.trim();
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
  let u: URL;
  try {
    u = new URL(candidate);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(u.protocol)) return null;
  const h = u.hostname.toLowerCase();
  const blocked =
    h === "localhost" ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    /^\d+\.\d+\.\d+\.\d+$/.test(h) ||
    h === "::1" ||
    !h.includes(".");
  return blocked ? null : u;
}

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json({ error: "Too many checks — give it a minute." }, { status: 429 });
  }

  let body: { url?: string };
  try {
    body = (await request.json()) as { url?: string };
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const url = publicHttpUrl(String(body.url ?? ""));
  if (!url) {
    return NextResponse.json({ error: "That doesn't look like a public website address." }, { status: 400 });
  }

  try {
    const report = await auditSite(url.toString());
    if (!report.ok) {
      return NextResponse.json(
        { error: report.error ?? "Couldn't reach that site.", url: report.url },
        { status: 502 },
      );
    }
    return NextResponse.json(report);
  } catch (err) {
    console.error("[site-audit]", err);
    return NextResponse.json({ error: "The check failed. Try again in a moment." }, { status: 500 });
  }
}
