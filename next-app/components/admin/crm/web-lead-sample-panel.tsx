"use client";

import type { WebLeadViewModel } from "@/lib/crm/web-lead-view-model";

/** Read-only summary; interactive mockup tooling stays in LeadMockupSharePanel. */
export function WebLeadSamplePanel({ vm }: { vm: WebLeadViewModel }) {
  return (
    <div className="rounded-lg border px-3 py-2 text-xs space-y-1" style={{ borderColor: "var(--admin-border)" }}>
      <p style={{ color: "var(--admin-muted)" }}>
        Sample status: <span style={{ color: "var(--admin-fg)" }}>{vm.sampleStatus}</span>
      </p>
      <p style={{ color: "var(--admin-muted)" }}>
        Mockup deal: <span style={{ color: "var(--admin-fg)" }}>{vm.mockupDealStatus || "—"}</span>
      </p>
      <p style={{ color: "var(--admin-muted)" }}>
        Preview sent: <span style={{ color: "var(--admin-fg)" }}>{vm.previewSent ? "Yes" : "No"}</span>
      </p>
    </div>
  );
}
