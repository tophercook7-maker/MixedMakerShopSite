"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Crosshair, ExternalLink, RefreshCw } from "lucide-react";
import type { ScoutLead, ScoutScanSettings, ScoutSummary } from "@/lib/scout/types";
import { useGlobalScoutJob } from "@/components/admin/scout-job-provider";
import { LeadBucketBadge } from "@/components/admin/lead-bucket-badge";
import { buildLeadPath } from "@/lib/lead-route";
import { isManualOnlyModeClient } from "@/lib/manual-mode";
import { verifyLeadBeforeNavigation } from "@/lib/lead-navigation";
import { scoreScoutLead } from "@/lib/scout-conversion";
import { ScoutLitePanel } from "@/components/admin/scout-lite-panel";
import type { ScoutResultListItem, ScoutResultsCounts } from "@/lib/scout/scout-results-types";

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

function conversionFocusScore(lead: ScoutLead): number {
  const contact = String(lead.best_contact_method || "").toLowerCase();
  const score = scoreScoutLead({
    business_name: lead.business_name,
    category: lead.category,
    website: lead.website,
    phone: contact === "phone" ? "phone" : "",
    email: contact === "email" ? "email@example.com" : "",
    review_count: null,
    issue_texts: [
      String(lead.opportunity_reason || ""),
      ...(Array.isArray(lead.opportunity_signals) ? lead.opportunity_signals : []),
    ],
    website_status: null,
  });
  return score.lead_score;
}

function targetedPriorityScore(lead: ScoutLead): number {
  const website = String(lead.website || "").trim();
  const reason = String(lead.opportunity_reason || "").toLowerCase();
  const signals = Array.isArray(lead.opportunity_signals)
    ? lead.opportunity_signals.map((v) => String(v || "").toLowerCase())
    : [];
  const contact = String(lead.best_contact_method || "").toLowerCase();
  let score = 0;
  const noWebsite = !website || reason.includes("no website") || signals.some((s) => s.includes("no_website"));
  const weakSite =
    reason.includes("outdated") ||
    reason.includes("weak") ||
    reason.includes("broken") ||
    reason.includes("call-to-action") ||
    signals.some((s) => s.includes("outdated") || s.includes("broken") || s.includes("cta"));
  const noContact = contact === "none" || reason.includes("no contact") || signals.some((s) => s.includes("no_contact"));
  const lowReviews = reason.includes("low review") || signals.some((s) => s.includes("review_count") || s.includes("low_reviews"));
  if (noWebsite) score += 3;
  if (noContact) score += 2;
  if (weakSite) score += 2;
  if (lowReviews) score += 1;
  return score;
}

function targetedBadges(lead: ScoutLead): string[] {
  const website = String(lead.website || "").trim();
  const reason = String(lead.opportunity_reason || "").toLowerCase();
  const signals = Array.isArray(lead.opportunity_signals)
    ? lead.opportunity_signals.map((v) => String(v || "").toLowerCase())
    : [];
  const contact = String(lead.best_contact_method || "").toLowerCase();
  const out: string[] = [];
  if (!website || reason.includes("no website") || signals.some((s) => s.includes("no_website"))) out.push("No Website");
  if (contact === "none" || reason.includes("no contact") || signals.some((s) => s.includes("no_contact"))) out.push("No Contact");
  if (
    reason.includes("outdated") ||
    reason.includes("weak") ||
    reason.includes("broken") ||
    reason.includes("call-to-action") ||
    signals.some((s) => s.includes("outdated") || s.includes("broken") || s.includes("cta"))
  ) {
    out.push("Weak Site");
  }
  if (reason.includes("low review") || signals.some((s) => s.includes("review_count") || s.includes("low_reviews"))) out.push("Low Reviews");
  return out.slice(0, 4);
}

function scoutWhyLead(lead: ScoutLead): string {
  const contact = String(lead.best_contact_method || "").toLowerCase();
  const score = scoreScoutLead({
    business_name: lead.business_name,
    category: lead.category,
    website: lead.website,
    phone: contact === "phone" ? "phone" : "",
    email: contact === "email" ? "email@example.com" : "",
    review_count: null,
    issue_texts: [
      String(lead.opportunity_reason || ""),
      ...(Array.isArray(lead.opportunity_signals) ? lead.opportunity_signals : []),
    ],
    website_status: null,
  });
  return score.why_this_lead;
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
  "No Website",
  "Weak / Outdated Website",
  "No Contact Info",
  "Facebook Only Presence",
  "Low Reviews (< 10)",
  "Low Rating (< 4.0)",
  "No Clear Call-To-Action",
];

const PRESET_STORAGE_KEY = "mixedmakershop.scout.custom-presets.v1";

type ScanPreset = {
  id: string;
  name: string;
  settings: ScoutScanSettings;
};

const BUILT_IN_PRESETS: ScanPreset[] = [
  {
    id: "best-web-design-targets",
    name: "Best web design targets",
    settings: {
      scope: "single_city",
      single_city: "Hot Springs",
      region: null,
      categories: ["plumber", "roofer", "HVAC", "electrician", "landscaping", "cleaning service", "auto repair"],
      issue_filters: ["No Website", "Facebook Only Presence", "Weak / Outdated Website", "No Contact Info"],
      depth: "normal",
    },
  },
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
      issue_filters: ["No Website", "Weak / Outdated Website", "No Contact Info"],
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
      issue_filters: ["No Website"],
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
      issue_filters: ["Facebook Only Presence"],
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
      issue_filters: ["No Website", "Facebook Only Presence", "Weak / Outdated Website"],
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
      issue_filters: ["No Website", "No Contact Info", "Weak / Outdated Website"],
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
  const manualOnlyMode = isManualOnlyModeClient();
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
    "No Website",
    "No Contact Info",
  ]);
  const [depth, setDepth] = useState<ScoutScanSettings["depth"]>("normal");
  const [discoveryMode, setDiscoveryMode] = useState<ScoutScanSettings["discovery_mode"]>("reduced_free");
  const [runCity, setRunCity] = useState("Hot Springs");
  const [runCategory, setRunCategory] = useState("plumber");
  const [leadLimit, setLeadLimit] = useState<number>(20);
  const [customPresetName, setCustomPresetName] = useState("");
  const [customPresets, setCustomPresets] = useState<ScanPreset[]>([]);
  const [creatingLeadForOppId, setCreatingLeadForOppId] = useState<string | null>(null);
  const [scoutToast, setScoutToast] = useState<string | null>(null);
  const [persistedRows, setPersistedRows] = useState<ScoutResultListItem[]>([]);
  const [persistedCounts, setPersistedCounts] = useState<ScoutResultsCounts | null>(null);
  const [persistedLoading, setPersistedLoading] = useState(false);
  const [showSkippedPersisted, setShowSkippedPersisted] = useState(false);
  const [includeSavedPersisted, setIncludeSavedPersisted] = useState(false);
  const lastBrainSyncSig = useRef<string>("");
  const adminSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  useEffect(() => {
    if (!scoutToast) return;
    const t = setTimeout(() => setScoutToast(null), 3500);
    return () => clearTimeout(t);
  }, [scoutToast]);

  const activeScanSettings = scout.scanSettings;
  const intake = scout.persistenceDebug?.intake;
  const isReducedRun = Boolean(
    intake?.reduced_mode ||
      (scout.scanSettings?.mode !== "discovery" && scout.scanSettings?.discovery_mode !== "paid_discovery")
  );
  const freshDiscoveryCount = isReducedRun
    ? 0
    : Number(intake?.businesses_found || intake?.opportunities_found || intake?.opportunities_loaded || 0);
  const existingRecordsEnriched = Number(
    intake?.records_enriched || intake?.enriched_count || intake?.stored_records_scanned || 0
  );
  const reducedNoDataMessage =
    isReducedRun &&
    freshDiscoveryCount === 0 &&
    existingRecordsEnriched === 0 &&
    (scout.jobStatus === "finished" || scout.jobStatus === "failed");

  const toggleSelection = (value: string, selected: string[], setSelected: (items: string[]) => void) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
      return;
    }
    setSelected([...selected, value]);
  };

  const buildScanSettings = (): ScoutScanSettings => ({
    scope: "single_city",
    single_city: runCity || singleCity,
    region: scope === "arkansas_region" ? region : null,
    categories: [runCategory || selectedCategories[0] || "plumber"],
    issue_filters: selectedIssueFilters,
    depth,
    discovery_mode: discoveryMode || "reduced_free",
    mode: discoveryMode === "paid_discovery" ? "discovery" : "reduced",
    city: runCity || null,
    category: runCategory || null,
    lead_limit: Number.isFinite(leadLimit) ? Math.max(1, Math.min(200, leadLimit)) : 20,
  });

  const applySettings = (settings: ScoutScanSettings) => {
    setScope(settings.scope);
    setSingleCity(settings.single_city || "Hot Springs");
    setRegion(settings.region || "central");
    setSelectedCategories(Array.isArray(settings.categories) ? settings.categories : []);
    setSelectedIssueFilters(Array.isArray(settings.issue_filters) ? settings.issue_filters : []);
    setDepth(settings.depth || "normal");
    setDiscoveryMode(settings.discovery_mode || "reduced_free");
    if (settings.city) setRunCity(String(settings.city));
    if (settings.category) setRunCategory(String(settings.category));
    if (Number.isFinite(Number(settings.lead_limit))) {
      setLeadLimit(Math.max(1, Math.min(200, Number(settings.lead_limit))));
    }
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
    console.info("[Admin Click] Scout run click fired");
    setPageError(null);
    console.info("[Admin Click] Scout handler entered");
    if (!runCategory.trim()) {
      setPageError("Category is required.");
      return;
    }
    if (!runCity.trim()) {
      setPageError("City is required.");
      return;
    }
    const payload = buildScanSettings();
    console.info("[Admin Click] Scout request", {
      route: "/api/scout/run",
      method: "POST",
      payload,
    });
    const result = await scout.startScout(integrationReady, payload);
    if (!result.ok && result.error) {
      console.error("[Admin Click] Scout start failed", { error: result.error });
      setPageError(result.error.includes("Unauthorized") ? "Permission denied" : result.error);
    } else {
      console.info("[Admin Click] Scout start succeeded");
    }
  };

  const resetScoutUiState = () => {
    setPageError(null);
    scout.clearScoutState();
  };

  const fetchPersistedResults = useCallback(async () => {
    setPersistedLoading(true);
    try {
      const q = new URLSearchParams();
      if (showSkippedPersisted) q.set("include_skipped", "1");
      if (includeSavedPersisted) q.set("include_saved", "1");
      const res = await fetch(`/api/scout/results?${q.toString()}`);
      const data = (await res.json().catch(() => ({}))) as {
        results?: ScoutResultListItem[];
        counts?: ScoutResultsCounts;
        error?: string;
      };
      if (!res.ok) {
        setPageError(String(data.error || "Could not load discovery list."));
        return;
      }
      setPersistedRows(Array.isArray(data.results) ? data.results : []);
      setPersistedCounts(data.counts ?? null);
    } finally {
      setPersistedLoading(false);
    }
  }, [showSkippedPersisted, includeSavedPersisted]);

  const brainSignature = useMemo(
    () =>
      [...initialTopLeads]
        .map((l) => String(l.id || l.slug || ""))
        .sort()
        .join("|"),
    [initialTopLeads]
  );

  useEffect(() => {
    if (!integrationReady) return;
    let cancelled = false;
    (async () => {
      const sig = brainSignature;
      if (sig !== lastBrainSyncSig.current) {
        lastBrainSyncSig.current = sig;
        if (initialTopLeads.length > 0) {
          const syncRes = await fetch("/api/scout/results", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ opportunities: initialTopLeads }),
          });
          if (!syncRes.ok && !cancelled) {
            const j = (await syncRes.json().catch(() => ({}))) as { error?: string };
            setPageError(String(j.error || "Could not save discovery results."));
          }
        }
      }
      if (!cancelled) await fetchPersistedResults();
    })();
    return () => {
      cancelled = true;
    };
  }, [integrationReady, brainSignature, initialTopLeads, fetchPersistedResults]);

  const createLeadFromOpportunity = async (opportunityId: string, scoutResultId?: string | null) => {
    const oppId = String(opportunityId || "").trim();
    if (!oppId) return null;
    setPageError(null);
    const busyKey = String(scoutResultId || "").trim() || oppId;
    setCreatingLeadForOppId(busyKey);
    try {
      const payload = scoutResultId ? { scout_result_id: scoutResultId } : {};
      console.info("[Admin Click] Create Lead request", {
        route: `/api/scout/opportunities/${encodeURIComponent(oppId)}/create-lead`,
        method: "POST",
        payload,
      });
      const res = await fetch(`/api/scout/opportunities/${encodeURIComponent(oppId)}/create-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        reason?: string;
        lead_id?: string;
        business_name?: string;
        case_id?: string | null;
        created?: boolean;
      };
      console.info("[Admin Click] Create Lead response", { status: res.status, body });
      if (!res.ok || !body.lead_id) {
        if (res.status === 403) setPageError("Permission denied");
        else if (res.status >= 500) setPageError(body.error || "API error");
        else setPageError(body.error || body.reason || "No data returned");
        return null;
      }
      await fetchPersistedResults();
      return {
        leadId: String(body.lead_id || ""),
        businessName: String(body.business_name || "Lead"),
        caseId: String(body.case_id || "").trim() || null,
        created: body.created !== false,
      };
    } catch (error) {
      setPageError(error instanceof Error ? `API error: ${error.message}` : "API error");
      return null;
    } finally {
      setCreatingLeadForOppId(null);
    }
  };

  const hardNavigate = (href: string) => {
    if (!href) return;
    if (typeof window !== "undefined") window.location.assign(href);
  };

  const navigateLeadWithGuard = async (leadId: string, businessName: string, query?: string) => {
    const check = await verifyLeadBeforeNavigation(leadId);
    if (!check.ok) {
      setPageError(check.message);
      if (typeof window !== "undefined") window.alert(check.message);
      return;
    }
    const path = buildLeadPath(leadId, businessName);
    hardNavigate(query ? `${path}?${query}` : path);
  };

  const openExternal = (href: string) => {
    if (!href) return;
    if (typeof window !== "undefined") window.open(href, "_blank", "noopener,noreferrer");
  };

  const runWithPreset = async (preset: ScanPreset) => {
    console.info("[Admin Click] Scout preset run click fired", { preset: preset.id });
    setPageError(null);
    applySettings(preset.settings);
    const presetCity = String(preset.settings.city || preset.settings.single_city || "").trim();
    const presetCategory =
      String(preset.settings.category || (Array.isArray(preset.settings.categories) ? preset.settings.categories[0] : "") || "").trim();
    if (!presetCategory || !presetCity) {
      setPageError("Category and city are required.");
      return;
    }
    console.info("[Admin Click] Scout preset handler entered", { preset: preset.id });
    const result = await scout.startScout(integrationReady, preset.settings);
    if (!result.ok && result.error) {
      console.error("[Admin Click] Scout preset start failed", { preset: preset.id, error: result.error });
      setPageError(result.error);
    } else {
      console.info("[Admin Click] Scout preset start succeeded", { preset: preset.id });
    }
  };

  const statusClass = useMemo(() => {
    if (scout.jobStatus === "finished") return "admin-badge admin-badge-won";
    if (scout.jobStatus === "cancelled") return "admin-badge admin-badge-cancelled";
    if (scout.jobStatus === "failed") return "admin-badge admin-badge-lost";
    if (scout.jobStatus === "idle") return "admin-badge admin-badge-pending";
    return "admin-badge admin-badge-progress";
  }, [scout.jobStatus]);

  const visibleError = useMemo(() => {
    const raw = String(pageError || scout.jobError || "").trim();
    if (!raw) return null;
    const isStaleAuthBanner =
      raw.includes("No authenticated session found in admin proxy") &&
      (Boolean(initialSummary) || initialTopLeads.length > 0);
    return isStaleAuthBanner ? null : raw;
  }, [initialSummary, initialTopLeads.length, pageError, scout.jobError]);

  const prioritizedTopLeads = useMemo(() => {
    return [...initialTopLeads]
      .filter((lead) => {
        const contact = String(lead.best_contact_method || "").toLowerCase();
        const score = scoreScoutLead({
          business_name: lead.business_name,
          category: lead.category,
          website: lead.website,
          phone: contact === "phone" ? "phone" : "",
          email: contact === "email" ? "email@example.com" : "",
          review_count: null,
          issue_texts: [
            String(lead.opportunity_reason || ""),
            ...(Array.isArray(lead.opportunity_signals) ? lead.opportunity_signals : []),
          ],
          website_status: null,
        });
        const contactable = contact === "phone" || contact === "email";
        return !score.excluded && contactable && score.lead_score >= 60;
      })
      .sort((a, b) => {
        const targeted = targetedPriorityScore(b) - targetedPriorityScore(a);
        if (targeted !== 0) return targeted;
        const delta = conversionFocusScore(b) - conversionFocusScore(a);
        if (delta !== 0) return delta;
        return Number(b.opportunity_score ?? b.score ?? 0) - Number(a.opportunity_score ?? a.score ?? 0);
      });
  }, [initialTopLeads]);

  const addLeadFromDiscovery = async (scoutResultId: string, opportunityId: string) => {
    const created = await createLeadFromOpportunity(opportunityId, scoutResultId);
    if (!created?.leadId) return null;
    return { created: created.created, businessName: created.businessName };
  };

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
              Find businesses with Scout, scan the list quickly, and save the ones you want. Run a search above, then use Add lead — you don’t need to open a full profile first.
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
        <div className="mt-3">
          <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
            Scout Mode
          </h2>
          <div className="grid gap-2 md:grid-cols-2 text-xs">
            <button
              type="button"
              className={discoveryMode === "reduced_free" ? "admin-btn-primary text-left" : "admin-btn-ghost text-left"}
              onClick={() => setDiscoveryMode("reduced_free")}
              disabled={scout.isBusy}
            >
              <div className="font-semibold">Reduced (Free)</div>
              <div style={{ color: "var(--admin-muted)" }}>No fresh business discovery</div>
              <div style={{ color: "var(--admin-muted)" }}>Existing data enrichment only</div>
            </button>
            <button
              type="button"
              className={discoveryMode === "paid_discovery" ? "admin-btn-primary text-left" : "admin-btn-ghost text-left"}
              onClick={() => setDiscoveryMode("paid_discovery")}
              disabled={scout.isBusy}
            >
              <div className="font-semibold">Discovery (Paid)</div>
              <div style={{ color: "#fca5a5" }}>May use paid API calls</div>
            </button>
          </div>
          <div className="mt-2 text-xs" style={{ color: "var(--admin-muted)" }}>
            <span className="font-semibold">
              {discoveryMode === "paid_discovery" ? "Paid discovery mode" : "Reduced mode (free)"}
            </span>
            {" "}·{" "}
            <span className="font-semibold">
              {discoveryMode === "paid_discovery" ? "Discovery Mode = fresh business finding (paid Google Places)" : "Reduced Mode = enrichment only (no fresh business discovery)"}
            </span>
            {" "}·{" "}
            <span className="font-semibold">{manualOnlyMode ? "Manual trigger only" : "Enabled by configuration"}</span>
          </div>
        </div>
        {discoveryMode === "paid_discovery" ? (
          <div
            className="mt-3 rounded-md border px-3 py-2 text-xs"
            style={{ borderColor: "rgba(252, 165, 165, 0.5)", background: "rgba(127, 29, 29, 0.18)", color: "#fecaca" }}
          >
            This run may use paid APIs (Google Places). Nothing will run automatically. This will only execute once when you click Run Scout.
          </div>
        ) : null}
        <div className="mt-3 grid gap-3 md:grid-cols-3 text-xs">
          <label className="space-y-1">
            <span style={{ color: "var(--admin-muted)" }}>City</span>
            <input
              className="admin-input h-9"
              value={runCity}
              onChange={(e) => setRunCity(e.target.value)}
              placeholder="Hot Springs"
              disabled={scout.isBusy}
            />
          </label>
          <label className="space-y-1">
            <span style={{ color: "var(--admin-muted)" }}>Category</span>
            <input
              className="admin-input h-9"
              value={runCategory}
              onChange={(e) => setRunCategory(e.target.value)}
              placeholder="plumber"
              disabled={scout.isBusy}
            />
          </label>
          <label className="space-y-1">
            <span style={{ color: "var(--admin-muted)" }}>Lead limit</span>
            <input
              type="number"
              min={1}
              max={200}
              className="admin-input h-9"
              value={leadLimit}
              onChange={(e) => setLeadLimit(Number(e.target.value || 20))}
              disabled={scout.isBusy}
            />
          </label>
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--admin-muted)" }}>
          Run settings are applied once per click. Nothing runs automatically.
        </p>
      </section>

      {visibleError && (
        <section
          className="admin-card"
          style={{
            borderColor: "rgba(252, 165, 165, 0.5)",
            background: "rgba(127, 29, 29, 0.18)",
          }}
        >
          <h2 className="text-lg font-semibold mb-2" style={{ color: "#fecaca" }}>
            Scout request failed
          </h2>
          <p className="text-sm" style={{ color: "#fecaca" }}>
            {visibleError}
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--admin-muted)" }}>
            The admin page is still active. Retry Scout actions or reset local Scout UI state.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="admin-btn-primary text-xs"
              disabled={!integrationReady || scout.isBusy}
              onClick={() => {
                void runScout();
              }}
            >
              Retry Scout Start
            </button>
            <button
              type="button"
              className="admin-btn-ghost text-xs"
              onClick={() => {
                if (typeof window !== "undefined") window.location.reload();
              }}
            >
              Retry Load
            </button>
            <button
              type="button"
              className="admin-btn-ghost text-xs"
              onClick={resetScoutUiState}
            >
              Reset Scout UI State
            </button>
          </div>
        </section>
      )}

      {scout.persistenceDebug?.reduced_mode_notice ? (
        <section
          className="admin-card"
          style={{
            borderColor: "rgba(251, 191, 36, 0.45)",
            background: "rgba(120, 53, 15, 0.18)",
          }}
        >
          <h2 className="text-lg font-semibold mb-2" style={{ color: "#fde68a" }}>
            Reduced Scout Mode
          </h2>
          <p className="text-sm mb-1" style={{ color: "#fde68a" }}>
            No fresh business discovery.
          </p>
          <p className="text-sm mb-2" style={{ color: "#fde68a" }}>
            Existing data enrichment only.
          </p>
          <p className="text-sm" style={{ color: "#fde68a" }}>
            {String(scout.persistenceDebug?.reduced_mode_notice || "")}
          </p>
          <div className="mt-3">
            <Link href="/admin/leads" className="admin-btn-ghost inline-flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Work Existing Leads
            </Link>
          </div>
        </section>
      ) : null}

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
                aria-label="Where to scan"
                title="Where to scan"
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
                  aria-label="Scan city"
                  title="Scan city"
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
                  aria-label="Scan region"
                  title="Scan region"
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
                aria-label="Scan depth"
                title="Scan depth"
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
              Opportunity Filters
            </p>
            <div className="grid gap-2 md:grid-cols-2 text-xs">
              {ISSUE_FILTER_OPTIONS.map((item) => {
                const selected = selectedIssueFilters.includes(item);
                return (
                  <label key={item} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelection(item, selectedIssueFilters, setSelectedIssueFilters)}
                    />
                    <span>{item}</span>
                  </label>
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
                <p>
                  Discovery mode:{" "}
                  {activeScanSettings.discovery_mode === "paid_discovery" ? "Paid discovery mode" : "Reduced mode (free)"}
                </p>
              </div>
            )}
        </section>
      )}

      {(scout.jobStatus === "finished" || scout.jobStatus === "failed") && (
        <section className="admin-card">
          <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
            This Scan Summary
          </h2>
          <div className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
            <p>
              mode used:{" "}
              {scout.scanSettings?.mode === "discovery" || scout.scanSettings?.discovery_mode === "paid_discovery"
                ? "Discovery (Paid)"
                : "Reduced (Free)"}
            </p>
            <p>
              mode meaning:{" "}
              {isReducedRun
                ? "Reduced Mode = enrichment only (no fresh business discovery)"
                : "Discovery Mode = new business finding (paid Google Places)"}
            </p>
            <p>
              leads found: {Number(scout.persistenceDebug?.intake?.leads_created || scout.persistenceDebug?.intake?.created || 0)} |
              {" "}records enriched: {Number(scout.persistenceDebug?.intake?.records_enriched || scout.persistenceDebug?.intake?.enriched_count || 0)} |
              {" "}emails found: {Number(scout.persistenceDebug?.intake?.emails_found || scout.persistenceDebug?.intake?.leads_with_email || 0)} |
              {" "}contact leads: {Number(scout.persistenceDebug?.intake?.contact_available || scout.persistenceDebug?.intake?.leads_with_contact_page || 0)} |
              {" "}door candidates: {Number(scout.persistenceDebug?.intake?.door_to_door_candidates || scout.persistenceDebug?.intake?.door_to_door_candidates_created || 0)}
            </p>
            <p style={{ color: "#fde68a" }}>
              {scout.scanSettings?.mode === "discovery" || scout.scanSettings?.discovery_mode === "paid_discovery"
                ? "Google Places used"
                : "No paid APIs used"}
            </p>
          </div>
          <div className="text-xs mb-2 space-y-1" style={{ color: "var(--admin-muted)" }}>
            {Boolean(scout.persistenceDebug?.intake?.reduced_mode) ? (
              <p style={{ color: "#fde68a" }}>
                Google discovery unavailable. Running in reduced enrichment mode.
              </p>
            ) : null}
            {reducedNoDataMessage ? (
              <p style={{ color: "#fde68a" }}>
                No new businesses were discovered in reduced mode. This mode only enriches existing records.
              </p>
            ) : null}
            <p>
              fresh_discovery_count: {freshDiscoveryCount} | existing_records_enriched: {existingRecordsEnriched}
            </p>
            <p>
              businesses scanned: {Number(scout.persistenceDebug?.intake?.scanned_count || 0)} |
              opportunities found: {Number(scout.persistenceDebug?.intake?.opportunities_found || scout.persistenceDebug?.intake?.opportunities_loaded || 0)} |
              enriched leads created: {Number(scout.persistenceDebug?.intake?.leads_created || scout.persistenceDebug?.intake?.created || 0)} |
              emails found: {Number(scout.persistenceDebug?.intake?.leads_with_email || 0)} |
              actionable leads created: {Number(scout.persistenceDebug?.intake?.actionable_email_leads_created || 0)} |
              research later created: {Number(scout.persistenceDebug?.intake?.research_later_leads_created || 0)} |
              door-to-door created: {Number(scout.persistenceDebug?.intake?.door_to_door_candidates_created || 0)} |
              skipped leads: {Number(scout.persistenceDebug?.intake?.filtered_out || 0)}
            </p>
            {Boolean(scout.persistenceDebug?.intake?.reduced_mode) ? (
              <p>
                google_discovery_used: {String(Boolean(scout.persistenceDebug?.intake?.google_discovery_used))} |
                reduced_mode: {String(Boolean(scout.persistenceDebug?.intake?.reduced_mode))} |
                stored_records_scanned: {Number(scout.persistenceDebug?.intake?.stored_records_scanned || 0)} |
                records_enriched: {Number(scout.persistenceDebug?.intake?.records_enriched || 0)} |
                emails_found: {Number(scout.persistenceDebug?.intake?.emails_found || 0)} |
                actionable_email_leads: {Number(scout.persistenceDebug?.intake?.actionable_email_leads || 0)} |
                contact_available: {Number(scout.persistenceDebug?.intake?.contact_available || 0)} |
                door_to_door_candidates: {Number(scout.persistenceDebug?.intake?.door_to_door_candidates || 0)} |
                skipped: {Number(scout.persistenceDebug?.intake?.skipped || 0)}
              </p>
            ) : null}
            <p>
              easy wins found: {
                initialTopLeads.filter((lead) => String(lead.lead_bucket || "").toLowerCase() === "easy win").length
              } | contact-ready leads: {
                initialTopLeads.filter((lead) => String(lead.best_contact_method || "").trim().length > 0).length
              }
            </p>
            <p>
              <Link href="/admin/leads" className="admin-btn-ghost inline-flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Work Existing Leads
              </Link>
            </p>
          </div>
          <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
            opportunities_found: {Number(scout.persistenceDebug?.intake?.opportunities_found || scout.persistenceDebug?.intake?.opportunities_loaded || 0)} | opportunities_evaluated:{" "}
            {Number(scout.persistenceDebug?.intake?.opportunities_evaluated || scout.persistenceDebug?.intake?.evaluated || 0)} | eligible_for_lead_creation:{" "}
            {Number(scout.persistenceDebug?.intake?.eligible_for_lead_creation || scout.persistenceDebug?.intake?.eligible || 0)} | leads_created:{" "}
            {Number(scout.persistenceDebug?.intake?.leads_created || scout.persistenceDebug?.intake?.created || scout.persistenceDebug?.leads_created || 0)} | duplicates_skipped:{" "}
            {Number(scout.persistenceDebug?.intake?.duplicates_skipped || scout.persistenceDebug?.intake?.duplicate_skipped || scout.persistenceDebug?.duplicates_skipped || 0)} | insert_failed:{" "}
            {Number(scout.persistenceDebug?.intake?.insert_failed || 0)} | filtered_out: {Number(scout.persistenceDebug?.intake?.filtered_out || 0)}
          </p>
          <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
            missing_business_name: {Number(scout.persistenceDebug?.intake?.reason_counts?.missing_business_name || scout.persistenceDebug?.intake?.filtered_missing_business_name || 0)} | missing_workspace_id:{" "}
            {Number(scout.persistenceDebug?.intake?.reason_counts?.missing_workspace_id || scout.persistenceDebug?.intake?.filtered_missing_workspace || 0)} | missing_contact_path:{" "}
            {Number(scout.persistenceDebug?.intake?.reason_counts?.missing_contact_path || scout.persistenceDebug?.intake?.filtered_missing_contact_path || 0)} | score_below_threshold:{" "}
            {Number(scout.persistenceDebug?.intake?.reason_counts?.score_below_threshold || scout.persistenceDebug?.intake?.filtered_low_score || 0)}
          </p>
          <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
            missing_email: {Number(scout.persistenceDebug?.intake?.reason_counts?.missing_email || scout.persistenceDebug?.intake?.filtered_missing_email || 0)} | missing_opportunity_reason:{" "}
            {Number(scout.persistenceDebug?.intake?.reason_counts?.missing_opportunity_reason || scout.persistenceDebug?.intake?.filtered_missing_opportunity_reason || 0)}
          </p>
          <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
            duplicate_by_linked_opportunity_id:{" "}
            {Number(scout.persistenceDebug?.intake?.reason_counts?.duplicate_by_linked_opportunity_id || scout.persistenceDebug?.intake?.filtered_existing_linked_opportunity || 0)} | duplicate_by_website:{" "}
            {Number(scout.persistenceDebug?.intake?.reason_counts?.duplicate_by_website || scout.persistenceDebug?.intake?.duplicate_by_website || 0)} | duplicate_by_phone:{" "}
            {Number(scout.persistenceDebug?.intake?.reason_counts?.duplicate_by_phone || scout.persistenceDebug?.intake?.duplicate_by_phone || 0)} | duplicate_by_business_name_city:{" "}
            {Number(scout.persistenceDebug?.intake?.reason_counts?.duplicate_by_business_name_city || scout.persistenceDebug?.intake?.duplicate_by_business_name_city || 0)} | insert_error:{" "}
            {Number(scout.persistenceDebug?.intake?.reason_counts?.insert_error || scout.persistenceDebug?.intake?.insert_failed || 0)}
          </p>
          <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
            leads_with_email: {Number(scout.persistenceDebug?.intake?.leads_with_email || 0)} | leads_with_phone:{" "}
            {Number(scout.persistenceDebug?.intake?.leads_with_phone || 0)} | leads_with_contact_page:{" "}
            {Number(scout.persistenceDebug?.intake?.leads_with_contact_page || 0)} | leads_with_facebook:{" "}
            {Number(scout.persistenceDebug?.intake?.leads_with_facebook || 0)} | leads_with_no_contact_path:{" "}
            {Number(scout.persistenceDebug?.intake?.leads_with_no_contact_path || 0)}
          </p>
          <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
            total_records: {Number(scout.persistenceDebug?.intake?.total_records || scout.persistenceDebug?.intake?.scanned_count || 0)} | emails_found: {Number(scout.persistenceDebug?.intake?.emails_found || scout.persistenceDebug?.intake?.leads_with_email || 0)} | contact_pages_found:{" "}
            {Number(scout.persistenceDebug?.intake?.contact_pages_found || scout.persistenceDebug?.intake?.leads_with_contact_page || 0)} | facebook_found:{" "}
            {Number(scout.persistenceDebug?.intake?.facebook_found || scout.persistenceDebug?.intake?.facebook_links_found || scout.persistenceDebug?.intake?.leads_with_facebook || 0)} | phone_found:{" "}
            {Number(scout.persistenceDebug?.intake?.phone_found || scout.persistenceDebug?.intake?.phones_found || scout.persistenceDebug?.intake?.leads_with_phone || 0)} | no_contact_path:{" "}
            {Number(scout.persistenceDebug?.intake?.no_contact_path || scout.persistenceDebug?.intake?.records_with_no_contact || scout.persistenceDebug?.intake?.leads_with_no_contact_path || 0)}
          </p>
          {!isReducedRun ? (
            <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
              businesses_found: {Number(scout.persistenceDebug?.intake?.businesses_found || scout.persistenceDebug?.intake?.opportunities_found || 0)} | websites_found:{" "}
              {Number(scout.persistenceDebug?.intake?.websites_found || 0)} | no_website_found:{" "}
              {Number(scout.persistenceDebug?.intake?.no_website_found || 0)} | facebook_links_found:{" "}
              {Number(scout.persistenceDebug?.intake?.facebook_links_found || scout.persistenceDebug?.intake?.facebook_found || 0)}
            </p>
          ) : null}
          <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
            leads_created_with_website: {Number(scout.persistenceDebug?.intake?.leads_created_with_website || 0)} | leads_created_without_website:{" "}
            {Number(scout.persistenceDebug?.intake?.leads_created_without_website || 0)}
          </p>
          <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
            facebook_only: {Number(scout.persistenceDebug?.intake?.facebook_only || 0)} | phone_only:{" "}
            {Number(scout.persistenceDebug?.intake?.phone_only || 0)}
          </p>
          <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
            actionable_email_leads_created: {Number(scout.persistenceDebug?.intake?.actionable_email_leads_created || 0)} | leads_skipped_due_no_email:{" "}
            {Number(scout.persistenceDebug?.intake?.leads_skipped_due_no_email || 0)}
          </p>
          <p className="text-xs mb-2" style={{ color: "var(--admin-muted)" }}>
            leads_created_with_low_score: {Number(scout.persistenceDebug?.intake?.leads_created_with_low_score || 0)} | leads_created_high_score:{" "}
            {Number(scout.persistenceDebug?.intake?.leads_created_high_score || 0)}
          </p>
          {Number(scout.persistenceDebug?.intake?.created || scout.persistenceDebug?.leads_created || 0) === 0 && (
            <p className="text-xs mb-2" style={{ color: "#fca5a5" }}>
              no_leads_created_reason:{" "}
              {String(
                scout.persistenceDebug?.intake?.query_error ||
                  scout.persistenceDebug?.errors?.[0]?.message ||
                  "No leads were created from this run. Use backfill and inspect intake filters."
              )}
            </p>
          )}
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
            <div className="admin-stat-label">New Leads Today</div>
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
        <section className="admin-card space-y-4">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link href="/admin/leads" className="admin-btn-ghost inline-flex items-center gap-2 text-sm">
              <ExternalLink className="h-4 w-4" />
              Businesses you saved
            </Link>
          </div>
          <ScoutLitePanel
            rows={persistedRows}
            counts={persistedCounts}
            loading={persistedLoading}
            brainHadOpportunities={initialTopLeads.length > 0}
            creatingLeadKey={creatingLeadForOppId}
            showSkipped={showSkippedPersisted}
            onShowSkippedChange={setShowSkippedPersisted}
            includeSaved={includeSavedPersisted}
            onIncludeSavedChange={setIncludeSavedPersisted}
            onRefresh={fetchPersistedResults}
            onAddLead={addLeadFromDiscovery}
            onToast={setScoutToast}
            openExternal={openExternal}
          />
          <details className="rounded-lg border pt-2 pb-3 px-3" style={{ borderColor: "var(--admin-border)" }}>
            <summary className="text-xs cursor-pointer font-medium" style={{ color: "var(--admin-muted)" }}>
              Advanced table (high-score, email/phone only)
            </summary>
            <p className="text-xs mt-2 mb-3" style={{ color: "var(--admin-muted)" }}>
              Same data as before, for power users. Day-to-day scanning uses the compact cards above.
            </p>
            {initialTopLeads.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
                No opportunities yet. Run Scout to load results.
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
                      <th>Why this lead</th>
                      <th>Bucket</th>
                      <th>Reason</th>
                      <th>Contact</th>
                      <th>Next</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prioritizedTopLeads.slice(0, 10).map((lead, idx) => (
                      <tr key={`${lead.slug ?? lead.business_name ?? "lead"}-${idx}`}>
                        <td>{lead.business_name ?? "Unknown"}</td>
                        <td>{lead.category ?? "—"}</td>
                        <td>{lead.city ?? "—"}</td>
                        <td>{conversionFocusScore(lead)}</td>
                        <td>{scoutWhyLead(lead)}</td>
                        <td>
                          <LeadBucketBadge bucket={lead.lead_bucket} score={lead.opportunity_score ?? lead.score} />
                        </td>
                        <td>
                          <div className="space-y-2 max-w-xs">
                            <div className="text-xs">
                              {String(lead.opportunity_reason || "").trim() ||
                                (Array.isArray(lead.opportunity_signals) && lead.opportunity_signals.length
                                  ? lead.opportunity_signals.slice(0, 3).join(", ")
                                  : "—")}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {targetedBadges(lead).map((badge) => (
                                <span
                                  key={`${lead.id || lead.slug || lead.business_name}-${badge}`}
                                  className="admin-priority-badge admin-priority-badge-high text-[10px]"
                                >
                                  {badge}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td>{lead.best_contact_method ?? "—"}</td>
                        <td>{lead.recommended_next_action ?? "—"}</td>
                        <td>
                          <div className="flex flex-col gap-1 text-xs">
                            <button
                              type="button"
                              className="admin-btn-primary text-xs"
                              disabled={creatingLeadForOppId === String(lead.id || lead.slug || "")}
                              onClick={async () => {
                                const opportunityId = String(lead.id || lead.slug || "").trim();
                                if (!opportunityId) {
                                  setPageError("Missing opportunity id.");
                                  return;
                                }
                                const created = await createLeadFromOpportunity(opportunityId);
                                if (!created?.leadId) return;
                                setScoutToast(created.created ? "Saved to your leads" : "Already in your leads");
                              }}
                            >
                              Add lead
                            </button>
                            <button
                              type="button"
                              className="admin-btn-ghost text-xs border border-[var(--admin-border)]"
                              disabled={creatingLeadForOppId === String(lead.id || lead.slug || "")}
                              onClick={async () => {
                                const opportunityId = String(lead.id || lead.slug || "").trim();
                                if (!opportunityId) return;
                                const created = await createLeadFromOpportunity(opportunityId);
                                if (!created?.leadId) return;
                                setScoutToast(created.created ? "Saved — opening workspace" : "Opening workspace");
                                await navigateLeadWithGuard(created.leadId, created.businessName);
                              }}
                            >
                              Open workspace
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </details>
          <div className="pt-2">
            <Link href="/admin/outreach" className="admin-btn-ghost inline-flex items-center gap-2 text-sm">
              <RefreshCw className="h-4 w-4" />
              Outreach queue
            </Link>
          </div>
        </section>
      )}
      {scoutToast ? (
        <div
          className="fixed bottom-4 right-4 z-[80] rounded-lg border px-4 py-3 text-sm shadow-lg max-w-xs"
          style={{
            background: "rgba(22, 101, 52, 0.95)",
            borderColor: "rgba(34, 197, 94, 0.5)",
            color: "#dcfce7",
          }}
          role="status"
        >
          {scoutToast}
        </div>
      ) : null}
    </div>
  );
}
