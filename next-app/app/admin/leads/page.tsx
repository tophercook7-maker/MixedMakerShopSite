import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LeadsTable } from "@/components/admin/leads-table";
import { PipelineBoard } from "@/components/admin/pipeline-board";
import { BackfillLeadsButton } from "@/components/admin/backfill-leads-button";
import { refreshDueFollowUps } from "@/lib/leads-workflow";

const STATUSES = [
  "new",
  "contacted",
  "follow_up_due",
  "replied",
  "closed_won",
  "closed_lost",
  "do_not_contact",
];

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    lead?: string;
    focus?: string;
    source?: string;
    date?: string;
    status?: string;
    sort?: string;
    generate?: string;
  }>;
}) {
  const { view, lead, focus, source, date, status, sort, generate } = await searchParams;
  const showPipeline = view === "pipeline";
  await refreshDueFollowUps();

  const supabase = await createClient();
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  let query = supabase.from("leads").select("*");
  if (source) query = query.eq("lead_source", source);
  if (date === "today") query = query.gte("created_at", dayStart);
  if (status) query = query.eq("status", status);
  if (sort === "score_desc") {
    query = query.order("opportunity_score", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }
  console.info("[Admin Leads] navigating to detail page with filters", {
    source: source || null,
    date: date || null,
    status: status || null,
    sort: sort || null,
  });
  const { data: leads } = await query;
  console.info("[Admin Leads] detail query returned X rows", (leads || []).length);

  const byStatus = STATUSES.map((s) => ({
    status: s,
    leads: (leads ?? []).filter((l) => l.status === s),
  }));
  const newLeads = (leads ?? []).filter((l) => l.status === "new");
  const followUpsDue = (leads ?? []).filter((l) => l.status === "follow_up_due");
  const replied = (leads ?? []).filter((l) => l.status === "replied");
  const closed = (leads ?? []).filter((l) =>
    ["closed_won", "closed_lost", "do_not_contact"].includes(String(l.status || ""))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>Leads</h1>
        <div className="flex gap-2">
          <BackfillLeadsButton />
          <Link
            href="/admin/leads?view=table"
            className={!showPipeline ? "admin-btn-primary" : "admin-btn-ghost"}
          >
            Table
          </Link>
          <Link
            href="/admin/leads?view=pipeline"
            className={showPipeline ? "admin-btn-primary" : "admin-btn-ghost"}
          >
            Pipeline
          </Link>
        </div>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>New Leads</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{newLeads.length}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Follow-Ups Due</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{followUpsDue.length}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Replied</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{replied.length}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Closed</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{closed.length}</p>
        </div>
      </section>
      {showPipeline ? (
        <PipelineBoard initialStatuses={byStatus} />
      ) : (
        <LeadsTable
          leads={leads ?? []}
          initialLeadId={lead}
          initialFocus={focus}
          initialGenerate={generate}
          emptyStateTitle={
            source === "scout-brain" && date === "today"
              ? "No scout leads found for today"
              : status === "follow_up_due"
                ? "No follow-ups due"
                : "No leads match your filters"
          }
          emptyStateDescription={
            source === "scout-brain" && date === "today"
              ? "Try running Scout again or check intake rules."
              : status === "follow_up_due"
                ? "Follow-up leads will appear here when due."
                : "Try a different search or status."
          }
        />
      )}
    </div>
  );
}
