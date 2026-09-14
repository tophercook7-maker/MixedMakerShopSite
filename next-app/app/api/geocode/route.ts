import { NextResponse } from "next/server";
import { checkRate } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Place-name lookup for the weather station.
 *
 * Apple does not geocode, so this proxies Open-Meteo's free geocoding API
 * (no key, no attribution requirement). Results are cached hard because place
 * names do not move, which keeps repeat typing off the upstream entirely.
 */
type Hit = {
  name: string;
  admin1?: string;
  country_code?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

const TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; data: unknown }>();

export async function GET(request: Request) {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  const gate = checkRate(`geo:${ip}`, 40, 60_000);
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Too many searches. Try again in a moment." },
      { status: 429, headers: { "Retry-After": String(gate.retryAfter) } },
    );
  }

  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2 || q.length > 100) {
    return NextResponse.json({ results: [] });
  }

  const key = q.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return NextResponse.json({ results: hit.data, cached: true });
  }

  try {
    const url =
      "https://geocoding-api.open-meteo.com/v1/search?count=6&language=en&format=json&name=" +
      encodeURIComponent(q);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ results: [], error: `geocoder ${res.status}` });
    }
    const raw = (await res.json()) as { results?: Hit[] };

    const results = (raw.results ?? []).map((r) => ({
      label: [r.name, r.admin1, r.country_code === "US" ? undefined : r.country]
        .filter(Boolean)
        .join(", "),
      lat: Number(r.latitude.toFixed(4)),
      lon: Number(r.longitude.toFixed(4)),
      tz: r.timezone ?? "UTC",
      country: r.country_code ?? "US",
    }));

    cache.set(key, { at: Date.now(), data: results });
    return NextResponse.json({ results, cached: false });
  } catch (e) {
    return NextResponse.json(
      { results: [], error: e instanceof Error ? e.message : "lookup failed" },
      { status: 502 },
    );
  }
}
