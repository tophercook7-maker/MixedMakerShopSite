"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { WorkTheseNowStrip } from "@/components/admin/crm/work-these-now-strip";

type SortKey = "created" | "score" | "follow_up" | "business";

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
}: {
  initialLeads: WorkflowLead[];
  emptyStateReason: string;
  initialAddOpen?: boolean;
  initialDensity?: "compact" | "detailed";
  /** From `?highlight=` after extension save — brief pulse + scroll. */
  initialHighlightLeadId?: string | null;
  /** From `?lane=` — primary CRM bucket filter */
  initialLane?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearch = useSearchParams();
  const [leads, setLeads] = useState<WorkflowLead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [stageTab, setStageTab] = useState<(typeof STAGE_TABS)[number]["id"]>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created");
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

  useEffect(() => {
    setLaneTab(parseLaneParam(urlSearch?.get("lane")));
  }, [urlSearch?.toString()]);

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

  const laneCounts = useMemo(() => {
    const c = {} as Record<CrmLeadLane, number>;
    for (const id of CRM_LEAD_LANES) c[id] = 0;
    for (const l of leads) {
      const k = effectiveCrmLane(l);
      if (k in c) c[k] += 1;
    }
    return c;
  }, [leads]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sortKeyEffective = sourceTab === "extension" ? "created" : sortKey;
    return [...leads]
      .filter((l) => {
        if (laneTab !== "all" && effectiveCrmLane(l) !== laneTab) return false;
        if (stageTab !== "all" && l.status !== stageTab) return false;
        if (!leadMatchesSourceFilter(l, sourceTab)) return false;
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
        if (sortKeyEffective === "score") return Number(b.conversion_score || 0) - Number(a.conversion_score || 0);
        if (sortKeyEffective === "business") return a.business_name.localeCompare(b.business_name);
        if (sortKeyEffective === "follow_up") {
          const at = a.next_follow_up_at ? new Date(a.next_follow_up_at).getTime() : Infinity;
          const bt = b.next_follow_up_at ? new Date(b.next_follow_up_at).getTime() : Infinity;
          return at - bt;
        }
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [leads, search, stageTab, sourceTab, sortKey, hotOnly, replyOnly, laneTab]);

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

      <WorkTheseNowStrip leads={leads} />

      <section
        className="rounded-xl border-2 p-4 space-y-3"
        style={{ borderColor: "rgba(212, 175, 55, 0.45)", background: "rgba(0,0,0,0.22)" }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--admin-gold)" }}>
            Lead folders
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
            Open a folder to focus the list — counts use every lead loaded below (before this folder filter).
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
            All ({leads.length})
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
            onChange={(e) => setSortKey(e.target.value as SortKey)}
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
            onClick={() => setDensity("compact")}
          >
            Compact
          </button>
          <button
            type="button"
            className={density === "detailed" ? "admin-btn-primary text-xs px-2 py-1.5 rounded-md" : "admin-btn-ghost text-xs px-2 py-1.5 rounded-md"}
            onClick={() => setDensity("detailed")}
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
              Source
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
            value={sourceTab}
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
            return (
              <li
                id={`lead-card-${lead.id}`}
                key={lead.id}
                className={`rounded-lg border p-3 flex flex-col gap-2 ${extensionCapture ? "border-l-[3px] border-l-[var(--admin-gold)]" : ""} ${pulse ? "ring-1 ring-[var(--admin-gold)]/55 shadow-[0_0_14px_rgba(212,175,55,0.22)]" : ""}`}
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
                {unreadN > 0 ? (
                  <p className="text-[11px] font-medium text-rose-200">
                    {unreadN} unread {unreadN === 1 ? "reply" : "replies"}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2 mt-auto pt-1">
                  <Link
                    href={buildLeadPath(lead.id, lead.business_name)}
                    className="admin-btn-primary text-xs px-2 py-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open
                  </Link>
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
                      void patchLead(lead.id, patch, next ? "Marked contacted — follow-up scheduled." : "Marked contacted.", "mark_contacted");
                    }}
                  >
                    Contacted
                  </button>
                  ) : null}
                  <button
                    type="button"
                    className="admin-btn-ghost text-xs px-2 py-1.5 border border-[var(--admin-border)]"
                    disabled={busy}
                    onClick={async () => {
                      setBusyId(lead.id);
                      const r = await patchLeadApi(lead.id, {
                        status: "replied",
                        is_hot_lead: true,
                        automation_paused: true,
                        sequence_active: false,
                        replied_at: new Date().toISOString(),
                      });
                      setBusyId(null);
                      if (!r.ok) {
                        setToast(r.error);
                        return;
                      }
                      void createReplyReminder(lead.id, lead.business_name || "Lead");
                      void logAutomation(lead.id, "mark_replied", {});
                      setToast("Marked as replied.");
                      router.refresh();
                    }}
                  >
                    Replied
                  </button>
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
            return (
              <div
                id={`lead-card-${lead.id}`}
                key={lead.id}
                className={`admin-card text-left w-full ${extensionCapture ? "border-l-[3px] border-l-[var(--admin-gold)]" : ""} ${pulse ? "ring-1 ring-[var(--admin-gold)]/55 shadow-[0_0_14px_rgba(212,175,55,0.22)]" : ""}`}
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
                  <p className="text-xs mt-3 line-clamp-2 italic border-t border-white/10 pt-2" style={{ color: "#fecaca" }}>
                    “{lead.last_reply_preview}”
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={buildLeadPath(lead.id, lead.business_name)} className="admin-btn-primary text-xs">
                    Open
                  </Link>
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
                  <button
                    type="button"
                    className="admin-btn-ghost text-xs border border-[var(--admin-border)]"
                    disabled={busy}
                    onClick={async () => {
                      setBusyId(lead.id);
                      const r = await patchLeadApi(lead.id, {
                        status: "replied",
                        is_hot_lead: true,
                        automation_paused: true,
                        sequence_active: false,
                        replied_at: new Date().toISOString(),
                      });
                      setBusyId(null);
                      if (!r.ok) {
                        setToast(r.error);
                        return;
                      }
                      void createReplyReminder(lead.id, lead.business_name || "Lead");
                      void logAutomation(lead.id, "mark_replied", {});
                      setToast("Marked as replied.");
                      router.refresh();
                    }}
                  >
                    Replied
                  </button>
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
              <Link href={buildLeadPath(selected.id, selected.business_name)} className="admin-btn-primary text-sm">
                Open workspace
              </Link>
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
