"use client";

import type { WebCrmLane } from "@/lib/crm/web-lead-lane";

const TABS: { id: WebCrmLane | "all"; label: string }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "ready_now", label: "Ready now" },
  { id: "waiting", label: "Waiting" },
  { id: "responded", label: "Responded" },
  { id: "sample_active", label: "Sample active" },
  { id: "qualified_deal", label: "Qualified" },
  { id: "won", label: "Won" },
  { id: "parked", label: "Parked" },
  { id: "all", label: "All" },
];

export function WebLaneTabs({
  active,
  onChange,
  counts,
}: {
  active: WebCrmLane | "all";
  onChange: (lane: WebCrmLane | "all") => void;
  counts: Partial<Record<WebCrmLane | "all", number>>;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 border-b pb-2" style={{ borderColor: "var(--admin-border)" }}>
      {TABS.map(({ id, label }) => {
        const n = counts[id];
        const activeTab = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
              activeTab ? "border-[var(--admin-gold)] bg-[rgba(201,97,44,0.12)]" : "border-transparent hover:border-[var(--admin-border)]"
            }`}
            style={{ color: activeTab ? "var(--admin-fg)" : "var(--admin-muted)" }}
          >
            {label}
            {typeof n === "number" ? <span className="ml-1 opacity-70">({n})</span> : null}
          </button>
        );
      })}
    </div>
  );
}
