"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isThreeDPrintLead } from "@/lib/crm/three-d-print-lead";
import { isTopPickLead } from "@/lib/crm/manual-pick-leads";
import { isFollowUpDueTodayUtc } from "@/lib/crm/simple-lead-status-ui";
import { toWebLeadViewModel, webLeadSearchHaystack, type WebLeadViewModel } from "@/lib/crm/web-lead-view-model";
import { compareForLane } from "@/lib/crm/web-lead-sort";
import type { WebCrmLane } from "@/lib/crm/web-lead-lane";
import { WEB_CRM_LANES, laneLabel } from "@/lib/crm/web-lead-lane";
import { WebLaneTabs } from "@/components/admin/crm/web-lane-tabs";
import {
  WebCrmFilters,
  defaultWebCrmFilters,
  type WebCrmFilterState,
} from "@/components/admin/crm/web-crm-filters";
import { WebLeadCard } from "@/components/admin/crm/web-lead-card";
import { saveLeadsListReturnContext } from "@/components/admin/crm/leads-list-return-link";
import type { WebCrmDashboardPreset } from "@/lib/crm/web-crm-dashboard-presets";
import { webCrmEmptyHint } from "@/lib/crm/web-crm-empty-hint";
import { webCrmWebHref, webCrmWebHrefPreset } from "@/lib/crm/web-crm-url";

const WEB_CRM_LANE_SET = new Set<string>(WEB_CRM_LANES);

function passesFilters(vm: WebLeadViewModel, f: WebCrmFilterState): boolean {
  if (f.search.trim()) {
    const q = f.search.trim().toLowerCase();
    if (!webLeadSearchHaystack(vm).includes(q)) return false;
  }
  if (f.sourcePlatform && vm.sourcePlatform !== f.sourcePlatform) return false;
  if (f.hasWebsite === "yes" && !vm.hasWebsite) return false;
  if (f.hasWebsite === "no" && vm.hasWebsite) return false;
  if (f.hasEmail && !vm.hasEmail) return false;
  if (f.hasPhone && !vm.hasPhone) return false;
  if (f.hasFacebook && !vm.hasFacebook) return false;
  if (f.city.trim() && !vm.city.toLowerCase().includes(f.city.trim().toLowerCase())) return false;
  if (f.category.trim() && !vm.category.toLowerCase().includes(f.category.trim().toLowerCase())) return false;
  if (f.highScoreOnly && (vm.score == null || vm.score < 50)) return false;
  if (f.mockupActiveOnly) {
    const mockupFlow =
      vm.lane === "sample_active" ||
      Boolean(vm.mockupDealStatus && !["new", "closed_lost", "closed_won"].includes(String(vm.mockupDealStatus).toLowerCase()));
    if (!mockupFlow) return false;
  }
  return true;
}

function passesPresetFilters(vm: WebLeadViewModel, preset: WebCrmDashboardPreset): boolean {
  if (preset.followUpTodayOnly && !isFollowUpDueTodayUtc(vm.followUpDueAt)) return false;
  if (preset.needsReplyOnly && (vm.unreadReplyCount || 0) <= 0) return false;
  return true;
}

function wonThisMonth(vm: WebLeadViewModel): boolean {
  const ok = vm.lane === "won" || String(vm.status).toLowerCase() === "won";
  if (!ok) return false;
  const raw = vm.closedAt || vm.createdAt;
  if (!raw) return false;
  const d = new Date(raw);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
}

export function WebCrmDashboard({
  initialRows,
  initialPreset,
}: {
  initialRows: Record<string, unknown>[];
  initialPreset: WebCrmDashboardPreset;
}) {
  const searchParams = useSearchParams();
  const [lane, setLane] = useState<WebCrmLane | "all">(initialPreset.lane);
  const [filters, setFilters] = useState<WebCrmFilterState>(defaultWebCrmFilters);

  useEffect(() => {
    saveLeadsListReturnContext();
  }, []);

  useEffect(() => {
    setLane(initialPreset.lane);
  }, [initialPreset.lane]);

  const webVms = useMemo(() => {
    let rows = initialRows.filter((row) => !isThreeDPrintLead(row));
    if (initialPreset.topPicksOnly) {
      rows = rows.filter((row) => isTopPickLead(row));
    }
    return rows
      .map((row) => toWebLeadViewModel(row))
      .filter((vm) => vm.serviceMode !== "3d_printing")
      .filter((vm) => passesPresetFilters(vm, initialPreset));
  }, [
    initialRows,
    initialPreset.topPicksOnly,
    initialPreset.followUpTodayOnly,
    initialPreset.needsReplyOnly,
  ]);

  const filtered = useMemo(() => webVms.filter((vm) => passesFilters(vm, filters)), [webVms, filters]);

  const tabbed = useMemo(() => {
    const base = lane === "all" ? filtered : filtered.filter((vm) => vm.lane === lane);
    return [...base].sort((a, b) => compareForLane(lane, a, b));
  }, [filtered, lane]);

  const counts = useMemo(() => {
    const c: Partial<Record<WebCrmLane | "all", number>> = { all: filtered.length };
    for (const vm of filtered) {
      c[vm.lane] = (c[vm.lane] || 0) + 1;
    }
    c.all = filtered.length;
    return c;
  }, [filtered]);

  const metrics = useMemo(() => {
    return {
      total: webVms.length,
      ready: webVms.filter((v) => v.lane === "ready_now").length,
      waiting: webVms.filter((v) => v.lane === "waiting").length,
      responded: webVms.filter((v) => v.lane === "responded").length,
      sample: webVms.filter((v) => v.lane === "sample_active").length,
      qualified: webVms.filter((v) => v.lane === "qualified_deal").length,
      wonMonth: webVms.filter(wonThisMonth).length,
      parked: webVms.filter((v) => v.lane === "parked").length,
    };
  }, [webVms]);

  const todaysWork = useMemo(() => {
    return {
      needsReply: webVms.filter((v) => (v.unreadReplyCount || 0) > 0).length,
      followUpToday: webVms.filter((v) => isFollowUpDueTodayUtc(v.followUpDueAt)).length,
      readyNow: webVms.filter((v) => v.lane === "ready_now").length,
      sampleActive: webVms.filter((v) => v.lane === "sample_active").length,
    };
  }, [webVms]);

  const hasSearchFilter = Boolean(filters.search.trim());

  const urlNeedsReply = searchParams.get("needs_reply") === "1";
  const urlFollowUpToday = searchParams.get("follow_up_today") === "1";
  const urlLaneParam = String(searchParams.get("lane") || "").trim().toLowerCase();

  const emptyMessage = webCrmEmptyHint({
    lane,
    preset: initialPreset,
    hasSearch: hasSearchFilter,
    topPicksOnlyEffective: initialPreset.topPicksOnly,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
            Web design CRM
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
            Next action first — Google and manual leads in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link href="/admin/crm/print" className="admin-btn-ghost px-3 py-2 border border-[var(--admin-border)]">
            3D print jobs
          </Link>
          <Link href="/admin/crm/web/prospecting-runs" className="admin-btn-ghost px-3 py-2 border border-[var(--admin-border)]">
            Prospecting runs
          </Link>
          <Link href="/admin/leads/sources" className="admin-btn-ghost px-3 py-2 border border-[var(--admin-border)]">
            Source report
          </Link>
        </div>
      </div>

      <section className="admin-card p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--admin-muted)" }}>
          Today&apos;s work
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <TodaysWorkCard
            href={webCrmWebHrefPreset("needs_reply")}
            label="Needs reply"
            count={todaysWork.needsReply}
            active={urlNeedsReply}
          />
          <TodaysWorkCard
            href={webCrmWebHrefPreset("follow_up_today")}
            label="Follow-up today"
            count={todaysWork.followUpToday}
            active={urlFollowUpToday}
          />
          <TodaysWorkCard
            href={webCrmWebHrefPreset("ready_now")}
            label="Ready now"
            count={todaysWork.readyNow}
            active={urlLaneParam === "ready_now"}
          />
          <TodaysWorkCard
            href={webCrmWebHrefPreset("sample_active")}
            label="Sample active"
            count={todaysWork.sampleActive}
            active={urlLaneParam === "sample_active"}
          />
        </div>
        <p className="text-[11px] mt-2" style={{ color: "var(--admin-muted)" }}>
          Counts reflect your current scope (e.g. Top picks). Open a card to apply that view.
        </p>
      </section>

      <section className="admin-card p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center text-xs">
          <Metric label="Total" value={metrics.total} />
          <Metric label="Ready now" value={metrics.ready} highlight />
          <Metric label="Waiting" value={metrics.waiting} />
          <Metric label="Responded" value={metrics.responded} highlight />
          <Metric label="Sample" value={metrics.sample} />
          <Metric label="Qualified" value={metrics.qualified} />
          <Metric label="Won (mo)" value={metrics.wonMonth} />
          <Metric label="Parked" value={metrics.parked} />
        </div>
      </section>

      <ActiveViewChips lane={lane} searchParams={searchParams} />

      <section className="admin-card p-4 space-y-4">
        <WebLaneTabs active={lane} onChange={setLane} counts={counts} />
        <WebCrmFilters value={filters} onChange={setFilters} />
      </section>

      <div className="space-y-3">
        {tabbed.length === 0 ? (
          <p className="text-sm admin-card p-6" style={{ color: "var(--admin-muted)" }}>
            {emptyMessage}
          </p>
        ) : (
          tabbed.map((vm) => <WebLeadCard key={vm.id} vm={vm} />)
        )}
      </div>
    </div>
  );
}

function ActiveViewChips({
  lane,
  searchParams,
}: {
  lane: WebCrmLane | "all";
  searchParams: ReturnType<typeof useSearchParams>;
}) {
  const poolIsTopPicks = String(searchParams.get("pool") || "")
    .toLowerCase()
    .replace(/-/g, "_") === "top_picks";
  const urlFollowUpToday = searchParams.get("follow_up_today") === "1";
  const urlNeedsReply = searchParams.get("needs_reply") === "1";
  const urlLaneParam = String(searchParams.get("lane") || "").trim().toLowerCase();

  const chips: { key: string; label: string; href: string }[] = [];

  if (urlLaneParam && WEB_CRM_LANE_SET.has(urlLaneParam)) {
    chips.push({
      key: `url-lane-${urlLaneParam}`,
      label: `Queue · ${laneLabel(urlLaneParam as WebCrmLane)}`,
      href: webCrmWebHref(searchParams, { lane: null }),
    });
  }

  if (poolIsTopPicks) {
    chips.push({
      key: "top-picks",
      label: "Top picks",
      href: webCrmWebHref(searchParams, { pool: null }),
    });
  }
  if (urlFollowUpToday) {
    chips.push({
      key: "fu-today",
      label: "Follow-up today",
      href: webCrmWebHref(searchParams, { follow_up_today: null }),
    });
  }
  if (urlNeedsReply) {
    chips.push({
      key: "needs-reply",
      label: "Needs reply",
      href: webCrmWebHref(searchParams, { needs_reply: null }),
    });
  }

  const tabTitle =
    lane === "all" ? "All lanes" : lane === "inbox" ? "Inbox" : laneLabel(lane as WebCrmLane);

  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-black/10 px-3 py-2.5 space-y-2">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
          Active view
        </span>
        <Link href="/admin/crm/web" className="text-[11px] text-[var(--admin-gold)] hover:underline">
          Clear URL filters
        </Link>
      </div>
      <p className="text-xs" style={{ color: "var(--admin-fg)" }}>
        <span style={{ color: "var(--admin-muted)" }}>Tab:</span> {tabTitle}
      </p>
      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <Link
              key={c.key}
              href={c.href}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-100/95 transition-colors hover:bg-emerald-500/15"
              title="Remove this URL filter"
            >
              {c.label}
              <span className="opacity-60">×</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-[10px]" style={{ color: "var(--admin-muted)" }}>
          No extra URL filters — use Today&apos;s work or tabs below.
        </p>
      )}
      <p className="text-[10px] leading-snug" style={{ color: "var(--admin-muted)" }}>
        Tabs choose which lane you browse. Green chips are server filters from the URL (click × to drop one). They can
        stack with the tab you pick.
      </p>
    </div>
  );
}

function TodaysWorkCard({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-lg border px-3 py-2.5 text-left transition-colors ${
        active
          ? "border-[var(--admin-gold)] bg-[rgba(201,97,44,0.12)]"
          : "border-[var(--admin-border)] hover:border-[var(--admin-gold)]/40 bg-black/5"
      }`}
    >
      <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
        {label}
      </div>
      <div className="text-xl font-semibold tabular-nums" style={{ color: "var(--admin-fg)" }}>
        {count}
      </div>
    </Link>
  );
}

function Metric({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg px-2 py-2 border ${highlight ? "border-[var(--admin-gold)]/40 bg-[rgba(201,97,44,0.08)]" : "border-[var(--admin-border)]"}`}
    >
      <div style={{ color: "var(--admin-muted)" }}>{label}</div>
      <div className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
        {value}
      </div>
    </div>
  );
}
