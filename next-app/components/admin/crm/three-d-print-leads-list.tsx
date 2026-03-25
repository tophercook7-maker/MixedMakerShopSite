"use client";

import Link from "next/link";
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { buildLeadPath } from "@/lib/lead-route";
import { normalizePrintPaymentStatus, PRINT_PAYMENT_STATUS_LABELS } from "@/lib/crm/print-payment";
import { normalizePrintPipelineStatus, printLastActivityMs, THREE_D_PRINT_PIPELINE_LABELS } from "@/lib/crm/three-d-print-lead";

function displayName(lead: WorkflowLead): string {
  const n = String(lead.known_owner_name || "").trim();
  if (n) return n;
  const b = String(lead.business_name || "").trim();
  if (b.startsWith("3D Print Quote")) return b.replace(/^3D Print Quote —\s*/i, "").trim() || b;
  return b || "—";
}

function summaryOne(lead: WorkflowLead): string {
  const s = String(lead.print_request_summary || "").trim();
  if (s) return s.length > 96 ? `${s.slice(0, 93)}…` : s;
  return "—";
}

function fmtActivity(lead: WorkflowLead): string {
  const ms = printLastActivityMs(lead);
  if (!ms) return "—";
  try {
    return new Date(ms).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function estimateLine(lead: WorkflowLead): string {
  return String(lead.print_estimate_summary || "").trim() || "—";
}

export function ThreeDPrintLeadsList({ leads }: { leads: WorkflowLead[] }) {
  if (leads.length === 0) return null;
  return (
    <ul className="space-y-2 list-none p-0 m-0">
      {leads.map((lead) => {
        const href = buildLeadPath(lead.id, lead.business_name);
        const pipe = normalizePrintPipelineStatus(lead.print_pipeline_status);
        const pay = normalizePrintPaymentStatus(lead.payment_status);
        const tags = (lead.print_tags || []).filter(Boolean);
        return (
          <li
            key={lead.id}
            className="rounded-lg border border-violet-500/30 bg-black/20 px-3 py-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Link href={href} className="font-semibold text-sm text-violet-100 hover:underline">
                  {displayName(lead)}
                </Link>
                <span className="text-[10px] font-medium text-violet-200/85">{THREE_D_PRINT_PIPELINE_LABELS[pipe]}</span>
                <span className="text-[10px] font-medium text-sky-200/90">{PRINT_PAYMENT_STATUS_LABELS[pay]}</span>
              </div>
              <p className="text-[11px] mt-1 text-zinc-400 line-clamp-2">{summaryOne(lead)}</p>
              <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1.5 text-[10px] text-zinc-500">
                <span>
                  Est: <span className="text-zinc-300">{estimateLine(lead)}</span>
                </span>
                <span>·</span>
                <span>
                  Tags:{" "}
                  {tags.length ? (
                    <span className="text-zinc-300">{tags.slice(0, 6).join(", ")}</span>
                  ) : (
                    <span>—</span>
                  )}
                </span>
                <span>·</span>
                <span>Activity: {fmtActivity(lead)}</span>
              </div>
            </div>
            <Link
              href={href}
              className="shrink-0 text-xs font-medium text-sky-400 hover:underline sm:self-center"
            >
              Open →
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
