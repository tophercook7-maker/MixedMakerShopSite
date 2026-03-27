import { cn } from "@/lib/utils";

export function serviceTypeLabel(raw: string | null | undefined): "Web Design" | "3D Printing" | null {
  const v = String(raw || "")
    .trim()
    .toLowerCase();
  if (v === "web_design") return "Web Design";
  if (v === "3d_printing") return "3D Printing";
  return null;
}

/** When `service_type` is null, infer from source tags for display only. */
export function resolveServiceTypeForDisplay(lead: {
  service_type?: string | null;
  lead_source?: string | null;
  source?: string | null;
  lead_tags?: string[] | null;
}): string | null {
  if (lead.service_type && String(lead.service_type).trim()) return String(lead.service_type).trim();
  const hay = [
    lead.lead_source,
    lead.source,
    ...(Array.isArray(lead.lead_tags) ? lead.lead_tags : []),
  ]
    .map((x) => String(x || "").toLowerCase())
    .join(" ");
  if (/(3d_printing|3d printing|print_quote|print_request|\bprint\b)/i.test(hay)) return "3d_printing";
  if (/(mockup|web_design|website)/i.test(hay)) return "web_design";
  return null;
}

export function LeadServiceTypeBadge({
  serviceType,
  className,
}: {
  serviceType: string | null | undefined;
  className?: string;
}) {
  const label = serviceTypeLabel(serviceType);
  if (!label) return null;
  const isWeb = label === "Web Design";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shrink-0",
        isWeb
          ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/35"
          : "bg-amber-500/15 text-amber-100 border border-amber-500/35",
        className,
      )}
    >
      {label}
    </span>
  );
}
