"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { patchLeadApi } from "@/lib/crm/patch-lead-client";
import { mergePrintKeywordTags } from "@/lib/crm/print-auto-tags";
import {
  DEFAULT_DEPOSIT_FRACTION,
  formatUsdAmount,
  normalizePrintPaymentMethod,
  normalizePrintPaymentRequestType,
  normalizePrintPaymentStatus,
  PRINT_PAYMENT_METHOD_LABELS,
  PRINT_PAYMENT_REQUEST_LABELS,
  PRINT_PAYMENT_STATUS_LABELS,
  PRINT_PAYMENT_STATUSES,
  resolveCheckoutAmountUsd,
  resolveEffectiveDepositAmountUsd,
  type PrintPaymentRequestType,
  type PrintPaymentStatus,
} from "@/lib/crm/print-payment";
import { buildPrintCashAppCustomerMessage } from "@/lib/crm/print-cashapp-messages";
import {
  buildPrintMessageFromTemplate,
  PRINT_MESSAGE_TEMPLATE_ORDER,
  printMessageTemplateLabel,
  type PrintMessageTemplateId,
} from "@/lib/crm/print-message-templates";
import { elapsedWholeMinutesSince, formatMinutesHuman } from "@/lib/crm/print-job-timer";
import {
  computePrintPriceEstimateUsd,
  normalizePrintLaborLevel,
  PRINT_LABOR_LEVELS,
  printLaborCostForLevel,
} from "@/lib/crm/print-labor-pricing";
import {
  computeFilamentCostUsd,
  computePrintJobFinancials,
  extractPrintRequestDescription,
  formatPrintUsd,
  isPrintAttachmentImageUrl,
  mapPrintPipelineToLeadStatus,
  normalizePrintPipelineStatus,
  PRINT_PIPELINE_QUICK_ACTIONS,
  resolveFilamentCostPerKg,
  THREE_D_PRINT_PIPELINE_LABELS,
  THREE_D_PRINT_PIPELINE_OPTIONS,
  THREE_D_PRINT_PIPELINE_ORDER,
  type ThreeDPrintPipelineStatus,
} from "@/lib/crm/three-d-print-lead";
import { QuotedPaymentRequestModal } from "@/components/admin/crm/quoted-payment-request-modal";
import { LeadActivityTimeline } from "@/components/admin/lead-activity-timeline";

function fmtTs(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function parseMoneyInput(raw: string): number | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  const n = Number.parseFloat(s.replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseHoursInput(raw: string): number | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseNonNegIntMinutes(raw: string): number | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseFilamentGrams(raw: string): number | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function displayContactName(contactName: string | null, businessName: string | null): string {
  const n = String(contactName || "").trim();
  if (n) return n;
  const b = String(businessName || "").trim();
  if (b.startsWith("3D Print Quote")) return b.replace(/^3D Print Quote —\s*/i, "").trim() || b;
  return b || "—";
}

export function PrintLeadDetailView({
  leadId,
  contactName,
  businessName,
  email,
  phone,
  printPipelineStatus,
  printTags,
  estimateRange,
  notes,
  printRequestSummary,
  attachmentUrl,
  printDimensions,
  printQuantity,
  printDeadline,
  designHelpRequested,
  printRequestType,
  printMaterial,
  createdAt,
  lastContactedAt,
  lastResponseAt,
  priceCharged,
  filamentCost,
  filamentGramsUsed,
  filamentCostPerKg,
  filamentUseWeightCalc,
  defaultFilamentCostPerKg,
  estimatedTimeHours,
  quotedAmount,
  depositAmount,
  finalAmount,
  paymentRequestType,
  paymentStatus,
  paymentMethod,
  paymentLink,
  paidAt,
  printTimerStartedAt,
  printTimerRunning,
  printTrackedMinutes,
  printManualTimeMinutes,
  printLaborLevel,
  printLaborCost,
  laborRateUsdPerHour,
  cashAppPaymentUrl,
  cashAppDisplayLine,
  stripePaymentReturn = null,
  stripeCheckoutSessionId = null,
}: {
  leadId: string;
  contactName: string | null;
  businessName: string | null;
  email: string | null;
  phone: string | null;
  printPipelineStatus: string | null;
  printTags: string[] | null;
  estimateRange: string | null;
  notes: string | null;
  printRequestSummary: string | null;
  attachmentUrl: string | null;
  printDimensions: string | null;
  printQuantity: string | null;
  printDeadline: string | null;
  designHelpRequested: boolean | null;
  printRequestType: string | null;
  printMaterial: string | null;
  createdAt: string | null;
  lastContactedAt: string | null;
  lastResponseAt: string | null;
  priceCharged: number | null;
  filamentCost: number | null;
  filamentGramsUsed: number | null;
  filamentCostPerKg: number | null;
  filamentUseWeightCalc: boolean;
  defaultFilamentCostPerKg: number;
  estimatedTimeHours: number | null;
  quotedAmount: number | null;
  depositAmount: number | null;
  finalAmount: number | null;
  paymentRequestType: string | null;
  paymentStatus: string | null;
  paymentMethod: string | null;
  paymentLink: string | null;
  paidAt: string | null;
  printTimerStartedAt: string | null;
  printTimerRunning: boolean | null;
  printTrackedMinutes: number | null;
  printManualTimeMinutes: number | null;
  printLaborLevel: string | null;
  printLaborCost: number | null;
  /** Reference $/hr from env (brackets are fixed USD amounts). */
  laborRateUsdPerHour: number;
  cashAppPaymentUrl: string | null;
  /** Cashtag / line for customer copy; env NEXT_PUBLIC_CASHAPP_HANDLE or payment URL. */
  cashAppDisplayLine: string | null;
  /** After Stripe Checkout redirect: success | cancel (display only; fulfillment is webhook-driven). */
  stripePaymentReturn?: "success" | "cancel" | null;
  /** Checkout Session id from success_url (optional display via /api/stripe/session). */
  stripeCheckoutSessionId?: string | null;
}) {
  const router = useRouter();
  const showStripe =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_SHOW_STRIPE_PRINT_PAYMENTS === "true";

  const [pipe, setPipe] = useState<ThreeDPrintPipelineStatus>(() => normalizePrintPipelineStatus(printPipelineStatus));
  const [busy, setBusy] = useState(false);
  const [pipeErr, setPipeErr] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState(() => String(notes || ""));
  const [noteBusy, setNoteBusy] = useState(false);
  const [noteErr, setNoteErr] = useState<string | null>(null);
  const [noteSaved, setNoteSaved] = useState(false);
  const [priceStr, setPriceStr] = useState(() => (priceCharged != null ? String(priceCharged) : ""));
  const [filamentStr, setFilamentStr] = useState(() => (filamentCost != null ? String(filamentCost) : ""));
  const [gramsStr, setGramsStr] = useState(() => (filamentGramsUsed != null ? String(filamentGramsUsed) : ""));
  const [costPerKgStr, setCostPerKgStr] = useState(() =>
    filamentCostPerKg != null ? String(filamentCostPerKg) : String(defaultFilamentCostPerKg),
  );
  const [useWeightCalc, setUseWeightCalc] = useState(() => filamentUseWeightCalc);
  const [materialBusy, setMaterialBusy] = useState(false);
  const [materialErr, setMaterialErr] = useState<string | null>(null);
  const [materialOk, setMaterialOk] = useState(false);
  const [laborLevel, setLaborLevel] = useState(() => String(printLaborLevel || "").trim());
  const [laborBusy, setLaborBusy] = useState(false);
  const [laborErr, setLaborErr] = useState<string | null>(null);
  const [laborOk, setLaborOk] = useState(false);
  const [hoursStr, setHoursStr] = useState(() => (estimatedTimeHours != null ? String(estimatedTimeHours) : ""));
  const [pricingBusy, setPricingBusy] = useState(false);
  const [pricingErr, setPricingErr] = useState<string | null>(null);
  const [pricingSaved, setPricingSaved] = useState(false);
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [invoiceErr, setInvoiceErr] = useState<string | null>(null);
  const [invoiceOk, setInvoiceOk] = useState<string | null>(null);
  const [quotedStr, setQuotedStr] = useState(() => (quotedAmount != null ? String(quotedAmount) : ""));
  const [depositStr, setDepositStr] = useState(() => (depositAmount != null ? String(depositAmount) : ""));
  const [finalStr, setFinalStr] = useState(() => (finalAmount != null ? String(finalAmount) : ""));
  const [payStatusLocal, setPayStatusLocal] = useState<PrintPaymentStatus>(() =>
    normalizePrintPaymentStatus(paymentStatus),
  );
  const [paymentFieldsBusy, setPaymentFieldsBusy] = useState(false);
  const [paymentFieldsErr, setPaymentFieldsErr] = useState<string | null>(null);
  const [paymentFieldsOk, setPaymentFieldsOk] = useState(false);
  const [copyMsgOk, setCopyMsgOk] = useState<string | null>(null);
  const [quotedPayModalOpen, setQuotedPayModalOpen] = useState(false);
  const [payRequestKind, setPayRequestKind] = useState<PrintPaymentRequestType>(() =>
    normalizePrintPaymentRequestType(paymentRequestType),
  );
  const [stripeCheckoutKind, setStripeCheckoutKind] = useState<"deposit" | "full" | null>(null);
  const [stripeCheckoutErr, setStripeCheckoutErr] = useState<string | null>(null);
  const [stripeSessionPreview, setStripeSessionPreview] = useState<{
    payment_status?: string | null;
    amount_total?: number | null;
    currency?: string | null;
  } | null>(null);

  const trackedMinutesBase = Math.max(0, Math.floor(Number(printTrackedMinutes) || 0));
  const manualMinutesBase = Math.max(0, Math.floor(Number(printManualTimeMinutes) || 0));
  const timerRunningServer = Boolean(printTimerRunning);
  const timerStartedIso =
    printTimerStartedAt && String(printTimerStartedAt).trim()
      ? String(printTimerStartedAt).trim()
      : null;

  const [timerTick, setTimerTick] = useState(() => Date.now());
  const [timerBusy, setTimerBusy] = useState(false);
  const [timerErr, setTimerErr] = useState<string | null>(null);
  const [manualMinutesStr, setManualMinutesStr] = useState(() => String(manualMinutesBase));
  const [manualBusy, setManualBusy] = useState(false);
  const [manualErr, setManualErr] = useState<string | null>(null);
  const [manualOk, setManualOk] = useState(false);

  useEffect(() => {
    if (!timerRunningServer || !timerStartedIso) return;
    const id = window.setInterval(() => setTimerTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [timerRunningServer, timerStartedIso]);

  useEffect(() => {
    setManualMinutesStr(String(manualMinutesBase));
  }, [manualMinutesBase]);

  useEffect(() => {
    setPipe(normalizePrintPipelineStatus(printPipelineStatus));
  }, [printPipelineStatus]);

  useEffect(() => {
    setUseWeightCalc(filamentUseWeightCalc);
  }, [filamentUseWeightCalc]);

  useEffect(() => {
    setNoteDraft(String(notes || ""));
  }, [notes]);

  useEffect(() => {
    setPriceStr(priceCharged != null ? String(priceCharged) : "");
  }, [priceCharged]);
  useEffect(() => {
    setFilamentStr(filamentCost != null ? String(filamentCost) : "");
  }, [filamentCost]);
  useEffect(() => {
    setGramsStr(filamentGramsUsed != null ? String(filamentGramsUsed) : "");
  }, [filamentGramsUsed]);
  useEffect(() => {
    setCostPerKgStr(
      filamentCostPerKg != null ? String(filamentCostPerKg) : String(defaultFilamentCostPerKg),
    );
  }, [filamentCostPerKg, defaultFilamentCostPerKg]);

  useEffect(() => {
    setLaborLevel(String(printLaborLevel || "").trim());
  }, [printLaborLevel]);
  useEffect(() => {
    setHoursStr(estimatedTimeHours != null ? String(estimatedTimeHours) : "");
  }, [estimatedTimeHours]);

  useEffect(() => {
    setQuotedStr(quotedAmount != null ? String(quotedAmount) : "");
  }, [quotedAmount]);
  useEffect(() => {
    setDepositStr(depositAmount != null ? String(depositAmount) : "");
  }, [depositAmount]);
  useEffect(() => {
    setFinalStr(finalAmount != null ? String(finalAmount) : "");
  }, [finalAmount]);
  useEffect(() => {
    setPayStatusLocal(normalizePrintPaymentStatus(paymentStatus));
  }, [paymentStatus]);
  useEffect(() => {
    setPayRequestKind(normalizePrintPaymentRequestType(paymentRequestType));
  }, [paymentRequestType]);

  useEffect(() => {
    if (!showStripe) return;
    if (stripePaymentReturn !== "success" || !stripeCheckoutSessionId) {
      setStripeSessionPreview(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const r = await fetch(
        `/api/stripe/session?session_id=${encodeURIComponent(stripeCheckoutSessionId)}`,
        { credentials: "same-origin" },
      );
      const j = (await r.json().catch(() => null)) as Record<string, unknown> | null;
      if (cancelled || !r.ok || !j) return;
      setStripeSessionPreview({
        payment_status: typeof j.payment_status === "string" ? j.payment_status : null,
        amount_total: typeof j.amount_total === "number" ? j.amount_total : null,
        currency: typeof j.currency === "string" ? j.currency : null,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [showStripe, stripePaymentReturn, stripeCheckoutSessionId]);

  const requestDescription = extractPrintRequestDescription(notes, printRequestSummary);
  const currentIdx = THREE_D_PRINT_PIPELINE_ORDER.indexOf(pipe);
  const tags = (printTags || []).filter(Boolean);
  const showImage = attachmentUrl && isPrintAttachmentImageUrl(attachmentUrl);

  const priceInputN = parseMoneyInput(priceStr);
  const liveComputedFilamentUsd = useMemo(() => {
    const grams = parseFilamentGrams(gramsStr);
    if (grams == null) return null;
    const perKgField = parseMoneyInput(costPerKgStr);
    const effPerKg = resolveFilamentCostPerKg(perKgField, defaultFilamentCostPerKg);
    const u = computeFilamentCostUsd(grams, effPerKg);
    return Number.isFinite(u) ? u : null;
  }, [gramsStr, costPerKgStr, defaultFilamentCostPerKg]);

  const filamentForProfitN = useMemo(() => {
    if (useWeightCalc && liveComputedFilamentUsd != null) return liveComputedFilamentUsd;
    return parseMoneyInput(filamentStr);
  }, [useWeightCalc, liveComputedFilamentUsd, filamentStr]);

  const laborUsdLive = useMemo(() => {
    if (!String(laborLevel || "").trim()) return null;
    const n = normalizePrintLaborLevel(laborLevel);
    if (n != null) return printLaborCostForLevel(n);
    return printLaborCost;
  }, [laborLevel, printLaborCost]);

  const printEstimate = useMemo(
    () =>
      computePrintPriceEstimateUsd({
        laborCostUsd: laborUsdLive,
        filamentCostUsd: filamentForProfitN,
      }),
    [laborUsdLive, filamentForProfitN],
  );

  useEffect(() => {
    if (!useWeightCalc) return;
    if (liveComputedFilamentUsd == null) return;
    setFilamentStr(liveComputedFilamentUsd.toFixed(2));
  }, [useWeightCalc, liveComputedFilamentUsd]);

  const { totalCost: liveTotalCost, profit: liveProfit } = computePrintJobFinancials(
    priceInputN,
    filamentForProfitN,
    laborUsdLive,
  );

  function tagHaystack(): string {
    return [
      requestDescription,
      noteDraft,
      String(printRequestType || ""),
      String(printMaterial || ""),
    ].join("\n");
  }

  const sessionLiveMins =
    timerRunningServer && timerStartedIso ? elapsedWholeMinutesSince(timerStartedIso, timerTick) : 0;
  const totalTimeMinutes = trackedMinutesBase + manualMinutesBase + sessionLiveMins;

  async function startPrintTimer() {
    if (timerRunningServer) return;
    setTimerBusy(true);
    setTimerErr(null);
    const print_tags = mergePrintKeywordTags(printTags, tagHaystack());
    const r = await patchLeadApi(leadId, {
      print_timer_started_at: new Date().toISOString(),
      print_timer_running: true,
      print_tags,
    });
    setTimerBusy(false);
    if (!r.ok) {
      setTimerErr(r.error);
      return;
    }
    router.refresh();
  }

  async function stopPrintTimer() {
    if (!timerRunningServer) return;
    setTimerBusy(true);
    setTimerErr(null);
    const print_tags = mergePrintKeywordTags(printTags, tagHaystack());
    const elapsed = timerStartedIso ? elapsedWholeMinutesSince(timerStartedIso) : 0;
    const nextTracked = trackedMinutesBase + elapsed;
    const r = await patchLeadApi(leadId, {
      print_tracked_minutes: nextTracked,
      print_timer_started_at: null,
      print_timer_running: false,
      print_tags,
    });
    setTimerBusy(false);
    if (!r.ok) {
      setTimerErr(r.error);
      return;
    }
    router.refresh();
  }

  async function saveManualMinutes() {
    const n = parseNonNegIntMinutes(manualMinutesStr);
    setManualBusy(true);
    setManualErr(null);
    setManualOk(false);
    if (n === null) {
      setManualBusy(false);
      setManualErr("Enter a whole number of minutes (0 or more).");
      return;
    }
    const print_tags = mergePrintKeywordTags(printTags, tagHaystack());
    const r = await patchLeadApi(leadId, { print_manual_time_minutes: n, print_tags });
    setManualBusy(false);
    if (!r.ok) {
      setManualErr(r.error);
      return;
    }
    setManualOk(true);
    router.refresh();
  }

  function resolveFilamentCostForSave(): number | null {
    const g = parseFilamentGrams(gramsStr);
    const perKgP = parseMoneyInput(costPerKgStr);
    const eff = resolveFilamentCostPerKg(perKgP, defaultFilamentCostPerKg);
    const comp = g != null ? computeFilamentCostUsd(g, eff) : null;
    if (useWeightCalc && comp != null) return comp;
    return parseMoneyInput(filamentStr);
  }

  async function saveMaterialCost() {
    setMaterialBusy(true);
    setMaterialErr(null);
    setMaterialOk(false);
    const g = parseFilamentGrams(gramsStr);
    const perKgStored = parseMoneyInput(costPerKgStr);
    const eff = resolveFilamentCostPerKg(perKgStored, defaultFilamentCostPerKg);
    const comp = g != null ? computeFilamentCostUsd(g, eff) : null;
    const print_tags = mergePrintKeywordTags(printTags, tagHaystack());
    const patch: Record<string, unknown> = {
      filament_grams_used: g,
      filament_cost_per_kg: perKgStored,
      filament_use_weight_calc: useWeightCalc,
      print_tags,
    };
    if (useWeightCalc) {
      if (comp != null) patch.filament_cost = comp;
    } else {
      patch.filament_cost = parseMoneyInput(filamentStr);
    }
    const r = await patchLeadApi(leadId, patch);
    setMaterialBusy(false);
    if (!r.ok) {
      setMaterialErr(r.error);
      return;
    }
    setMaterialOk(true);
    router.refresh();
  }

  async function saveLaborCost() {
    setLaborBusy(true);
    setLaborErr(null);
    setLaborOk(false);
    const n = normalizePrintLaborLevel(laborLevel);
    const print_tags = mergePrintKeywordTags(printTags, tagHaystack());
    const r = await patchLeadApi(leadId, {
      print_labor_level: n,
      print_labor_cost: n != null ? printLaborCostForLevel(n) : null,
      print_tags,
    });
    setLaborBusy(false);
    if (!r.ok) {
      setLaborErr(r.error);
      return;
    }
    setLaborOk(true);
    router.refresh();
  }

  async function savePricing() {
    setPricingBusy(true);
    setPricingErr(null);
    setPricingSaved(false);
    const print_tags = mergePrintKeywordTags(printTags, tagHaystack());
    const r = await patchLeadApi(leadId, {
      price_charged: parseMoneyInput(priceStr),
      filament_cost: resolveFilamentCostForSave(),
      filament_use_weight_calc: useWeightCalc,
      estimated_time_hours: parseHoursInput(hoursStr),
      print_tags,
    });
    setPricingBusy(false);
    if (!r.ok) {
      setPricingErr(r.error);
      return;
    }
    setPricingSaved(true);
    router.refresh();
  }

  async function applyPipeline(next: ThreeDPrintPipelineStatus) {
    if (next === "quoted") {
      setQuotedPayModalOpen(true);
      return;
    }
    setBusy(true);
    setPipeErr(null);
    const print_tags = mergePrintKeywordTags(printTags, tagHaystack());
    const r = await patchLeadApi(leadId, {
      print_pipeline_status: next,
      status: mapPrintPipelineToLeadStatus(next),
      print_tags,
    });
    setBusy(false);
    if (!r.ok) {
      setPipeErr(r.error);
      return;
    }
    setPipe(next);
    router.refresh();
  }

  async function saveNotes() {
    setNoteBusy(true);
    setNoteErr(null);
    setNoteSaved(false);
    const print_tags = mergePrintKeywordTags(printTags, tagHaystack());
    const r = await patchLeadApi(leadId, { notes: noteDraft.trim() || null, print_tags });
    setNoteBusy(false);
    if (!r.ok) {
      setNoteErr(r.error);
      return;
    }
    setNoteSaved(true);
    router.refresh();
  }

  async function sendInvoiceEmail() {
    setInvoiceBusy(true);
    setInvoiceErr(null);
    setInvoiceOk(null);
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}/invoice`, { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as { error?: unknown; invoiceNumber?: string };
      setInvoiceBusy(false);
      if (!res.ok) {
        setInvoiceErr(String(body.error ?? "Could not send invoice."));
        return;
      }
      setInvoiceOk(body.invoiceNumber ? `Sent invoice ${body.invoiceNumber}.` : "Invoice sent.");
    } catch (e) {
      setInvoiceBusy(false);
      setInvoiceErr(e instanceof Error ? e.message : "Could not send invoice.");
    }
  }

  const custName = displayContactName(contactName, businessName);
  const linkLive = String(paymentLink || "").trim();
  const priceForCheckout = parseMoneyInput(priceStr) ?? priceCharged ?? null;

  async function savePaymentFields() {
    setPaymentFieldsBusy(true);
    setPaymentFieldsErr(null);
    setPaymentFieldsOk(false);
    const q = parseMoneyInput(quotedStr);
    const dIn = parseMoneyInput(depositStr);
    const depositToStore =
      payRequestKind === "deposit"
        ? resolveEffectiveDepositAmountUsd({ deposit_amount: dIn, quoted_amount: q })
        : dIn;
    const print_tags = mergePrintKeywordTags(printTags, tagHaystack());
    const r = await patchLeadApi(leadId, {
      quoted_amount: q,
      deposit_amount: depositToStore,
      final_amount: parseMoneyInput(finalStr),
      payment_request_type: payRequestKind,
      payment_status: payStatusLocal,
      print_tags,
    });
    setPaymentFieldsBusy(false);
    if (!r.ok) {
      setPaymentFieldsErr(r.error);
      return;
    }
    setPaymentFieldsOk(true);
    router.refresh();
  }

  async function patchPayment(partial: Record<string, unknown>) {
    setPaymentFieldsBusy(true);
    setPaymentFieldsErr(null);
    setPaymentFieldsOk(false);
    const r = await patchLeadApi(leadId, partial);
    setPaymentFieldsBusy(false);
    if (!r.ok) {
      setPaymentFieldsErr(r.error);
      return;
    }
    router.refresh();
  }

  async function copyPaymentClipboard(text: string, okLabel: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsgOk(okLabel);
      window.setTimeout(() => setCopyMsgOk(null), 2800);
    } catch {
      setCopyMsgOk(null);
    }
  }

  function cashAppLineForMessages(): string {
    return (
      String(cashAppDisplayLine || "").trim() ||
      String(cashAppPaymentUrl || "").trim() ||
      linkLive
    );
  }

  function customerCashAppPaymentMessage(): string {
    const amountUsd = resolveCheckoutAmountUsd({
      for: payRequestKind === "deposit" ? "deposit" : "full",
      deposit_amount: parseMoneyInput(depositStr),
      final_amount: parseMoneyInput(finalStr),
      price_charged: priceForCheckout,
      quoted_amount: parseMoneyInput(quotedStr),
    }).usd;
    return buildPrintCashAppCustomerMessage({
      kind: payRequestKind === "deposit" ? "deposit" : "full",
      customerName: custName,
      cashAppLine: cashAppLineForMessages() || "(configure NEXT_PUBLIC_CASHAPP_HANDLE or PAYMENT_URL)",
      amountUsd,
    });
  }

  function canCopyCashAppRequest(): boolean {
    return Boolean(cashAppLineForMessages());
  }

  const stripeDepositUsd = resolveCheckoutAmountUsd({
    for: "deposit",
    deposit_amount: parseMoneyInput(depositStr),
    final_amount: parseMoneyInput(finalStr),
    price_charged: priceForCheckout,
    quoted_amount: parseMoneyInput(quotedStr),
  }).usd;
  const stripeFullUsd = resolveCheckoutAmountUsd({
    for: "full",
    deposit_amount: parseMoneyInput(depositStr),
    final_amount: parseMoneyInput(finalStr),
    price_charged: priceInputN,
    quoted_amount: parseMoneyInput(quotedStr),
  }).usd;

  async function startStripeCheckout(forKind: "deposit" | "full") {
    if (!showStripe) return;
    if (stripeCheckoutKind) return;
    setStripeCheckoutErr(null);
    setStripeCheckoutKind(forKind);
    try {
      const q = parseMoneyInput(quotedStr);
      const dIn = parseMoneyInput(depositStr);
      const depositToStore =
        payRequestKind === "deposit"
          ? resolveEffectiveDepositAmountUsd({ deposit_amount: dIn, quoted_amount: q })
          : dIn;
      const print_tags = mergePrintKeywordTags(printTags, tagHaystack());
      const saveR = await patchLeadApi(leadId, {
        quoted_amount: q,
        deposit_amount: depositToStore,
        final_amount: parseMoneyInput(finalStr),
        payment_request_type: payRequestKind,
        payment_status: payStatusLocal,
        print_tags,
      });
      if (!saveR.ok) {
        setStripeCheckoutErr(saveR.error);
        setStripeCheckoutKind(null);
        return;
      }
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}/stripe-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ for: forKind === "deposit" ? "deposit" : "full" }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
        code?: string;
      };
      const url = typeof body.url === "string" ? body.url : "";
      if (!url) {
        setStripeCheckoutErr(
          body.error ||
            (body.code === "STRIPE_NOT_CONFIGURED"
              ? "Stripe is not configured on the server."
              : "Could not start checkout."),
        );
        setStripeCheckoutKind(null);
        return;
      }
      if (res.ok || res.status === 207) {
        window.location.assign(url);
        return;
      }
      setStripeCheckoutErr(body.error || "Could not start checkout.");
      setStripeCheckoutKind(null);
    } catch (e) {
      setStripeCheckoutErr(e instanceof Error ? e.message : "Could not start checkout.");
      setStripeCheckoutKind(null);
    }
  }

  function copyQuickTemplate(id: PrintMessageTemplateId) {
    const depEff = resolveEffectiveDepositAmountUsd({
      deposit_amount: parseMoneyInput(depositStr),
      quoted_amount: parseMoneyInput(quotedStr),
    });
    const fullUsd = resolveCheckoutAmountUsd({
      for: "full",
      deposit_amount: parseMoneyInput(depositStr),
      final_amount: parseMoneyInput(finalStr),
      price_charged: priceInputN,
      quoted_amount: parseMoneyInput(quotedStr),
    }).usd;
    const text = buildPrintMessageFromTemplate(id, {
      name: custName,
      payment_link: linkLive,
      amount_deposit: formatUsdAmount(depEff),
      amount_full: formatUsdAmount(fullUsd),
      cash_app_url: String(cashAppDisplayLine || cashAppPaymentUrl || "").trim(),
    });
    void copyPaymentClipboard(text, `${printMessageTemplateLabel(id)} copied.`);
  }

  return (
    <div className="space-y-4">
      <QuotedPaymentRequestModal
        open={quotedPayModalOpen}
        onClose={() => setQuotedPayModalOpen(false)}
        leadId={leadId}
        contactName={contactName}
        businessName={businessName}
        email={email}
        currentPrintPipeline={pipe}
        initialQuotedAmount={parseMoneyInput(quotedStr) ?? quotedAmount}
        initialDepositAmount={parseMoneyInput(depositStr) ?? depositAmount}
        initialFinalAmount={parseMoneyInput(finalStr) ?? finalAmount}
        initialPriceCharged={priceForCheckout}
        existingPaymentLink={paymentLink}
        existingPaymentMethod={paymentMethod}
        initialPaymentRequestType={paymentRequestType}
        cashAppPaymentUrl={cashAppPaymentUrl}
        cashAppDisplayLine={cashAppDisplayLine}
        printTags={printTags}
        keywordHaystack={tagHaystack()}
        onCommitted={() => router.refresh()}
      />

      {/* Top */}
      <section
        className="rounded-xl border-2 border-violet-500/40 p-4 sm:p-5 space-y-4"
        style={{ background: "linear-gradient(165deg, rgba(139, 92, 246, 0.08), rgba(0,0,0,0.28))" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300/90">3D print lead</p>
            <h1 className="text-2xl font-bold text-white">{displayContactName(contactName, businessName)}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: "var(--admin-muted)" }}>
              {email ? (
                <a href={`mailto:${encodeURIComponent(email)}`} className="text-sky-400 hover:underline">
                  {email}
                </a>
              ) : null}
              {phone ? (
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-sky-400 hover:underline">
                  {phone}
                </a>
              ) : null}
              {!email && !phone ? <span className="text-amber-200/80">No email or phone on file</span> : null}
            </div>
          </div>
          <div className="shrink-0 text-right space-y-2">
            <div className="flex flex-wrap justify-end gap-2">
              <div
                className="inline-flex items-center rounded-lg border border-violet-400/50 px-3 py-1.5 text-sm font-semibold text-violet-100"
                style={{ background: "rgba(0,0,0,0.35)" }}
              >
                {THREE_D_PRINT_PIPELINE_LABELS[pipe]}
              </div>
              <div
                className="inline-flex items-center rounded-lg border border-sky-500/45 px-3 py-1.5 text-sm font-semibold text-sky-100"
                style={{ background: "rgba(0,0,0,0.35)" }}
              >
                {PRINT_PAYMENT_STATUS_LABELS[payStatusLocal]}
              </div>
            </div>
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              Calculator / range:{" "}
              <span className="font-medium text-[var(--admin-fg)]">{String(estimateRange || "").trim() || "—"}</span>
            </p>
            <div
              className="mt-3 rounded-lg border border-emerald-500/25 bg-black/30 px-3 py-2 text-xs"
              style={{ color: "var(--admin-muted)" }}
            >
              <span className="font-semibold uppercase tracking-wide text-emerald-200/90">Job economics </span>
              <span className="text-[var(--admin-fg)]">
                Price: {formatPrintUsd(priceInputN)} · Cost: {formatPrintUsd(liveTotalCost)} · Profit:{" "}
                {formatPrintUsd(liveProfit)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5 text-violet-200/80">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.length ? (
              tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-violet-500/45 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-100"
                >
                  {t}
                </span>
              ))
            ) : (
              <span className="text-xs opacity-70" style={{ color: "var(--admin-muted)" }}>
                —
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pipeline stepper */}
      <section className="admin-card space-y-3 border-violet-500/25">
        <h2 className="text-sm font-semibold text-violet-200/95">Pipeline</h2>
        <div className="flex flex-wrap gap-1.5 items-center">
          {THREE_D_PRINT_PIPELINE_ORDER.map((step, i) => {
            const done = currentIdx > i;
            const active = step === pipe;
            return (
              <div key={step} className="flex items-center gap-1.5">
                {i > 0 ? <span className="text-[10px] text-violet-500/50">→</span> : null}
                <span
                  className={`rounded-md px-2 py-1 text-[10px] font-medium border ${
                    active
                      ? "border-violet-400 bg-violet-500/25 text-violet-50 ring-1 ring-violet-400/60"
                      : done
                        ? "border-violet-500/25 bg-violet-500/5 text-violet-200/70"
                        : "border-[var(--admin-border)] opacity-55"
                  }`}
                >
                  {THREE_D_PRINT_PIPELINE_LABELS[step]}
                </span>
              </div>
            );
          })}
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--admin-muted)" }}>
            Quick actions
          </p>
          <div className="flex flex-wrap gap-2">
            {PRINT_PIPELINE_QUICK_ACTIONS.map((a) => (
              <button
                key={a.pipeline}
                type="button"
                disabled={busy}
                className="rounded-lg border border-violet-500/45 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-100 hover:bg-violet-500/20 disabled:opacity-45"
                onClick={() => void applyPipeline(a.pipeline)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px]">
            <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1" style={{ color: "var(--admin-muted)" }}>
              Set stage
            </label>
            <select
              aria-label="Print pipeline stage"
              className="w-full max-w-xs rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.25)", color: "var(--admin-fg)" }}
              disabled={busy}
              value={pipe}
              onChange={(e) => {
                const v = e.target.value as ThreeDPrintPipelineStatus;
                if (v === "quoted") {
                  setQuotedPayModalOpen(true);
                  return;
                }
                void applyPipeline(v);
              }}
            >
              {THREE_D_PRINT_PIPELINE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {pipeErr ? (
          <p className="text-xs text-red-400" role="alert">
            {pipeErr}
          </p>
        ) : null}
      </section>

      <div className="xl:grid xl:grid-cols-[1fr_min(100%,380px)] xl:gap-4 xl:items-start">
        <div className="space-y-4 min-w-0">
      {/* Main: description + attachment */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="admin-card space-y-2 border-violet-500/20">
          <h2 className="text-sm font-semibold text-[var(--admin-fg)]">Request description</h2>
          <div
            className="rounded-lg border p-3 text-sm whitespace-pre-wrap max-h-[420px] overflow-y-auto"
            style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.2)", color: "var(--admin-fg)" }}
          >
            {requestDescription}
          </div>
        </section>

        <section className="admin-card space-y-2 border-violet-500/20">
          <h2 className="text-sm font-semibold text-[var(--admin-fg)]">Uploaded file</h2>
          {showImage ? (
            <a
              href={attachmentUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border overflow-hidden bg-black/30"
              style={{ borderColor: "var(--admin-border)" }}
            >
              <img src={attachmentUrl!} alt="Customer upload" className="w-full max-h-[360px] object-contain" />
            </a>
          ) : attachmentUrl ? (
            <p className="text-sm">
              <a href={attachmentUrl} className="text-sky-400 hover:underline break-all" target="_blank" rel="noopener noreferrer">
                Open file (STL / 3MF / other)
              </a>
            </p>
          ) : (
            <p className="text-sm" style={{ color: "var(--admin-muted)" }}>
              No file uploaded.
            </p>
          )}
        </section>
      </div>

      {/* Details grid */}
      <section className="admin-card space-y-3 border-violet-500/20">
        <h2 className="text-sm font-semibold text-[var(--admin-fg)]">Job details</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Size
            </dt>
            <dd className="mt-0.5" style={{ color: "var(--admin-fg)" }}>
              {String(printDimensions || "").trim() || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Quantity
            </dt>
            <dd className="mt-0.5" style={{ color: "var(--admin-fg)" }}>
              {String(printQuantity || "").trim() || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Deadline
            </dt>
            <dd className="mt-0.5" style={{ color: "var(--admin-fg)" }}>
              {String(printDeadline || "").trim() || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
              Design help
            </dt>
            <dd className="mt-0.5" style={{ color: "var(--admin-fg)" }}>
              {designHelpRequested == null ? "—" : designHelpRequested ? "Yes" : "No"}
            </dd>
          </div>
          {printRequestType ? (
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
                Estimator type
              </dt>
              <dd className="mt-0.5" style={{ color: "var(--admin-fg)" }}>
                {printRequestType}
              </dd>
            </div>
          ) : null}
          {printMaterial ? (
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--admin-muted)" }}>
                Material
              </dt>
              <dd className="mt-0.5" style={{ color: "var(--admin-fg)" }}>
                {printMaterial}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="admin-card space-y-3 border-amber-500/25">
        <h2 className="text-sm font-semibold text-amber-200/95">Time tracking</h2>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Total labor time = timer sessions (after stop) + manual minutes. While the timer runs, the current session is
          included in the total below.
        </p>
        <div
          className="rounded-lg border px-4 py-3 text-sm space-y-1"
          style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.22)" }}
        >
          <p className="text-[var(--admin-fg)]">
            <span className="font-semibold text-amber-200/90">Total time: </span>
            <span className="font-mono tabular-nums">{formatMinutesHuman(totalTimeMinutes)}</span>
          </p>
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Timer (saved): {formatMinutesHuman(trackedMinutesBase)} · Manual: {formatMinutesHuman(manualMinutesBase)}
            {timerRunningServer ? (
              <>
                {" "}
                · This session: {formatMinutesHuman(sessionLiveMins)}
              </>
            ) : null}
          </p>
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Status:{" "}
            {timerRunningServer ? (
              <span className="text-amber-200/95 font-medium">
                Running{timerStartedIso ? ` · started ${fmtTs(timerStartedIso)}` : " (no start time — stop to reset)"}
              </span>
            ) : (
              <span className="text-[var(--admin-fg)]/90 font-medium">Stopped</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={timerBusy || timerRunningServer}
            className="rounded-lg border border-amber-500/45 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-100 hover:bg-amber-500/20 disabled:opacity-45"
            onClick={() => void startPrintTimer()}
          >
            Start timer
          </button>
          <button
            type="button"
            disabled={timerBusy || !timerRunningServer}
            className="rounded-lg border border-amber-500/45 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-100 hover:bg-amber-500/20 disabled:opacity-45"
            onClick={() => void stopPrintTimer()}
          >
            Stop timer
          </button>
        </div>
        {timerErr ? (
          <p className="text-xs text-red-400" role="alert">
            {timerErr}
          </p>
        ) : null}
        <div className="pt-1 border-t border-[var(--admin-border)]/60 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-200/80">Manual time</p>
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Set extra minutes if you forgot to use the timer. Stored as manual minutes only (timer total unchanged).
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[140px]">
              <label
                htmlFor="print-job-manual-minutes"
                className="text-[10px] font-semibold uppercase tracking-wide block mb-1"
                style={{ color: "var(--admin-muted)" }}
              >
                Manual minutes
              </label>
              <input
                id="print-job-manual-minutes"
                type="text"
                inputMode="numeric"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.25)", color: "var(--admin-fg)" }}
                placeholder="0"
                value={manualMinutesStr}
                onChange={(e) => {
                  setManualMinutesStr(e.target.value);
                  setManualOk(false);
                }}
              />
            </div>
            <button
              type="button"
              disabled={manualBusy}
              className="rounded-lg border border-amber-500/45 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-100 hover:bg-amber-500/20 disabled:opacity-45"
              onClick={() => void saveManualMinutes()}
            >
              Save manual time
            </button>
          </div>
          {manualErr ? (
            <p className="text-xs text-red-400" role="alert">
              {manualErr}
            </p>
          ) : null}
          {manualOk ? (
            <p className="text-xs text-emerald-400" role="status">
              Manual time saved.
            </p>
          ) : null}
        </div>
      </section>

      <section className="admin-card space-y-3 border-lime-500/25">
        <h2 className="text-sm font-semibold text-lime-200/95">Material cost</h2>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          PLA-focused: <code className="text-[10px] opacity-80">filament_cost = (grams / 1000) × cost_per_kg</code>, rounded to
          cents. Shop default is <strong className="text-lime-200/85">{formatPrintUsd(defaultFilamentCostPerKg)}</strong> per kg
          (override with <code className="text-[10px]">DEFAULT_FILAMENT_COST_PER_KG</code> or{" "}
          <code className="text-[10px]">NEXT_PUBLIC_DEFAULT_FILAMENT_COST_PER_KG</code>).
        </p>
        <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--admin-fg)" }}>
          <input
            type="checkbox"
            className="rounded border-[var(--admin-border)]"
            checked={useWeightCalc}
            onChange={(e) => {
              setUseWeightCalc(e.target.checked);
              setMaterialOk(false);
            }}
          />
          Calculate filament cost from weight
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="print-filament-grams"
              className="text-[10px] font-semibold uppercase tracking-wide block mb-1"
              style={{ color: "var(--admin-muted)" }}
            >
              Filament used (grams)
            </label>
            <input
              id="print-filament-grams"
              type="text"
              inputMode="decimal"
              className="w-full rounded-lg border px-3 py-2 text-sm disabled:opacity-45"
              style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.25)", color: "var(--admin-fg)" }}
              placeholder="e.g. 120"
              disabled={!useWeightCalc}
              value={gramsStr}
              onChange={(e) => {
                setGramsStr(e.target.value);
                setMaterialOk(false);
              }}
            />
          </div>
          <div>
            <label
              htmlFor="print-filament-per-kg"
              className="text-[10px] font-semibold uppercase tracking-wide block mb-1"
              style={{ color: "var(--admin-muted)" }}
            >
              Cost per kg (USD)
            </label>
            <input
              id="print-filament-per-kg"
              type="text"
              inputMode="decimal"
              className="w-full rounded-lg border px-3 py-2 text-sm disabled:opacity-45"
              style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.25)", color: "var(--admin-fg)" }}
              placeholder={String(defaultFilamentCostPerKg)}
              disabled={!useWeightCalc}
              value={costPerKgStr}
              onChange={(e) => {
                setCostPerKgStr(e.target.value);
                setMaterialOk(false);
              }}
            />
          </div>
        </div>
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.22)" }}
        >
          <span className="font-semibold text-lime-200/90">Filament cost: </span>
          <span className="font-mono tabular-nums text-[var(--admin-fg)]">
            {formatPrintUsd(
              useWeightCalc && liveComputedFilamentUsd != null
                ? liveComputedFilamentUsd
                : parseMoneyInput(filamentStr),
            )}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={materialBusy}
            className="rounded-lg border border-lime-500/45 bg-lime-500/10 px-3 py-2 text-xs font-medium text-lime-100 hover:bg-lime-500/20 disabled:opacity-45"
            onClick={() => void saveMaterialCost()}
          >
            Save material
          </button>
          {materialOk ? <span className="text-xs text-emerald-400">Saved.</span> : null}
          {materialErr ? (
            <span className="text-xs text-red-400" role="alert">
              {materialErr}
            </span>
          ) : null}
        </div>
      </section>

      <section className="admin-card space-y-3 border-cyan-500/25">
        <h2 className="text-sm font-semibold text-cyan-200/95">Labor</h2>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Pick a time bracket for quick labor pricing. Reference rate is{" "}
          <strong className="text-cyan-200/85">{formatPrintUsd(laborRateUsdPerHour)}</strong>/hr (
          <code className="text-[10px]">PRINT_LABOR_RATE_USD_PER_HOUR</code> or{" "}
          <code className="text-[10px]">NEXT_PUBLIC_PRINT_LABOR_RATE_USD_PER_HOUR</code>; default 40). Dollar amounts per
          level are fixed for speed.
        </p>
        <div>
          <label
            htmlFor="print-labor-level"
            className="text-[10px] font-semibold uppercase tracking-wide block mb-1"
            style={{ color: "var(--admin-muted)" }}
          >
            Labor level
          </label>
          <select
            id="print-labor-level"
            aria-label="Labor level"
            className="w-full max-w-xl rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.25)", color: "var(--admin-fg)" }}
            value={laborLevel}
            onChange={(e) => {
              setLaborLevel(e.target.value);
              setLaborOk(false);
            }}
          >
            <option value="">— None —</option>
            {PRINT_LABOR_LEVELS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label} — {formatPrintUsd(x.laborCostUsd)}
              </option>
            ))}
          </select>
        </div>
        <div
          className="rounded-lg border px-4 py-3 text-sm space-y-1"
          style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.22)" }}
        >
          <p className="text-[var(--admin-fg)]">
            <span className="font-semibold text-cyan-200/90">Labor cost: </span>
            {formatPrintUsd(laborUsdLive)}
          </p>
          <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
            Material: {formatPrintUsd(filamentForProfitN)} · Labor + material (exact):{" "}
            <span className="tabular-nums">{formatPrintUsd(printEstimate.subtotal)}</span> ·{" "}
            <span className="font-semibold text-[var(--admin-fg)]">
              Suggested total: {formatPrintUsd(printEstimate.rounded)}
            </span>{" "}
            (rounded to cleaner $5 / $10)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={laborBusy}
            className="rounded-lg border border-cyan-500/45 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-100 hover:bg-cyan-500/20 disabled:opacity-45"
            onClick={() => void saveLaborCost()}
          >
            Save labor
          </button>
          {laborOk ? <span className="text-xs text-emerald-400">Saved.</span> : null}
          {laborErr ? (
            <span className="text-xs text-red-400" role="alert">
              {laborErr}
            </span>
          ) : null}
        </div>
      </section>

      {/* Profit & cost (stored fields + live totals) */}
      <section className="admin-card space-y-3 border-emerald-500/25">
        <h2 className="text-sm font-semibold text-emerald-200/95">Profit tracking</h2>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          <strong className="text-emerald-200/80">Total cost</strong> = filament + labor (each optional until set).{" "}
          <strong className="text-emerald-200/80">Profit</strong> = price charged − total cost. Use the Labor section
          suggested total as a quick quote anchor alongside material.
        </p>
        <div
          className="flex flex-wrap gap-4 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.22)" }}
        >
          <div>
            <span style={{ color: "var(--admin-muted)" }}>Price: </span>
            <span className="font-semibold text-[var(--admin-fg)]">{formatPrintUsd(priceInputN)}</span>
          </div>
          <div>
            <span style={{ color: "var(--admin-muted)" }}>Cost: </span>
            <span className="font-semibold text-[var(--admin-fg)]">{formatPrintUsd(liveTotalCost)}</span>
          </div>
          <div>
            <span style={{ color: "var(--admin-muted)" }}>Profit: </span>
            <span
              className={`font-semibold ${liveProfit != null && liveProfit < 0 ? "text-red-400" : "text-emerald-300"}`}
            >
              {formatPrintUsd(liveProfit)}
            </span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1" style={{ color: "var(--admin-muted)" }}>
              Price charged (USD)
            </label>
            <input
              type="text"
              inputMode="decimal"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.25)", color: "var(--admin-fg)" }}
              placeholder="0.00"
              value={priceStr}
              onChange={(e) => {
                setPriceStr(e.target.value);
                setPricingSaved(false);
              }}
            />
          </div>
          <div>
            <label
              htmlFor="print-profit-filament-usd"
              className="text-[10px] font-semibold uppercase tracking-wide block mb-1"
              style={{ color: "var(--admin-muted)" }}
            >
              Filament cost (USD)
              {useWeightCalc ? " — from weight above" : ""}
            </label>
            <input
              id="print-profit-filament-usd"
              type="text"
              inputMode="decimal"
              readOnly={useWeightCalc}
              aria-readonly={useWeightCalc}
              className="w-full rounded-lg border px-3 py-2 text-sm read-only:opacity-70"
              style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.25)", color: "var(--admin-fg)" }}
              placeholder="0.00"
              value={filamentStr}
              onChange={(e) => {
                setFilamentStr(e.target.value);
                setPricingSaved(false);
              }}
            />
            {useWeightCalc ? (
              <p className="text-[10px] mt-1" style={{ color: "var(--admin-muted)" }}>
                Uncheck &quot;Calculate from weight&quot; in Material cost to edit this manually.
              </p>
            ) : null}
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1" style={{ color: "var(--admin-muted)" }}>
              Est. time (hours, optional)
            </label>
            <input
              type="text"
              inputMode="decimal"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.25)", color: "var(--admin-fg)" }}
              placeholder="—"
              value={hoursStr}
              onChange={(e) => {
                setHoursStr(e.target.value);
                setPricingSaved(false);
              }}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pricingBusy}
            className="admin-btn-primary text-sm px-4 py-2"
            onClick={() => void savePricing()}
          >
            Save pricing
          </button>
          {pricingSaved ? <span className="text-xs text-emerald-400">Saved.</span> : null}
          {pricingErr ? (
            <span className="text-xs text-red-400" role="alert">
              {pricingErr}
            </span>
          ) : null}
        </div>
      </section>

      {/* Quick message templates — main column */}
      <section className="admin-card space-y-3 border-teal-500/20">
        <h2 className="text-sm font-semibold text-teal-200/95">Quick message templates</h2>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          One-click copy for SMS, email, or DMs. Keyword tags update when you save notes or pricing (mount, organizer, …).
        </p>
        <ul className="space-y-2">
          {PRINT_MESSAGE_TEMPLATE_ORDER.map((tid) => (
            <li
              key={tid}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-black/15 px-3 py-2"
            >
              <span className="text-sm font-medium text-[var(--admin-fg)]">{printMessageTemplateLabel(tid)}</span>
              <button
                type="button"
                className="admin-btn-ghost text-xs px-3 py-1.5 shrink-0"
                onClick={() => copyQuickTemplate(tid)}
              >
                Copy
              </button>
            </li>
          ))}
        </ul>
        {copyMsgOk ? <p className="text-xs text-emerald-400">{copyMsgOk}</p> : null}
      </section>

        </div>

        <aside className="space-y-4 xl:sticky xl:top-3 self-start min-w-0">
      {/* Payments */}
      <section
        className="admin-card space-y-4 border-sky-500/25"
        style={{ background: "linear-gradient(165deg, rgba(14, 165, 233, 0.07), rgba(0,0,0,0.22))" }}
      >
        <h2 className="text-sm font-semibold text-sky-200/95">Payments</h2>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          <strong className="text-sky-100/80">Cash App</strong> is the default for 3D print jobs. Configure{" "}
          <code className="text-[10px] opacity-85">NEXT_PUBLIC_CASHAPP_PAYMENT_URL</code> and optional{" "}
          <code className="text-[10px] opacity-85">NEXT_PUBLIC_CASHAPP_HANDLE</code> for customer-facing copy. Deposit and
          full payment requests both use the same message templates. Optional Stripe Checkout is available when{" "}
          <code className="text-[10px] opacity-85">NEXT_PUBLIC_SHOW_STRIPE_PRINT_PAYMENTS=true</code> (see{" "}
          <code className="text-[10px] opacity-85">docs/STRIPE.md</code>).
        </p>

        {showStripe && stripePaymentReturn === "success" ? (
          <div
            className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100/95 space-y-1"
            role="status"
          >
            <p className="font-semibold">Stripe checkout finished.</p>
            <p style={{ color: "var(--admin-muted)" }}>
              Payment status on this lead updates when Stripe delivers the webhook (usually within seconds). Refresh if you
              do not see a change yet.
            </p>
            {stripeSessionPreview?.payment_status ? (
              <p className="tabular-nums opacity-90">
                Session: {stripeSessionPreview.payment_status}
                {stripeSessionPreview.amount_total != null
                  ? ` · ${(stripeSessionPreview.amount_total / 100).toFixed(2)} ${String(
                      stripeSessionPreview.currency || "usd",
                    ).toUpperCase()}`
                  : null}
              </p>
            ) : stripeCheckoutSessionId ? (
              <p className="opacity-80">Loading session details…</p>
            ) : null}
          </div>
        ) : null}
        {showStripe && stripePaymentReturn === "cancel" ? (
          <div
            className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90"
            role="status"
          >
            Checkout was cancelled. You can try Stripe again below or use Cash App.
          </div>
        ) : null}

        {showStripe ? (
          <div className="rounded-xl border border-violet-500/30 bg-black/20 p-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-200/90">Stripe Checkout</p>
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              Card payments. Your quote fields are saved automatically before opening Checkout. Fulfillment runs on the server
              webhook, not from this page alone.
            </p>
            {stripeCheckoutErr ? (
              <p className="text-xs text-red-400" role="alert">
                {stripeCheckoutErr}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={
                  Boolean(stripeCheckoutKind) ||
                  paymentFieldsBusy ||
                  stripeDepositUsd == null ||
                  stripeDepositUsd < 0.5
                }
                className="rounded-lg border border-violet-500/45 bg-violet-500/15 px-3 py-2 text-xs font-medium text-violet-100 hover:bg-violet-500/25 disabled:opacity-45"
                onClick={() => void startStripeCheckout("deposit")}
              >
                {stripeCheckoutKind === "deposit" ? "Opening Stripe…" : "Pay deposit (Stripe)"}
              </button>
              <button
                type="button"
                disabled={
                  Boolean(stripeCheckoutKind) || paymentFieldsBusy || stripeFullUsd == null || stripeFullUsd < 0.5
                }
                className="rounded-lg border border-violet-500/45 bg-violet-500/15 px-3 py-2 text-xs font-medium text-violet-100 hover:bg-violet-500/25 disabled:opacity-45"
                onClick={() => void startStripeCheckout("full")}
              >
                {stripeCheckoutKind === "full" ? "Opening Stripe…" : "Pay full balance (Stripe)"}
              </button>
            </div>
            {stripeDepositUsd == null || stripeDepositUsd < 0.5 ? (
              <p className="text-[11px] text-amber-200/85">
                Deposit checkout needs quoted / deposit amounts so the total is at least $0.50.
              </p>
            ) : null}
            {stripeFullUsd == null || stripeFullUsd < 0.5 ? (
              <p className="text-[11px] text-amber-200/85">
                Full checkout needs final, price charged, or quoted amount so the total is at least $0.50.
              </p>
            ) : null}
          </div>
        ) : null}

        <div
          className="rounded-xl border border-sky-500/25 bg-black/25 p-3 sm:p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm"
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-200/80">Quoted</p>
            <p className="mt-0.5 font-semibold text-[var(--admin-fg)]">{formatUsdAmount(parseMoneyInput(quotedStr))}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-200/80">Request type</p>
            <p className="mt-0.5 font-semibold text-[var(--admin-fg)]">
              {PRINT_PAYMENT_REQUEST_LABELS[normalizePrintPaymentRequestType(paymentRequestType)]}
              <span className="text-xs font-normal opacity-70" style={{ color: "var(--admin-muted)" }}>
                {normalizePrintPaymentRequestType(paymentRequestType) !== payRequestKind ? " · editing…" : ""}
              </span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-200/80">Deposit (stored / effective)</p>
            <p className="mt-0.5 font-semibold text-[var(--admin-fg)]">
              {formatUsdAmount(parseMoneyInput(depositStr))}
              {payRequestKind === "deposit" ? (
                <span className="block text-xs font-normal opacity-90" style={{ color: "var(--admin-muted)" }}>
                  Checkout: {formatUsdAmount(
                    resolveEffectiveDepositAmountUsd({
                      deposit_amount: parseMoneyInput(depositStr),
                      quoted_amount: parseMoneyInput(quotedStr),
                    }),
                  )}
                </span>
              ) : null}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-200/80">Final / balance</p>
            <p className="mt-0.5 font-semibold text-[var(--admin-fg)]">{formatUsdAmount(parseMoneyInput(finalStr))}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-200/80">Status</p>
            <p className="mt-0.5 font-semibold text-[var(--admin-fg)]">
              {PRINT_PAYMENT_STATUS_LABELS[normalizePrintPaymentStatus(paymentStatus)]}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-200/80">Method</p>
            <p className="mt-0.5 font-medium text-[var(--admin-fg)]">
              {PRINT_PAYMENT_METHOD_LABELS[normalizePrintPaymentMethod(paymentMethod)]}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-2 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-200/80">Cash App link (on file)</p>
            {linkLive ? (
              <p className="mt-0.5 text-xs break-all text-sky-300/90">{linkLive}</p>
            ) : (
              <p className="mt-0.5 text-xs" style={{ color: "var(--admin-muted)" }}>
                —
              </p>
            )}
          </div>
          {paidAt ? (
            <div className="sm:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-200/80">Paid at</p>
              <p className="mt-0.5 font-medium text-[var(--admin-fg)]">{fmtTs(paidAt)}</p>
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-2 text-sky-200/85">Request</p>
          <div className="inline-flex rounded-lg border border-white/10 p-0.5 bg-black/20" role="group" aria-label="Deposit or full payment request">
            {(["deposit", "full"] as const).map((k) => (
              <button
                key={k}
                type="button"
                disabled={paymentFieldsBusy}
                onClick={() => setPayRequestKind(k)}
                className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                  payRequestKind === k
                    ? "bg-sky-500/25 text-sky-50 ring-1 ring-sky-400/50"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {PRINT_PAYMENT_REQUEST_LABELS[k]}
              </button>
            ))}
          </div>
          <p className="text-[11px] mt-2" style={{ color: "var(--admin-muted)" }}>
            Cash App request copy uses this plus amounts below. Deposit with a blank deposit field uses{" "}
            <strong className="text-sky-100/80">{Math.round(DEFAULT_DEPOSIT_FRACTION * 100)}%</strong> of quoted when you save.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1" style={{ color: "var(--admin-muted)" }}>
              Quoted amount
            </label>
            <input
              type="text"
              inputMode="decimal"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.25)", color: "var(--admin-fg)" }}
              placeholder="0.00"
              aria-label="Quoted amount USD"
              value={quotedStr}
              onChange={(e) => setQuotedStr(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1" style={{ color: "var(--admin-muted)" }}>
              Deposit
            </label>
            <input
              type="text"
              inputMode="decimal"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.25)", color: "var(--admin-fg)" }}
              placeholder="0.00"
              aria-label="Deposit USD"
              value={depositStr}
              onChange={(e) => setDepositStr(e.target.value)}
            />
            <p className="text-[10px] mt-1 leading-snug" style={{ color: "var(--admin-muted)" }}>
              Leave blank for deposit requests to use {Math.round(DEFAULT_DEPOSIT_FRACTION * 100)}% of quoted (after save).
            </p>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1" style={{ color: "var(--admin-muted)" }}>
              Final / balance
            </label>
            <input
              type="text"
              inputMode="decimal"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.25)", color: "var(--admin-fg)" }}
              placeholder="0.00"
              aria-label="Final or balance USD"
              value={finalStr}
              onChange={(e) => setFinalStr(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px]">
            <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1" style={{ color: "var(--admin-muted)" }}>
              Payment status (manual)
            </label>
            <select
              aria-label="Payment status"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,.25)", color: "var(--admin-fg)" }}
              value={payStatusLocal}
              onChange={(e) => setPayStatusLocal(e.target.value as PrintPaymentStatus)}
            >
              {PRINT_PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {PRINT_PAYMENT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={paymentFieldsBusy}
            className="admin-btn-primary text-sm px-4 py-2"
            onClick={() => void savePaymentFields()}
          >
            Save payment fields
          </button>
        </div>
        {paymentFieldsOk ? <span className="text-xs text-emerald-400">Saved.</span> : null}
        {paymentFieldsErr ? (
          <p className="text-xs text-red-400" role="alert">
            {paymentFieldsErr}
          </p>
        ) : null}

        {linkLive ? (
          <div className="rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-xs break-all" style={{ color: "var(--admin-muted)" }}>
            <span className="font-semibold text-sky-100/90">Saved Cash App / pay link: </span>
            {linkLive}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {linkLive ? (
            <>
              <a
                href={linkLive}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn-ghost text-sm px-3 py-2 inline-flex items-center"
              >
                Open saved link
              </a>
              <button
                type="button"
                className="admin-btn-ghost text-sm px-3 py-2"
                onClick={() => void copyPaymentClipboard(linkLive, "Cash App link copied.")}
              >
                Copy saved link
              </button>
            </>
          ) : null}
          {cashAppPaymentUrl && !linkLive ? (
            <a
              href={cashAppPaymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn-ghost text-sm px-3 py-2 inline-flex items-center"
            >
              Open Cash App URL (env)
            </a>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-200/80">Cash App payment request</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canCopyCashAppRequest()}
              className="admin-btn-primary text-xs px-3 py-1.5 disabled:opacity-45"
              onClick={() => void copyPaymentClipboard(customerCashAppPaymentMessage(), "Cash App payment request copied.")}
            >
              Copy Cash App payment request
            </button>
            {cashAppPaymentUrl ? (
              <a
                href={cashAppPaymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn-ghost text-xs px-3 py-1.5 inline-flex items-center"
              >
                Open Cash App URL
              </a>
            ) : null}
          </div>
          {!canCopyCashAppRequest() ? (
            <p className="text-[11px] text-amber-200/85">Set env payment URL, save a link on the lead, or paste handle in env.</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
          <button
            type="button"
            disabled={paymentFieldsBusy}
            className="admin-btn-ghost text-sm px-3 py-2 border-emerald-500/35"
            onClick={() =>
              void patchPayment({
                payment_status: "partially_paid",
                payment_method: "cashapp",
                last_updated_at: new Date().toISOString(),
              })
            }
          >
            Mark deposit paid
          </button>
          <button
            type="button"
            disabled={paymentFieldsBusy}
            className="admin-btn-primary text-sm px-3 py-2"
            onClick={() =>
              void patchPayment({
                payment_status: "paid",
                paid_at: new Date().toISOString(),
                payment_method: "cashapp",
                last_updated_at: new Date().toISOString(),
              })
            }
          >
            Mark fully paid
          </button>
          <button
            type="button"
            disabled={paymentFieldsBusy}
            className="admin-btn-ghost text-sm px-3 py-2 border-amber-500/30"
            onClick={() =>
              void patchPayment({
                payment_status: "refunded",
                last_updated_at: new Date().toISOString(),
              })
            }
          >
            Mark refunded
          </button>
        </div>
      </section>

      {/* Invoice */}
      <section className="admin-card space-y-3 border-slate-500/25">
        <h2 className="text-sm font-semibold text-slate-200/95">Invoice</h2>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Simple HTML invoice — open and use <strong className="text-slate-200/90">Print → Save as PDF</strong> if you need a
          PDF file.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/leads/${encodeURIComponent(leadId)}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn-ghost text-sm px-4 py-2 inline-flex items-center"
          >
            View invoice
          </a>
          <a
            href={`/api/leads/${encodeURIComponent(leadId)}/invoice?download=1`}
            className="admin-btn-ghost text-sm px-4 py-2 inline-flex items-center"
          >
            Download HTML
          </a>
          <button
            type="button"
            disabled={invoiceBusy || !email}
            className="admin-btn-primary text-sm px-4 py-2"
            onClick={() => void sendInvoiceEmail()}
          >
            {invoiceBusy ? "Sending…" : "Email to customer"}
          </button>
        </div>
        {!email ? (
          <p className="text-xs text-amber-200/90">Add an email on this lead to send the invoice.</p>
        ) : null}
        {invoiceOk ? <p className="text-xs text-emerald-400">{invoiceOk}</p> : null}
        {invoiceErr ? (
          <p className="text-xs text-red-400" role="alert">
            {invoiceErr}
          </p>
        ) : null}
        <p className="text-[11px] opacity-80" style={{ color: "var(--admin-muted)" }}>
          When you move this job to <strong className="text-slate-200/80">Approved</strong> or{" "}
          <strong className="text-slate-200/80">Ready</strong>, we automatically email this invoice to the customer if their
          email is on file (requires Resend env vars on the server).
        </p>
      </section>

        </aside>
      </div>

      <div className="admin-card space-y-2 border-violet-500/20">
        <h2 className="text-sm font-semibold text-[var(--admin-fg)]">Activity timeline</h2>
        <p className="text-[11px]" style={{ color: "var(--admin-muted)" }}>
          Submitted {fmtTs(createdAt)} · Last contacted {fmtTs(lastContactedAt)} · Last response {fmtTs(lastResponseAt)}
        </p>
        <LeadActivityTimeline leadId={leadId} />
      </div>

      {/* Notes */}
      <section className="admin-card space-y-3 border-violet-500/20">
        <h2 className="text-sm font-semibold text-[var(--admin-fg)]">Notes</h2>
        <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
          Internal / full submission log. Editing replaces the stored <code className="text-[10px] opacity-80">notes</code> field.
        </p>
        <textarea
          className="w-full min-h-[160px] rounded-lg border p-3 text-sm font-mono"
          style={{ borderColor: "var(--admin-border)", background: "rgba(0,0,0,0.25)", color: "var(--admin-fg)" }}
          value={noteDraft}
          onChange={(e) => {
            setNoteDraft(e.target.value);
            setNoteSaved(false);
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={noteBusy}
            className="admin-btn-primary text-sm px-4 py-2"
            onClick={() => void saveNotes()}
          >
            Save notes
          </button>
          {noteSaved ? (
            <span className="text-xs text-emerald-400">Saved.</span>
          ) : null}
          {noteErr ? (
            <span className="text-xs text-red-400" role="alert">
              {noteErr}
            </span>
          ) : null}
        </div>
      </section>
    </div>
  );
}
