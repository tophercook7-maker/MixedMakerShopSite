"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { REPORTING_SOURCE_FILTER_OPTIONS } from "@/lib/crm/lead-source-reporting";

/**
 * Sets `lead_source` query param (normalized key) while preserving other params.
 */
export function LeadSourceUrlFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get("lead_source") || "";

  function setSource(next: string) {
    const p = new URLSearchParams(sp.toString());
    if (next) p.set("lead_source", next);
    else p.delete("lead_source");
    const q = p.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  }

  return (
    <label className="flex flex-col gap-1 text-xs min-w-[200px]" style={{ color: "var(--admin-muted)" }}>
      <span>Filter by source</span>
      <select
        className="admin-input h-9 text-sm"
        value={current}
        onChange={(e) => setSource(e.target.value)}
        aria-label="Filter leads by source"
      >
        {REPORTING_SOURCE_FILTER_OPTIONS.map((o) => (
          <option key={o.value || "all"} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
