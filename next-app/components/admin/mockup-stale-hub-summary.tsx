import Link from "next/link";
import { parseMockupLeadStatus } from "@/lib/lead-status";
import { getLeadStaleState } from "@/lib/lead-stale";
import { createClient } from "@/lib/supabase/server";

export async function MockupStaleHubSummary() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rows, error } = await supabase
    .from("mockup_submissions")
    .select("lead_status, status, status_updated_at, created_at, updated_at");

  if (error) return null;

  const list = rows || [];
  if (!list.length) {
    return (
      <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
        Mockup leads needing attention: <span className="font-semibold text-emerald-400/90">0</span>
      </p>
    );
  }

  let staleCount = 0;
  for (const r of list) {
    const row = r as {
      lead_status?: string | null;
      status?: string | null;
      status_updated_at?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
    const pipeline = parseMockupLeadStatus(row.lead_status ?? row.status);
    const st = getLeadStaleState({
      pipeline,
      createdAt: row.created_at,
      statusUpdatedAt: row.status_updated_at,
      updatedAt: row.updated_at,
    });
    if (st.isStale) staleCount += 1;
  }

  if (staleCount === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
        Mockup leads needing attention: <span className="font-semibold text-emerald-400/90">0</span>
      </p>
    );
  }

  return (
    <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
      Mockup leads needing attention:{" "}
      <Link
        href="/admin/mockup-submissions?needs_attention=1"
        className="font-semibold text-[var(--admin-gold)] hover:underline"
      >
        {staleCount}
      </Link>
    </p>
  );
}
