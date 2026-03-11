import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LeadsTable } from "@/components/admin/leads-table";
import { PipelineBoard } from "@/components/admin/pipeline-board";

const STATUSES = ["new", "contacted", "interested", "proposal_sent", "won", "lost"];

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const showPipeline = view === "pipeline";

  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const byStatus = STATUSES.map((s) => ({
    status: s,
    leads: (leads ?? []).filter((l) => l.status === s),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Leads</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/leads?view=table"
            className={`rounded-md border px-3 py-1.5 text-sm font-medium ${!showPipeline ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
          >
            Table
          </Link>
          <Link
            href="/admin/leads?view=pipeline"
            className={`rounded-md border px-3 py-1.5 text-sm font-medium ${showPipeline ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
          >
            Pipeline
          </Link>
        </div>
      </div>
      {showPipeline ? (
        <PipelineBoard initialStatuses={byStatus} />
      ) : (
        <LeadsTable leads={leads ?? []} />
      )}
    </div>
  );
}
