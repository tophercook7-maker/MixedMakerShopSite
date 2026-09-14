import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { NextResponse } from "next/server";
import { bumpDaily, checkRate } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Apple WeatherKit proxy.
 *
 * The .p8 signing key must NEVER reach the browser, so the JWT is minted here
 * and only the resulting weather JSON is returned.
 *
 * This endpoint accepts any coordinate, which means a public URL could in
 * principle be walked to burn the 500k-calls/month allowance. Three guards:
 * coordinates are rounded to 2dp (~1.1km) so nearby requests share a cache
 * entry, each IP is throttled, and a global daily cap hard-stops well before
 * the monthly allowance is at risk.
 */
const TTL_MS = 10 * 60 * 1000;
const MAX_CACHE = 500;
const DAILY_CAP = 3000; // monthly allowance is ~16k/day; this is a deep safety margin

const cache = new Map<string, { at: number; data: unknown }>();

const DATASETS = [
  "currentWeather",
  "forecastDaily",
  "forecastHourly",
  "forecastNextHour",
  "weatherAlerts",
].join(",");

/** ES256 JWT. Node's EC signer emits DER by default; WeatherKit needs raw r||s. */
function makeToken(): string {
  const teamId = process.env.WEATHERKIT_TEAM_ID;
  const serviceId = process.env.WEATHERKIT_SERVICE_ID;
  const keyId = process.env.WEATHERKIT_KEY_ID;
  const keyPath = process.env.WEATHERKIT_KEY_PATH;

  if (!teamId || !serviceId || !keyId || !keyPath) {
    throw new Error("WeatherKit env missing - set WEATHERKIT_TEAM_ID, _SERVICE_ID, _KEY_ID, _KEY_PATH");
  }

  const privateKey = readFileSync(keyPath.replace(/^~/, process.env.HOME ?? ""), "utf8");
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object) =>
    Buffer.from(JSON.stringify(o)).toString("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  // `id` in the HEADER must be TeamID.ServiceID - the WeatherKit-specific quirk.
  const header = b64({ alg: "ES256", kid: keyId, id: `${teamId}.${serviceId}`, typ: "JWT" });
  const payload = b64({ iss: teamId, iat: now, exp: now + 3600, sub: serviceId });
  const signingInput = `${header}.${payload}`;

  const sig = crypto
    .sign("sha256", Buffer.from(signingInput), { key: privateKey, dsaEncoding: "ieee-p1363" })
    .toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return `${signingInput}.${sig}`;
}

/** IANA zone names only - this value is forwarded upstream, so validate it. */
const TZ_RE = /^[A-Za-z]+(?:[_+-][A-Za-z0-9]+)*(?:\/[A-Za-z0-9]+(?:[_+-][A-Za-z0-9]+)*){0,2}$/;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sp = url.searchParams;

  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  const gate = checkRate(`wx:${ip}`, 30, 10 * 60_000);
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(gate.retryAfter) } },
    );
  }

  // Default to Hot Springs so a bare /api/weather still works.
  const latRaw = Number(sp.get("lat") ?? 34.5037);
  const lonRaw = Number(sp.get("lon") ?? -93.0552);
  if (!Number.isFinite(latRaw) || !Number.isFinite(lonRaw) ||
      latRaw < -90 || latRaw > 90 || lonRaw < -180 || lonRaw > 180) {
    return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });
  }
  const lat = Number(latRaw.toFixed(2));
  const lon = Number(lonRaw.toFixed(2));

  const tzRaw = (sp.get("tz") ?? "America/Chicago").slice(0, 64);
  const tz = TZ_RE.test(tzRaw) ? tzRaw : "America/Chicago";
  const country = (sp.get("country") ?? "US").slice(0, 2).toUpperCase();
  const label = (sp.get("label") ?? "").slice(0, 80);

  const key = `${lat},${lon},${tz}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return NextResponse.json({ ...(hit.data as object), place: { label, lat, lon, tz }, cached: true });
  }

  const budget = bumpDaily("weatherkit", DAILY_CAP);
  if (!budget.ok) {
    return NextResponse.json(
      { error: "Daily weather lookup limit reached. Cached locations still work." },
      { status: 429 },
    );
  }

  let token: string;
  try {
    token = makeToken();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "token error" }, { status: 500 });
  }

  const qs = new URLSearchParams({ dataSets: DATASETS, timezone: tz, countryCode: country });
  const wkUrl = `https://weatherkit.apple.com/api/v1/weather/en/${lat}/${lon}?${qs}`;

  try {
    const res = await fetch(wkUrl, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json(
        { error: `WeatherKit ${res.status}`, detail: body.slice(0, 300) },
        { status: res.status === 401 ? 500 : res.status },
      );
    }
    const data = await res.json();

    if (cache.size >= MAX_CACHE) {
      const oldest = Array.from(cache.entries()).sort((a, b) => a[1].at - b[1].at)[0];
      if (oldest) cache.delete(oldest[0]);
    }
    cache.set(key, { at: Date.now(), data });

    return NextResponse.json({ ...data, place: { label, lat, lon, tz }, cached: false });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "fetch failed" }, { status: 502 });
  }
}
