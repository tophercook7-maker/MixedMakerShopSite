"use client";

import Link from "next/link";
import type { WebLeadViewModel } from "@/lib/crm/web-lead-view-model";
import { buildLeadPath } from "@/lib/lead-route";

export function WebLeadNextActionCard({
  vm,
  primaryHrefSuffix,
}: {
  vm: WebLeadViewModel;
  primaryHrefSuffix?: string;
}) {
  const base = buildLeadPath(vm.id, vm.businessName);
  const href = primaryHrefSuffix ? `${base}${primaryHrefSuffix.startsWith("?") ? primaryHrefSuffix : `?${primaryHrefSuffix}`}` : base;

  return (
    <section className="admin-card p-4 space-y-3 border border-[var(--admin-gold)]/30 bg-[rgba(201,97,44,0.06)]">
      <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
        Next best action
      </h2>
      <p className="text-lg font-semibold" style={{ color: "var(--admin-gold)" }}>
        {vm.nextAction.label}
      </p>
      <p className="text-sm" style={{ color: "var(--admin-fg)" }}>
        {vm.nextAction.reason}
      </p>
      {vm.nextAction.urgencyNote ? (
        <p className="text-xs font-medium text-amber-200/90">{vm.nextAction.urgencyNote}</p>
      ) : null}
      <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
        Best method: <strong style={{ color: "var(--admin-fg)" }}>{vm.bestContactMethod || "—"}</strong>
        {vm.followUpDueAt ? (
          <>
            {" "}
            · Follow-up: {new Date(vm.followUpDueAt).toLocaleString()}
          </>
        ) : null}
      </p>
      <Link href={href} className="admin-btn-primary inline-block text-sm px-4 py-2">
        {vm.nextAction.primaryCtaLabel}
      </Link>
    </section>
  );
}
