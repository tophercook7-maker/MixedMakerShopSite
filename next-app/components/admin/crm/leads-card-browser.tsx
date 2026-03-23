"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LeadsListReturnLink } from "@/components/admin/crm/leads-list-return-link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { buildLeadPath } from "@/lib/lead-route";
import { leadStatusClass, prettyLeadStatus } from "@/components/admin/lead-visuals";
import { LeadForm } from "@/components/admin/lead-form";
import { CRM_STAGE_LABELS, type CrmPipelineStage } from "@/lib/crm/stages";
import { patchLeadApi } from "@/lib/crm/patch-lead-client";
import { addBusinessDaysIso } from "@/lib/crm/business-days";
import {
  formatLeadSourceBadge,
  formatLeadSourceLine,
  leadMatchesSourceFilter,
  normalizeLeadSourceValue,
  resolvedCaptureSource,
  SOURCE_FILTER_OPTIONS,
  type SourceFilterTab,
} from "@/lib/crm/lead-source";
import {
  CRM_LEAD_LANES,
  CRM_LANE_LABELS,
  computePrimaryLeadLane,
  type CrmLeadLane,
  leadHasContactPath,
} from "@/lib/crm/lead-lane";
import { FOLDER_EMPTY_MESSAGES, parseFolderFromUrlParam, workflowLeadToFolderInput } from "@/lib/crm/lead-buckets";
import {
  FACEBOOK_NO_WEBSITE_REACHABLE_TARGET_PARAM,
  facebookNoWebsiteReachableMatchLine,
  matchesFacebookNoWebsiteReachable,
} from "@/lib/crm/facebook-no-website-reachable";
import { leadPrimaryActionHintLine, resolveLeadPrimaryAction } from "@/lib/crm/lead-primary-action";
import { WorkTheseNowStrip } from "@/components/admin/crm/work-these-now-strip";
import { buildMarkLeadRepliedPatch } from "@/lib/crm/mark-lead-replied";
import {
  isScoutSourceLead,
  isTopPickLead,
  matchesLeadPoolTab,
  parseLeadPoolTab,
  type LeadPoolTab,
} from "@/lib/crm/manual-pick-leads";
import { TopPicksStrip } from "@/components/admin/crm/top-picks-strip";
import { PromoteToTopPicksButton } from "@/components/admin/crm/promote-to-top-picks-button";

type SortKey = "created" | "score" | "follow_up" | "business";

function parseSortKeyFromParam(raw: string | null | undefined, fallback: SortKey): SortKey {
  const v = String(raw || "").trim().toLowerCase();
  if (v === "score" || v === "follow_up" || v === "business" || v === "created") return v;
  return fallback;
}

const STAGE_TABS: { id: "all" | CrmPipelineStage; label: string }[] = [
  { id: "all", label: "All" },
  ...(["new", "contacted", "replied", "qualified", "proposal_sent", "won", "lost"] as const).map((id) => ({
    id,
    label: CRM_STAGE_LABELS[id],
  })),
];

function fmtShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function websitePlain(lead: WorkflowLead): string {
  const ws = String(lead.website_status || "").toLowerCase();
  if (ws === "no_website") return "No website";
  if (ws === "live" || String(lead.website || "").trim()) return "Has website";
  return "Website unclear";
}

function phonePlain(lead: WorkflowLead): string {
  return String(lead.phone_from_site || "").trim() ? "Has phone" : "No phone";
}

function emailPlain(lead: WorkflowLead): string {
  return String(lead.email || "").trim() ? "Has email" : "No email";
}

function facebookPlain(lead: WorkflowLead): string {
  return String(lead.facebook_url || "").trim() ? "Has Facebook" : "No Facebook";
}

/** Scan-friendly order: email → Facebook → phone → website */
function contactSignalsLine(lead: WorkflowLead): string {
  return (
    lead.contact_signals_line ||
    `${emailPlain(lead)} · ${facebookPlain(lead)} · ${phonePlain(lead)} · ${websitePlain(lead)}`
  );
}

function parseLaneParam(raw: string | null | undefined): CrmLeadLane | "all" {
  return parseFolderFromUrlParam(raw);
}

function workflowLeadContactPath(lead: WorkflowLead): boolean {
  return leadHasContactPath({
    email: lead.email,
    phone: lead.phone_from_site,
    contact_page: lead.contact_page,
    facebook_url: lead.facebook_url,
  });
}

function effectiveCrmLane(lead: WorkflowLead): CrmLeadLane {
  return lead.crm_lane ?? computePrimaryLeadLane(workflowLeadToFolderInput(lead));
}

function opportunityLine(lead: WorkflowLead): string {
  const w = String(lead.why_this_lead_is_here || "").trim();
  const pick = w || String(lead.detected_issue_summary || "").trim();
  if (!pick || pick === "No website audit data yet") return "—";
  return pick.length > 88 ? `${pick.slice(0, 85)}…` : pick;
}

function folderBucketLine(lead: WorkflowLead): string {
  const label = lead.crm_lane_label || CRM_LANE_LABELS[effectiveCrmLane(lead)];
  return `Bucket: ${label}`;
}

function nextStepLine(lead: WorkflowLead): string {
  const raw = String(lead.lane_summary_line || "").trim();
  if (raw.startsWith("Next:")) return raw;
  const s = lead.simplified_next_step_crm;
  if (!s) return "—";
  const cap = s.charAt(0).toUpperCase() + s.slice(1);
  return `Next: ${cap}`;
}

async function logAutomation(leadId: string, event_type: string, payload: Record<string, unknown> = {}) {
  await fetch("/api/crm/automation-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lead_id: leadId, event_type, payload }),
  }).catch(() => {});
}

async function createReplyReminder(leadId: string, businessLabel: string) {
  const start = new Date();
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  await fetch("/api/calendar/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: `Reply: ${businessLabel}`,
      event_type: "reminder",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      notes: "They replied — follow up from your CRM.",
      is_blocking: false,
      lead_id: leadId,
    }),
  }).catch(() => {});
}

export function LeadsCardBrowser({
  initialLeads,
  emptyStateReason,
  initialAddOpen = false,
  initialDensity = "compact",
  initialHighlightLeadId = null,
  initialLane = null,
  initialSort = "created",
}: {
  initialLeads: WorkflowLead[];
  emptyStateReason: string;
  initialAddOpen?: boolean;
  initialDensity?: "compact" | "detailed";
  /** From `?highlight=` after extension save — brief pulse + scroll. */
  initialHighlightLeadId?: string | null;
  /** From `?lane=` — primary CRM bucket filter */
  initialLane?: string | null;
  /** From `?sort=` — list sort */
  initialSort?: SortKey;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearch = useSearchParams();
  const [leads, setLeads] = useState<WorkflowLead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [stageTab, setStageTab] = useState<(typeof STAGE_TABS)[number]["id"]>("all");
  const [sortKey, setSortKey] = useState<SortKey>(() => initialSort);
  const [hotOnly, setHotOnly] = useState(false);
  const [replyOnly, setReplyOnly] = useState(false);
  const [selected, setSelected] = useState<WorkflowLead | null>(null);
  const [adding, setAdding] = useState(initialAddOpen);
  const [density, setDensity] = useState<"compact" | "detailed">(initialDensity);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sourceTab, setSourceTab] = useState<SourceFilterTab>("all");
  const [pulseLeadId, setPulseLeadId] = useState<string | null>(null);
  const [laneTab, setLaneTab] = useState<CrmLeadLane | "all">(() => parseLaneParam(initialLane));

  const replaceUrlLane = (next: CrmLeadLane | "all") => {
    const p = new URLSearchParams(urlSearch?.toString() || "");
    if (next === "all") p.delete("lane");
    else p.set("lane", next);
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const replaceUrlTargetPreset = (next: "all" | "facebook_no_website_reachable") => {
    const p = new URLSearchParams(urlSearch?.toString() || "");
    if (next === "all") p.delete("target");
    else p.set("target", FACEBOOK_NO_WEBSITE_REACHABLE_TARGET_PARAM);
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const poolTab = parseLeadPoolTab(urlSearch?.get("pool"));

  const replaceUrlPool = (next: LeadPoolTab) => {
    const p = new URLSearchParams(urlSearch?.toString() || "");
    if (next === "all") p.delete("pool");
    else p.set("pool", next);
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const targetPresetActive =
    String(urlSearch?.get("target") || "")
      .trim()
      .toLowerCase() === FACEBOOK_NO_WEBSITE_REACHABLE_TARGET_PARAM;

  useEffect(() => {
    setLaneTab(parseLaneParam(urlSearch?.get("lane")));
  }, [urlSearch?.toString()]);

  useEffect(() => {
    const raw = urlSearch?.get("sort");
    setSortKey(parseSortKeyFromParam(raw, initialSort));
  }, [urlSearch?.toString(), initialSort]);

  useEffect(() => {
    if (!urlSearch?.has("density")) return;
    const d = String(urlSearch?.get("density") || "").trim().toLowerCase();
    setDensity(d === "detailed" ? "detailed" : "compact");
  }, [urlSearch?.toString()]);

  const replaceUrlSort = (next: SortKey) => {
    const p = new URLSearchParams(urlSearch?.toString() || "");
    if (next === "created") p.delete("sort");
    else p.set("sort", next);
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const replaceUrlDensity = (next: "compact" | "detailed") => {
    const p = new URLSearchParams(urlSearch?.toString() || "");
    if (next === "compact") p.delete("density");
    else p.set("density", "detailed");
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  useEffect(() => {
    if (urlSearch?.get("deleted") !== "1") return;
    setToast("Lead deleted");
    const p = new URLSearchParams(urlSearch.toString());
    p.delete("deleted");
    const next = p.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [urlSearch, pathname, router]);

  useEffect(() => {
    const id = String(initialHighlightLeadId || "").trim();
    if (!id) return;
    setPulseLeadId(id);
    const scrollT = window.setTimeout(() => {
      document.getElementById(`lead-card-${id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 120);
    const url = typeof window !== "undefined" ? new URL(window.location.href) : null;
    if (url?.searchParams.has("highlight")) {
      url.searchParams.delete("highlight");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
    const clearT = window.setTimeout(() => setPulseLeadId(null), 5500);
    return () => {
      window.clearTimeout(scrollT);
      window.clearTimeout(clearT);
    };
  }, [initialHighlightLeadId]);

  const pooledLeads = useMemo(() => leads.filter((l) => matchesLeadPoolTab(l, poolTab)), [leads, poolTab]);

  const listBase = useMemo(() => {
    if (!targetPresetActive) return pooledLeads;
    return pooledLeads.filter(matchesFacebookNoWebsiteReachable);
  }, [pooledLeads, targetPresetActive]);

  const presetMatchCount = useMemo(() => leads.filter(matchesFacebookNoWebsiteReachable).length, [leads]);

  const poolCounts = useMemo(
    () => ({
      all: leads.length,
      top_picks: leads.filter(isTopPickLead).length,
      scout: leads.filter(isScoutSourceLead).length,
    }),
    [leads]
  );

  const topPickStripLeads = useMemo(() => {
    return [...leads]
      .filter(isTopPickLead)
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 24);
  }, [leads]);

  const laneCounts = useMemo(() => {
    const c = {} as Record<CrmLeadLane, number>;
    for (const id of CRM_LEAD_LANES) c[id] = 0;
    for (const l of listBase) {
      const k = effectiveCrmLane(l);
      if (k in c) c[k] += 1;
    }
    return c;
  }, [listBase]);

  const sourceTabEffective: SourceFilterTab = poolTab !== "all" ? "all" : sourceTab;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sortKeyEffective = sourceTabEffective === "extension" ? "created" : sortKey;
    return [...listBase]
      .filter((l) => {
        if (laneTab !== "all" && effectiveCrmLane(l) !== laneTab) return false;
        if (stageTab !== "all" && l.status !== stageTab) return false;
        if (!leadMatchesSourceFilter(l, sourceTabEffective)) return false;
        if (hotOnly && !l.is_hot_lead) return false;
        if (replyOnly && !(Number(l.unread_reply_count) > 0) && !String(l.last_reply_preview || "").trim()) return false;
        if (!q) return true;
        const hay = [
          l.business_name,
          l.known_owner_name,
          l.email,
          l.phone_from_site,
          l.website,
          l.city,
          l.category,
          l.last_reply_preview,
          formatLeadSourceLine(l),
          l.lead_source,
          l.source,
        ]
          .map((v) => String(v || "").toLowerCase())
          .join(" ");
        return hay.includes(q);
      })
      .sort((a, b) => {
        const repA = a.status === "replied" ? 1 : 0;
        const repB = b.status === "replied" ? 1 : 0;
        if (repA !== repB) return repB - repA;
        if (sortKeyEffective === "score") return Number(b.conversion_score || 0) - Number(a.conversion_score || 0);
        if (sortKeyEffective === "business") return a.business_name.localeCompare(b.business_name);
        if (sortKeyEffective === "follow_up") {
          const at = a.next_follow_up_at ? new Date(a.next_follow_up_at).getTime() : Infinity;
          const bt = b.next_follow_up_at ? new Date(b.next_follow_up_at).getTime() : Infinity;
          return at - bt;
        }
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [listBase, search, stageTab, sourceTabEffective, sortKey, hotOnly, replyOnly, laneTab]);

  const patchLead = async (leadId: string, patch: Record<string, unknown>, okMsg: string, log?: string) => {
    setBusyId(leadId);
    const r = await patchLeadApi(leadId, patch);
    setBusyId(null);
    if (!r.ok) {
      setToast(r.error);
      return;
    }
    setToast(okMsg);
    if (log) void logAutomation(leadId, log, {});
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        const next = { ...l } as WorkflowLead;
        if (typeof patch.status === "string") next.status = patch.status as WorkflowLead["status"];
        if ("next_follow_up_at" in patch) next.next_follow_up_at = String(patch.next_follow_up_at || "") || null;
        if (patch.automation_paused === true) (next as { automation_paused?: boolean }).automation_paused = true;
        if (typeof patch.last_reply_preview === "string")
          next.last_reply_preview = String(patch.last_reply_preview || "").trim() || null;
        if (typeof patch.last_reply_at === "string")
          (next as { last_reply_at?: string | null }).last_reply_at = String(patch.last_reply_at || "").trim() || null;
        if (typeof patch.unread_reply_count === "number" && Number.isFinite(patch.unread_reply_count)) {
          next.unread_reply_count = Math.max(0, patch.unread_reply_count);
        }
        return next;
      })
    );
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {toast ? (
        <div
          role="status"
          className="rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--admin-border)", color: "var(--admin-muted)" }}
        >
          {toast}
          <button type="button" className="ml-2 underline text-xs" onClick={() => setToast(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <section
        className="rounded-xl border-2 p-4 sm:p-5 space-y-3"
        style={{
          borderColor: "rgba(52, 211, 153, 0.4)",
          background: "linear-gradient(160deg, rgba(52, 211, 153, 0.08), rgba(0,0,0,0.22))",
        }}
        aria-label="Lead pool"
      >
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-300/90">Working set</p>
          <p className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
            All leads · Top Picks · Scout
          </p>
          <p className="text-xs max-w-xl leading-snug" style={{ color: "var(--admin-muted)" }}>
            <strong className="text-emerald-200/90">Top Picks</strong> is your hand-picked list (<code className="text-[10px] opacity-90">manual_pick</code>
            ). <strong className="text-sky-200/85">Scout</strong> is discovery-only — it never mixes into Top Picks unless you promote a lead.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center" role="tablist" aria-label="Lead pool filter">
          <button
            type="button"
            role="tab"
            aria-selected={poolTab === "all"}
            className={
              poolTab === "all"
                ? "admin-btn-primary text-sm px-4 py-2.5 rounded-lg ring-2 ring-emerald-400/70 ring-offset-2 ring-offset-[rgba(0,0,0,0.35)]"
                : "admin-btn-ghost text-sm px-4 py-2.5 rounded-lg border border-[var(--admin-border)]"
            }
            onClick={() => replaceUrlPool("all")}
          >
            All leads ({poolCounts.all})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={poolTab === "top_picks"}
            className={
              poolTab === "top_picks"
                ? "admin-btn-primary text-sm px-4 py-2.5 rounded-lg ring-2 ring-emerald-400/70 ring-offset-2 ring-offset-[rgba(0,0,0,0.35)]"
                : "admin-btn-ghost text-sm px-4 py-2.5 rounded-lg border border-emerald-500/40"
            }
            onClick={() => replaceUrlPool("top_picks")}
          >
            Top Picks ({poolCounts.top_picks})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={poolTab === "scout"}
            className={
              poolTab === "scout"
                ? "admin-btn-primary text-sm px-4 py-2.5 rounded-lg ring-2 ring-sky-400/60 ring-offset-2 ring-offset-[rgba(0,0,0,0.35)]"
                : "admin-btn-ghost text-sm px-4 py-2.5 rounded-lg border border-sky-500/35"
            }
            onClick={() => replaceUrlPool("scout")}
          >
            Scout leads ({poolCounts.scout})
          </button>
        </div>
      </section>

      {poolTab === "all" ? <TopPicksStrip leads={topPickStripLeads} /> : null}

      <section
        className={`rounded-xl border-2 p-4 sm:p-5 space-y-3 shadow-[0_0_28px_rgba(59,130,246,0.12)] ${
          targetPresetActive ? "ring-2 ring-blue-400/50 ring-offset-2 ring-offset-[rgba(0,0,0,0.4)]" : ""
        }`}
        style={{
          borderColor: targetPresetActive ? "rgba(59, 130, 246, 0.55)" : "rgba(212, 175, 55, 0.35)",
          background: targetPresetActive
            ? "linear-gradient(145deg, rgba(59, 130, 246, 0.12), rgba(0,0,0,0.32))"
            : "rgba(0,0,0,0.2)",
        }}
        aria-label="Target market preset"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--admin-gold)" }}>
              Targeting
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
              Target market
            </p>
            <p className="text-xs max-w-xl leading-snug" style={{ color: "var(--admin-muted)" }}>
              {targetPresetActive ? (
                <>
                  <span aria-hidden>🔥</span> Facebook leads with no website and a way to reach them.
                </>
              ) : (
                <>All leads, or switch to Facebook No-Website Reachable.</>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center" role="tablist" aria-label="Target preset">
          <button
            type="button"
            role="tab"
            aria-selected={!targetPresetActive}
            className={
              !targetPresetActive
                ? "admin-btn-primary text-sm px-4 py-2.5 rounded-lg ring-2 ring-[var(--admin-gold)]/80 ring-offset-2 ring-offset-[rgba(0,0,0,0.35)]"
                : "admin-btn-ghost text-sm px-4 py-2.5 rounded-lg border border-[var(--admin-border)]"
            }
            onClick={() => replaceUrlTargetPreset("all")}
          >
            All leads ({leads.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={targetPresetActive}
            className={
              targetPresetActive
                ? "admin-btn-primary text-sm px-4 py-2.5 rounded-lg ring-2 ring-blue-400/70 ring-offset-2 ring-offset-[rgba(0,0,0,0.35)] shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                : "admin-btn-ghost text-sm px-4 py-2.5 rounded-lg border border-blue-500/35 text-blue-100 hover:border-blue-400/50"
            }
            onClick={() => replaceUrlTargetPreset("facebook_no_website_reachable")}
          >
            <span className="inline-flex items-center gap-2">
              <span aria-hidden>📘</span>
              Facebook No-Website Reachable
              <span className="text-xs font-normal opacity-90">({presetMatchCount})</span>
            </span>
          </button>
        </div>
      </section>

      <WorkTheseNowStrip leads={listBase} />

      <section
        className="rounded-xl border-2 p-4 space-y-3"
        style={{ borderColor: "rgba(212, 175, 55, 0.45)", background: "rgba(0,0,0,0.22)" }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--admin-gold)" }}>
            Lead folders
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
            {targetPresetActive
              ? "Folders narrow the targeting list — counts only include Facebook No-Website Reachable leads."
              : "Open a folder to focus the list — counts use every lead loaded below (before this folder filter)."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Lead folders">
          <button
            type="button"
            className={
              laneTab === "all"
                ? "admin-btn-primary text-xs px-3 py-2 rounded-lg ring-2 ring-[var(--admin-gold)]/85 ring-offset-2 ring-offset-[rgba(0,0,0,0.35)] shadow-md"
                : "admin-btn-ghost text-xs px-3 py-2 rounded-lg border border-[var(--admin-border)]"
            }
            onClick={() => {
              setLaneTab("all");
              replaceUrlLane("all");
            }}
          >
            All ({listBase.length})
          </button>
          {CRM_LEAD_LANES.map((id) => (
            <button
              key={id}
              type="button"
              className={
                laneTab === id
                  ? "admin-btn-primary text-xs px-3 py-2 rounded-lg ring-2 ring-[var(--admin-gold)]/85 ring-offset-2 ring-offset-[rgba(0,0,0,0.35)] shadow-md"
                  : "admin-btn-ghost text-xs px-3 py-2 rounded-lg border border-[var(--admin-border)]"
              }
              onClick={() => {
                setLaneTab(id);
                replaceUrlLane(id);
              }}
            >
              {CRM_LANE_LABELS[id]} ({laneCounts[id] ?? 0})
            </button>
          ))}
        </div>
      </section>

      <div className="admin-card flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-semibold block mb-1" style={{ color: "var(--admin-muted)" }}>
            Search
          </label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.2)", color: "var(--admin-fg)" }}
            placeholder="Business, email, phone, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: "var(--admin-muted)" }}>
            Sort
          </label>
          <select
            aria-label="Sort leads"
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.2)", color: "var(--admin-fg)" }}
            value={sortKey}
            onChange={(e) => {
              const v = e.target.value as SortKey;
              setSortKey(v);
              replaceUrlSort(v);
            }}
          >
            <option value="created">Newest</option>
            <option value="score">Opportunity score</option>
            <option value="follow_up">Follow-up date</option>
            <option value="business">Business A–Z</option>
          </select>
        </div>
        <div
          className="inline-flex rounded-lg border p-0.5 gap-0.5"
          style={{ borderColor: "var(--admin-border)" }}
          role="group"
          aria-label="Card density"
        >
          <button
            type="button"
            className={density === "compact" ? "admin-btn-primary text-xs px-2 py-1.5 rounded-md" : "admin-btn-ghost text-xs px-2 py-1.5 rounded-md"}
            onClick={() => {
              setDensity("compact");
              replaceUrlDensity("compact");
            }}
          >
            Compact
          </button>
          <button
            type="button"
            className={density === "detailed" ? "admin-btn-primary text-xs px-2 py-1.5 rounded-md" : "admin-btn-ghost text-xs px-2 py-1.5 rounded-md"}
            onClick={() => {
              setDensity("detailed");
              replaceUrlDensity("detailed");
            }}
          >
            Detailed
          </button>
        </div>
        <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--admin-fg)" }}>
          <input type="checkbox" checked={hotOnly} onChange={(e) => setHotOnly(e.target.checked)} />
          Hot only
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--admin-fg)" }}>
          <input type="checkbox" checked={replyOnly} onChange={(e) => setReplyOnly(e.target.checked)} />
          Has reply preview
        </label>
        <div className="w-full min-w-[200px]">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0 mb-1">
            <span className="text-xs font-semibold" style={{ color: "var(--admin-muted)" }}>
              Source{poolTab !== "all" ? " (use All leads pool to refine by source)" : ""}
            </span>
            <button
              type="button"
              className="text-xs underline decoration-[var(--admin-gold)]/70 underline-offset-2"
              style={{ color: "var(--admin-gold)" }}
              onClick={() => setSourceTab("extension")}
            >
              Extension captures
            </button>
          </div>
          <select
            aria-label="Filter by lead source"
            className="w-full max-w-xs rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.2)", color: "var(--admin-fg)" }}
            value={sourceTabEffective}
            disabled={poolTab !== "all"}
            onChange={(e) => setSourceTab(e.target.value as SourceFilterTab)}
          >
            {SOURCE_FILTER_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="admin-btn-primary text-sm" onClick={() => setAdding(true)}>
          Add business
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STAGE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={stageTab === t.id ? "admin-btn-primary text-xs" : "admin-btn-ghost text-xs"}
            onClick={() => setStageTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {adding ? (
        <section className="admin-card">
          <LeadForm
            onClose={() => setAdding(false)}
            onSave={async (payload) => {
              const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              if (res.ok) {
                window.location.reload();
                return true;
              }
              return false;
            }}
          />
        </section>
      ) : null}

      <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
        These are businesses you saved. Open one to work it.
      </p>

      {filtered.length === 0 ? (
        <section className="admin-card space-y-2">
          <p className="text-sm font-medium" style={{ color: "var(--admin-fg)" }}>
            {leads.length === 0
              ? emptyStateReason || "No leads match filters."
              : poolTab === "top_picks" && poolCounts.top_picks === 0
                ? "You don’t have any Top Picks yet. Import hand-picked leads (Admin tools → Import Top Picks JSON) or promote a lead with “Add to Top Picks.”"
                : poolTab === "scout" && poolCounts.scout === 0
                  ? "No Scout-sourced leads in your workspace yet. Use Find businesses to add some, or switch to All leads."
                  : pooledLeads.length === 0 && poolTab !== "all"
                    ? "No leads in this pool."
                    : targetPresetActive && presetMatchCount === 0
                      ? "No leads match Facebook No-Website Reachable — add extension captures from Facebook or scout Facebook leads without a standalone site."
                      : targetPresetActive && listBase.length > 0 && laneTab !== "all" && (laneCounts[laneTab] ?? 0) === 0
                        ? FOLDER_EMPTY_MESSAGES[laneTab]
                        : targetPresetActive && listBase.length > 0 && laneTab !== "all"
                          ? "No leads in this folder match your search or status filters."
                          : targetPresetActive && listBase.length > 0
                            ? "No leads match your search or status filters in this targeting mode."
                            : laneTab !== "all" && (laneCounts[laneTab] ?? 0) === 0
                              ? FOLDER_EMPTY_MESSAGES[laneTab]
                              : laneTab !== "all"
                                ? "No leads in this folder match your search or status filters."
                                : "No leads match filters."}
          </p>
          {leads.length === 0 && emptyStateReason ? (
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
              Go to <Link href="/admin/scout" className="text-[var(--admin-gold)] underline">Find businesses</Link> and add a few leads to get started.
            </p>
          ) : poolTab === "top_picks" && poolCounts.top_picks === 0 ? (
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
              Open <strong className="text-emerald-200/90">Admin tools</strong> on this page and use{" "}
              <strong className="text-emerald-200/90">Import Top Picks (JSON)</strong>, or open any lead and choose{" "}
              <strong className="text-emerald-200/90">Add to Top Picks</strong>.
            </p>
          ) : null}
        </section>
      ) : density === "compact" ? (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 list-none p-0 m-0">
          {filtered.map((lead) => {
            const busy = busyId === lead.id;
            const unreadN = Number(lead.unread_reply_count || 0);
            const extensionCapture =
              normalizeLeadSourceValue(resolvedCaptureSource(lead)) === "extension";
            const pulse = pulseLeadId === lead.id;
            const canQuickContact = workflowLeadContactPath(lead);
            const workspaceHref = buildLeadPath(lead.id, lead.business_name);
            const primaryAction = resolveLeadPrimaryAction(lead, { workspaceHref });
            return (
              <li
                id={`lead-card-${lead.id}`}
                key={lead.id}
                className={`rounded-lg border p-3 flex flex-col gap-2 ${extensionCapture ? "border-l-[3px] border-l-[var(--admin-gold)]" : ""} ${pulse ? "ring-1 ring-[var(--admin-gold)]/55 shadow-[0_0_14px_rgba(212,175,55,0.22)]" : ""} ${lead.status === "replied" ? "ring-1 ring-emerald-500/40 shadow-[0_0_12px_rgba(34,197,94,0.12)]" : ""}`}
                style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.12)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    className="text-left font-semibold text-sm leading-tight hover:underline"
                    style={{ color: "var(--admin-fg)" }}
                    onClick={() => setSelected(lead)}
                  >
                    {lead.business_name}
                  </button>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${leadStatusClass(lead.status)}`}>
                    {prettyLeadStatus(lead.status)}
                  </span>
                </div>
                <p className="text-[10px] leading-snug opacity-90" style={{ color: "var(--admin-muted)" }}>
                  {folderBucketLine(lead)}
                </p>
                <p className="text-[10px] leading-snug font-medium" style={{ color: "var(--admin-fg)" }}>
                  {nextStepLine(lead)}
                </p>
                {targetPresetActive ? (
                  <p className="text-[10px] font-medium leading-snug text-emerald-200/90">
                    {leadPrimaryActionHintLine(primaryAction)}
                  </p>
                ) : null}
                {targetPresetActive ? (
                  <p className="text-[10px] font-semibold leading-snug text-blue-200/95" title="Why this lead matches the preset">
                    {facebookNoWebsiteReachableMatchLine(lead)}
                  </p>
                ) : null}
                <p className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
                  {lead.city || "—"}
                </p>
                <p className="text-[10px] font-medium leading-snug" style={{ color: "var(--admin-fg)" }}>
                  {contactSignalsLine(lead)}
                </p>
                <p className="text-[10px] leading-snug opacity-80" style={{ color: "var(--admin-muted)" }}>
                  {formatLeadSourceBadge(lead)}
                </p>
                <p className="text-xs line-clamp-2" style={{ color: "var(--admin-fg)" }}>
                  {opportunityLine(lead)}
                </p>
                {lead.status === "replied" && lead.last_reply_preview ? (
                  <p className="text-[11px] font-medium text-emerald-100/90 line-clamp-2">
                    Reply: {String(lead.last_reply_preview).replace(/\s+/g, " ").trim().slice(0, 140)}
                    {String(lead.last_reply_preview).length > 140 ? "…" : ""}
                  </p>
                ) : null}
                {unreadN > 0 ? (
                  <p className="text-[11px] font-medium text-rose-200">
                    {unreadN} unread {unreadN === 1 ? "reply" : "replies"}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2 mt-auto pt-1 items-center">
                  {targetPresetActive ? (
                    <>
                      {primaryAction.type === "research" ? (
                        <LeadsListReturnLink
                          href={workspaceHref}
                          className="admin-btn-primary text-xs px-3 py-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {primaryAction.label}
                        </LeadsListReturnLink>
                      ) : primaryAction.href ? (
                        <>
                          <a
                            href={primaryAction.href}
                            className="admin-btn-primary text-xs px-3 py-2"
                            onClick={(e) => e.stopPropagation()}
                            {...(primaryAction.external
                              ? { target: "_blank" as const, rel: "noopener noreferrer" }
                              : {})}
                          >
                            {primaryAction.label}
                          </a>
                          {primaryAction.secondary?.href ? (
                            <a
                              href={primaryAction.secondary.href}
                              className="text-[10px] underline underline-offset-2 opacity-80 hover:opacity-100 px-1"
                              style={{ color: "var(--admin-muted)" }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {primaryAction.secondary.label}
                            </a>
                          ) : null}
                        </>
                      ) : (
                        <LeadsListReturnLink
                          href={workspaceHref}
                          className="admin-btn-primary text-xs px-3 py-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Open
                        </LeadsListReturnLink>
                      )}
                      {primaryAction.type !== "research" && primaryAction.href ? (
                        <LeadsListReturnLink
                          href={workspaceHref}
                          className="text-[10px] underline underline-offset-2 opacity-80 hover:opacity-100 px-1"
                          style={{ color: "var(--admin-muted)" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Open
                        </LeadsListReturnLink>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <LeadsListReturnLink
                        href={workspaceHref}
                        className="admin-btn-primary text-xs px-2 py-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open
                      </LeadsListReturnLink>
                      {canQuickContact ? (
                        <button
                          type="button"
                          className="admin-btn-ghost text-xs px-2 py-1.5 border border-[var(--admin-border)]"
                          disabled={busy}
                          onClick={() => {
                            const next =
                              lead.next_follow_up_at && String(lead.next_follow_up_at).trim()
                                ? undefined
                                : addBusinessDaysIso(new Date(), 3);
                            const patch: Record<string, unknown> = { status: "contacted", automation_paused: false };
                            if (next) patch.next_follow_up_at = next;
                            void patchLead(
                              lead.id,
                              patch,
                              next ? "Marked contacted — follow-up scheduled." : "Marked contacted.",
                              "mark_contacted"
                            );
                          }}
                        >
                          Contacted
                        </button>
                      ) : null}
                      {lead.status !== "replied" ? (
                        <button
                          type="button"
                          className="admin-btn-ghost text-xs px-2 py-1.5 border border-emerald-500/35 text-emerald-100"
                          disabled={busy}
                          onClick={async () => {
                            setBusyId(lead.id);
                            const r = await patchLeadApi(
                              lead.id,
                              buildMarkLeadRepliedPatch({
                                currentUnread: lead.unread_reply_count,
                                alreadyReplied: false,
                              })
                            );
                            setBusyId(null);
                            if (!r.ok) {
                              setToast(r.error);
                              return;
                            }
                            void createReplyReminder(lead.id, lead.business_name || "Lead");
                            void logAutomation(lead.id, "mark_replied", {});
                            setToast("Marked as replied.");
                            setLeads((prev) =>
                              prev.map((l) =>
                                l.id === lead.id
                                  ? ({
                                      ...l,
                                      status: "replied",
                                      unread_reply_count: Math.max(0, Number(lead.unread_reply_count || 0)) + 1,
                                    } as WorkflowLead)
                                  : l
                              )
                            );
                            router.refresh();
                          }}
                        >
                          Mark replied
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="admin-btn-ghost text-xs px-2 py-1.5 border border-[var(--admin-border)]"
                        disabled={busy}
                        onClick={() => {
                          void patchLead(
                            lead.id,
                            { next_follow_up_at: addBusinessDaysIso(new Date(), 3) },
                            "Follow-up scheduled.",
                            "schedule_follow_up"
                          );
                        }}
                      >
                        Follow up
                      </button>
                      <PromoteToTopPicksButton
                        leadId={lead.id}
                        initialTags={lead.lead_tags}
                        isTopPick={isTopPickLead(lead)}
                        className="admin-btn-ghost text-xs px-2 py-1.5 border border-emerald-500/35"
                      />
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lead) => {
            const busy = busyId === lead.id;
            const unreadN = Number(lead.unread_reply_count || 0);
            const extensionCapture =
              normalizeLeadSourceValue(resolvedCaptureSource(lead)) === "extension";
            const pulse = pulseLeadId === lead.id;
            const canQuickContact = workflowLeadContactPath(lead);
            const workspaceHrefDetailed = buildLeadPath(lead.id, lead.business_name);
            const primaryActionDetailed = resolveLeadPrimaryAction(lead, { workspaceHref: workspaceHrefDetailed });
            return (
              <div
                id={`lead-card-${lead.id}`}
                key={lead.id}
                className={`admin-card text-left w-full ${extensionCapture ? "border-l-[3px] border-l-[var(--admin-gold)]" : ""} ${pulse ? "ring-1 ring-[var(--admin-gold)]/55 shadow-[0_0_14px_rgba(212,175,55,0.22)]" : ""} ${lead.status === "replied" ? "ring-1 ring-emerald-500/40 shadow-[0_0_12px_rgba(34,197,94,0.12)]" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => setSelected(lead)}
                  >
                    <p className="font-semibold text-base" style={{ color: "var(--admin-fg)" }}>
                      {lead.business_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
                      {lead.city || "—"}
                      {lead.category ? ` · ${lead.category}` : ""}
                    </p>
                  </button>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${leadStatusClass(lead.status)}`}>
                    {prettyLeadStatus(lead.status)}
                  </span>
                </div>
                <p className="text-[10px] mt-2 opacity-90" style={{ color: "var(--admin-muted)" }}>
                  {folderBucketLine(lead)}
                </p>
                <p className="text-[10px] mt-0.5 font-medium" style={{ color: "var(--admin-fg)" }}>
                  {nextStepLine(lead)}
                </p>
                {targetPresetActive ? (
                  <p className="text-[10px] mt-1 font-medium text-emerald-200/90">
                    {leadPrimaryActionHintLine(primaryActionDetailed)}
                  </p>
                ) : null}
                {targetPresetActive ? (
                  <p className="text-[10px] mt-1 font-semibold text-blue-200/95" title="Why this lead matches the preset">
                    {facebookNoWebsiteReachableMatchLine(lead)}
                  </p>
                ) : null}
                <p className="text-[11px] mt-2 font-medium" style={{ color: "var(--admin-fg)" }}>
                  {contactSignalsLine(lead)}
                  {unreadN > 0 ? ` · ${unreadN} unread` : ""}
                </p>
                <p className="text-[11px] mt-1" style={{ color: "var(--admin-muted)" }}>
                  {formatLeadSourceBadge(lead)}
                </p>
                <p className="text-xs mt-2 line-clamp-3" style={{ color: "var(--admin-fg)" }}>
                  {opportunityLine(lead)}
                </p>
                <dl className="mt-3 space-y-1 text-xs" style={{ color: "var(--admin-muted)" }}>
                  <div className="flex justify-between gap-2">
                    <dt>Email</dt>
                    <dd className="text-right truncate max-w-[60%]" style={{ color: "var(--admin-fg)" }}>
                      {lead.email || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Facebook</dt>
                    <dd className="text-right truncate max-w-[60%]" style={{ color: "var(--admin-fg)" }}>
                      {lead.facebook_url ? (
                        <a href={lead.facebook_url} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline">
                          Open
                        </a>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Phone</dt>
                    <dd className="text-right" style={{ color: "var(--admin-fg)" }}>
                      {lead.phone_from_site || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Website</dt>
                    <dd className="text-right truncate max-w-[60%]" style={{ color: "var(--admin-fg)" }}>
                      {lead.website || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Next follow-up</dt>
                    <dd style={{ color: "var(--admin-fg)" }}>{fmtShort(lead.next_follow_up_at)}</dd>
                  </div>
                </dl>
                {lead.last_reply_preview ? (
                  <p className="text-xs mt-3 line-clamp-2 border-t border-white/10 pt-2 text-emerald-100/90">
                    Reply: {String(lead.last_reply_preview).replace(/\s+/g, " ").trim()}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  {targetPresetActive ? (
                    <>
                      {primaryActionDetailed.type === "research" ? (
                        <LeadsListReturnLink href={workspaceHrefDetailed} className="admin-btn-primary text-xs px-3 py-2">
                          {primaryActionDetailed.label}
                        </LeadsListReturnLink>
                      ) : primaryActionDetailed.href ? (
                        <>
                          <a
                            href={primaryActionDetailed.href}
                            className="admin-btn-primary text-xs px-3 py-2"
                            {...(primaryActionDetailed.external
                              ? { target: "_blank" as const, rel: "noopener noreferrer" }
                              : {})}
                          >
                            {primaryActionDetailed.label}
                          </a>
                          {primaryActionDetailed.secondary?.href ? (
                            <a
                              href={primaryActionDetailed.secondary.href}
                              className="text-[10px] underline underline-offset-2 opacity-80 hover:opacity-100"
                              style={{ color: "var(--admin-muted)" }}
                            >
                              {primaryActionDetailed.secondary.label}
                            </a>
                          ) : null}
                        </>
                      ) : (
                        <LeadsListReturnLink href={workspaceHrefDetailed} className="admin-btn-primary text-xs px-3 py-2">
                          Open
                        </LeadsListReturnLink>
                      )}
                      {primaryActionDetailed.type !== "research" && primaryActionDetailed.href ? (
                        <LeadsListReturnLink
                          href={workspaceHrefDetailed}
                          className="text-[10px] underline underline-offset-2 opacity-80 hover:opacity-100"
                          style={{ color: "var(--admin-muted)" }}
                        >
                          Open
                        </LeadsListReturnLink>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <LeadsListReturnLink href={workspaceHrefDetailed} className="admin-btn-primary text-xs">
                        Open
                      </LeadsListReturnLink>
                      {canQuickContact ? (
                        <button
                          type="button"
                          className="admin-btn-ghost text-xs border border-[var(--admin-border)]"
                          disabled={busy}
                          onClick={() => {
                            const next =
                              lead.next_follow_up_at && String(lead.next_follow_up_at).trim()
                                ? undefined
                                : addBusinessDaysIso(new Date(), 3);
                            const patch: Record<string, unknown> = { status: "contacted", automation_paused: false };
                            if (next) patch.next_follow_up_at = next;
                            void patchLead(lead.id, patch, next ? "Marked contacted." : "Marked contacted.", "mark_contacted");
                          }}
                        >
                          Contacted
                        </button>
                      ) : null}
                      {lead.status !== "replied" ? (
                        <button
                          type="button"
                          className="admin-btn-ghost text-xs border border-emerald-500/35 text-emerald-100"
                          disabled={busy}
                          onClick={async () => {
                            setBusyId(lead.id);
                            const r = await patchLeadApi(
                              lead.id,
                              buildMarkLeadRepliedPatch({
                                currentUnread: lead.unread_reply_count,
                                alreadyReplied: false,
                              })
                            );
                            setBusyId(null);
                            if (!r.ok) {
                              setToast(r.error);
                              return;
                            }
                            void createReplyReminder(lead.id, lead.business_name || "Lead");
                            void logAutomation(lead.id, "mark_replied", {});
                            setToast("Marked as replied.");
                            setLeads((prev) =>
                              prev.map((l) =>
                                l.id === lead.id
                                  ? ({
                                      ...l,
                                      status: "replied",
                                      unread_reply_count: Math.max(0, Number(lead.unread_reply_count || 0)) + 1,
                                    } as WorkflowLead)
                                  : l
                              )
                            );
                            router.refresh();
                          }}
                        >
                          Mark replied
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="admin-btn-ghost text-xs border border-[var(--admin-border)]"
                        disabled={busy}
                        onClick={() => {
                          void patchLead(
                            lead.id,
                            { next_follow_up_at: addBusinessDaysIso(new Date(), 3) },
                            "Follow-up scheduled.",
                            "schedule_follow_up"
                          );
                        }}
                      >
                        Follow up
                      </button>
                      <PromoteToTopPicksButton
                        leadId={lead.id}
                        initialTags={lead.lead_tags}
                        isTopPick={isTopPickLead(lead)}
                        className="admin-btn-ghost text-xs border border-emerald-500/35"
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60"
          role="dialog"
          aria-modal
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg h-full overflow-y-auto admin-card rounded-none border-l"
            style={{ borderColor: "var(--admin-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-lg font-bold" style={{ color: "var(--admin-fg)" }}>
                {selected.business_name}
              </h2>
              <button type="button" className="admin-btn-ghost text-xs" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--admin-muted)" }}>
              Scores, full notes, and outreach tools are on the workspace page.
            </p>
            <dl className="space-y-2 text-sm" style={{ color: "var(--admin-muted)" }}>
              <div>
                <dt className="text-xs uppercase tracking-wide">Status</dt>
                <dd className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${leadStatusClass(selected.status)}`}>
                  {prettyLeadStatus(selected.status)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Why they’re here</dt>
                <dd style={{ color: "var(--admin-fg)" }} className="mt-1">
                  {opportunityLine(selected)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Contact</dt>
                <dd style={{ color: "var(--admin-fg)" }} className="mt-1">
                  {selected.known_owner_name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Email / Phone</dt>
                <dd style={{ color: "var(--admin-fg)" }} className="mt-1">
                  {selected.email || "—"} · {selected.phone_from_site || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Website</dt>
                <dd style={{ color: "var(--admin-fg)" }} className="mt-1 break-all">
                  {selected.website || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide">Notes</dt>
                <dd style={{ color: "var(--admin-fg)" }} className="mt-1 whitespace-pre-wrap">
                  {(selected.notes || []).join("\n") || "—"}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              <LeadsListReturnLink href={buildLeadPath(selected.id, selected.business_name)} className="admin-btn-primary text-sm">
                Open workspace
              </LeadsListReturnLink>
              <Link href={`/admin/conversations?leadId=${encodeURIComponent(selected.id)}`} className="admin-btn-ghost text-sm">
                Conversation
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
