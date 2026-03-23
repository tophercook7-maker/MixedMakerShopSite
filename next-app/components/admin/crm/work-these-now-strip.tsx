"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { buildLeadPath } from "@/lib/lead-route";
import {
  getTopWorkLeads,
  resolveWorkLeadPrimaryAction,
  workTheseNowContextLine,
} from "@/lib/crm/work-these-leads";

export function WorkTheseNowStrip({ leads }: { leads: WorkflowLead[] }) {
  const topWork = useMemo(() => getTopWorkLeads(leads), [leads]);

  if (leads.length === 0) return null;

  if (topWork.length === 0) {
    return (
      <section
        className="rounded-xl border-2 px-4 py-4 sm:px-5 sm:py-5"
        style={{
          borderColor: "rgba(34, 197, 94, 0.35)",
          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(0,0,0,0.25))",
        }}
      >
        <p className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          Work these now
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--admin-muted)" }}>
          Nothing ready to contact right now.
        </p>
        <p className="text-[11px] mt-2 opacity-90" style={{ color: "var(--admin-muted)" }}>
          Try checking <span className="text-[var(--admin-gold)]">Facebook Only</span> or{" "}
          <span className="text-[var(--admin-gold)]">Needs Research</span> folders.
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border-2 px-4 py-4 sm:px-5 sm:py-5 space-y-3"
      style={{
        borderColor: "rgba(212, 175, 55, 0.55)",
        background: "linear-gradient(165deg, rgba(212, 175, 55, 0.12), rgba(0,0,0,0.28))",
        boxShadow: "0 0 0 1px rgba(212, 175, 55, 0.12), 0 12px 40px rgba(0,0,0,0.25)",
      }}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--admin-gold)" }}>
          Work these now
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
          Best leads ready to contact
        </p>
      </div>
      <ul className="space-y-2 list-none p-0 m-0">
        {topWork.map((lead) => {
          const action = resolveWorkLeadPrimaryAction(lead);
          const workspace = buildLeadPath(lead.id, lead.business_name);
          return (
            <li
              key={lead.id}
              className="flex flex-col gap-3 rounded-lg border px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              style={{
                borderColor: "var(--admin-border)",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-tight truncate" style={{ color: "var(--admin-fg)" }}>
                  {lead.business_name}
                </p>
                <p className="text-[11px] mt-1 leading-snug line-clamp-2" style={{ color: "var(--admin-muted)" }}>
                  {workTheseNowContextLine(lead)}
                </p>
                {action ? (
                  <p className="text-[11px] mt-1 font-medium" style={{ color: "var(--admin-fg)" }}>
                    {action.detailLine}
                  </p>
                ) : (
                  <p className="text-[11px] mt-1 italic" style={{ color: "var(--admin-muted)" }}>
                    No direct link — open workspace
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                {action ? (
                  <a
                    href={action.href}
                    {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="admin-btn-primary text-xs px-3 py-2 rounded-lg whitespace-nowrap"
                  >
                    {action.label}
                  </a>
                ) : (
                  <Link href={workspace} className="admin-btn-primary text-xs px-3 py-2 rounded-lg whitespace-nowrap">
                    Open
                  </Link>
                )}
                {action ? (
                  <Link
                    href={workspace}
                    className="text-[11px] underline underline-offset-2 opacity-70 hover:opacity-100 px-1"
                    style={{ color: "var(--admin-muted)" }}
                  >
                    Open
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
