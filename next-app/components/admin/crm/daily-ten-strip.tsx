"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { buildLeadPath } from "@/lib/lead-route";
import { getTopDailyLeadBatch } from "@/lib/crm/daily-real-leads-batch";
import { resolveLeadPrimaryAction } from "@/lib/crm/lead-primary-action";
import { PromoteToTopPicksButton } from "@/components/admin/crm/promote-to-top-picks-button";

function bestContactLine(lead: WorkflowLead): string {
  const m = String(lead.best_contact_method || "").trim().toLowerCase();
  if (m === "email" && lead.email) return "Email";
  if (m === "phone" && lead.phone_from_site) return "Phone";
  if ((m === "facebook" || m === "contact_page" || m === "contact_form") && lead.contact_page) return "Contact page";
  if (m === "facebook" && lead.facebook_url) return "Facebook";
  if (lead.email) return "Email";
  if (lead.phone_from_site) return "Phone";
  if (lead.contact_page) return "Contact page";
  if (lead.facebook_url) return "Facebook";
  return "Reachable";
}

export function DailyTenStrip({ leads }: { leads: WorkflowLead[] }) {
  const batch = useMemo(() => getTopDailyLeadBatch(leads, 10), [leads]);

  if (batch.length === 0) {
    return (
      <section
        className="rounded-xl border border-blue-500/25 p-4 sm:p-5 space-y-2"
        style={{ background: "linear-gradient(145deg, rgba(59, 130, 246, 0.06), rgba(0,0,0,0.2))" }}
        aria-label="Daily 10"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-blue-200/90">Daily 10</p>
        <p className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          Today&apos;s best Facebook no-website leads with a way to reach them
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--admin-muted)" }}>
          No good Facebook no-website leads are ready right now.
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border-2 border-blue-500/35 p-4 sm:p-5 space-y-4 shadow-[0_0_24px_rgba(59,130,246,0.12)]"
      style={{ background: "linear-gradient(150deg, rgba(59, 130, 246, 0.1), rgba(0,0,0,0.28))" }}
      aria-label="Daily 10"
    >
      <div className="space-y-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-200/90">Daily 10</p>
        <p className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          Today&apos;s best Facebook no-website leads with a way to reach them
        </p>
        <p className="text-xs max-w-2xl leading-snug" style={{ color: "var(--admin-muted)" }}>
          A short queue — not the full list. Promote the best ones to Top Picks when you&apos;re ready.
        </p>
      </div>
      <ul className="space-y-3 list-none m-0 p-0">
        {batch.map((lead) => {
          const href = buildLeadPath(lead.id, lead.business_name);
          const action = resolveLeadPrimaryAction(lead, { workspaceHref: href });
          const why = String(lead.why_this_lead_is_here || "").trim() || "—";
          return (
            <li
              key={lead.id}
              className="rounded-lg border border-blue-500/20 px-3 py-3 sm:px-4 flex flex-col sm:flex-row sm:items-center gap-3"
              style={{ background: "rgba(0,0,0,0.22)" }}
            >
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--admin-fg)" }}>
                  {lead.business_name}
                </p>
                <p className="text-xs leading-snug line-clamp-2" style={{ color: "var(--admin-muted)" }}>
                  {why}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-blue-200/75">
                  Best contact · {bestContactLine(lead)}
                </p>
                <p className="text-xs text-slate-300/90">
                  <span className="text-slate-500">Action:</span> {action.label}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center shrink-0">
                <Link
                  href={href}
                  className="admin-btn-primary text-xs px-3 py-2 rounded-lg inline-flex items-center justify-center"
                >
                  Open
                </Link>
                {action.href && action.type !== "open" ? (
                  <a
                    href={action.href}
                    className="admin-btn-ghost text-xs px-3 py-2 rounded-lg border border-blue-500/30"
                    {...(action.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {action.label}
                  </a>
                ) : null}
                <PromoteToTopPicksButton
                  leadId={lead.id}
                  initialTags={lead.lead_tags}
                  isTopPick={false}
                  className="text-xs"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
