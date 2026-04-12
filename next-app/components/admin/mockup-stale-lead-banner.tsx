"use client";

import type { LeadStaleSeverity } from "@/lib/lead-stale";

type Props = {
  isStale: boolean;
  reason: string;
  severity: LeadStaleSeverity;
  suggestedMessage: string;
};

function severityBorder(sev: LeadStaleSeverity): string {
  switch (sev) {
    case "high":
      return "border-red-500/45 bg-red-500/10";
    case "medium":
      return "border-amber-500/45 bg-amber-500/10";
    default:
      return "border-amber-500/30 bg-amber-500/5";
  }
}

export function MockupStaleLeadBanner({ isStale, reason, severity, suggestedMessage }: Props) {
  if (!isStale) return null;

  return (
    <div
      className={`mb-6 rounded-lg border p-4 ${severityBorder(severity)}`}
      role="status"
    >
      <p className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
        ⚠️ {reason}
      </p>
      <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--admin-muted)" }}>
        {suggestedMessage}
      </p>
      <button
        type="button"
        className="mt-3 rounded-md bg-[var(--admin-gold)] px-4 py-2 text-sm font-semibold text-black hover:opacity-95"
        onClick={() => {
          document.getElementById("follow-up-draft")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        Follow up now
      </button>
    </div>
  );
}
