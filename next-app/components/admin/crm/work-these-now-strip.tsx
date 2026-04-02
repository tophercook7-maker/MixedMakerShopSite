"use client";

import { useMemo } from "react";
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { LeadsListReturnLink } from "@/components/admin/crm/leads-list-return-link";
import { buildLeadPath } from "@/lib/lead-route";
import { leadPrimaryActionDetailLine, resolveLeadPrimaryAction } from "@/lib/crm/lead-primary-action";
import { getRepliedStripLeads, getTopWorkLeads, workTheseNowContextLine } from "@/lib/crm/work-these-leads";

function replyPreviewLine(lead: WorkflowLead): string | null {
  const t = String(lead.last_reply_preview || "").replace(/\s+/g, " ").trim();
  if (!t) return null;
  const s = t.length > 120 ? `${t.slice(0, 117)}…` : t;
  return `Reply: ${s}`;
}

export function WorkTheseNowStrip({ leads }: { leads: WorkflowLead[] }) {
  const repliedTop = useMemo(() => getRepliedStripLeads(leads), [leads]);
  const topWork = useMemo(() => getTopWorkLeads(leads), [leads]);

  if (leads.length === 0) return null;

  const renderActionRow = (lead: WorkflowLead, variant: "replied" | "work") => {
    const workspace = buildLeadPath(lead.id, lead.business_name);
    const action = resolveLeadPrimaryAction(lead, { workspaceHref: workspace });
    const replyLine = replyPreviewLine(lead);
    return (
      <li
        key={`${variant}-${lead.id}`}
        className="flex flex-col gap-3 rounded-lg border px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        style={{
          borderColor: variant === "replied" ? "rgba(34, 197, 94, 0.45)" : "var(--admin-border)",
          background: variant === "replied" ? "rgba(34, 197, 94, 0.08)" : "rgba(0,0,0,0.2)",
        }}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight truncate" style={{ color: "var(--admin-fg)" }}>
            {lead.business_name}
            {variant === "replied" ? (
              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-emerald-300/95">Replied</span>
            ) : null}
          </p>
          <p className="text-[11px] mt-1 leading-snug line-clamp-2" style={{ color: "var(--admin-muted)" }}>
            {workTheseNowContextLine(lead)}
          </p>
          {replyLine ? (
            <p className="text-[11px] mt-1 font-medium text-emerald-100/90 line-clamp-2">{replyLine}</p>
          ) : null}
          <p className="text-[11px] mt-1 font-medium" style={{ color: "var(--admin-fg)" }}>
            {leadPrimaryActionDetailLine(action)}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {action.type === "research" ? (
            <LeadsListReturnLink href={workspace} className="admin-btn-primary text-xs px-3 py-2 rounded-lg whitespace-nowrap">
              {action.label}
            </LeadsListReturnLink>
          ) : action.href ? (
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={action.href}
                {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="admin-btn-primary text-xs px-3 py-2 rounded-lg whitespace-nowrap"
              >
                {action.label}
              </a>
              {action.secondary?.href ? (
                <a
                  href={action.secondary.href}
                  className="text-[11px] underline underline-offset-2 opacity-80 hover:opacity-100 px-0.5"
                  style={{ color: "var(--admin-muted)" }}
                >
                  {action.secondary.label}
                </a>
              ) : null}
            </div>
          ) : (
            <LeadsListReturnLink href={workspace} className="admin-btn-primary text-xs px-3 py-2 rounded-lg whitespace-nowrap">
              Open
            </LeadsListReturnLink>
          )}
          {action.type !== "research" && action.href ? (
            <LeadsListReturnLink
              href={workspace}
              className="text-[11px] underline underline-offset-2 opacity-70 hover:opacity-100 px-1"
              style={{ color: "var(--admin-muted)" }}
            >
              Open workspace
            </LeadsListReturnLink>
          ) : null}
        </div>
      </li>
    );
  };

  if (repliedTop.length === 0 && topWork.length === 0) {
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
          No active replies or cold contacts queued.
        </p>
        <p className="text-[11px] mt-2 opacity-90" style={{ color: "var(--admin-muted)" }}>
          Replied leads with a contact path appear here first. Ready-to-contact leads show below when available.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      {repliedTop.length > 0 ? (
        <section
          className="rounded-xl border-2 px-4 py-4 sm:px-5 sm:py-5 space-y-3"
          style={{
            borderColor: "rgba(34, 197, 94, 0.5)",
            background: "linear-gradient(165deg, rgba(34, 197, 94, 0.14), rgba(0,0,0,0.28))",
            boxShadow: "0 0 0 1px rgba(34, 197, 94, 0.12), 0 12px 40px rgba(0,0,0,0.25)",
          }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300/95">They replied</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
              Follow up while it&apos;s warm — automation is paused for these
            </p>
          </div>
          <ul className="space-y-2 list-none p-0 m-0">{repliedTop.map((lead) => renderActionRow(lead, "replied"))}</ul>
        </section>
      ) : null}

      {topWork.length > 0 ? (
        <section
          className="rounded-xl border-2 px-4 py-4 sm:px-5 sm:py-5 space-y-3"
          style={{
            borderColor: "rgba(201, 97, 44, 0.55)",
            background: "linear-gradient(165deg, rgba(201, 97, 44, 0.12), rgba(0,0,0,0.28))",
            boxShadow: "0 0 0 1px rgba(201, 97, 44, 0.12), 0 12px 40px rgba(0,0,0,0.25)",
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
          <ul className="space-y-2 list-none p-0 m-0">{topWork.map((lead) => renderActionRow(lead, "work"))}</ul>
        </section>
      ) : repliedTop.length > 0 ? (
        <p className="text-[11px] px-1" style={{ color: "var(--admin-muted)" }}>
          No additional cold-outreach slots right now — you&apos;re caught up on new contacts.
        </p>
      ) : null}
    </div>
  );
}
