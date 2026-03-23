"use client";

import Link from "next/link";
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { buildLeadPath } from "@/lib/lead-route";
import { prettyLeadStatus, leadStatusClass } from "@/components/admin/lead-visuals";

export function TopPicksStrip({ leads }: { leads: WorkflowLead[] }) {
  if (leads.length === 0) return null;

  return (
    <section
      className="rounded-xl border-2 p-4 sm:p-5 space-y-3"
      style={{
        borderColor: "rgba(16, 185, 129, 0.5)",
        background: "linear-gradient(145deg, rgba(16, 185, 129, 0.1), rgba(0,0,0,0.28))",
      }}
      aria-label="Top Picks"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-300/95">Top Picks</p>
          <p className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
            Your working list
          </p>
          <p className="text-xs max-w-2xl leading-snug" style={{ color: "var(--admin-muted)" }}>
            Hand-picked priority leads — separate from Scout. Use the <strong className="text-emerald-200/90">Top Picks</strong> filter
            to focus the full list, or open a business below.
          </p>
        </div>
        <Link
          href="/admin/leads?pool=top_picks"
          className="admin-btn-ghost text-xs px-3 py-2 rounded-lg border border-emerald-500/35 whitespace-nowrap"
        >
          View only Top Picks →
        </Link>
      </div>
      <ul className="flex gap-2 overflow-x-auto pb-1 list-none p-0 m-0 snap-x snap-mandatory">
        {leads.map((lead) => {
          const href = buildLeadPath(lead.id, lead.business_name);
          return (
            <li key={lead.id} className="snap-start shrink-0 w-[min(100%,220px)]">
              <Link
                href={href}
                className="flex flex-col gap-1 rounded-lg border p-3 h-full min-h-[88px] hover:border-emerald-400/50 transition-colors"
                style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.25)" }}
              >
                <span className="text-sm font-semibold leading-tight line-clamp-2" style={{ color: "var(--admin-fg)" }}>
                  {lead.business_name}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full w-fit ${leadStatusClass(lead.status)}`}>
                  {prettyLeadStatus(lead.status)}
                </span>
                {lead.city ? (
                  <span className="text-[10px] opacity-80" style={{ color: "var(--admin-muted)" }}>
                    {lead.city}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
