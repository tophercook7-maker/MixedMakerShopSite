import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BackfillLeadsButton } from "@/components/admin/backfill-leads-button";

type CaseLeadRow = {
  id: string;
  opportunity_id: string | null;
  created_at: string | null;
  status: string | null;
  email: string | null;
  contact_page: string | null;
  phone_from_site: string | null;
  opportunity?: {
    business_name?: string;
    category?: string;
    website?: string;
    opportunity_score?: number;
  } | null;
};

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    source?: string;
    date?: string;
    status?: string;
    sort?: string;
  }>;
}) {
  const { source, date, status, sort } = await searchParams;
  const supabase = await createClient();
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  let baseQuery = supabase
    .from("case_files")
    .select(`
      id,
      created_at,
      status,
      email,
      contact_page,
      phone_from_site,
      opportunity_id,
      opportunity:opportunities(
        business_name,
        category,
        website,
        opportunity_score
      )
    `)
    .order("created_at", { ascending: false })
    .limit(200);
  if (date === "today") baseQuery = baseQuery.gte("created_at", dayStart);
  if (status) baseQuery = baseQuery.eq("status", status);

  const { data: joinedRows, error: joinedError } = await baseQuery;
  let queryMode: "relationship" | "simple_fallback" | "failed" = "relationship";
  let queryError: string | null = joinedError?.message || null;
  let rows: CaseLeadRow[] = [];

  if (joinedError) {
    queryMode = "simple_fallback";
    let fallbackQuery = supabase
      .from("case_files")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (date === "today") fallbackQuery = fallbackQuery.gte("created_at", dayStart);
    if (status) fallbackQuery = fallbackQuery.eq("status", status);
    const { data: fallbackRows, error: fallbackError } = await fallbackQuery;
    if (fallbackError) {
      queryMode = "failed";
      queryError = `${joinedError.message} | fallback: ${fallbackError.message}`;
      rows = [];
    } else {
      rows = (fallbackRows || []) as CaseLeadRow[];
    }
  } else {
    rows = (joinedRows || []) as CaseLeadRow[];
  }

  if (sort === "score_desc") {
    rows = [...rows].sort(
      (a, b) =>
        Number(b.opportunity?.opportunity_score ?? 0) - Number(a.opportunity?.opportunity_score ?? 0)
    );
  }

  const [
    { count: newCount },
    { count: followUpCount },
    { count: repliedCount },
    { count: closedCount },
  ] = await Promise.all([
    supabase.from("case_files").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("case_files").select("*", { count: "exact", head: true }).eq("status", "follow_up"),
    supabase.from("case_files").select("*", { count: "exact", head: true }).eq("status", "replied"),
    supabase.from("case_files").select("*", { count: "exact", head: true }).eq("status", "closed"),
  ]);

  console.info("[Admin Leads] case_files query debug", {
    source: source || null,
    date: date || null,
    status: status || null,
    sort: sort || null,
    query_mode: queryMode,
    rows_returned: rows.length,
    query_error: queryError,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>Leads</h1>
        <div className="flex gap-2">
          <BackfillLeadsButton />
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>New Leads</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{newCount ?? 0}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Follow-Ups Due</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{followUpCount ?? 0}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Replied</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{repliedCount ?? 0}</p>
        </div>
        <div className="admin-card">
          <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>Closed</h2>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--admin-gold)" }}>{closedCount ?? 0}</p>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="text-sm font-semibold mb-1" style={{ color: "var(--admin-fg)" }}>
          Leads Debug (temporary)
        </h2>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          query_mode: {queryMode} | rows_returned: {rows.length} | filters - source: {source || "none"}, date: {date || "none"}, status:{" "}
          {status || "none"}, sort: {sort || "created_desc"}
        </p>
        {queryError ? (
          <p className="text-xs mt-1" style={{ color: "#fca5a5" }}>error: {queryError}</p>
        ) : null}
        <details className="mt-2">
          <summary className="cursor-pointer text-[var(--admin-gold)]">First row preview</summary>
          <pre className="mt-1 p-2 rounded-md overflow-x-auto text-xs" style={{ background: "rgba(255,255,255,0.04)" }}>
            {JSON.stringify(rows?.[0] ?? null, null, 2)}
          </pre>
        </details>
      </section>

      <section className="admin-card">
        {rows.length === 0 ? (
          <div className="admin-empty !py-8">
            <div className="admin-empty-title">No case lead rows found</div>
            <div className="admin-empty-desc">
              Try removing filters, or check the debug panel for query errors.
            </div>
          </div>
        ) : (
          <div className="admin-table-wrap overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Category</th>
                  <th>Website</th>
                  <th>Score</th>
                  <th>Email</th>
                  <th>Contact Page</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.opportunity?.business_name || "Unknown business"}</td>
                    <td>{row.opportunity?.category || "—"}</td>
                    <td>
                      {row.opportunity?.website ? (
                        <a href={row.opportunity.website} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline text-xs">
                          Open Site
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{row.opportunity?.opportunity_score ?? "—"}</td>
                    <td>{row.email || "—"}</td>
                    <td>
                      {row.contact_page ? (
                        <a href={row.contact_page} target="_blank" rel="noreferrer" className="text-[var(--admin-gold)] hover:underline text-xs">
                          Contact Page
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{row.phone_from_site || "—"}</td>
                    <td>{row.status || "—"}</td>
                    <td>{row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}</td>
                    <td>
                      <Link href="/admin/cases" className="text-[var(--admin-gold)] hover:underline text-xs">
                        Cases
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
