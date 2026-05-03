"use client";

import type { WebLeadViewModel } from "@/lib/crm/web-lead-view-model";
import { bestContactPathSummary } from "@/lib/crm/web-lead-view-model";
import { laneLabel } from "@/lib/crm/web-lead-lane";
import { WebLeadRowActions } from "@/components/admin/crm/web-lead-row-actions";

function fmtShort(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

const BADGE_CLASS = "text-[10px] px-1.5 py-0.5 rounded border border-[var(--admin-border)]";

export function WebLeadCard({ vm }: { vm: WebLeadViewModel }) {
  const sourceLine = vm.sourceQuery || vm.sourceLabel || vm.sourceUrl || "—";
  const cityLine = [vm.city, vm.state].filter(Boolean).join(", ") || "—";

  return (
    <article className="admin-card p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="text-base font-semibold truncate" style={{ color: "var(--admin-fg)" }}>
            {vm.businessName}
          </h3>
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            {cityLine}
            {vm.category ? ` · ${vm.category}` : ""}
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wide shrink-0" style={{ color: "var(--admin-gold)" }}>
          {laneLabel(vm.lane)}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className={`admin-priority-badge ${vm.priority.className}`}>
          {vm.priority.label}
          {vm.priority.isManual ? " (manual)" : ""}
        </span>
      </div>

      <div className="grid gap-2 text-xs md:grid-cols-2">
        <p style={{ color: "var(--admin-muted)" }}>
          <span className="opacity-80">Platform:</span> {vm.sourcePlatformLabel}
        </p>
        <p className="truncate" style={{ color: "var(--admin-muted)" }} title={sourceLine}>
          <span className="opacity-80">Source:</span> {sourceLine}
        </p>
        <p style={{ color: "var(--admin-muted)" }}>
          <span className="opacity-80">Website:</span> {vm.websiteStatus}
        </p>
        <p style={{ color: "var(--admin-muted)" }}>
          <span className="opacity-80">Contact:</span> {bestContactPathSummary(vm)}
        </p>
        <p style={{ color: "var(--admin-muted)" }}>
          <span className="opacity-80">Score:</span> {vm.score ?? "—"}
        </p>
        <p style={{ color: "var(--admin-muted)" }}>
          <span className="opacity-80">Next:</span> {vm.nextAction.primaryCtaLabel}
        </p>
        <p style={{ color: "var(--admin-muted)" }}>
          <span className="opacity-80">Last touch:</span> {fmtShort(vm.lastTouchedAt)}
        </p>
        <p style={{ color: "var(--admin-muted)" }}>
          <span className="opacity-80">Follow-up:</span> {fmtShort(vm.followUpDueAt)}
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {vm.badges.slice(0, 8).map((b) => (
          <span key={b} className={BADGE_CLASS} style={{ color: "var(--admin-muted)" }}>
            {b.replace(/_/g, " ")}
          </span>
        ))}
      </div>

      <WebLeadRowActions vm={vm} />
    </article>
  );
}
