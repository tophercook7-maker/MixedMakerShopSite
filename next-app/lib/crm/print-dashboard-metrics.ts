/**
 * Aggregates for the admin 3D print business dashboard (CRM leads only).
 */

import { buildLeadPath } from "@/lib/lead-route";
import {
  computePrintJobAmountDueUsd,
  formatUsdAmount,
  normalizePrintPaymentRequestType,
  normalizePrintPaymentStatus,
  PRINT_PAYMENT_REQUEST_LABELS,
  PRINT_PAYMENT_STATUS_LABELS,
} from "@/lib/crm/print-payment";
import {
  computePrintJobFinancials,
  isThreeDPrintLead,
  normalizePrintPipelineStatus,
  THREE_D_PRINT_PIPELINE_LABELS,
  THREE_D_PRINT_PIPELINE_ORDER,
  type ThreeDPrintPipelineStatus,
} from "@/lib/crm/three-d-print-lead";

export const PRINT_DASHBOARD_TZ = (
  process.env.BUSINESS_TIMEZONE ||
  process.env.NEXT_PUBLIC_BUSINESS_TIMEZONE ||
  "America/New_York"
).trim() || "America/New_York";

export type PrintDashboardLead = {
  id: string;
  business_name?: string | null;
  contact_name?: string | null;
  primary_contact_name?: string | null;
  created_at?: string | null;
  last_contacted_at?: string | null;
  last_reply_at?: string | null;
  last_response_at?: string | null;
  last_updated_at?: string | null;
  print_pipeline_status?: string | null;
  price_charged?: unknown;
  filament_cost?: unknown;
  print_labor_cost?: unknown;
  source?: string | null;
  lead_source?: string | null;
  category?: string | null;
  lead_tags?: string[] | null;
  quoted_amount?: unknown;
  deposit_amount?: unknown;
  final_amount?: unknown;
  payment_request_type?: string | null;
  payment_method?: string | null;
  payment_link?: string | null;
  payment_status?: string | null;
  paid_at?: string | null;
};

export type LeadActivityRow = {
  lead_id: string;
  metadata: unknown;
  created_at: string;
};

function num(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function calendarDateKey(iso: string | null | undefined, tz: string): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(t));
}

export function todayKey(tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
}

/** Calendar dates for the last `days` days in `tz` (YYYY-MM-DD). */
function rollingDayKeys(tz: string, now: Date, days: number): Set<string> {
  const keys = new Set<string>();
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getTime() - i * 86400000);
    keys.add(new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d));
  }
  return keys;
}

/** All YYYY-MM-DD keys falling in the same calendar month as `now` in `tz` (scans ~62 days back). */
function monthKeysThisMonth(tz: string, now: Date): Set<string> {
  const keys = new Set<string>();
  const todayK = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(now);
  const ym = todayK.slice(0, 7);
  for (let i = 0; i < 62; i++) {
    const d = new Date(now.getTime() - i * 86400000);
    const k = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);
    if (k.slice(0, 7) === ym) keys.add(k);
  }
  return keys;
}

function parsePipelineTransition(
  meta: unknown,
): { from: string | null; to: string | null } | null {
  if (!meta || typeof meta !== "object") return null;
  const m = meta as Record<string, unknown>;
  if (m.kind !== "print_pipeline_status") return null;
  return {
    from: m.from == null || m.from === "" ? null : String(m.from),
    to: m.to == null || m.to === "" ? null : String(m.to),
  };
}

function displayLeadName(lead: PrintDashboardLead): string {
  const p = String(lead.primary_contact_name || "").trim();
  if (p) return p;
  const c = String(lead.contact_name || "").trim();
  if (c) return c;
  const b = String(lead.business_name || "").trim();
  if (b.startsWith("3D Print Quote")) return b.replace(/^3D Print Quote —\s*/i, "").trim() || b;
  return b || "Lead";
}

/** Leads that belong in the 3D print dashboard. */
export function filterPrintDashboardLeads(rows: PrintDashboardLead[]): PrintDashboardLead[] {
  return rows.filter((r) => r.id && isThreeDPrintLead(r));
}

function ms(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
}

export function leadNeedsNoResponseAttention(lead: PrintDashboardLead, nowMs: number): boolean {
  const replyAt = ms(lead.last_reply_at);
  if (!replyAt) return false;
  if (nowMs - replyAt < 24 * 60 * 60 * 1000) return false;
  const responseAt = ms(lead.last_response_at);
  if (!responseAt || responseAt < replyAt) return true;
  return false;
}

export type AttentionItem = {
  leadId: string;
  href: string;
  title: string;
  reason: string;
  /** higher = show first */
  urgency: number;
  amountDue?: number | null;
  amountDueLabel?: string | null;
  paymentStatusLabel?: string;
  paymentRequestTypeLabel?: string;
  lastActivityLabel?: string;
  paymentLink?: string | null;
  /** When true, dashboard shows payment follow-up quick actions for this row. */
  paymentQuickActions?: boolean;
  printPipelineStatus?: ThreeDPrintPipelineStatus;
};

function lastActivityLabel(lead: Pick<PrintDashboardLead, "last_reply_at" | "last_contacted_at" | "last_response_at" | "created_at">): string {
  const times = [lead.last_reply_at, lead.last_contacted_at, lead.last_response_at, lead.created_at]
    .filter(Boolean)
    .map((d) => new Date(String(d)).getTime())
    .filter((t) => Number.isFinite(t));
  if (times.length === 0) return "—";
  const ms = Math.max(...times);
  return new Date(ms).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function paymentAttentionFromLead(lead: PrintDashboardLead): AttentionItem | null {
  const id = String(lead.id || "").trim();
  if (!id) return null;
  const pipe = normalizePrintPipelineStatus(lead.print_pipeline_status);
  const pay = normalizePrintPaymentStatus(lead.payment_status);
  if (pay === "paid" || pay === "refunded") return null;

  const title = displayLeadName(lead);
  const href = buildLeadPath(id, lead.business_name);
  const { due, dueKind } = computePrintJobAmountDueUsd(lead);
  const prq = normalizePrintPaymentRequestType(lead.payment_request_type);

  let reason = "";
  let urgency = 0;

  if (pay === "deposit_requested") {
    reason = "Deposit requested — waiting on payment";
    urgency = 92;
  } else if (pay === "partially_paid") {
    reason = "Partially paid — balance still due";
    urgency = 88;
  } else if (pipe === "ready") {
    reason = "Ready — still unpaid (collect before handoff)";
    urgency = 90;
  } else if (pipe === "quoted" && pay === "unpaid") {
    reason = "Quoted — unpaid (send or chase payment)";
    urgency = 86;
  } else {
    return null;
  }

  const kindHuman =
    dueKind === "deposit" ? "Deposit" : dueKind === "balance" ? "Balance" : dueKind === "full" ? "Full" : "Due";
  const amountDueLabel = due != null && due > 0 ? `${kindHuman} ${formatUsdAmount(due)}` : null;

  return {
    leadId: id,
    href,
    title,
    reason,
    urgency,
    amountDue: due,
    amountDueLabel,
    paymentStatusLabel: PRINT_PAYMENT_STATUS_LABELS[pay],
    paymentRequestTypeLabel: PRINT_PAYMENT_REQUEST_LABELS[prq],
    lastActivityLabel: lastActivityLabel(lead),
    paymentLink: String(lead.payment_link || "").trim() || null,
    paymentQuickActions: true,
    printPipelineStatus: pipe,
  };
}

export function computePaymentAttentionItems(leads: PrintDashboardLead[]): AttentionItem[] {
  const out: AttentionItem[] = [];
  for (const lead of leads) {
    const item = paymentAttentionFromLead(lead);
    if (item) out.push(item);
  }
  return out.sort((a, b) => b.urgency - a.urgency);
}

export function computeAttentionItems(leads: PrintDashboardLead[], now = new Date()): AttentionItem[] {
  const nowMs = now.getTime();
  const candidates: AttentionItem[] = [...computePaymentAttentionItems(leads)];

  for (const lead of leads) {
    const pipe = normalizePrintPipelineStatus(lead.print_pipeline_status);
    const id = String(lead.id || "").trim();
    if (!id) continue;
    const title = displayLeadName(lead);
    const href = buildLeadPath(id, lead.business_name);

    if (leadNeedsNoResponseAttention(lead, nowMs)) {
      candidates.push({ leadId: id, href, title, reason: "Reply waiting (24h+)", urgency: 100 });
      continue;
    }

    if (pipe === "new" && !String(lead.last_contacted_at || "").trim()) {
      candidates.push({ leadId: id, href, title, reason: "New — not contacted", urgency: 85 });
      continue;
    }

    if (pipe === "need_info") {
      candidates.push({ leadId: id, href, title, reason: "Need info", urgency: 70 });
      continue;
    }

    if (pipe === "quoted") {
      candidates.push({ leadId: id, href, title, reason: "Quoted — follow up (stage)", urgency: 55 });
      continue;
    }

    if (pipe === "ready") {
      candidates.push({ leadId: id, href, title, reason: "Ready — not delivered", urgency: 60 });
      continue;
    }
  }

  const byLead = new Map<string, AttentionItem>();
  for (const item of candidates.sort((a, b) => b.urgency - a.urgency)) {
    const prev = byLead.get(item.leadId);
    if (!prev || item.urgency > prev.urgency) byLead.set(item.leadId, item);
  }
  return Array.from(byLead.values()).sort((a, b) => b.urgency - a.urgency);
}

export type PipelineCounts = Record<ThreeDPrintPipelineStatus, number>;

export function emptyPipelineCounts(): PipelineCounts {
  const o = {} as PipelineCounts;
  for (const k of THREE_D_PRINT_PIPELINE_ORDER) o[k] = 0;
  return o;
}

export function computePipelineCounts(leads: PrintDashboardLead[]): PipelineCounts {
  const c = emptyPipelineCounts();
  for (const lead of leads) {
    const p = normalizePrintPipelineStatus(lead.print_pipeline_status);
    c[p] += 1;
  }
  return c;
}

export type DailySummary = {
  newRequestsToday: number;
  quotesSentToday: number;
  approvedToday: number;
  deliveredToday: number;
  revenueCollectedToday: number;
  usedActivityForToday: boolean;
};

export type MoneyOverview = {
  revenueThisWeek: number;
  revenueThisMonth: number;
  outstandingQuoted: number;
  estimatedProfitThisMonth: number;
  usedActivityForRevenue: boolean;
};

export type PaymentQueueRow = {
  leadId: string;
  href: string;
  title: string;
  amountDue: number | null;
  dueKind: string | null;
  paymentStatus: string;
  paymentRequestType: string | null;
  quotedAmount: number | null;
  paymentLink: string | null;
  lastActivityLabel: string;
  printPipelineStatus: ThreeDPrintPipelineStatus;
};

export type PaymentDashboardSlice = {
  unpaidQuoted: PaymentQueueRow[];
  depositRequested: PaymentQueueRow[];
  partiallyPaid: PaymentQueueRow[];
  readyUnpaid: PaymentQueueRow[];
  inProgressUnpaid: PaymentQueueRow[];
};

export type UnpaidMoneyMetrics = {
  unpaidQuotedCount: number;
  depositRequestedCount: number;
  partiallyPaidCount: number;
  readyUnpaidCount: number;
  totalAmountDue: number;
  totalDepositPendingAmount: number;
  paidTodayCount: number;
  /** Leads still in pipeline stage `new`. */
  newStageCount: number;
  /** Sum of best-effort order total (final → price → quote) for non-paid, non-refunded jobs. */
  outstandingOrderTotalUsd: number;
};

function dashboardLeadTitle(lead: PrintDashboardLead): string {
  const p = String(lead.primary_contact_name || "").trim();
  if (p) return p;
  const c = String(lead.contact_name || "").trim();
  if (c) return c;
  const b = String(lead.business_name || "").trim();
  if (b.startsWith("3D Print Quote")) return b.replace(/^3D Print Quote —\s*/i, "").trim() || b;
  return b || "Lead";
}

function toPaymentQueueRow(lead: PrintDashboardLead): PaymentQueueRow {
  const id = String(lead.id || "").trim();
  const { due, dueKind } = computePrintJobAmountDueUsd(lead);
  return {
    leadId: id,
    href: buildLeadPath(id, lead.business_name),
    title: dashboardLeadTitle(lead),
    amountDue: due,
    dueKind,
    paymentStatus: normalizePrintPaymentStatus(lead.payment_status),
    paymentRequestType: lead.payment_request_type ?? null,
    quotedAmount: num(lead.quoted_amount) ?? num(lead.price_charged),
    paymentLink: String(lead.payment_link || "").trim() || null,
    lastActivityLabel: lastActivityLabel(lead),
    printPipelineStatus: normalizePrintPipelineStatus(lead.print_pipeline_status),
  };
}

export function computeUnpaidMoneyMetrics(leads: PrintDashboardLead[], tz: string): UnpaidMoneyMetrics {
  const today = todayKey(tz);
  let unpaidQuotedCount = 0;
  let depositRequestedCount = 0;
  let partiallyPaidCount = 0;
  let readyUnpaidCount = 0;
  let totalAmountDue = 0;
  let totalDepositPendingAmount = 0;
  let paidTodayCount = 0;
  let newStageCount = 0;
  let outstandingOrderTotalUsd = 0;

  for (const lead of leads) {
    const pipe = normalizePrintPipelineStatus(lead.print_pipeline_status);
    const pay = normalizePrintPaymentStatus(lead.payment_status);

    if (pipe === "new") newStageCount += 1;

    if (pay === "paid" && calendarDateKey(lead.paid_at, tz) === today) paidTodayCount += 1;

    if (pay !== "paid" && pay !== "refunded") {
      const { due } = computePrintJobAmountDueUsd(lead);
      if (due != null && due > 0) totalAmountDue += due;
      const order =
        num(lead.final_amount) ?? num(lead.price_charged) ?? num(lead.quoted_amount);
      if (order != null && order > 0) outstandingOrderTotalUsd += order;
    }

    if (pay === "deposit_requested") {
      depositRequestedCount += 1;
      const { due } = computePrintJobAmountDueUsd(lead);
      if (due != null && due > 0) totalDepositPendingAmount += due;
    }
    if (pay === "partially_paid") partiallyPaidCount += 1;
    if (pipe === "quoted" && pay === "unpaid") unpaidQuotedCount += 1;
    if (pipe === "ready" && pay !== "paid" && pay !== "refunded") readyUnpaidCount += 1;
  }

  return {
    unpaidQuotedCount,
    depositRequestedCount,
    partiallyPaidCount,
    readyUnpaidCount,
    totalAmountDue: Math.round(totalAmountDue * 100) / 100,
    totalDepositPendingAmount: Math.round(totalDepositPendingAmount * 100) / 100,
    paidTodayCount,
    newStageCount,
    outstandingOrderTotalUsd: Math.round(outstandingOrderTotalUsd * 100) / 100,
  };
}

export function computePaymentDashboardSlice(leads: PrintDashboardLead[]): PaymentDashboardSlice {
  const unpaidQuoted: PaymentQueueRow[] = [];
  const depositRequested: PaymentQueueRow[] = [];
  const partiallyPaid: PaymentQueueRow[] = [];
  const readyUnpaid: PaymentQueueRow[] = [];
  const inProgressUnpaid: PaymentQueueRow[] = [];

  for (const lead of leads) {
    const id = String(lead.id || "").trim();
    if (!id) continue;
    const pipe = normalizePrintPipelineStatus(lead.print_pipeline_status);
    const pay = normalizePrintPaymentStatus(lead.payment_status);

    if (pipe === "quoted" && pay === "unpaid") unpaidQuoted.push(toPaymentQueueRow(lead));
    if (pay === "deposit_requested") depositRequested.push(toPaymentQueueRow(lead));
    if (pay === "partially_paid") partiallyPaid.push(toPaymentQueueRow(lead));
    if (pipe === "ready" && pay !== "paid" && pay !== "refunded") readyUnpaid.push(toPaymentQueueRow(lead));
    if ((pipe === "approved" || pipe === "printing") && pay !== "paid" && pay !== "refunded") {
      inProgressUnpaid.push(toPaymentQueueRow(lead));
    }
  }

  const lim = (rows: PaymentQueueRow[]) => rows.slice(0, 14);
  return {
    unpaidQuoted: lim(unpaidQuoted),
    depositRequested: lim(depositRequested),
    partiallyPaid: lim(partiallyPaid),
    readyUnpaid: lim(readyUnpaid),
    inProgressUnpaid: lim(inProgressUnpaid),
  };
}

function sumPriceForLeads(ids: Set<string>, byId: Map<string, PrintDashboardLead>): number {
  let s = 0;
  for (const id of Array.from(ids)) {
    const p = num(byId.get(id)?.price_charged);
    if (p != null) s += p;
  }
  return Math.round(s * 100) / 100;
}

function profitForLeads(ids: Set<string>, byId: Map<string, PrintDashboardLead>): number {
  let s = 0;
  for (const id of Array.from(ids)) {
    const row = byId.get(id);
    if (!row) continue;
    const { profit } = computePrintJobFinancials(
      num(row.price_charged),
      num(row.filament_cost),
      num(row.print_labor_cost),
    );
    if (profit != null) s += profit;
  }
  return Math.round(s * 100) / 100;
}

function fallbackDeliveredOnDates(
  leads: PrintDashboardLead[],
  dateKeys: Set<string>,
  tz: string,
): Set<string> {
  const ids = new Set<string>();
  for (const lead of leads) {
    const pipe = normalizePrintPipelineStatus(lead.print_pipeline_status);
    if (pipe !== "delivered") continue;
    const key = calendarDateKey(lead.last_updated_at || lead.created_at, tz);
    if (!key || !dateKeys.has(key)) continue;
    ids.add(String(lead.id));
  }
  return ids;
}

function transitionedToOnDateKeys(
  activities: LeadActivityRow[],
  target: string,
  dateKeys: Set<string>,
  tz: string,
): Set<string> {
  const ids = new Set<string>();
  for (const a of activities) {
    const tr = parsePipelineTransition(a.metadata);
    if (!tr || String(tr.to || "").toLowerCase() !== target) continue;
    const k = calendarDateKey(a.created_at, tz);
    if (!k || !dateKeys.has(k)) continue;
    ids.add(String(a.lead_id));
  }
  return ids;
}

/**
 * `activities` = lead_status_changed rows with print_pipeline_status metadata (best-effort).
 */
export function computePrintDashboardStats(opts: {
  leads: PrintDashboardLead[];
  activities: LeadActivityRow[] | null;
  tz?: string;
  now?: Date;
}): {
  daily: DailySummary;
  money: MoneyOverview;
  pipeline: PipelineCounts;
  attention: AttentionItem[];
  payment: PaymentDashboardSlice;
  unpaidMoney: UnpaidMoneyMetrics;
} {
  const tz = opts.tz || PRINT_DASHBOARD_TZ;
  const now = opts.now || new Date();
  const today = todayKey(tz);
  const leads = filterPrintDashboardLeads(opts.leads);
  const activities = opts.activities || [];

  const byId = new Map<string, PrintDashboardLead>();
  for (const l of leads) byId.set(String(l.id), l);

  const pipeline = computePipelineCounts(leads);

  const hasActivityData = activities.length > 0;
  const todaySet = new Set<string>([today]);

  const transitionedToToday = (target: string): Set<string> =>
    transitionedToOnDateKeys(activities, target, todaySet, tz);

  let quotesToday: Set<string>;
  let approvedToday: Set<string>;
  let deliveredToday: Set<string>;
  let usedActivityForToday = hasActivityData;

  if (hasActivityData) {
    quotesToday = transitionedToToday("quoted");
    approvedToday = transitionedToToday("approved");
    deliveredToday = transitionedToToday("delivered");
  } else {
    quotesToday = new Set();
    approvedToday = new Set();
    deliveredToday = new Set();
    for (const lead of leads) {
      const key = calendarDateKey(lead.last_updated_at || lead.created_at, tz);
      if (key !== today) continue;
      const id = String(lead.id);
      const pipe = normalizePrintPipelineStatus(lead.print_pipeline_status);
      if (pipe === "quoted") quotesToday.add(id);
      if (pipe === "approved") approvedToday.add(id);
      if (pipe === "delivered") deliveredToday.add(id);
    }
  }

  const newRequestsToday = leads.filter((l) => calendarDateKey(l.created_at, tz) === today).length;

  const revenueCollectedToday = sumPriceForLeads(deliveredToday, byId);

  const weekKeys = rollingDayKeys(tz, now, 7);
  const monthKeys = monthKeysThisMonth(tz, now);

  let deliveredThisWeek: Set<string>;
  let deliveredThisMonth: Set<string>;
  let usedActivityForRevenue = hasActivityData;

  if (hasActivityData) {
    deliveredThisWeek = transitionedToOnDateKeys(activities, "delivered", weekKeys, tz);
    deliveredThisMonth = transitionedToOnDateKeys(activities, "delivered", monthKeys, tz);
    if (deliveredThisWeek.size === 0 && deliveredThisMonth.size === 0) {
      const fw = fallbackDeliveredOnDates(leads, weekKeys, tz);
      const fm = fallbackDeliveredOnDates(leads, monthKeys, tz);
      if (fw.size || fm.size) {
        deliveredThisWeek = fw;
        deliveredThisMonth = fm;
        usedActivityForRevenue = false;
      }
    }
  } else {
    deliveredThisWeek = fallbackDeliveredOnDates(leads, weekKeys, tz);
    deliveredThisMonth = fallbackDeliveredOnDates(leads, monthKeys, tz);
    usedActivityForRevenue = false;
  }

  const revenueThisWeek = sumPriceForLeads(deliveredThisWeek, byId);
  const revenueThisMonth = sumPriceForLeads(deliveredThisMonth, byId);
  const estimatedProfitThisMonth = profitForLeads(deliveredThisMonth, byId);

  let outstandingQuoted = 0;
  for (const lead of leads) {
    if (normalizePrintPipelineStatus(lead.print_pipeline_status) !== "quoted") continue;
    const p = num(lead.price_charged) ?? num(lead.quoted_amount);
    if (p != null) outstandingQuoted += p;
  }
  outstandingQuoted = Math.round(outstandingQuoted * 100) / 100;

  const daily: DailySummary = {
    newRequestsToday,
    quotesSentToday: quotesToday.size,
    approvedToday: approvedToday.size,
    deliveredToday: deliveredToday.size,
    revenueCollectedToday,
    usedActivityForToday: usedActivityForToday && activities.length > 0,
  };

  const money: MoneyOverview = {
    revenueThisWeek,
    revenueThisMonth,
    outstandingQuoted,
    estimatedProfitThisMonth,
    usedActivityForRevenue,
  };

  const attention = computeAttentionItems(leads, now);
  const payment = computePaymentDashboardSlice(leads);
  const unpaidMoney = computeUnpaidMoneyMetrics(leads, tz);

  return { daily, money, pipeline, attention, payment, unpaidMoney };
}

export function formatDashboardUsd(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function parsePrintStageQuery(raw: string | null | undefined): "all" | ThreeDPrintPipelineStatus {
  const k = String(raw || "").toLowerCase().trim();
  if (!k) return "all";
  if ((THREE_D_PRINT_PIPELINE_ORDER as readonly string[]).includes(k)) return k as ThreeDPrintPipelineStatus;
  return "all";
}

export type PrintPaymentViewFilter =
  | "all"
  | "unpaid"
  | "deposit_requested"
  | "partially_paid"
  | "ready_but_unpaid"
  | "paid";

export const PRINT_PAYMENT_VIEW_TABS: { id: PrintPaymentViewFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unpaid", label: "Unpaid" },
  { id: "deposit_requested", label: "Deposit req." },
  { id: "partially_paid", label: "Partial" },
  { id: "ready_but_unpaid", label: "Ready · unpaid" },
  { id: "paid", label: "Paid" },
];

export function parsePrintPaymentFilterQuery(raw: string | null | undefined): PrintPaymentViewFilter {
  const k = String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/-/g, "_");
  if (!k || k === "all") return "all";
  if (k === "unpaid") return "unpaid";
  if (k === "deposit_requested") return "deposit_requested";
  if (k === "partially_paid" || k === "partial") return "partially_paid";
  if (k === "ready_but_unpaid" || k === "ready_unpaid") return "ready_but_unpaid";
  if (k === "paid") return "paid";
  return "all";
}

export function printLeadMatchesPaymentFilter(
  lead: Pick<PrintDashboardLead, "print_pipeline_status" | "payment_status">,
  filter: PrintPaymentViewFilter,
): boolean {
  if (filter === "all") return true;
  const pipe = normalizePrintPipelineStatus(lead.print_pipeline_status);
  const pay = normalizePrintPaymentStatus(lead.payment_status);

  if (filter === "paid") return pay === "paid";
  if (filter === "deposit_requested") return pay === "deposit_requested";
  if (filter === "partially_paid") return pay === "partially_paid";
  if (filter === "ready_but_unpaid") return pipe === "ready" && pay !== "paid" && pay !== "refunded";
  if (filter === "unpaid") return pay === "unpaid";
  return true;
}

export { THREE_D_PRINT_PIPELINE_LABELS, THREE_D_PRINT_PIPELINE_ORDER };
