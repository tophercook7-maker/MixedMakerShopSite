import { ScoutReviewQueue } from "@/components/admin/scout-review-queue";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ScoutReviewPage() {
  return <ScoutReviewQueue />;
}
