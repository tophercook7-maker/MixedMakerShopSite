"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LeadsListReturnLink } from "@/components/admin/crm/leads-list-return-link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { buildLeadPath } from "@/lib/lead-route";
import { leadStatusClass } from "@/components/admin/lead-visuals";
import { LeadForm } from "@/components/admin/lead-form";
import { CRM_PIPELINE_STAGES, CRM_STAGE_LABELS, type CrmPipelineStage } from "@/lib/crm/stages";
import { patchLeadApi } from "@/lib/crm/patch-lead-client";
import { applyWorkflowLeadPatch } from "@/lib/crm/apply-workflow-lead-patch";
import { simpleLeadStatusLabel } from "@/lib/crm/simple-lead-status-ui";
import { LeadServiceTypeBadge, resolveServiceTypeForDisplay } from "@/components/admin/crm/lead-service-type-badge";
import { LeadWorkflowDrawer } from "@/components/admin/crm/lead-workflow-drawer";
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
import { outreachScriptLabel, resolveOutreachScriptNiche } from "@/lib/crm-utils";
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
import { DailyTenStrip } from "@/components/admin/crm/daily-ten-strip";
import { PromoteToTopPicksButton } from "@/components/admin/crm/promote-to-top-picks-button";
import { ThreeDPrintKanban } from "@/components/admin/crm/three-d-print-kanban";
import { ThreeDPrintLeadsList } from "@/components/admin/crm/three-d-print-leads-list";
import { ThreeDPrintRequestsTable } from "@/components/admin/crm/three-d-print-requests-table";
import { QuotedPaymentRequestModal } from "@/components/admin/crm/quoted-payment-request-modal";
import { extractPrintRequestDescription, printLastActivityMs } from "@/lib/crm/three-d-print-lead";
import {
  PRINT_PAYMENT_VIEW_TABS,
  parsePrintPaymentFilterQuery,
  parsePrintStageQuery,
  printLeadMatchesPaymentFilter,
  type PrintCrmStageFilter,
  type PrintPaymentViewFilter,
} from "@/lib/crm/print-dashboard-metrics";
import {
  printCrmStageFiltersEqual,
  printLeadMatchesCrmStageFilter,
  THREE_D_PRINT_CRM_FILTER_TABS,
  serializePrintCrmStageFilter,
} from "@/lib/crm/three-d-print-ui-lanes";
import { isLeadStaleNoContact, mockupDealStatusShortLabel } from "@/lib/mockup-deal-status";

type SortKey = "created" | "score" | "follow_up" | "business";

function parseSortKeyFromParam(raw: string | null | undefined, fallback: SortKey): SortKey {
  const v = String(raw || "").trim().toLowerCase();
  if (v === "score" || v === "follow_up" || v === "business" || v === "created") return v;
  return fallback;
}

const STAGE_TABS: { id: "all" | CrmPipelineStage; label: string }[] = [
  { id: "all", label: "All" },
  ...CRM_PIPELINE_STAGES.map((id) => ({
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

/** Highlight web-design-ish leads with no touch in 3+ days (excludes terminal statuses / closed mockup / 3D print lane). */
function cardStaleNeedsPing(lead: WorkflowLead): boolean {
  const s = String(lead.status || "").toLowerCase();
  if (s === "won" || s === "archived" || s === "no_response" || s === "not_interested") return false;
  const m = String(lead.mockup_deal_status || "").toLowerCase();
  if (m === "closed_won" || m === "closed_lost") return false;
  if (resolveServiceTypeForDisplay(lead) === "3d_printing") return false;
  return isLeadStaleNoContact(lead.last_contacted_at, 3);
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
  initialSourceTab = null,
  initialPrintStageFilter = { kind: "all" },
  initialPrintPaymentFilter = "all",
  initialNeedsReply = false,
  printCashAppPaymentUrl = null,
  printCashAppDisplayLine = null,
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
  /** From `?crm_source=3d_printing` — 3D print lane */
  initialSourceTab?: SourceFilterTab | null;
  /** From `?print_stage=` — 3D print pipeline column */
  initialPrintStageFilter?: PrintCrmStageFilter;
  /** From `?print_payment=` — unpaid / deposit / … */
  initialPrintPaymentFilter?: PrintPaymentViewFilter;
  /** From `?needs_reply=1` — inbound / reply queue */
  initialNeedsReply?: boolean;
  printCashAppPaymentUrl?: string | null;
  printCashAppDisplayLine?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearch = useSearchParams();
  const [leads, setLeads] = useState<WorkflowLead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [stageTab, setStageTab] = useState<(typeof STAGE_TABS)[number]["id"]>("all");
  const [sortKey, setSortKey] = useState<SortKey>(() => initialSort);
  const [hotOnly, setHotOnly] = useState(false);
  const [replyOnly, setReplyOnly] = useState(() => initialNeedsReply === true);
  const [workflowDrawerLead, setWorkflowDrawerLead] = useState<WorkflowLead | null>(null);
  const [adding, setAdding] = useState(initialAddOpen);
  const [density, setDensity] = useState<"compact" | "detailed">(initialDensity);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [quotedModalLead, setQuotedModalLead] = useState<WorkflowLead | null>(null);
  const [sourceTab, setSourceTab] = useState<SourceFilterTab>(() => initialSourceTab || "all");
  const [printStageFilter, setPrintStageFilter] = useState<PrintCrmStageFilter>(
    () => initialPrintStageFilter || { kind: "all" },
  );
  const [printPaymentTab, setPrintPaymentTab] = useState<PrintPaymentViewFilter>(
    () => initialPrintPaymentFilter || "all",
  );
  const [printTagFilter, setPrintTagFilter] = useState("");
  const [printActivityFilter, setPrintActivityFilter] = useState<"all" | "7d" | "30d" | "stale14">("all");
  const [printCrmView, setPrintCrmView] = useState<"board" | "table" | "list">("list");
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
    setLeads(initialLeads);
  }, [initialLeads]);

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

  useEffect(() => {
    const raw = String(urlSearch?.get("crm_source") || "")
      .trim()
      .toLowerCase()
      .replace(/-/g, "_");
    if (raw === "3d_printing" || raw === "three_d_printing") setSourceTab("three_d_printing");
  }, [urlSearch?.toString()]);

  useEffect(() => {
    const stage = parsePrintStageQuery(urlSearch?.get("print_stage"));
    setPrintStageFilter(stage);
  }, [urlSearch?.toString()]);

  const replaceUrlPrintStage = (next: PrintCrmStageFilter) => {
    const p = new URLSearchParams(urlSearch?.toString() || "");
    const s = serializePrintCrmStageFilter(next);
    if (!s) p.delete("print_stage");
    else p.set("print_stage", s);
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  useEffect(() => {
    setReplyOnly(String(urlSearch?.get("needs_reply") || "").trim() === "1");
  }, [urlSearch?.toString()]);

  useEffect(() => {
    setPrintPaymentTab(parsePrintPaymentFilterQuery(urlSearch?.get("print_payment")));
  }, [urlSearch?.toString()]);

  useEffect(() => {
    const id = String(urlSearch?.get("print_pay_request") || "").trim();
    if (!id) return;
    const p = new URLSearchParams(urlSearch?.toString() || "");
    p.delete("print_pay_request");
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    const lead = leads.find((l) => String(l.id) === id);
    if (lead) setQuotedModalLead(lead);
  }, [urlSearch?.toString(), leads, pathname, router]);

  const replaceUrlCrmSource = (next: SourceFilterTab) => {
    const p = new URLSearchParams(urlSearch?.toString() || "");
    if (next === "three_d_printing") p.set("crm_source", "3d_printing");
    else p.delete("crm_source");
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

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

  const replaceUrlPrintPayment = (next: PrintPaymentViewFilter) => {
    const p = new URLSearchParams(urlSearch?.toString() || "");
    if (next === "all") p.delete("print_payment");
    else p.set("print_payment", next);
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
    const now = Date.now();
    return [...listBase]
      .filter((l) => {
        if (laneTab !== "all" && effectiveCrmLane(l) !== laneTab) return false;
        if (sourceTabEffective === "three_d_printing") {
          if (printPaymentTab !== "all" && !printLeadMatchesPaymentFilter(l, printPaymentTab)) return false;
          if (printStageFilter.kind !== "all" && !printLeadMatchesCrmStageFilter(l, printStageFilter)) return false;
          const tf = printTagFilter.trim().toLowerCase();
          if (tf) {
            const tags = (l.print_tags || []).map((t) => String(t).toLowerCase());
            if (!tags.some((t) => t.includes(tf))) return false;
          }
          const ms = printLastActivityMs(l);
          if (printActivityFilter === "7d" && (!ms || now - ms > 7 * 86400000)) return false;
          if (printActivityFilter === "30d" && (!ms || now - ms > 30 * 86400000)) return false;
          if (printActivityFilter === "stale14" && ms && now - ms <= 14 * 86400000) return false;
        } else if (stageTab !== "all" && l.status !== stageTab) {
          return false;
        }
        if (!leadMatchesSourceFilter(l, sourceTabEffective)) return false;
        if (hotOnly && !l.is_hot_lead) return false;
        if (replyOnly && !(Number(l.unread_reply_count) > 0) && !String(l.last_reply_preview || "").trim()) return false;
        if (!q) return true;
        const tagHay = (l.print_tags || []).join(" ").toLowerCase();
        const hay = [
          l.business_name,
          l.known_owner_name,
          l.email,
          l.phone_from_site,
          l.website,
          l.city,
          l.category,
          l.last_reply_preview,
          l.print_request_summary,
          l.print_estimate_summary,
          tagHay,
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
  }, [
    listBase,
    search,
    stageTab,
    sourceTabEffective,
    sortKey,
    hotOnly,
    replyOnly,
    laneTab,
    printStageFilter,
    printPaymentTab,
    printTagFilter,
    printActivityFilter,
  ]);

  const mergeWorkflowPatch = (leadId: string, patch: Record<string, unknown>) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? applyWorkflowLeadPatch(l, patch) : l)));
    setWorkflowDrawerLead((cur) => (cur && cur.id === leadId ? applyWorkflowLeadPatch(cur, patch) : cur));
  };

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
    mergeWorkflowPatch(leadId, patch);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {quotedModalLead ? (
        <QuotedPaymentRequestModal
          open={Boolean(quotedModalLead)}
          onClose={() => setQuotedModalLead(null)}
          leadId={quotedModalLead.id}
          contactName={quotedModalLead.known_owner_name ?? null}
          businessName={quotedModalLead.business_name ?? null}
          email={quotedModalLead.email ?? null}
          currentPrintPipeline={quotedModalLead.print_pipeline_status ?? null}
          initialQuotedAmount={quotedModalLead.quoted_amount ?? null}
          initialDepositAmount={quotedModalLead.deposit_amount ?? null}
          initialFinalAmount={quotedModalLead.final_amount ?? null}
          initialPriceCharged={quotedModalLead.price_charged ?? null}
          initialPaymentRequestType={quotedModalLead.payment_request_type ?? null}
          existingPaymentLink={quotedModalLead.payment_link ?? null}
          existingPaymentMethod={quotedModalLead.payment_method ?? null}
          cashAppPaymentUrl={printCashAppPaymentUrl}
          cashAppDisplayLine={printCashAppDisplayLine}
          printTags={quotedModalLead.print_tags ?? null}
          keywordHaystack={[
            extractPrintRequestDescription(
              Array.isArray(quotedModalLead.notes) && quotedModalLead.notes.length
                ? quotedModalLead.notes.join("\n")
                : null,
              quotedModalLead.print_request_summary ?? null,
            ),
            String(quotedModalLead.print_request_type || ""),
            String(quotedModalLead.print_material || ""),
          ].join("\n")}
          onCommitted={() => router.refresh()}
        />
      ) : null}

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

      {poolTab === "all" ? (
        <div className="space-y-4">
          <TopPicksStrip leads={topPickStripLeads} />
          <DailyTenStrip leads={leads} />
        </div>
      ) : null}

      <section
        className={`rounded-xl border-2 p-4 sm:p-5 space-y-3 shadow-[0_0_28px_rgba(59,130,246,0.12)] ${
          targetPresetActive ? "ring-2 ring-blue-400/50 ring-offset-2 ring-offset-[rgba(0,0,0,0.4)]" : ""
        }`}
        style={{
          borderColor: targetPresetActive ? "rgba(59, 130, 246, 0.55)" : "rgba(201, 97, 44, 0.35)",
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
        style={{ borderColor: "rgba(201, 97, 44, 0.45)", background: "rgba(0,0,0,0.22)" }}
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
            onChange={(e) => {
              const v = e.target.value as SourceFilterTab;
              setSourceTab(v);
              replaceUrlCrmSource(v);
            }}
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

      {sourceTabEffective === "three_d_printing" ? (
        <div className="space-y-2 rounded-xl border border-violet-500/35 bg-black/15 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-violet-200/90">3D print pipeline</p>
          <div className="flex flex-wrap gap-2">
            {THREE_D_PRINT_CRM_FILTER_TABS.map((t) => (
              <button
                key={t.label + (t.filter.kind === "ui" ? t.filter.lane : t.filter.kind === "pipeline" ? t.filter.pipeline : "all")}
                type="button"
                className={
                  printCrmStageFiltersEqual(printStageFilter, t.filter)
                    ? "admin-btn-primary text-xs"
                    : "admin-btn-ghost text-xs border-violet-500/30"
                }
                onClick={() => {
                  setPrintStageFilter(t.filter);
                  replaceUrlPrintStage(t.filter);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-200/85 mt-3">Payment</p>
          <div className="flex flex-wrap gap-2">
            {PRINT_PAYMENT_VIEW_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={
                  printPaymentTab === t.id
                    ? "admin-btn-primary text-xs"
                    : "admin-btn-ghost text-xs border-amber-500/30"
                }
                onClick={() => {
                  setPrintPaymentTab(t.id);
                  replaceUrlPrintPayment(t.id);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-[10px] font-semibold block mb-1 text-violet-200/80">Tag contains</label>
              <input
                className="rounded-lg border px-2 py-1.5 text-xs min-w-[140px]"
                style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.2)", color: "var(--admin-fg)" }}
                placeholder="mount, organizer…"
                value={printTagFilter}
                onChange={(e) => setPrintTagFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold block mb-1 text-violet-200/80">Last activity</label>
              <select
                aria-label="Filter by last activity"
                className="rounded-lg border px-2 py-1.5 text-xs"
                style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.2)", color: "var(--admin-fg)" }}
                value={printActivityFilter}
                onChange={(e) => setPrintActivityFilter(e.target.value as "all" | "7d" | "30d" | "stale14")}
              >
                <option value="all">Any</option>
                <option value="7d">Active within 7 days</option>
                <option value="30d">Active within 30 days</option>
                <option value="stale14">Quiet 14+ days</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
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
      )}

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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          {sourceTabEffective === "three_d_printing"
            ? "3D print requests from /3d-printing — drag jobs between stages or open a card for the full view."
            : "These are businesses you saved. Open one to work it."}
        </p>
        {sourceTabEffective === "three_d_printing" && filtered.length > 0 ? (
          <div
            className="inline-flex rounded-lg border border-violet-500/35 p-0.5"
            role="group"
            aria-label="3D print list layout"
          >
            <button
              type="button"
              className={
                printCrmView === "list"
                  ? "rounded-md bg-violet-600/35 px-3 py-1.5 text-xs font-semibold text-violet-50"
                  : "rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-violet-200"
              }
              onClick={() => setPrintCrmView("list")}
            >
              List
            </button>
            <button
              type="button"
              className={
                printCrmView === "board"
                  ? "rounded-md bg-violet-600/35 px-3 py-1.5 text-xs font-semibold text-violet-50"
                  : "rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-violet-200"
              }
              onClick={() => setPrintCrmView("board")}
            >
              Board
            </button>
            <button
              type="button"
              className={
                printCrmView === "table"
                  ? "rounded-md bg-violet-600/35 px-3 py-1.5 text-xs font-semibold text-violet-50"
                  : "rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-violet-200"
              }
              onClick={() => setPrintCrmView("table")}
            >
              Table
            </button>
          </div>
        ) : null}
      </div>

      {sourceTabEffective === "three_d_printing" && filtered.length > 0 && printCrmView === "list" ? (
        <section className="rounded-xl border border-violet-500/25 bg-black/15 p-3">
          <ThreeDPrintLeadsList
            leads={filtered}
            busyId={busyId}
            patchLead={patchLead}
            onOpenWorkflow={(l) => setWorkflowDrawerLead(l)}
            onQuotedPaymentRequest={(l) => setQuotedModalLead(l)}
          />
        </section>
      ) : null}
      {sourceTabEffective === "three_d_printing" && filtered.length > 0 && printCrmView === "board" ? (
        <ThreeDPrintKanban
          leads={filtered}
          busyId={busyId}
          patchLead={patchLead}
          onQuotedPaymentRequest={(lead) => setQuotedModalLead(lead)}
          onOpenWorkflow={(l) => setWorkflowDrawerLead(l)}
        />
      ) : null}
      {sourceTabEffective === "three_d_printing" && filtered.length > 0 && printCrmView === "table" ? (
        <ThreeDPrintRequestsTable
          leads={filtered}
          busyId={busyId}
          patchLead={patchLead}
          onQuotedPaymentRequest={(lead) => setQuotedModalLead(lead)}
          onOpenWorkflow={(l) => setWorkflowDrawerLead(l)}
        />
      ) : null}

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
      ) : sourceTabEffective === "three_d_printing" ? null : density === "compact" ? (
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
            const staleNoContact = cardStaleNeedsPing(lead);
            return (
              <li
                id={`lead-card-${lead.id}`}
                key={lead.id}
                className={`rounded-lg border p-3 flex flex-col gap-2 ${extensionCapture ? "border-l-[3px] border-l-[var(--admin-gold)]" : ""} ${pulse ? "ring-1 ring-[var(--admin-gold)]/55 shadow-[0_0_14px_rgba(201,97,44,0.22)]" : ""} ${lead.status === "replied" ? "ring-1 ring-emerald-500/40 shadow-[0_0_12px_rgba(34,197,94,0.12)]" : ""} ${staleNoContact ? "ring-1 ring-amber-500/50 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.2)]" : ""}`}
                style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.12)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    className="text-left font-semibold text-sm leading-tight hover:underline"
                    style={{ color: "var(--admin-fg)" }}
                    onClick={() => setWorkflowDrawerLead(lead)}
                  >
                    {lead.business_name}
                  </button>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${leadStatusClass(lead.status)}`}>
                      {simpleLeadStatusLabel({
                        status: lead.status,
                        next_follow_up_at: lead.next_follow_up_at,
                        first_outreach_sent_at: lead.first_outreach_sent_at,
                      })}
                    </span>
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-full border"
                      style={{ borderColor: "var(--admin-border)", color: "var(--admin-muted)" }}
                      title="Mockup deal status"
                    >
                      {mockupDealStatusShortLabel(lead.mockup_deal_status)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <LeadServiceTypeBadge
                    serviceType={resolveServiceTypeForDisplay({
                      service_type: lead.service_type,
                      lead_source: lead.lead_source,
                      source: lead.source,
                      lead_tags: lead.lead_tags,
                    })}
                  />
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
                <p className="text-[9px] uppercase tracking-wide opacity-60" style={{ color: "var(--admin-muted)" }}>
                  Script: {outreachScriptLabel(resolveOutreachScriptNiche(lead.category))}
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
                      <button
                        type="button"
                        className="admin-btn-ghost text-xs px-2 py-1.5 border border-[var(--admin-border)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWorkflowDrawerLead(lead);
                        }}
                      >
                        Workflow
                      </button>
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
                            const repliedPatch = buildMarkLeadRepliedPatch({
                              currentUnread: lead.unread_reply_count,
                              alreadyReplied: false,
                            });
                            mergeWorkflowPatch(lead.id, repliedPatch);
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
                      <button
                        type="button"
                        className="admin-btn-ghost text-xs px-2 py-1.5 border border-[var(--admin-border)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWorkflowDrawerLead(lead);
                        }}
                      >
                        Workflow
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
            const staleNoContactDetailed = cardStaleNeedsPing(lead);
            return (
              <div
                id={`lead-card-${lead.id}`}
                key={lead.id}
                className={`admin-card text-left w-full ${extensionCapture ? "border-l-[3px] border-l-[var(--admin-gold)]" : ""} ${pulse ? "ring-1 ring-[var(--admin-gold)]/55 shadow-[0_0_14px_rgba(201,97,44,0.22)]" : ""} ${lead.status === "replied" ? "ring-1 ring-emerald-500/40 shadow-[0_0_12px_rgba(34,197,94,0.12)]" : ""} ${staleNoContactDetailed ? "ring-1 ring-amber-500/50 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.2)]" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => setWorkflowDrawerLead(lead)}
                  >
                    <p className="font-semibold text-base" style={{ color: "var(--admin-fg)" }}>
                      {lead.business_name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
                      {lead.city || "—"}
                      {lead.category ? ` · ${lead.category}` : ""}
                    </p>
                  </button>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${leadStatusClass(lead.status)}`}>
                      {simpleLeadStatusLabel({
                        status: lead.status,
                        next_follow_up_at: lead.next_follow_up_at,
                        first_outreach_sent_at: lead.first_outreach_sent_at,
                      })}
                    </span>
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-full border"
                      style={{ borderColor: "var(--admin-border)", color: "var(--admin-muted)" }}
                      title="Mockup deal status"
                    >
                      {mockupDealStatusShortLabel(lead.mockup_deal_status)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <LeadServiceTypeBadge
                    serviceType={resolveServiceTypeForDisplay({
                      service_type: lead.service_type,
                      lead_source: lead.lead_source,
                      source: lead.source,
                      lead_tags: lead.lead_tags,
                    })}
                  />
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
                <p className="text-[9px] mt-0.5 uppercase tracking-wide opacity-60" style={{ color: "var(--admin-muted)" }}>
                  Script: {outreachScriptLabel(resolveOutreachScriptNiche(lead.category))}
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
                      <button
                        type="button"
                        className="admin-btn-ghost text-xs border border-[var(--admin-border)]"
                        onClick={() => setWorkflowDrawerLead(lead)}
                      >
                        Workflow
                      </button>
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
                            const repliedPatchDetailed = buildMarkLeadRepliedPatch({
                              currentUnread: lead.unread_reply_count,
                              alreadyReplied: false,
                            });
                            mergeWorkflowPatch(lead.id, repliedPatchDetailed);
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
                      <button
                        type="button"
                        className="admin-btn-ghost text-xs border border-[var(--admin-border)]"
                        onClick={() => setWorkflowDrawerLead(lead)}
                      >
                        Workflow
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

      <LeadWorkflowDrawer
        lead={workflowDrawerLead}
        open={Boolean(workflowDrawerLead)}
        onClose={() => setWorkflowDrawerLead(null)}
        onLeadUpdated={mergeWorkflowPatch}
        onRequestPrintQuoteModal={(l) => setQuotedModalLead(l)}
      />
    </div>
  );
}
