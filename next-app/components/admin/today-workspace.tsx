"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { buildLeadPath } from "@/lib/lead-route";
import type { WorkTodayItem } from "@/lib/crm/work-today-leads";

type Props = {
  workTodayLeads: WorkTodayItem[];
  children: React.ReactNode;
};

export function TodayWorkspace({ workTodayLeads, children }: Props) {
  const [focusMode, setFocusMode] = useState(false);

  const onToggleFocus = useCallback(() => {
    setFocusMode((v) => !v);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
            Today
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
            Start here — a simple checklist for your web design sales day.
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm shrink-0" style={{ color: "var(--admin-fg)" }}>
          <input type="checkbox" checked={focusMode} onChange={onToggleFocus} className="rounded border" />
          Focus mode
        </label>
      </div>

      <section className="admin-card space-y-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
          🔥 Work Today
        </h2>
        {workTodayLeads.length === 0 ? (
          <div className="space-y-3 text-sm" style={{ color: "var(--admin-muted)" }}>
            <p className="font-medium" style={{ color: "var(--admin-fg)" }}>
              You&apos;re clear for now — find new businesses
            </p>
            <Link href="/admin/scout" className="admin-btn-primary text-sm inline-block">
              Go to Scout
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {workTodayLeads.map((lead) => {
              const id = String(lead.id || "").trim();
              const name = String(lead.business_name || "").trim() || "Business";
              const openHref = buildLeadPath(id, name);
              const contactHref = `${openHref}?focus=outreach`;
              return (
                <li
                  key={id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                  style={{ borderColor: "var(--admin-border)" }}
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate" style={{ color: "var(--admin-fg)" }}>
                      {name}
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: "var(--admin-muted)" }}>
                      {lead.reasonLine}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Link href={contactHref} className="admin-btn-primary text-xs">
                      Contact
                    </Link>
                    <Link href={openHref} className="admin-btn-ghost text-xs">
                      Open
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {!focusMode ? children : null}
    </div>
  );
}
