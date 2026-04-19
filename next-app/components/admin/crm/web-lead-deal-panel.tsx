"use client";

import type { WebLeadViewModel } from "@/lib/crm/web-lead-view-model";

export function WebLeadDealPanel({ vm }: { vm: WebLeadViewModel }) {
  return (
    <div className="rounded-lg border px-3 py-2 text-xs space-y-1" style={{ borderColor: "var(--admin-border)" }}>
      <p style={{ color: "var(--admin-muted)" }}>
        Stage: <span style={{ color: "var(--admin-fg)" }}>{vm.dealStage || "—"}</span>
      </p>
      <p style={{ color: "var(--admin-muted)" }}>
        Deal status: <span style={{ color: "var(--admin-fg)" }}>{vm.dealStatus || "—"}</span>
      </p>
      <p style={{ color: "var(--admin-muted)" }}>
        Quote:{" "}
        <span style={{ color: "var(--admin-fg)" }}>
          {vm.dealValue != null ? `$${Number(vm.dealValue).toFixed(0)}` : "—"}
        </span>
      </p>
    </div>
  );
}
