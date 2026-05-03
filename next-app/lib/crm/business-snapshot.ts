import type { SupabaseClient } from "@supabase/supabase-js";
import { deriveLeadPriority } from "@/lib/crm/lead-display";
import { calculateProjectBalance, projectMoneyBadge } from "@/lib/crm/project-money";

type ProjectSnapshotRow = {
  status?: string | null;
  price?: number | string | null;
  estimated_price?: number | string | null;
  amount_paid?: number | string | null;
  payment_status?: string | null;
  amount_paid_updated_at?: string | null;
  completed_at?: string | null;
};

export type CrmBusinessSnapshotStats = {
  newLeads: number;
  hotLeads: number;
  activeProjects: number;
  scheduledProjects: number;
  balanceDueProjects: number;
  estimatedUnpaidBalance: number;
  paidThisMonth: number;
  completedProjectsThisMonth: number;
};

function startOfMonthIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function money(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export async function getCrmBusinessSnapshotStats(
  supabase: SupabaseClient,
  ownerId: string,
): Promise<CrmBusinessSnapshotStats> {
  const scopedOwnerId = ownerId.trim();
  if (!scopedOwnerId) {
    return {
      newLeads: 0,
      hotLeads: 0,
      activeProjects: 0,
      scheduledProjects: 0,
      balanceDueProjects: 0,
      estimatedUnpaidBalance: 0,
      paidThisMonth: 0,
      completedProjectsThisMonth: 0,
    };
  }

  const monthStart = startOfMonthIso();
  const [newLeadsResult, leadRowsResult, projectsResult] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", scopedOwnerId)
      .eq("status", "new"),
    supabase
      .from("leads")
      .select("id,notes,category,service_type,lead_bucket")
      .eq("owner_id", scopedOwnerId)
      .neq("status", "archived"),
    supabase
      .from("projects")
      .select("status,price,estimated_price,amount_paid,payment_status,amount_paid_updated_at,completed_at")
      .eq("owner_id", scopedOwnerId),
  ]);

  if (newLeadsResult.error) console.error("[crm snapshot] new leads count failed", newLeadsResult.error);
  if (leadRowsResult.error) console.error("[crm snapshot] hot leads query failed", leadRowsResult.error);
  if (projectsResult.error) console.error("[crm snapshot] projects query failed", projectsResult.error);

  const projects = (projectsResult.data ?? []) as ProjectSnapshotRow[];
  const activeStatuses = new Set([
    "draft",
    "estimate_sent",
    "deposit_requested",
    "deposit_received",
    "in_progress",
    "waiting_on_customer",
  ]);

  const balanceDueProjects = projects.filter((project) => {
    const estimatedPrice = project.estimated_price ?? project.price ?? 0;
    return projectMoneyBadge({
      estimatedPrice,
      amountPaid: project.amount_paid ?? 0,
      paymentStatus: project.payment_status,
    }).label === "Balance Due";
  });

  return {
    newLeads: Number(newLeadsResult.count || 0),
    hotLeads: (leadRowsResult.data ?? []).filter((lead) => deriveLeadPriority(lead as Record<string, unknown>).key === "hot")
      .length,
    activeProjects: projects.filter((project) => activeStatuses.has(String(project.status || ""))).length,
    scheduledProjects: projects.filter((project) => project.status === "scheduled").length,
    balanceDueProjects: balanceDueProjects.length,
    estimatedUnpaidBalance: balanceDueProjects.reduce(
      (sum, project) => sum + calculateProjectBalance(project.estimated_price ?? project.price ?? 0, project.amount_paid ?? 0),
      0,
    ),
    paidThisMonth: projects
      .filter((project) => String(project.amount_paid_updated_at || "") >= monthStart)
      .reduce((sum, project) => sum + money(project.amount_paid), 0),
    completedProjectsThisMonth: projects.filter(
      (project) => project.status === "completed" && String(project.completed_at || "") >= monthStart,
    ).length,
  };
}
