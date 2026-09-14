"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Cloud, CloudDrizzle, CloudFog, CloudHail, CloudLightning, CloudMoon, CloudRain,
  CloudSnow, CloudSun, Compass, Crosshair, Droplets, Eye, Gauge, Loader2, MapPin,
  Moon, RefreshCw, Search, Sun, Sunrise, Sunset, Thermometer, TriangleAlert, Wind, X,
} from "lucide-react";

/* ---------- units ---------- */
const c2f = (c: number) => (c * 9) / 5 + 32;
const kmh2mph = (k: number) => k * 0.621371;
const km2mi = (k: number) => k * 0.621371;

const DIRS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
const dir = (deg: number) => DIRS[Math.round((deg % 360) / 22.5) % 16];

/* ---------- condition -> label + icon ---------- */
type IconT = typeof Sun;
const COND: Record<string, [string, IconT]> = {
  Clear: ["Clear", Sun], MostlyClear: ["Mostly clear", Sun],
  PartlyCloudy: ["Partly cloudy", CloudSun], MostlyCloudy: ["Mostly cloudy", Cloud],
  Cloudy: ["Cloudy", Cloud], Haze: ["Haze", CloudFog], Foggy: ["Fog", CloudFog],
  Smoky: ["Smoke", CloudFog], Breezy: ["Breezy", Wind], Windy: ["Windy", Wind],
  Drizzle: ["Drizzle", CloudDrizzle], Rain: ["Rain", CloudRain],
  HeavyRain: ["Heavy rain", CloudRain], Showers: ["Showers", CloudRain],
  Thunderstorms: ["Thunderstorms", CloudLightning],
  IsolatedThunderstorms: ["Isolated storms", CloudLightning],
  ScatteredThunderstorms: ["Scattered storms", CloudLightning],
  StrongStorms: ["Strong storms", CloudLightning],
  Snow: ["Snow", CloudSnow], HeavySnow: ["Heavy snow", CloudSnow],
  Flurries: ["Flurries", CloudSnow], Sleet: ["Sleet", CloudHail],
  FreezingRain: ["Freezing rain", CloudHail], FreezingDrizzle: ["Freezing drizzle", CloudHail],
  Hail: ["Hail", CloudHail], Hot: ["Hot", Sun], Frigid: ["Frigid", CloudSnow],
  Blizzard: ["Blizzard", CloudSnow],
};
/** WeatherKit reports "Clear" day or night, so swap in moon icons after dark. */
const NIGHT: Record<string, IconT> = {
  Clear: Moon, MostlyClear: CloudMoon, PartlyCloudy: CloudMoon, Hot: Moon,
};
const cond = (code?: string, daylight?: boolean): [string, IconT] => {
  const [label, icon] = (code && COND[code]) || [code ?? "Unknown", Cloud];
  if (daylight === false && code && NIGHT[code]) return [label, NIGHT[code]];
  return [label, icon];
};

const MOON: Record<string, string> = {
  new: "New moon", waxingCrescent: "Waxing crescent", firstQuarter: "First quarter",
  waxingGibbous: "Waxing gibbous", full: "Full moon", waningGibbous: "Waning gibbous",
  thirdQuarter: "Third quarter", waningCrescent: "Waning crescent",
};

/* ---------- types ---------- */
type Place = { label: string; lat: number; lon: number; tz: string; country?: string };
type Current = {
  temperature: number; temperatureApparent: number; temperatureDewPoint: number;
  humidity: number; pressure: number; pressureTrend?: string; conditionCode: string;
  cloudCover: number; uvIndex: number; visibility: number;
  windSpeed: number; windGust?: number; windDirection: number; daylight?: boolean;
};
type Hour = {
  forecastStart: string; temperature: number; conditionCode: string;
  precipitationChance: number; daylight?: boolean;
};
type Day = {
  forecastStart: string; conditionCode: string; temperatureMax: number; temperatureMin: number;
  precipitationChance: number; precipitationAmount?: number;
  sunrise?: string; sunset?: string; moonPhase?: string;
};
type Alert = { description?: string; severity?: string };
type Payload = {
  currentWeather?: Current;
  forecastHourly?: { hours: Hour[] };
  forecastDaily?: { days: Day[] };
  forecastNextHour?: { minutes?: { precipitationChance: number }[] };
  weatherAlerts?: { alerts?: Alert[] };
  place?: Place; cached?: boolean; error?: string; detail?: string;
};

const DEFAULT_PLACE: Place = {
  label: "Hot Springs, Arkansas", lat: 34.5037, lon: -93.0552,
  tz: "America/Chicago", country: "US",
};
const LS_LAST = "wx.last";
const LS_RECENT = "wx.recent";

/** localStorage can throw outright (private mode, blocked site data) - never let it break render. */
function lsGet<T>(key: string, fallback: T): T {
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}
function lsSet(key: string, value: unknown) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

/** An invalid IANA zone makes toLocaleTimeString throw, so fall back rather than crash. */
function fmtTime(iso: string, tz: string) {
  try {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", timeZone: tz });
  } catch {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric" });
  }
}
function fmtDay(iso: string, tz: string) {
  try {
    return new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: tz });
  } catch {
    return new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short" });
  }
}

/* ---------- pieces ---------- */
function Stat({ icon: Icon, label, value, sub }: { icon: IconT; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[#f28c1b]/20 bg-[#123f24]/60 p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#f7ead2]/55">
        <Icon className="h-3.5 w-3.5 text-[#f28c1b]" aria-hidden />
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-semibold text-[#f7ead2]">{value}</div>
      {sub && <div className="text-xs text-[#f7ead2]/50">{sub}</div>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-44 rounded-2xl bg-[#123f24]/60" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-[#123f24]/50" />)}
      </div>
      <div className="h-56 rounded-2xl bg-[#123f24]/60" />
    </div>
  );
}

/* ---------- location picker ---------- */
function LocationBar({ place, onPick }: { place: Place; onPick: (p: Place) => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [recent, setRecent] = useState<Place[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Seed with the default place, otherwise the home location is unreachable
    // without retyping it - it is never "chosen", so it never lands in recents.
    const stored = lsGet<Place[]>(LS_RECENT, []);
    const has = stored.some((r) => r.lat === DEFAULT_PLACE.lat && r.lon === DEFAULT_PLACE.lon);
    setRecent(has ? stored : [...stored, DEFAULT_PLACE].slice(0, 6));
  }, []);

  // Debounced so typing a city name is one lookup, not one per keystroke.
  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        const r = await fetch(`/api/geocode?q=${encodeURIComponent(q.trim())}`);
        const j = await r.json();
        setHits(j.results ?? []);
        setOpen(true);
      } catch { setHits([]); }
      finally { setBusy(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const away = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  const choose = (p: Place) => {
    onPick(p);
    setQ(""); setHits([]); setOpen(false); setNote(null);
    const rest = recent.filter((r) => r.lat !== p.lat || r.lon !== p.lon);
    const isDefault = p.lat === DEFAULT_PLACE.lat && p.lon === DEFAULT_PLACE.lon;
    const hasDefault = isDefault || rest.some((r) => r.lat === DEFAULT_PLACE.lat && r.lon === DEFAULT_PLACE.lon);
    const next = [p, ...rest].slice(0, 5);
    if (!hasDefault) next.push(DEFAULT_PLACE);
    setRecent(next);
    lsSet(LS_RECENT, next);
  };

  const locate = () => {
    if (!("geolocation" in navigator)) { setNote("This browser can't share a location."); return; }
    setLocating(true); setNote(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        let tz = "UTC";
        try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch { /* keep UTC */ }
        choose({
          label: "Current location",
          lat: Number(pos.coords.latitude.toFixed(4)),
          lon: Number(pos.coords.longitude.toFixed(4)),
          tz,
        });
      },
      (err) => {
        setLocating(false);
        setNote(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied — search for a place instead."
            : "Couldn't get your location — search for a place instead.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div ref={boxRef} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f7ead2]/40" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => hits.length && setOpen(true)}
            placeholder="Search any city, town or ZIP…"
            aria-label="Search for a location"
            className="w-full rounded-xl border border-[#f28c1b]/25 bg-[#123f24]/70 py-2.5 pl-9 pr-9 text-[#f7ead2] placeholder-[#f7ead2]/35 outline-none focus:border-[#f28c1b]/60"
          />
          {busy && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#f28c1b]" aria-hidden />}
          {!busy && q && (
            <button onClick={() => { setQ(""); setOpen(false); }} aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f7ead2]/40 hover:text-[#f7ead2]">
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
          {open && hits.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-[#f28c1b]/25 bg-[#0b2f1a] shadow-xl">
              {hits.map((h, i) => (
                <li key={`${h.lat},${h.lon},${i}`}>
                  <button onClick={() => choose(h)}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#f7ead2] hover:bg-[#164b2b]">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#f28c1b]" aria-hidden />
                    <span className="truncate">{h.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {open && !busy && q.trim().length >= 2 && hits.length === 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-[#f28c1b]/25 bg-[#0b2f1a] px-3 py-2.5 text-sm text-[#f7ead2]/55">
              No places found for “{q.trim()}”.
            </div>
          )}
        </div>

        <button onClick={locate} disabled={locating}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#f28c1b]/30 px-4 py-2.5 text-sm font-medium text-[#f7ead2] transition hover:border-[#f28c1b] hover:text-[#f28c1b] disabled:opacity-50">
          {locating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Crosshair className="h-4 w-4" aria-hidden />}
          {locating ? "Locating…" : "Use my location"}
        </button>
      </div>

      {note && <p className="text-sm text-amber-300/90">{note}</p>}

      {recent.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recent.map((r, i) => {
            const active = r.lat === place.lat && r.lon === place.lon;
            return (
              <button key={`${r.lat},${r.lon},${i}`} onClick={() => onPick(r)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  active
                    ? "border-[#f28c1b] bg-[#f28c1b]/15 text-[#f28c1b]"
                    : "border-[#f28c1b]/20 text-[#f7ead2]/65 hover:border-[#f28c1b]/50 hover:text-[#f7ead2]"
                }`}>
                {r.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- main ---------- */
export function WeatherStation() {
  const [place, setPlace] = useState<Place>(DEFAULT_PLACE);
  const [data, setData] = useState<Payload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [updated, setUpdated] = useState<Date | null>(null);

  useEffect(() => { setPlace(lsGet<Place>(LS_LAST, DEFAULT_PLACE)); }, []);

  const load = useCallback(async (p: Place) => {
    setBusy(true);
    try {
      const qs = new URLSearchParams({
        lat: String(p.lat), lon: String(p.lon), tz: p.tz,
        country: p.country ?? "US", label: p.label,
      });
      const r = await fetch(`/api/weather?${qs}`);
      const j: Payload = await r.json();
      if (!r.ok || j.error) {
        setErr(j.detail ? `${j.error} — ${j.detail}` : j.error ?? `HTTP ${r.status}`);
      } else {
        setData(j); setErr(null); setUpdated(new Date());
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "network error");
    } finally { setBusy(false); }
  }, []);

  useEffect(() => {
    load(place);
    lsSet(LS_LAST, place);
    const t = setInterval(() => load(place), 10 * 60 * 1000);
    return () => clearInterval(t);
  }, [place, load]);

  const pick = useCallback((p: Place) => { setData(null); setErr(null); setPlace(p); }, []);

  const cur = data?.currentWeather;
  const days = useMemo(() => data?.forecastDaily?.days ?? [], [data]);
  const scale = useMemo(() => {
    if (!days.length) return { lo: 0, span: 1 };
    const lo = Math.min(...days.map((d) => c2f(d.temperatureMin)));
    const hi = Math.max(...days.map((d) => c2f(d.temperatureMax)));
    return { lo, span: Math.max(hi - lo, 1) };
  }, [days]);

  const tz = data?.place?.tz ?? place.tz;

  return (
    <div className="space-y-6">
      <LocationBar place={place} onPick={pick} />

      {err ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-[#f7ead2]">
          <div className="flex items-center gap-2 font-semibold">
            <TriangleAlert className="h-5 w-5 text-red-300" aria-hidden />
            Weather station offline
          </div>
          <p className="mt-2 font-mono text-sm text-[#f7ead2]/70">{err}</p>
          <button onClick={() => load(place)}
            className="mt-4 rounded-lg bg-[#f28c1b] px-4 py-2 text-sm font-semibold text-[#0b2f1a] hover:bg-[#ffb347]">
            Try again
          </button>
        </div>
      ) : !cur ? (
        <Skeleton />
      ) : (
        <>
          {(data?.weatherAlerts?.alerts ?? []).map((a, i) => (
            <div key={i} className="rounded-xl border border-amber-400/40 bg-amber-500/15 p-4">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-200">
                <TriangleAlert className="h-4 w-4" aria-hidden />
                {a.severity ?? "Alert"}
              </div>
              <p className="mt-1 text-[#f7ead2]">{a.description}</p>
            </div>
          ))}

          {(() => {
            const [label, Icon] = cond(cur.conditionCode, cur.daylight);
            const today = days[0];
            return (
              <div className="rounded-2xl border border-[#f28c1b]/25 bg-gradient-to-br from-[#164b2b] to-[#0b2f1a] p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-2 text-sm text-[#f7ead2]/65">
                    <MapPin className="h-4 w-4 shrink-0 text-[#f28c1b]" aria-hidden />
                    <span className="truncate">{data?.place?.label || place.label}</span>
                  </div>
                  <button onClick={() => load(place)} disabled={busy} aria-label="Refresh weather"
                    className="shrink-0 rounded-lg border border-[#f28c1b]/30 p-2 text-[#f7ead2]/70 transition hover:text-[#f28c1b] disabled:opacity-40">
                    <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} aria-hidden />
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4">
                  <Icon className="h-20 w-20 shrink-0 text-[#f28c1b]" aria-hidden />
                  <div>
                    <div className="text-7xl font-bold leading-none tracking-tight text-[#f7ead2]">
                      {Math.round(c2f(cur.temperature))}°
                    </div>
                    <div className="mt-2 text-xl text-[#f7ead2]/85">{label}</div>
                    <div className="text-sm text-[#f7ead2]/55">
                      Feels like {Math.round(c2f(cur.temperatureApparent))}°
                      {today && ` · High ${Math.round(c2f(today.temperatureMax))}° · Low ${Math.round(c2f(today.temperatureMin))}°`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {(() => {
            const minutes = data?.forecastNextHour?.minutes ?? [];
            if (!minutes.some((m) => m.precipitationChance > 0.01)) return null;
            return (
              <div className="rounded-2xl border border-[#f28c1b]/25 bg-[#123f24]/60 p-5">
                <h2 className="text-xs uppercase tracking-wider text-[#f7ead2]/55">Next hour, minute by minute</h2>
                <div className="mt-3 flex h-16 items-end gap-px" aria-hidden>
                  {minutes.slice(0, 60).map((m, i) => (
                    <div key={i} className="flex-1 rounded-t-sm bg-[#f28c1b]"
                      style={{ height: `${Math.max(m.precipitationChance * 100, 2)}%`, opacity: 0.35 + m.precipitationChance * 0.65 }} />
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] text-[#f7ead2]/45">
                  <span>now</span><span>30 min</span><span>60 min</span>
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={Wind} label="Wind" value={`${Math.round(kmh2mph(cur.windSpeed))} mph`}
              sub={`${dir(cur.windDirection)}${cur.windGust ? ` · gust ${Math.round(kmh2mph(cur.windGust))}` : ""}`} />
            <Stat icon={Droplets} label="Humidity" value={`${Math.round(cur.humidity * 100)}%`}
              sub={`Dew pt ${Math.round(c2f(cur.temperatureDewPoint))}°`} />
            <Stat icon={Sun} label="UV index" value={`${cur.uvIndex}`}
              sub={cur.uvIndex >= 8 ? "Very high" : cur.uvIndex >= 6 ? "High" : cur.uvIndex >= 3 ? "Moderate" : "Low"} />
            <Stat icon={Gauge} label="Pressure" value={`${(cur.pressure * 0.02953).toFixed(2)} in`} sub={cur.pressureTrend ?? undefined} />
            <Stat icon={Eye} label="Visibility" value={`${Math.round(km2mi(cur.visibility / 1000))} mi`} />
            <Stat icon={Cloud} label="Cloud cover" value={`${Math.round(cur.cloudCover * 100)}%`} />
            <Stat icon={Thermometer} label="Today"
              value={days[0] ? `${Math.round(c2f(days[0].temperatureMax))}° / ${Math.round(c2f(days[0].temperatureMin))}°` : "—"}
              sub={days[0] ? `${Math.round(days[0].precipitationChance * 100)}% rain` : undefined} />
            <Stat icon={Compass} label="Direction" value={dir(cur.windDirection)} sub={`${Math.round(cur.windDirection)}°`} />
          </div>

          <div className="rounded-2xl border border-[#f28c1b]/25 bg-[#123f24]/60 p-5">
            <h2 className="text-xs uppercase tracking-wider text-[#f7ead2]/55">Next 24 hours</h2>
            <div className="wx-scroll mt-3 flex gap-5 overflow-x-auto pb-2">
              {(data?.forecastHourly?.hours ?? []).slice(0, 24).map((h) => {
                const [hl, HI] = cond(h.conditionCode, h.daylight);
                return (
                  <div key={h.forecastStart} className="flex min-w-[62px] flex-col items-center gap-1.5" title={hl}>
                    <span className="text-[11px] text-[#f7ead2]/55">{fmtTime(h.forecastStart, tz)}</span>
                    <HI className="h-5 w-5 text-[#f28c1b]" aria-hidden />
                    <span className="font-semibold text-[#f7ead2]">{Math.round(c2f(h.temperature))}°</span>
                    <span className={`text-[11px] ${h.precipitationChance > 0.25 ? "text-[#ffb347]" : "text-[#f7ead2]/35"}`}>
                      {Math.round(h.precipitationChance * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#f28c1b]/25 bg-[#123f24]/60 p-5">
            <h2 className="text-xs uppercase tracking-wider text-[#f7ead2]/55">10-day forecast</h2>
            <div className="mt-3 divide-y divide-[#f28c1b]/10">
              {days.map((d, i) => {
                const [dl, DI] = cond(d.conditionCode);
                const dmin = c2f(d.temperatureMin);
                const dmax = c2f(d.temperatureMax);
                return (
                  <div key={d.forecastStart} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="w-11 shrink-0 font-medium text-[#f7ead2]/85">
                      {i === 0 ? "Today" : fmtDay(d.forecastStart, tz)}
                    </span>
                    <DI className="h-5 w-5 shrink-0 text-[#f28c1b]" aria-hidden />
                    <span className="w-10 shrink-0 text-right text-[11px] text-[#f7ead2]/45">
                      {d.precipitationChance > 0.05 ? `${Math.round(d.precipitationChance * 100)}%` : ""}
                    </span>
                    <span className="w-9 shrink-0 text-right text-[#f7ead2]/50">{Math.round(dmin)}°</span>
                    <div className="relative h-1.5 flex-1 rounded-full bg-[#0b2f1a]">
                      <div className="absolute h-1.5 rounded-full bg-gradient-to-r from-[#f28c1b]/60 to-[#ffb347]"
                        style={{ left: `${((dmin - scale.lo) / scale.span) * 100}%`, width: `${Math.max(((dmax - dmin) / scale.span) * 100, 4)}%` }} />
                    </div>
                    <span className="w-9 shrink-0 font-semibold text-[#f7ead2]">{Math.round(dmax)}°</span>
                    <span className="hidden w-36 shrink-0 truncate text-right text-[#f7ead2]/45 sm:block">{dl}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {days[0] && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {days[0].sunrise && <Stat icon={Sunrise} label="Sunrise" value={fmtTime(days[0].sunrise, tz)} />}
              {days[0].sunset && <Stat icon={Sunset} label="Sunset" value={fmtTime(days[0].sunset, tz)} />}
              {days[0].moonPhase && <Stat icon={Moon} label="Moon" value={MOON[days[0].moonPhase] ?? days[0].moonPhase} />}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-[#f7ead2]/40">
            <span>
              {updated && `Updated ${updated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}
              {data?.cached && " · cached"}
              {tz && ` · times in ${tz.split("/").pop()?.replace(/_/g, " ")}`}
            </span>
            <a href="https://weatherkit.apple.com/legal-attribution.html" target="_blank" rel="noopener noreferrer" className="hover:text-[#f28c1b]">
              Weather data provided by  Weather
            </a>
          </div>
        </>
      )}
    </div>
  );
}
