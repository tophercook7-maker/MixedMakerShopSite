import { getScoutSummary, getTopOpportunities } from "@/lib/scout/server";
import { ScoutConsole } from "@/components/admin/scout-console";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminScoutPage() {
  let summaryResult: Awaited<ReturnType<typeof getScoutSummary>>;
  let topResult: Awaited<ReturnType<typeof getTopOpportunities>>;
  try {
    [summaryResult, topResult] = await Promise.all([getScoutSummary(), getTopOpportunities()]);
  } catch (error) {
    console.error("[Admin Scout] scout page load failed", error);
    summaryResult = {
      configured: false,
      data: null,
      error: "Scout load failed. Retry from the Scout panel.",
    };
    topResult = {
      configured: false,
      data: null,
      error: "Top opportunities failed to load.",
    };
  }
  return (
    <ScoutConsole
      integrationReady={summaryResult.configured}
      initialSummary={summaryResult.data}
      initialTopLeads={topResult.data?.leads ?? []}
      initialError={summaryResult.error || topResult.error}
    />
  );
}
