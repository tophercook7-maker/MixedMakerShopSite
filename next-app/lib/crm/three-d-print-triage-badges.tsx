import type { ReactNode } from "react";
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { hasPrintFileAttached, resolvePrintUiLane } from "@/lib/crm/three-d-print-ui-lanes";
import { normalizePrintPipelineStatus } from "@/lib/crm/three-d-print-lead";

const chip =
  "inline-flex items-center rounded-md border px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide";

export type ThreeDTriageBadge = { key: string; className: string; label: string };

export function computeThreeDPrintTriageBadges(lead: WorkflowLead): ThreeDTriageBadge[] {
  const out: ThreeDTriageBadge[] = [];
  const p = normalizePrintPipelineStatus(lead.print_pipeline_status);
  const lane = resolvePrintUiLane(lead);
  const mat = String(lead.print_material || "").trim();

  if (hasPrintFileAttached(lead)) {
    out.push({ key: "file", className: `${chip} border-emerald-500/35 bg-emerald-500/10 text-emerald-200/95`, label: "File attached" });
  } else if (p === "new" || p === "need_info") {
    out.push({ key: "idea", className: `${chip} border-sky-500/35 bg-sky-500/10 text-sky-200/95`, label: "Idea only" });
  }

  if (!mat && p !== "delivered" && p !== "closed") {
    out.push({
      key: "material",
      className: `${chip} border-amber-500/35 bg-amber-500/12 text-amber-200/95`,
      label: "Needs material",
    });
  }

  if (lane === "needs_quote") {
    out.push({
      key: "quote_pending",
      className: `${chip} border-violet-500/35 bg-violet-500/12 text-violet-200/95`,
      label: "Quote pending",
    });
  }

  if (lane === "waiting_customer") {
    out.push({
      key: "wait_cust",
      className: `${chip} border-rose-500/30 bg-rose-500/10 text-rose-200/95`,
      label: "Waiting on customer",
    });
  }

  if (lead.is_hot_lead) {
    out.push({ key: "hot", className: `${chip} border-orange-400/40 bg-orange-500/15 text-orange-200`, label: "Hot lead" });
  }

  return out;
}

export function ThreeDPrintTriageBadgeRow({ lead }: { lead: WorkflowLead }): ReactNode {
  const badges = computeThreeDPrintTriageBadges(lead);
  if (!badges.length) return null;
  return (
    <div className="flex flex-wrap gap-1 pt-0.5">
      {badges.map((b) => (
        <span key={b.key} className={b.className}>
          {b.label}
        </span>
      ))}
    </div>
  );
}
