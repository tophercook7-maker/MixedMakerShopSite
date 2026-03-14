import { getScoutSummary, getTopOpportunities } from "@/lib/scout/server";
import { ScoutConsole } from "@/components/admin/scout-console";

export default async function AdminScoutPage() {
  const [summaryResult, topResult] = await Promise.all([getScoutSummary(), getTopOpportunities()]);
  return (
    <ScoutConsole
      integrationReady={summaryResult.configured}
      initialSummary={summaryResult.data}
      initialTopLeads={topResult.data?.leads ?? []}
      initialError={summaryResult.error || topResult.error}
    />
  );
}
