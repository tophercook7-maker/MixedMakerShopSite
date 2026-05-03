export const CRM_PROJECT_STATUSES = [
  "draft",
  "estimate_sent",
  "deposit_requested",
  "deposit_received",
  "scheduled",
  "in_progress",
  "waiting_on_customer",
  "completed",
  "archived",
] as const;

export type CrmProjectStatus = (typeof CRM_PROJECT_STATUSES)[number];

export const CRM_PROJECT_STATUS_LABELS: Record<CrmProjectStatus, string> = {
  draft: "Draft",
  estimate_sent: "Estimate sent",
  deposit_requested: "Deposit requested",
  deposit_received: "Deposit received",
  scheduled: "Scheduled",
  in_progress: "In progress",
  waiting_on_customer: "Waiting on customer",
  completed: "Completed",
  archived: "Archived",
};

export function projectStatusLabel(status: string | null | undefined): string {
  const key = String(status || "").trim() as CrmProjectStatus;
  return CRM_PROJECT_STATUS_LABELS[key] || String(status || "Draft").replace(/_/g, " ");
}

export function projectStatusClass(status: string | null | undefined): string {
  const key = String(status || "").trim();
  if (key === "completed") return "admin-badge admin-badge-complete";
  if (key === "scheduled" || key === "in_progress") return "admin-badge admin-badge-progress";
  if (key === "archived" || key === "waiting_on_customer") return "admin-badge admin-badge-muted";
  return "admin-badge admin-badge-new";
}
