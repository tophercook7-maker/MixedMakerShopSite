"use client";

import type { WebLeadViewModel } from "@/lib/crm/web-lead-view-model";

export function WebLeadSourcePanel({ vm, raw }: { vm: WebLeadViewModel; raw: Record<string, unknown> }) {
  const preview = JSON.stringify(
    {
      id: raw.id,
      source: raw.source,
      lead_source: raw.lead_source,
      source_label: raw.source_label,
      source_url: raw.source_url,
      source_query: raw.source_query,
      source_platform: raw.source_platform,
      capture_run_id: raw.capture_run_id,
      capture_notes: raw.capture_notes,
      linked_opportunity_id: raw.linked_opportunity_id,
      place_id: raw.place_id,
      workspace_id: raw.workspace_id,
    },
    null,
    2
  );

  return (
    <details className="admin-card p-4">
      <summary className="text-sm font-semibold cursor-pointer" style={{ color: "var(--admin-fg)" }}>
        Details / source / diagnostics
      </summary>
      <div className="mt-3 space-y-3 text-xs font-mono overflow-x-auto" style={{ color: "var(--admin-muted)" }}>
        <pre className="whitespace-pre-wrap">{preview}</pre>
      </div>
    </details>
  );
}
