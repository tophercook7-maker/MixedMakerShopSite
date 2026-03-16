export type CanonicalLeadBucket =
  | "Easy Win"
  | "High Value"
  | "Good Prospect"
  | "Needs Review"
  | "Low Priority";

export function canonicalLeadBucket(
  rawValue: string | null | undefined,
  scoreValue?: number | null
): CanonicalLeadBucket {
  const raw = String(rawValue || "").trim().toLowerCase();
  if (raw === "easy win" || raw === "easy_win") return "Easy Win";
  if (raw === "high value" || raw === "high_value") return "High Value";
  if (raw === "good prospect" || raw === "good_prospect") return "Good Prospect";
  if (raw === "needs review" || raw === "needs_review") return "Needs Review";
  if (raw === "low priority" || raw === "low_priority") return "Low Priority";

  const score = Number(scoreValue || 0);
  if (score >= 90) return "Easy Win";
  if (score >= 75) return "High Value";
  if (score >= 60) return "Good Prospect";
  if (score >= 40) return "Needs Review";
  return "Low Priority";
}

export function leadBucketBadgeClass(bucket: CanonicalLeadBucket): string {
  if (bucket === "Easy Win") return "admin-badge admin-badge-bucket-easy";
  if (bucket === "High Value") return "admin-badge admin-badge-bucket-high";
  if (bucket === "Good Prospect") return "admin-badge admin-badge-bucket-good";
  if (bucket === "Needs Review") return "admin-badge admin-badge-bucket-review";
  return "admin-badge admin-badge-bucket-low";
}

