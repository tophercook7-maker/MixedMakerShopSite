"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { WorkflowLead } from "@/components/admin/leads-workflow-view";
import { ThreeDPrintKanban } from "@/components/admin/crm/three-d-print-kanban";
import { ThreeDPrintLeadsList } from "@/components/admin/crm/three-d-print-leads-list";
import { patchLeadApi } from "@/lib/crm/patch-lead-client";
import { isThreeDPrintLead } from "@/lib/crm/three-d-print-lead";
import { resolveServiceTypeForDisplay } from "@/components/admin/crm/lead-service-type-badge";

export function PrintCrmDashboard({ initialLeads }: { initialLeads: WorkflowLead[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const printLeads = initialLeads.filter(
    (l) => isThreeDPrintLead(l) || resolveServiceTypeForDisplay(l) === "3d_printing"
  );

  const patchLead = useCallback(
    async (leadId: string, patch: Record<string, unknown>, _okMsg: string, _log?: string) => {
      setBusyId(leadId);
      const res = await patchLeadApi(leadId, patch);
      setBusyId(null);
      if (res.ok) router.refresh();
    },
    [router]
  );

  const onOpenWorkflow = useCallback((_lead: WorkflowLead) => {
    /* Dedicated print CRM — drawer not used */
  }, []);

  return (
    <div className="space-y-6">
      <ThreeDPrintKanban
        leads={printLeads}
        busyId={busyId}
        patchLead={patchLead}
        onOpenWorkflow={onOpenWorkflow}
      />
      <ThreeDPrintLeadsList
        leads={printLeads}
        busyId={busyId}
        patchLead={patchLead}
        onOpenWorkflow={onOpenWorkflow}
      />
    </div>
  );
}
