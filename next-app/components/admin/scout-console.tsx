"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Crosshair, ExternalLink, RefreshCw } from "lucide-react";
import type { ScoutLead, ScoutScanSettings, ScoutSummary } from "@/lib/scout/types";
import { useGlobalScoutJob } from "@/components/admin/scout-job-provider";
import { LeadBucketBadge } from "@/components/admin/lead-bucket-badge";

type Props = {
  integrationReady: boolean;
  initialSummary: ScoutSummary | null;
  initialTopLeads: ScoutLead[];
  initialError: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "No run recorded";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

const SCAN_CITIES = [
  "Hot Springs",
  "Benton",
  "Bryant",
  "Malvern",
  "Little Rock",
  "Conway",
  "Fayetteville",
  "Fort Smith",
  "Springdale",
  "Rogers",
  "Jonesboro",
  "Texarkana",
];

const SCAN_REGIONS = [
  { label: "Central Arkansas", value: "central" },
  { label: "Northwest Arkansas", value: "northwest" },
  { label: "River Valley", value: "river_valley" },
  { label: "Delta", value: "delta" },
  { label: "South Arkansas", value: "south" },
  { label: "Ouachita", value: "ouachita" },
];

const CATEGORY_OPTIONS = [
  "plumber",
  "roofer",
  "HVAC",
  "electrician",
  "landscaping",
  "cleaning service",
  "pressure washing",
  "auto repair",
  "church",
  "restaurant",
  "cafe",
  "small church",
  "small restaurant",
];

const ISSUE_FILTER_OPTIONS = [
  "no website",
  "facebook only",
  "broken website",
  "insecure HTTP",
  "missing contact page",
  "outdated website",
  "mobile issues",
  "easy wins only",
];

const PRESET_STORAGE_KEY = "mixedmakershop.scout.custom-presets.v1";

type ScanPreset = {
  id: string;
  name: string;
  settings: ScoutScanSettings;
};

const BUILT_IN_PRESETS: ScanPreset[] = [
  {
    id: "easy-wins",
    name: "Easy Win",
    settings: {
      scope: "nearby_cities",
      single_city: "Hot Springs",
      region: null,
      categories: [
        "plumber",
        "roofer",
        "HVAC",
        "electrician",
        "landscaping",
        "cleaning service",
        "pressure washing",
        "auto repair",
        "church",
        "restaurant",
      ],
      issue_filters: ["no website", "broken website", "insecure HTTP", "missing contact page"],
      depth: "normal",
    },
  },
  {
    id: "no-website-leads",
    name: "No Website Leads",
    settings: {
      scope: "single_city",
      single_city: "Hot Springs",
      region: null,
      categories: CATEGORY_OPTIONS,
      issue_filters: ["no website"],
      depth: "quick",
    },
  },
  {
    id: "facebook-only-businesses",
    name: "Facebook-Only Businesses",
    settings: {
      scope: "nearby_cities",
      single_city: "Hot Springs",
      region: null,
      categories: CATEGORY_OPTIONS,
      issue_filters: ["facebook only"],
      depth: "normal",
    },
  },
  {
    id: "small-churches",
    name: "Small Churches",
    settings: {
      scope: "nearby_cities",
      single_city: "Hot Springs",
      region: null,
      categories: ["church", "small church"],
      issue_filters: ["no website", "facebook only", "mobile issues", "outdated website"],
      depth: "normal",
    },
  },
  {
    id: "arkansas-small-business-sweep",
    name: "Arkansas Small Business Sweep",
    settings: {
      scope: "all_arkansas",
      single_city: null,
      region: null,
      categories: CATEGORY_OPTIONS,
      issue_filters: ["easy wins only", "outdated website", "mobile issues"],
      depth: "deep",
    },
  },
];

export function ScoutConsole({
  integrationReady,
  initialSummary,
  initialTopLeads,
  initialError,
}: Props) {
  const scout = useGlobalScoutJob();
  const [pageError, setPageError] = useState<string | null>(initialError);
  const [scope, setScope] = useState<ScoutScanSettings["scope"]>("single_city");
  const [singleCity, setSingleCity] = useState<string>("Hot Springs");
  const [region, setRegion] = useState<string>("central");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "plumber",
    "roofer",
    "HVAC",
    "electrician",
  ]);
  const [selectedIssueFilters, setSelectedIssueFilters] = useState<string[]>([
    "no website",
    "broken website",
    "insecure HTTP",
    "missing contact page",
  ]);
  const [depth, setDepth] = useState<ScoutScanSettings["depth"]>("normal");
  const [customPresetName, setCustomPresetName] = useState("");
  const [customPresets, setCustomPresets] = useState<ScanPreset[]>([]);
  const adminSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  const activeScanSettings = scout.scanSettings;

  const toggleSelection = (value: string, selected: string[], setSelected: (items: string[]) => void) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
      return;
    }
    setSelected([...selected, value]);
  };

  const buildScanSettings = (): ScoutScanSettings => ({
    scope,
    single_city: scope === "single_city" || scope === "nearby_cities" ? singleCity : null,
    region: scope === "arkansas_region" ? region : null,
    categories: selectedCategories,
    issue_filters: selectedIssueFilters,
    depth,
  });

  const applySettings = (settings: ScoutScanSettings) => {
    setScope(settings.scope);
    setSingleCity(settings.single_city || "Hot Springs");
    setRegion(settings.region || "central");
    setSelectedCategories(Array.isArray(settings.categories) ? settings.categories : []);
    setSelectedIssueFilters(Array.isArray(settings.issue_filters) ? settings.issue_filters : []);
    setDepth(settings.depth || "normal");
  };

  const saveCustomPreset = () => {
    const name = customPresetName.trim();
    if (!name) return;
    const preset: ScanPreset = {
      id: `custom-${Date.now()}`,
      name,
      settings: buildScanSettings(),
    };
    const next = [preset, ...customPresets].slice(0, 10);
    setCustomPresets(next);
    setCustomPresetName("");
    try {
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore local storage write failures.
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRESET_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ScanPreset[];
      if (Array.isArray(parsed)) {
        setCustomPresets(parsed);
      }
    } catch {
      // Ignore local storage parse failures.
    }
  }, []);

  const settingsLabel = (settings: ScoutScanSettings | null | undefined) => {
    if (!settings) return "Default";
    const where =
      settings.scope === "single_city"
        ? `City: ${settings.single_city || "n/a"}`
        : settings.scope === "nearby_cities"
          ? `Nearby: ${settings.single_city || "n/a"}`
          : settings.scope === "arkansas_region"
            ? `Region: ${settings.region || "n/a"}`
            : "All Arkansas";
    return where;
  };

  const runScout = async () => {
    setPageError(null);
    const result = await scout.startScout(integrationReady, buildScanSettings());
    if (!result.ok && result.error) {
      setPageError(result.error);
    }
  };

  const runWithPreset = async (preset: ScanPreset) => {
    setPageError(null);
    applySettings(preset.settings);
    const result = await scout.startScout(integrationReady, preset.settings);
    if (!result.ok && result.error) {
      setPageError(result.error);
    }
  };

  const statusClass = useMemo(() => {
    if (scout.jobStatus === "finished") return "admin-badge admin-badge-won";
    if (scout.jobStatus === "cancelled") return "admin-badge admin-badge-cancelled";
    if (scout.jobStatus === "failed") return "admin-badge admin-badge-lost";
    if (scout.jobStatus === "idle") return "admin-badge admin-badge-pending";
    return "admin-badge admin-badge-progress";
  }, [scout.jobStatus]);

  return (
    <div className="space-y-6">
      <section className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crosshair className="h-5 w-5" style={{ color: "var(--admin-gold)" }} />
              <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
                Scout
              </h1>
            </div>
            <p style={{ color: "var(--admin-muted)" }}>
              MixedMakerShop admin shell + Scout-Brain engine. Run Scout jobs from here and monitor progress live.
            </p>
          </div>
          <button
            type="button"
            className="admin-btn-primary"
            onClick={runScout}
            disabled={!integrationReady || scout.isBusy}
          >
            {scout.isBusy ? "Running..." : "Run Scout"}
          </button>
          {(scout.jobStatus === "queued" || scout.jobStatus === "running" || scout.jobStatus === "analyzing") && (
            <button
              type="button"
              className="admin-btn-ghost"
              onClick={() => {
                void scout.cancelScout();
              }}
            >
              Cancel Scout
            </button>
          )}
        </div>
      </section>

      {integrationReady && !scout.isBusy && (
        <section className="admin-card space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
            Scan Setup
          </h2>
          <div className="space-y-2">
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
              Presets
            </p>
            <div className="flex flex-wrap gap-2">
              {BUILT_IN_PRESETS.map((preset) => (
                <div key={preset.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    className="admin-btn-ghost text-xs"
                    onClick={() => applySettings(preset.settings)}
                  >
                    {preset.name}
                  </button>
                  <button
                    type="button"
                    className="admin-btn-primary text-xs"
                    disabled={!integrationReady || scout.isBusy}
                    onClick={() => {
                      void runWithPreset(preset);
                    }}
                  >
                    Run
                  </button>
                </div>
              ))}
              {customPresets.map((preset) => (
                <div key={preset.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    className="admin-btn-ghost text-xs"
                    onClick={() => applySettings(preset.settings)}
                  >
                    {preset.name}
                  </button>
                  <button
                    type="button"
                    className="admin-btn-primary text-xs"
                    disabled={!integrationReady || scout.isBusy}
                    onClick={() => {
                      void runWithPreset(preset);
                    }}
                  >
                    Run
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                className="admin-input h-9 w-64"
                placeholder="Save current setup as preset"
                value={customPresetName}
                onChange={(e) => setCustomPresetName(e.target.value)}
              />
              <button type="button" className="admin-btn-primary text-xs" onClick={saveCustomPreset}>
                Save Custom Preset
              </button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm mb-2" style={{ color: "var(--admin-muted)" }}>
                Where to scan
              </p>
              <select
                className="w-full rounded-md border px-3 py-2"
                style={{ background: "rgba(0,0,0,0.2)", borderColor: "var(--admin-border)", color: "var(--admin-fg)" }}
                value={scope}
                onChange={(e) => setScope(e.target.value as ScoutScanSettings["scope"])}
              >
                <option value="single_city">single city</option>
                <option value="nearby_cities">nearby cities</option>
                <option value="arkansas_region">Arkansas region</option>
                <option value="all_arkansas">all Arkansas</option>
              </select>
            </div>
            {(scope === "single_city" || scope === "nearby_cities") && (
              <div>
                <p className="text-sm mb-2" style={{ color: "var(--admin-muted)" }}>
                  City
                </p>
                <select
                  className="w-full rounded-md border px-3 py-2"
                  style={{ background: "rgba(0,0,0,0.2)", borderColor: "var(--admin-border)", color: "var(--admin-fg)" }}
                  value={singleCity}
                  onChange={(e) => setSingleCity(e.target.value)}
                >
                  {SCAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {scope === "arkansas_region" && (
              <div>
                <p className="text-sm mb-2" style={{ color: "var(--admin-muted)" }}>
                  Region
                </p>
                <select
                  className="w-full rounded-md border px-3 py-2"
                  style={{ background: "rgba(0,0,0,0.2)", borderColor: "var(--admin-border)", color: "var(--admin-fg)" }}
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  {SCAN_REGIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <p className="text-sm mb-2" style={{ color: "var(--admin-muted)" }}>
                Scan depth
              </p>
              <select
                className="w-full rounded-md border px-3 py-2"
                style={{ background: "rgba(0,0,0,0.2)", borderColor: "var(--admin-border)", color: "var(--admin-fg)" }}
                value={depth}
                onChange={(e) => setDepth(e.target.value as ScoutScanSettings["depth"])}
              >
                <option value="quick">quick (25 businesses)</option>
                <option value="normal">normal (100 businesses)</option>
                <option value="deep">deep (300 businesses)</option>
              </select>
            </div>
          </div>

          <div>
            <p className="text-sm mb-2" style={{ color: "var(--admin-muted)" }}>
              Business type filters (multi-select)
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((item) => {
                const selected = selectedCategories.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    className="admin-btn-ghost text-xs"
                    style={selected ? { borderColor: "var(--admin-gold)", color: "var(--admin-gold)" } : undefined}
                    onClick={() => toggleSelection(item, selectedCategories, setSelectedCategories)}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm mb-2" style={{ color: "var(--admin-muted)" }}>
              Website problem filters (multi-select)
            </p>
            <div className="flex flex-wrap gap-2">
              {ISSUE_FILTER_OPTIONS.map((item) => {
                const selected = selectedIssueFilters.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    className="admin-btn-ghost text-xs"
                    style={selected ? { borderColor: "var(--admin-gold)", color: "var(--admin-gold)" } : undefined}
                    onClick={() => toggleSelection(item, selectedIssueFilters, setSelectedIssueFilters)}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {!integrationReady && (
        <section className="admin-card">
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
            Integration not configured
          </h2>
          <p style={{ color: "var(--admin-muted)" }}>
            Set <code>SCOUT_BRAIN_API_BASE_URL</code> in `next-app/.env.local` to connect this admin to Scout-Brain.
          </p>
        </section>
      )}

      {integrationReady && (
        <section className="admin-card">
          <div className="flex flex-wrap items-center gap-3">
            <span className={statusClass}>{scout.jobStatus}</span>
            {(scout.jobStatus === "queued" || scout.jobStatus === "running" || scout.jobStatus === "analyzing") && (
              <RefreshCw className="h-4 w-4 animate-spin" style={{ color: "var(--admin-gold)" }} />
            )}
            <span className="text-sm" style={{ color: "var(--admin-muted)" }}>
              {scout.statusMessage}
            </span>
            {scout.jobId && (
              <span className="text-xs" style={{ color: "var(--admin-muted-2)" }}>
                Job: {scout.jobId}
              </span>
            )}
          </div>
          {(scout.jobStatus === "running" || scout.jobStatus === "analyzing" || scout.jobStatus === "queued") && (
            <div className="mt-3">
              <div className="w-full h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${Math.max(0, Math.min(100, scout.jobProgress))}%`,
                    background: "linear-gradient(90deg, rgba(240,165,26,1), rgba(198,90,30,0.95))",
                  }}
                />
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--admin-muted)" }}>
                Progress: {scout.jobProgress}% - Phase: {String(scout.stage || "working").replace(/[_-]+/g, " ")}
              </p>
            </div>
          )}
          {scout.jobMessage && (
            <p className="text-sm mt-3" style={{ color: "var(--admin-muted)" }}>
              {scout.jobMessage}
            </p>
          )}
          {(scout.jobStatus === "queued" || scout.jobStatus === "running" || scout.jobStatus === "analyzing") &&
            activeScanSettings && (
              <div className="mt-3 text-xs space-y-1" style={{ color: "var(--admin-muted)" }}>
                <p>Scan: {settingsLabel(activeScanSettings)}</p>
                <p>Business types: {activeScanSettings.categories?.length ? activeScanSettings.categories.join(", ") : "all"}</p>
                <p>Target filters: {activeScanSettings.issue_filters?.length ? activeScanSettings.issue_filters.join(", ") : "none"}</p>
                <p>Depth: {activeScanSettings.depth || "normal"}</p>
              </div>
            )}
          {(pageError || scout.jobError) && (
            <p className="text-sm mt-3" style={{ color: "#fca5a5" }}>
              {pageError || scout.jobError}
            </p>
          )}
        </section>
      )}

      {(scout.jobStatus === "finished" || scout.jobStatus === "failed") && (
        <section className="admin-card">
          <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
            Scout Persistence Debug
          </h2>
          <pre
            className="text-xs overflow-auto rounded-md border p-3"
            style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.25)", color: "var(--admin-muted)" }}
          >
{JSON.stringify(
  {
    scout_run_saved: scout.persistenceDebug?.scout_run_saved ?? false,
    opportunities_created: scout.persistenceDebug?.opportunities_created ?? 0,
    opportunities_updated: scout.persistenceDebug?.opportunities_updated ?? 0,
    case_files_created: scout.persistenceDebug?.case_files_created ?? 0,
    case_files_updated: scout.persistenceDebug?.case_files_updated ?? 0,
    leads_created: scout.persistenceDebug?.leads_created ?? 0,
    duplicates_skipped: scout.persistenceDebug?.duplicates_skipped ?? 0,
    workspace_id: scout.persistenceDebug?.workspace_id ?? null,
    backend_supabase_url: scout.persistenceDebug?.backend_supabase_url ?? null,
    admin_next_public_supabase_url: adminSupabaseUrl || null,
    backend_admin_supabase_url: scout.persistenceDebug?.admin_supabase_url ?? null,
    intake: scout.persistenceDebug?.intake ?? null,
    errors: scout.persistenceDebug?.errors ?? [],
  },
  null,
  2
)}
          </pre>
        </section>
      )}

      {integrationReady && initialSummary && (
        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Last scout run</div>
            <div className="admin-stat-value" style={{ fontSize: "1rem" }}>
              {formatDate(initialSummary.last_run_time)}
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Leads found today</div>
            <div className="admin-stat-value">{initialSummary.leads_found_today}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Top opportunities</div>
            <div className="admin-stat-value">{initialSummary.top_opportunities_count}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Follow-ups due</div>
            <div className="admin-stat-value">{initialSummary.followups_due}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Websites audited</div>
            <div className="admin-stat-value">{initialSummary.dashboard_websites_audited}</div>
          </div>
        </section>
      )}

      {integrationReady && (
        <section className="admin-card">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
              Top Opportunities
            </h2>
            <Link href="/admin/leads" className="admin-btn-ghost inline-flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Open Leads
            </Link>
          </div>
          {initialTopLeads.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
              No opportunities returned yet. Run Scout to refresh opportunities.
            </p>
          ) : (
            <div className="admin-table-wrap overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Category</th>
                    <th>City</th>
                    <th>Score</th>
                    <th>Lead Bucket</th>
                    <th>Detected Issues</th>
                    <th>Best Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {initialTopLeads.slice(0, 10).map((lead, idx) => (
                    <tr key={`${lead.slug ?? lead.business_name ?? "lead"}-${idx}`}>
                      <td>{lead.business_name ?? "Unknown"}</td>
                      <td>{lead.category ?? "—"}</td>
                      <td>{lead.city ?? "—"}</td>
                      <td>{lead.score ?? "—"}</td>
                      <td>
                        <LeadBucketBadge bucket={lead.lead_bucket} score={lead.score} />
                      </td>
                      <td>
                        {Array.isArray(lead.opportunity_signals) && lead.opportunity_signals.length
                          ? lead.opportunity_signals.slice(0, 3).join(", ")
                          : "—"}
                      </td>
                      <td>{lead.best_contact_method ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Link href="/admin/outreach" className="admin-btn-ghost inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Next: Wire Outreach Queue
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
