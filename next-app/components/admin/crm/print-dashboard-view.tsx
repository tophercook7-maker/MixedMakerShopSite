import Link from "next/link";
import type {
  AttentionItem,
  DailySummary,
  MoneyOverview,
  PaymentDashboardSlice,
  PaymentQueueRow,
  PipelineCounts,
  UnpaidMoneyMetrics,
} from "@/lib/crm/print-dashboard-metrics";
import {
  PRINT_DASHBOARD_TZ,
  THREE_D_PRINT_PIPELINE_LABELS,
  THREE_D_PRINT_PIPELINE_ORDER,
  formatDashboardUsd,
} from "@/lib/crm/print-dashboard-metrics";
import {
  PRINT_PAYMENT_REQUEST_LABELS,
  PRINT_PAYMENT_STATUS_LABELS,
  normalizePrintPaymentRequestType,
} from "@/lib/crm/print-payment";
import type { ThreeDPrintPipelineStatus } from "@/lib/crm/three-d-print-lead";
import { PrintAttentionQuickActions } from "@/components/admin/crm/print-attention-quick-actions";

function SummaryCard({
  label,
  value,
  hint,
  emphasize,
}: {
  label: string;
  value: string | number;
  hint?: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-3 sm:px-4 sm:py-3.5 min-w-[140px] flex-1 ${
        emphasize ? "border-emerald-500/45 bg-emerald-500/10" : "border-white/[0.08] bg-black/25"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--admin-muted)" }}>
        {label}
      </p>
      <p className={`text-xl sm:text-2xl font-bold mt-1 tabular-nums ${emphasize ? "text-emerald-200" : "text-[var(--admin-fg)]"}`}>
        {value}
      </p>
      {hint ? (
        <p className="text-[10px] mt-1 leading-snug" style={{ color: "var(--admin-muted)" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function dueKindShort(kind: string | null): string {
  if (kind === "deposit") return "Dep";
  if (kind === "balance") return "Bal";
  if (kind === "full") return "Full";
  return "";
}

function PaymentQueueBlock({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle?: string;
  rows: PaymentQueueRow[];
}) {
  if (rows.length === 0) {
    return (
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wide mb-2 text-amber-200/85">{title}</h3>
        {subtitle ? (
          <p className="text-[10px] mb-1.5" style={{ color: "var(--admin-muted)" }}>
            {subtitle}
          </p>
        ) : null}
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          None
        </p>
      </div>
    );
  }
  return (
    <div>
      <h3 className="text-[10px] font-bold uppercase tracking-wide mb-2 text-amber-200/85">{title}</h3>
      {subtitle ? (
        <p className="text-[10px] mb-2" style={{ color: "var(--admin-muted)" }}>
          {subtitle}
        </p>
      ) : null}
      <ul className="space-y-2">
        {rows.map((row) => {
          const req = normalizePrintPaymentRequestType(row.paymentRequestType);
          const stLabel =
            row.paymentStatus in PRINT_PAYMENT_STATUS_LABELS
              ? PRINT_PAYMENT_STATUS_LABELS[row.paymentStatus as keyof typeof PRINT_PAYMENT_STATUS_LABELS]
              : row.paymentStatus;
          return (
            <li
              key={row.leadId}
              className="rounded-lg border border-white/[0.07] bg-black/25 px-2.5 py-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <Link href={row.href} className="text-sm font-medium text-sky-300 hover:underline">
                  {row.title}
                </Link>
                <p className="text-[10px] mt-1 leading-relaxed" style={{ color: "var(--admin-muted)" }}>
                  <span className="text-zinc-200/90">
                    Due {row.amountDue != null && row.amountDue > 0 ? formatDashboardUsd(row.amountDue) : "—"}
                  </span>
                  {row.dueKind ? (
                    <span className="text-zinc-500"> · {dueKindShort(row.dueKind)}</span>
                  ) : null}
                  {" · "}
                  Quote {row.quotedAmount != null ? formatDashboardUsd(row.quotedAmount) : "—"}
                  {" · "}
                  {stLabel}
                  {" · "}
                  {PRINT_PAYMENT_REQUEST_LABELS[req]}
                  {" · "}
                  <span className="opacity-90">Last: {row.lastActivityLabel}</span>
                </p>
              </div>
              <PrintAttentionQuickActions
                leadId={row.leadId}
                leadHref={row.href}
                paymentLink={row.paymentLink}
                compact
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PipelineChip({ stage, count }: { stage: ThreeDPrintPipelineStatus; count: number }) {
  return (
    <div className="rounded-lg border border-violet-500/35 bg-violet-500/10 px-3 py-2 text-center min-w-[88px]">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-200/85">
        {THREE_D_PRINT_PIPELINE_LABELS[stage]}
      </p>
      <p className="text-lg font-bold tabular-nums text-[var(--admin-fg)] mt-0.5">{count}</p>
    </div>
  );
}

export function PrintDashboardView({
  daily,
  money,
  pipeline,
  payment,
  unpaidMoney,
  attention,
  printLeadCount,
}: {
  daily: DailySummary;
  money: MoneyOverview;
  pipeline: PipelineCounts;
  payment: PaymentDashboardSlice;
  unpaidMoney: UnpaidMoneyMetrics;
  attention: AttentionItem[];
  printLeadCount: number;
}) {
  const tzNote = PRINT_DASHBOARD_TZ.replace(/_/g, " ");
  const dataHint = daily.usedActivityForToday
    ? "Pipeline changes from your activity log."
    : "Approximate: uses same-day updates when activity history is empty.";
  const revenueHint = money.usedActivityForRevenue
    ? "Delivered jobs from activity timing + current prices."
    : "Approximate: delivered jobs whose last update falls in the window.";

  return (
    <div className="space-y-8">
      <section className="admin-card space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
              3D print dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--admin-muted)" }}>
              Snapshot for inbound print jobs — {printLeadCount} active records in this view · Calendar: {tzNote}
            </p>
          </div>
          <Link href="/admin/leads?crm_source=3d_printing" className="admin-btn-primary text-sm shrink-0">
            Open all print leads
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-3 text-violet-200/90">Today</h2>
        <p className="text-[11px] mb-3" style={{ color: "var(--admin-muted)" }}>
          {dataHint}
        </p>
        <div className="flex flex-wrap gap-3">
          <SummaryCard label="New requests" value={daily.newRequestsToday} />
          <SummaryCard label="Quotes sent" value={daily.quotesSentToday} />
          <SummaryCard label="Approved" value={daily.approvedToday} />
          <SummaryCard label="Delivered" value={daily.deliveredToday} />
          <SummaryCard
            label="Revenue collected today"
            value={formatDashboardUsd(daily.revenueCollectedToday)}
            hint="Sum of price_charged for jobs counted as delivered today."
            emphasize
          />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-3 text-violet-200/90">Pipeline (now)</h2>
        <p className="text-[11px] mb-3" style={{ color: "var(--admin-muted)" }}>
          <strong className="text-violet-200/90">{unpaidMoney.newStageCount}</strong> job{unpaidMoney.newStageCount === 1 ? "" : "s"} still in{" "}
          <span className="text-zinc-200/90">New</span> — triage from{" "}
          <Link href="/admin/leads?crm_source=3d_printing&print_stage=new" className="text-sky-300 underline">
            CRM → New
          </Link>
          .
        </p>
        <div className="flex flex-wrap gap-2">
          {THREE_D_PRINT_PIPELINE_ORDER.map((stage) => (
            <PipelineChip key={stage} stage={stage} count={pipeline[stage]} />
          ))}
        </div>
      </section>

      <section
        className="rounded-xl border border-amber-500/25 p-4 sm:p-5 space-y-4"
        style={{ background: "linear-gradient(165deg, rgba(245, 158, 11, 0.06), rgba(0,0,0,0.28))" }}
      >
        <h2 className="text-xs font-bold uppercase tracking-wider text-amber-200/95">Money</h2>
        <p className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
          {revenueHint} Week = last 7 days. Outstanding = sum of <code className="text-[10px] opacity-90">price_charged</code>{" "}
          on <strong className="text-amber-100/90">Quoted</strong> jobs ( <code className="text-[10px] opacity-90">price_charged</code> or{" "}
          <code className="text-[10px] opacity-90">quoted_amount</code>). Profit uses{" "}
          <code className="text-[10px] opacity-90">price_charged − filament_cost</code> on deliveries this month.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Revenue (7 days)" value={formatDashboardUsd(money.revenueThisWeek)} emphasize />
          <SummaryCard label="Revenue (month)" value={formatDashboardUsd(money.revenueThisMonth)} emphasize />
          <SummaryCard
            label="Outstanding quotes"
            value={formatDashboardUsd(money.outstandingQuoted)}
            hint="Quoted stage, priced"
          />
          <SummaryCard
            label="Est. profit (month)"
            value={formatDashboardUsd(money.estimatedProfitThisMonth)}
            hint="Delivered this month"
          />
        </div>
        <h3 className="text-[10px] font-bold uppercase tracking-wide pt-2 text-rose-200/90">To collect</h3>
        <p className="text-[10px] mb-2" style={{ color: "var(--admin-muted)" }}>
          Amounts use saved quote / deposit / final fields — CRM only, not accounting.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            label="Unpaid quoted"
            value={unpaidMoney.unpaidQuotedCount}
            hint="Quoted + unpaid"
            emphasize
          />
          <SummaryCard
            label="Deposit requested"
            value={unpaidMoney.depositRequestedCount}
            hint="Waiting on deposit"
            emphasize
          />
          <SummaryCard
            label="Partially paid"
            value={unpaidMoney.partiallyPaidCount}
            hint="Balance may still be due"
            emphasize
          />
          <SummaryCard label="Ready, unpaid" value={unpaidMoney.readyUnpaidCount} hint="Handoff risk" />
          <SummaryCard
            label="Total due (est.)"
            value={formatDashboardUsd(unpaidMoney.totalAmountDue)}
            hint="Non-refunded, sum of amount due"
          />
          <SummaryCard
            label="Deposits pending (est.)"
            value={formatDashboardUsd(unpaidMoney.totalDepositPendingAmount)}
            hint="deposit_requested rows"
          />
          <SummaryCard
            label="Paid today"
            value={unpaidMoney.paidTodayCount}
            hint="paid + paid_at is today"
          />
          <SummaryCard
            label="Order value outstanding"
            value={formatDashboardUsd(unpaidMoney.outstandingOrderTotalUsd)}
            hint="Non-paid jobs: sum of final → price → quote"
            emphasize
          />
        </div>
      </section>

      <section className="admin-card space-y-3 border-sky-500/25">
        <h2 className="text-xs font-bold uppercase tracking-wider text-sky-200/95">Payments · queues</h2>
        <p className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
          <span className="font-semibold text-sky-100/90">Paid today: {unpaidMoney.paidTodayCount}</span> (
          <code className="text-[10px] opacity-90">paid</code> + today&apos;s <code className="text-[10px] opacity-90">paid_at</code>).
          Filter in CRM:{" "}
          <Link href="/admin/leads?crm_source=3d_printing&print_payment=unpaid" className="text-sky-300 underline">
            Unpaid
          </Link>
          {" · "}
          <Link
            href="/admin/leads?crm_source=3d_printing&print_payment=deposit_requested"
            className="text-sky-300 underline"
          >
            Deposit
          </Link>
          {" · "}
          <Link
            href="/admin/leads?crm_source=3d_printing&print_payment=partially_paid"
            className="text-sky-300 underline"
          >
            Partial
          </Link>
          {" · "}
          <Link
            href="/admin/leads?crm_source=3d_printing&print_payment=ready_but_unpaid"
            className="text-sky-300 underline"
          >
            Ready unpaid
          </Link>
          {" · "}
          <Link href="/admin/leads?crm_source=3d_printing&print_payment=paid" className="text-sky-300 underline">
            Paid
          </Link>
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <PaymentQueueBlock title="Unpaid quoted" rows={payment.unpaidQuoted} />
          <PaymentQueueBlock title="Deposit requested" rows={payment.depositRequested} />
          <PaymentQueueBlock title="Partially paid" subtitle="Still show here even if balance is $0 — verify in lead." rows={payment.partiallyPaid} />
          <PaymentQueueBlock title="Ready, unpaid" rows={payment.readyUnpaid} />
          <PaymentQueueBlock
            title="Approved / printing, unpaid"
            subtitle="Track before ready."
            rows={payment.inProgressUnpaid}
          />
        </div>
      </section>

      <section className="admin-card space-y-3 border-red-500/20" id="needs-attention">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-sm font-semibold text-red-200/95">Needs attention</h2>
          <span className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
            {attention.length} lead{attention.length === 1 ? "" : "s"}
          </span>
        </div>
        {attention.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
            Nothing urgent by these rules — nice work.
          </p>
        ) : (
          <ul className="space-y-2">
            {attention.slice(0, 14).map((item) => (
              <li key={`${item.leadId}-${item.reason}`}>
                <div className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2 hover:border-violet-500/35 transition-colors flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <Link href={item.href} className="font-medium text-[var(--admin-fg)] hover:underline">
                      {item.title}
                    </Link>
                    <p className="text-xs text-amber-200/90 mt-0.5">{item.reason}</p>
                    {item.paymentStatusLabel ? (
                      <p className="text-[10px] mt-1 leading-relaxed" style={{ color: "var(--admin-muted)" }}>
                        {item.amountDueLabel ? (
                          <span className="text-rose-200/85 font-medium">{item.amountDueLabel}</span>
                        ) : (
                          <span>Amount due —</span>
                        )}
                        {" · "}
                        {item.paymentStatusLabel}
                        {item.paymentRequestTypeLabel ? (
                          <>
                            {" · "}
                            {item.paymentRequestTypeLabel}
                          </>
                        ) : null}
                        {item.lastActivityLabel ? (
                          <>
                            {" · "}
                            Last {item.lastActivityLabel}
                          </>
                        ) : null}
                      </p>
                    ) : null}
                  </div>
                  {item.paymentQuickActions ? (
                    <PrintAttentionQuickActions
                      leadId={item.leadId}
                      leadHref={item.href}
                      paymentLink={item.paymentLink ?? null}
                      compact
                    />
                  ) : (
                    <Link
                      href={item.href}
                      className="text-[11px] shrink-0 self-start rounded border border-white/12 px-2 py-1 text-zinc-200 hover:bg-white/[0.05]"
                    >
                      Open lead
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-card space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--admin-muted)" }}>
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/leads?crm_source=3d_printing&print_stage=new" className="admin-btn-ghost text-xs sm:text-sm">
            New print leads
          </Link>
          <Link
            href="/admin/leads?crm_source=3d_printing&print_stage=printing"
            className="admin-btn-ghost text-xs sm:text-sm"
          >
            Printing
          </Link>
          <Link href="/admin/leads?crm_source=3d_printing&print_stage=ready" className="admin-btn-ghost text-xs sm:text-sm">
            Ready
          </Link>
          <Link
            href="/admin/leads?crm_source=3d_printing&needs_reply=1"
            className="admin-btn-ghost text-xs sm:text-sm border-amber-500/30"
          >
            Follow-up queue
          </Link>
          <Link
            href="/admin/leads?crm_source=3d_printing&print_stage=approved"
            className="admin-btn-ghost text-xs sm:text-sm border-emerald-500/30"
          >
            Approved (invoice)
          </Link>
          <Link
            href="/admin/leads?crm_source=3d_printing&print_payment=unpaid"
            className="admin-btn-ghost text-xs sm:text-sm border-rose-500/25"
          >
            Unpaid
          </Link>
          <Link
            href="/admin/leads?crm_source=3d_printing&print_payment=deposit_requested"
            className="admin-btn-ghost text-xs sm:text-sm border-rose-500/25"
          >
            Deposit requested
          </Link>
          <Link href="/admin/print-dashboard#needs-attention" className="admin-btn-ghost text-xs sm:text-sm">
            Jump to attention
          </Link>
        </div>
      </section>
    </div>
  );
}
