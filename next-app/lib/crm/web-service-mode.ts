import { isThreeDPrintLead } from "@/lib/crm/three-d-print-lead";

export type WebServiceMode = "web_design" | "3d_printing" | "unknown";

export function resolveServiceMode(row: {
  lead_source?: string | null;
  source?: string | null;
  category?: string | null;
  lead_tags?: string[] | null;
  service_type?: string | null;
}): WebServiceMode {
  if (isThreeDPrintLead(row)) return "3d_printing";
  const st = String(row.service_type || "").trim().toLowerCase();
  if (st === "3d_printing") return "3d_printing";
  if (st === "web_design") return "web_design";
  return "web_design";
}
