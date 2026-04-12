import Link from "next/link";
import { MockupLeadStatusBadge } from "@/components/admin/mockup-lead-status-badge";
import { getPreviewSnapshotFromMockupData } from "@/lib/free-mockup-preview-snapshot";
import {
  isMockupLeadStatus,
  parseMockupLeadStatus,
  type MockupLeadStatus,
} from "@/lib/lead-status";
import { getLeadStaleState } from "@/lib/lead-stale";
import { createClient } from "@/lib/supabase/server";

type Row = {
  id: string;
  email: string;
  status: string;
  lead_status?: string | null;
  status_updated_at?: string | null;
  updated_at?: string | null;
  source: string;
  funnel_source: string | null;
  created_at: string;
  mockup_data?: Record<string, unknown> | null;
};

function needsAttentionParam(raw: string | string[] | undefined): boolean {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "1" || v === "true" || v === "yes";
}

export default async function AdminMockupSubmissionsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view mockup submissions.
        </p>
      </section>
    );
  }

  const pipelineRaw = typeof searchParams?.pipeline === "string" ? searchParams.pipeline.trim() : "";
  const pipelineFilter: MockupLeadStatus | "" =
    pipelineRaw && isMockupLeadStatus(pipelineRaw) ? pipelineRaw : "";

  const needsAttention = needsAttentionParam(searchParams?.needs_attention);

  let query = supabase
    .from("mockup_submissions")
    .select(
      "id, email, status, lead_status, status_updated_at, updated_at, source, funnel_source, created_at, mockup_data",
    )
    .order("created_at", { ascending: false });

  if (pipelineFilter) {
    query = query.eq("lead_status", pipelineFilter);
  }

  const { data: rows, error } = await query;

  if (error) {
    console.error("[admin mockup-submissions] list failed", error.message);
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "#f87171" }}>
          Could not load submissions.
        </p>
      </section>
    );
  }

  let list = (rows || []) as Row[];

  const withStale = list.map((r) => {
    const pipeline = parseMockupLeadStatus(r.lead_status ?? r.status);
    const stale = getLeadStaleState({
      pipeline,
      createdAt: r.created_at,
      statusUpdatedAt: r.status_updated_at,
      updatedAt: r.updated_at,
    });
    return { r, pipeline, stale };
  });

  const staleInView = withStale.filter((x) => x.stale.isStale).length;

  const needsAttentionOnHref = (() => {
    const p = new URLSearchParams();
    if (pipelineFilter) p.set("pipeline", pipelineFilter);
    p.set("needs_attention", "1");
    return `/admin/mockup-submissions?${p.toString()}`;
  })();

  const needsAttentionOffHref = pipelineFilter
    ? `/admin/mockup-submissions?pipeline=${encodeURIComponent(pipelineFilter)}`
    : "/admin/mockup-submissions";

  let rowsForTable = withStale;
  if (needsAttention) {
    rowsForTable = withStale.filter((x) => x.stale.isStale);
    rowsForTable.sort((a, b) => b.stale.urgencyScore - a.stale.urgencyScore);
  }

  return (
    <section className="admin-card">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--admin-fg)" }}>
            Free mockup submissions
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
            {needsAttention
              ? "Needs attention: stale leads first (most urgent at the top)."
              : "Newest first. Stale leads show a warm highlight and attention badge."}
          </p>
          {!needsAttention ? (
            <p className="text-xs mt-2" style={{ color: "var(--admin-muted)" }}>
              {staleInView > 0 ? (
                <>
                  <span className="font-semibold text-amber-200/90">{staleInView}</span> in this view need attention.{" "}
                  <Link href="/admin/mockup-submissions?needs_attention=1" className="text-[var(--admin-gold)] hover:underline">
                    Open needs-attention queue
                  </Link>
                </>
              ) : (
                <>No stale leads in this view.</>
              )}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Link
            href={needsAttention ? needsAttentionOffHref : needsAttentionOnHref}
            className={`rounded-md border px-3 py-2 text-xs font-semibold ${
              needsAttention
                ? "border-[rgba(201,97,44,0.55)] text-[var(--admin-gold)] bg-[rgba(201,97,44,0.12)]"
                : "border-[rgba(255,255,255,0.12)] text-[var(--admin-muted)] hover:bg-[rgba(255,255,255,0.04)]"
            }`}
          >
            Needs attention
          </Link>
          <form method="get" className="flex flex-wrap items-end gap-2">
            {needsAttention ? <input type="hidden" name="needs_attention" value="1" /> : null}
            <label className="text-xs" style={{ color: "var(--admin-muted)" }}>
              Pipeline
              <select
                name="pipeline"
                defaultValue={pipelineFilter || ""}
                className="form-select mt-1 min-w-[180px] text-sm"
              >
                <option value="">All</option>
                <option value="new">New</option>
                <option value="draft_created">Draft created</option>
                <option value="contacted">Contacted</option>
                <option value="replied">Replied</option>
                <option value="follow_up_needed">Follow up needed</option>
                <option value="closed_won">Closed won</option>
                <option value="closed_lost">Closed lost</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <button
              type="submit"
              className="rounded-md border border-[rgba(201,97,44,0.35)] px-3 py-2 text-xs font-semibold text-[var(--admin-gold)] hover:bg-[rgba(201,97,44,0.08)]"
            >
              Apply
            </button>
            {pipelineFilter || needsAttention ? (
              <Link
                href="/admin/mockup-submissions"
                className="rounded-md border border-[rgba(255,255,255,0.12)] px-3 py-2 text-xs font-semibold text-[var(--admin-muted)] hover:bg-[rgba(255,255,255,0.04)]"
              >
                Clear
              </Link>
            ) : null}
          </form>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[rgba(201,97,44,0.2)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[rgba(201,97,44,0.15)]" style={{ color: "var(--admin-muted)" }}>
              <th className="px-3 py-2 font-medium w-[120px]">Attention</th>
              <th className="px-3 py-2 font-medium">Created</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Live preview</th>
              <th className="px-3 py-2 font-medium">Pipeline</th>
              <th className="px-3 py-2 font-medium">Attribution</th>
            </tr>
          </thead>
          <tbody>
            {rowsForTable.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center" style={{ color: "var(--admin-muted)" }}>
                  {needsAttention ? "No stale leads right now." : "No submissions yet."}
                </td>
              </tr>
            ) : (
              rowsForTable.map(({ r, pipeline, stale }) => {
                const ps = getPreviewSnapshotFromMockupData(r.mockup_data || null);
                const previewLine = ps?.previewSummary || "";
                const rowHighlight = stale.isStale
                  ? "bg-amber-500/[0.07] border-l-2 border-l-amber-400/70"
                  : "";
                const dot =
                  stale.severity === "high"
                    ? "bg-red-400"
                    : stale.severity === "medium"
                      ? "bg-amber-400"
                      : stale.isStale
                        ? "bg-amber-300/80"
                        : "opacity-0";
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(201,97,44,0.06)] ${rowHighlight}`.trim()}
                  >
                    <td className="px-3 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block h-2 w-2 shrink-0 rounded-full ${dot}`}
                          aria-hidden
                          title={stale.isStale ? stale.reason : "Up to date"}
                        />
                        {stale.isStale ? (
                          <span className="rounded-full border border-amber-400/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100/95">
                            Stale
                          </span>
                        ) : (
                          <span className="text-[10px] text-[var(--admin-muted)]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <Link
                        href={`/admin/mockup-submissions/${encodeURIComponent(r.id)}`}
                        className="text-[var(--admin-gold)] hover:underline"
                      >
                        {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/mockup-submissions/${encodeURIComponent(r.id)}`}
                        className="hover:text-[var(--admin-gold)] hover:underline"
                      >
                        {r.email}
                      </Link>
                    </td>
                    <td className="px-3 py-2 max-w-[min(380px,40vw)]">
                      {previewLine ? (
                        <p
                          className="text-[11px] leading-snug line-clamp-2 text-[var(--admin-muted)]"
                          title={previewLine}
                        >
                          {previewLine}
                        </p>
                      ) : (
                        <span className="text-[11px] text-[var(--admin-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex flex-col gap-1">
                        <MockupLeadStatusBadge status={pipeline} />
                        {r.status_updated_at ? (
                          <span className="text-[10px] text-[var(--admin-muted)]">
                            Updated {new Date(r.status_updated_at).toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-[var(--admin-muted)]">{r.source}</span>
                      {r.funnel_source ? (
                        <>
                          <span className="text-[var(--admin-muted)]"> · </span>
                          <span className="rounded border border-[rgba(201,97,44,0.35)] px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-gold)]">
                            {r.funnel_source}
                          </span>
                        </>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
