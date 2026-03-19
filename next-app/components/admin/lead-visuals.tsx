import { canonicalLeadBucket } from "@/lib/lead-bucket";

export function leadStatusClass(status: string | null | undefined): string {
  const normalized = String(status || "new").trim().toLowerCase();
  if (normalized === "new") return "admin-badge-lead-new";
  if (normalized === "contacted" || normalized === "follow_up_due" || normalized === "follow_up") return "admin-badge-lead-contacted";
  if (normalized === "replied") return "admin-badge-lead-replied";
  if (normalized === "research_later" || normalized === "no_response" || normalized === "not_interested") return "admin-badge-lead-research";
  if (normalized === "closed" || normalized === "closed_won" || normalized === "closed_lost" || normalized === "won" || normalized === "archived") return "admin-badge-lead-closed";
  return "admin-badge-lead-new";
}

export function prettyLeadStatus(status: string | null | undefined): string {
  return String(status || "new")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export type PriorityBadge = {
  key: string;
  label: string;
  className: string;
};

export function getLeadPriorityBadges(input: {
  isHotLead?: boolean | null;
  bucket?: string | null;
  score?: number | null;
  email?: string | null;
  phone?: string | null;
}): PriorityBadge[] {
  const badges: PriorityBadge[] = [];
  const hasEmail = Boolean(String(input.email || "").trim());
  const hasPhone = Boolean(String(input.phone || "").trim());
  const bucket = canonicalLeadBucket(input.bucket || null, input.score ?? null);

  if (input.isHotLead) badges.push({ key: "hot", label: "🔥 Hot Lead", className: "admin-priority-hot" });
  if (bucket === "Easy Win") badges.push({ key: "easy", label: "⚡ Easy Win", className: "admin-priority-easy" });
  if (!hasEmail) badges.push({ key: "no-email", label: "🚫 No Email", className: "admin-priority-no-email" });
  if (hasPhone && !hasEmail) badges.push({ key: "phone", label: "📱 Phone Lead", className: "admin-priority-phone" });

  return badges;
}

