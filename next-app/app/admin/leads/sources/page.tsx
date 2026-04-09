import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  aggregateBySource,
  computeHighlights,
  fetchAllLeadReportingRows,
  filterRowsByCreatedAt,
  parseLeadSourceRangeParam,
  startIsoForRange,
  startOfCurrentMonthUtc,
  type LeadSourceRange,
} from "@/lib/crm/lead-source-reporting";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const RANGE_OPTIONS: { id: LeadSourceRange; label: string }[] = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
];

function pct(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Math.round(n * 1000) / 10}%`;
}

export default async function LeadSourcesReportPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const range = parseLeadSourceRangeParam(rangeParam);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = String(user?.id || "").trim();
  if (!ownerId) {
    return (
      <section className="admin-card">
        <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
          Sign in to view lead sources.
        </p>
      </section>
    );
  }

  const allRows = await fetchAllLeadReportingRows(supabase, ownerId);
  const startIso = startIsoForRange(range);
  const rangeRows = filterRowsByCreatedAt(allRows, startIso);
  const agg = aggregateBySource(rangeRows);
  const monthStart = startOfCurrentMonthUtc();
  const monthRows = filterRowsByCreatedAt(allRows, monthStart);
  const highlights = computeHighlights(monthRows, agg);

  const queryForRange = (r: LeadSourceRange) =>
    `/admin/leads/sources${r === "all" ? "" : `?range=${r}`}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
            Lead sources
          </h1>
          <p className="text-sm mt-1 max-w-[70ch]" style={{ color: "var(--admin-muted)" }}>
            Intake paths vs outcomes — grouped by normalized <code className="text-[11px]">lead_source</code> /{" "}
            <code className="text-[11px]">source</code>. Raw values stay in the database; this is read-only reporting.
          </p>
        </div>
        <Link href="/admin/leads" className="admin-btn-ghost text-sm shrink-0">
          ← Back to leads
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {RANGE_OPTIONS.map((opt) => (
          <Link
            key={opt.id}
            href={queryForRange(opt.id)}
            className="admin-btn-ghost text-xs px-3 py-1"
            style={{
              borderColor: opt.id === range ? "rgba(251, 191, 36, 0.5)" : undefined,
              fontWeight: opt.id === range ? 800 : undefined,
            }}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <section className="admin-card space-y-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          This month (calendar, UTC)
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--admin-border)" }}>
            <div className="text-[11px] uppercase tracking-wide opacity-80" style={{ color: "var(--admin-muted)" }}>
              Total leads
            </div>
            <div className="text-2xl font-bold mt-1" style={{ color: "var(--admin-fg)" }}>
              {highlights.monthTotalLeads}
            </div>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--admin-border)" }}>
            <div className="text-[11px] uppercase tracking-wide opacity-80" style={{ color: "var(--admin-muted)" }}>
              Wins
            </div>
            <div className="text-2xl font-bold mt-1" style={{ color: "var(--admin-fg)" }}>
              {highlights.monthWins}
            </div>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--admin-border)" }}>
            <div className="text-[11px] uppercase tracking-wide opacity-80" style={{ color: "var(--admin-muted)" }}>
              Best volume ({RANGE_OPTIONS.find((r) => r.id === range)?.label ?? "period"})
            </div>
            <div className="text-sm font-semibold mt-1" style={{ color: "var(--admin-fg)" }}>
              {highlights.bestVolumeLabel || "—"}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
              {highlights.bestVolumeCount} leads
            </div>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: "var(--admin-border)" }}>
            <div className="text-[11px] uppercase tracking-wide opacity-80" style={{ color: "var(--admin-muted)" }}>
              Most wins ({RANGE_OPTIONS.find((r) => r.id === range)?.label ?? "period"})
            </div>
            <div className="text-sm font-semibold mt-1" style={{ color: "var(--admin-fg)" }}>
              {highlights.bestWinsLabel || "—"}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--admin-muted)" }}>
              {highlights.bestWinsCount} won
            </div>
          </div>
        </div>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Best win rate (≥3 leads in selected period):{" "}
          <strong style={{ color: "var(--admin-fg)" }}>
            {highlights.bestWinRateLabel || "—"}
            {highlights.bestWinRatePct != null
              ? ` (${pct(highlights.bestWinRatePct)})`
              : ""}
          </strong>
        </p>
      </section>

      <section className="admin-card overflow-x-auto">
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--admin-fg)" }}>
          By source — {RANGE_OPTIONS.find((r) => r.id === range)?.label}
        </h2>
        <p className="text-xs mb-3" style={{ color: "var(--admin-muted)" }}>
          Active = new + contacted + replied. Dead = no_response + not_interested + archived. Win rate = won ÷ total.
        </p>
        <table className="w-full text-sm border-collapse min-w-[720px]">
          <thead>
            <tr className="text-left border-b" style={{ borderColor: "var(--admin-border)" }}>
              <th className="py-2 pr-3 font-semibold" style={{ color: "var(--admin-fg)" }}>
                Source
              </th>
              <th className="py-2 pr-3 font-semibold">Total</th>
              <th className="py-2 pr-3 font-semibold">New</th>
              <th className="py-2 pr-3 font-semibold">Contacted</th>
              <th className="py-2 pr-3 font-semibold">Replied</th>
              <th className="py-2 pr-3 font-semibold">Active</th>
              <th className="py-2 pr-3 font-semibold">Won</th>
              <th className="py-2 pr-3 font-semibold">No resp.</th>
              <th className="py-2 pr-3 font-semibold">Not int.</th>
              <th className="py-2 pr-3 font-semibold">Arch.</th>
              <th className="py-2 pr-3 font-semibold">Dead</th>
              <th className="py-2 pr-3 font-semibold">Win %</th>
              <th className="py-2 pr-2 font-semibold">Active %</th>
            </tr>
          </thead>
          <tbody>
            {agg.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-6 text-center" style={{ color: "var(--admin-muted)" }}>
                  No leads in this period.
                </td>
              </tr>
            ) : (
              agg.map((row) => (
                <tr key={row.key} className="border-b" style={{ borderColor: "rgba(255,255,255,.06)" }}>
                  <td className="py-2 pr-3">
                    <Link
                      href={`/admin/leads?lead_source=${encodeURIComponent(row.key)}`}
                      className="font-medium text-[var(--admin-gold)] hover:underline"
                    >
                      {row.label}
                    </Link>
                    <div className="text-[10px] opacity-70 font-mono">{row.key}</div>
                  </td>
                  <td className="py-2 pr-3">{row.total}</td>
                  <td className="py-2 pr-3">{row.new}</td>
                  <td className="py-2 pr-3">{row.contacted}</td>
                  <td className="py-2 pr-3">{row.replied}</td>
                  <td className="py-2 pr-3">{row.active}</td>
                  <td className="py-2 pr-3">{row.won}</td>
                  <td className="py-2 pr-3">{row.no_response}</td>
                  <td className="py-2 pr-3">{row.not_interested}</td>
                  <td className="py-2 pr-3">{row.archived}</td>
                  <td className="py-2 pr-3">{row.dead}</td>
                  <td className="py-2 pr-3">{pct(row.winRate)}</td>
                  <td className="py-2 pr-2">{pct(row.activeRate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="admin-card">
        <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--admin-fg)" }}>
          Funnel (selected period)
        </h2>
        <p className="text-xs mb-3" style={{ color: "var(--admin-muted)" }}>
          Per source: total → active pipeline → won vs dead.
        </p>
        <div className="space-y-2 text-sm">
          {agg.slice(0, 12).map((row) => (
            <div key={`f-${row.key}`} className="flex flex-wrap gap-x-4 gap-y-1 border-b border-white/5 pb-2">
              <span className="font-medium text-[var(--admin-fg)] min-w-[140px]">{row.label}</span>
              <span style={{ color: "var(--admin-muted)" }}>
                total {row.total} · active {row.active} · won {row.won} · dead {row.dead}
              </span>
            </div>
          ))}
          {agg.length > 12 ? (
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              + {agg.length - 12} more sources in the table above.
            </p>
          ) : null}
        </div>
      </section>

      <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
        Tip: messy legacy strings still bucket under normalized keys — see the raw key under each label. To fix data,
        update the lead row in the CRM (display-only mapping does not change DB values).
      </p>
    </div>
  );
}
