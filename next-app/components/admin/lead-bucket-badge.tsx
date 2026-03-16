import { canonicalLeadBucket, type CanonicalLeadBucket, leadBucketBadgeClass } from "@/lib/lead-bucket";

type LeadBucketBadgeProps = {
  bucket?: string | null;
  score?: number | null;
  className?: string;
};

export function LeadBucketBadge({ bucket, score, className = "" }: LeadBucketBadgeProps) {
  const label: CanonicalLeadBucket = canonicalLeadBucket(bucket, score ?? null);
  const cls = `${leadBucketBadgeClass(label)} ${className}`.trim();
  return <span className={cls}>{label}</span>;
}

