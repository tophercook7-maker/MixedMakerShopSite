const FORM_LEAD_SOURCES = new Set([
  "contact_form",
  "idea_lab",
  "quote_request",
  "ring_connect",
  "website_check",
]);

export type LeadSourceFilter = "all" | "captain_maker_chat" | "free_estimate_form";
export type LeadPriority = "hot" | "warm" | "browsing";

export type LeadPriorityDisplay = {
  key: LeadPriority;
  label: "Hot" | "Warm" | "Browsing";
  className: string;
  isManual: boolean;
};

export function rawLeadSource(row: Record<string, unknown>): string {
  return String(row.lead_source || row.source || "")
    .trim()
    .toLowerCase();
}

export function displayLeadSourceLabel(row: Record<string, unknown>): string {
  const source = rawLeadSource(row);
  if (source === "captain_maker_chat" || source === "captain_maker") return "Captain Maker Chat";
  if (FORM_LEAD_SOURCES.has(source)) return "Free Estimate Form";
  if (!source) return "Unknown source";
  return source
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function leadMatchesSourceDisplayFilter(row: Record<string, unknown>, filter: LeadSourceFilter): boolean {
  if (filter === "all") return true;
  const source = rawLeadSource(row);
  if (filter === "captain_maker_chat") return source === "captain_maker_chat" || source === "captain_maker";
  return FORM_LEAD_SOURCES.has(source);
}

function noteField(notes: string, labels: string[]): string {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = notes.match(new RegExp(`^${escaped}:\\s*(.+)$`, "im"));
    const value = match?.[1]?.trim();
    if (value && value !== "(not provided)") return value;
  }
  return "";
}

export function buildLeadSummary(row: Record<string, unknown>) {
  const notes = String(row.notes || "");
  const category = String(row.category || "").trim();
  const serviceType = String(row.service_type || "").trim();
  return {
    projectType:
      noteField(notes, ["Project type", "Recommendation"]) ||
      category ||
      serviceType ||
      "Not specified",
    budgetRange: noteField(notes, ["Budget range", "Budget"]) || "Not specified",
    timeline: noteField(notes, ["Timeline"]) || "Not specified",
    source: displayLeadSourceLabel(row),
  };
}

function normalizeLoose(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[$,]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");
}

function manualPriority(row: Record<string, unknown>): LeadPriority | null {
  const raw = normalizeLoose(String(row.lead_bucket || row.priority || ""));
  if (raw === "hot") return "hot";
  if (raw === "warm") return "warm";
  if (raw === "browsing") return "browsing";
  return null;
}

export function deriveLeadPriority(row: Record<string, unknown>): LeadPriorityDisplay {
  const manual = manualPriority(row);
  const summary = buildLeadSummary(row);
  const projectType = normalizeLoose(summary.projectType);
  const budget = normalizeLoose(summary.budgetRange);
  const timeline = normalizeLoose(summary.timeline);

  const derived: LeadPriority =
    timeline.includes("asap") ||
    timeline.includes("this week") ||
    budget.includes("400-") ||
    budget.includes("400+") ||
    budget.includes("800+") ||
    budget.includes("1000") ||
    projectType.includes("website") ||
    projectType.includes("ai bot")
      ? "hot"
      : timeline.includes("this month") ||
          budget.includes("100-300") ||
          budget.includes("100-400") ||
          projectType.includes("landing page") ||
          projectType.includes("flyers") ||
          projectType.includes("ads") ||
          projectType.includes("3d print") ||
          projectType.includes("custom / 3d")
        ? "warm"
        : timeline.includes("just getting ideas") ||
            budget.includes("not sure") ||
            projectType.includes("not sure")
          ? "browsing"
          : "browsing";

  const key = manual || derived;
  const meta = {
    hot: { label: "Hot", className: "admin-priority-hot" },
    warm: { label: "Warm", className: "admin-priority-warm" },
    browsing: { label: "Browsing", className: "admin-priority-browsing" },
  } satisfies Record<LeadPriority, { label: LeadPriorityDisplay["label"]; className: string }>;

  return { key, label: meta[key].label, className: meta[key].className, isManual: Boolean(manual) };
}

export function leadMatchesPriorityFilter(row: Record<string, unknown>, filter: LeadPriority | "all"): boolean {
  return filter === "all" || deriveLeadPriority(row).key === filter;
}
