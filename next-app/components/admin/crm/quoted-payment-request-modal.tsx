"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatUsdAmount,
  normalizePrintPaymentRequestType,
  resolveCheckoutAmountUsd,
  resolveEffectiveDepositAmountUsd,
} from "@/lib/crm/print-payment";
import { buildPrintCashAppCustomerMessage, type PrintCashAppRequestKind } from "@/lib/crm/print-cashapp-messages";
import { mapPrintPipelineToLeadStatus, normalizePrintPipelineStatus } from "@/lib/crm/three-d-print-lead";
import { mergePrintKeywordTags } from "@/lib/crm/print-auto-tags";
import { patchLeadApi } from "@/lib/crm/patch-lead-client";

export type QuotedPaymentMethod = "cashapp" | "manual";

function parseMoneyInput(raw: string): number | null {
  const s = String(raw || "").trim();
  if (!s) return null;
  const n = Number.parseFloat(s.replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function displayContactName(contactName: string | null, businessName: string | null): string {
  const n = String(contactName || "").trim();
  if (n) return n;
  const b = String(businessName || "").trim();
  if (b.startsWith("3D Print Quote")) return b.replace(/^3D Print Quote —\s*/i, "").trim() || b;
  return b || "—";
}

async function postLeadActivity(
  leadId: string,
  type: string,
  message?: string,
  metadata?: Record<string, unknown>,
) {
  try {
    await fetch(`/api/leads/${encodeURIComponent(leadId)}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, message, metadata: metadata ?? {} }),
    });
  } catch {
    /* best-effort */
  }
}

function manualPaymentStubMessage(customerName: string): string {
  const name = String(customerName || "").trim() || "there";
  return [
    `Hi ${name},`,
    "",
    "Thanks — I'll send payment details separately.",
    "",
    "– Topher",
    "MixedMakerShop",
  ].join("\n");
}

export function QuotedPaymentRequestModal({
  open,
  onClose,
  leadId,
  contactName,
  businessName,
  email,
  currentPrintPipeline,
  initialQuotedAmount,
  initialDepositAmount,
  initialFinalAmount,
  initialPriceCharged,
  existingPaymentLink,
  existingPaymentMethod: _existingPaymentMethod,
  cashAppPaymentUrl,
  cashAppDisplayLine,
  initialPaymentRequestType,
  printTags,
  keywordHaystack,
  onCommitted,
}: {
  open: boolean;
  onClose: () => void;
  leadId: string;
  contactName: string | null;
  businessName: string | null;
  email: string | null;
  currentPrintPipeline: string | null;
  initialQuotedAmount: number | null;
  initialDepositAmount: number | null;
  initialFinalAmount: number | null;
  initialPriceCharged: number | null;
  existingPaymentLink: string | null;
  existingPaymentMethod?: string | null;
  cashAppPaymentUrl: string | null;
  /** Handle or line for messages (e.g. $Cashtag); falls back to payment URL in copy. */
  cashAppDisplayLine: string | null;
  initialPaymentRequestType?: string | null;
  /** For keyword auto-tags (optional). */
  printTags?: string[] | null;
  keywordHaystack?: string | null;
  onCommitted?: () => void;
}) {
  void _existingPaymentMethod;
  const custName = displayContactName(contactName, businessName);
  const pipelineNorm = normalizePrintPipelineStatus(currentPrintPipeline);
  const paymentOnly = pipelineNorm === "quoted";

  const [quotedStr, setQuotedStr] = useState(() => (initialQuotedAmount != null ? String(initialQuotedAmount) : ""));
  const [depositStr, setDepositStr] = useState(() => (initialDepositAmount != null ? String(initialDepositAmount) : ""));
  const [finalStr, setFinalStr] = useState(() => (initialFinalAmount != null ? String(initialFinalAmount) : ""));
  const [payKind, setPayKind] = useState<PrintCashAppRequestKind>(() =>
    normalizePrintPaymentRequestType(initialPaymentRequestType) === "deposit" ? "deposit" : "full",
  );
  const canUseCashApp =
    Boolean(String(cashAppPaymentUrl || "").trim()) || Boolean(String(existingPaymentLink || "").trim());
  const [method, setMethod] = useState<QuotedPaymentMethod>(() => (canUseCashApp ? "cashapp" : "manual"));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [localLink, setLocalLink] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuotedStr(initialQuotedAmount != null ? String(initialQuotedAmount) : "");
    setDepositStr(initialDepositAmount != null ? String(initialDepositAmount) : "");
    setFinalStr(initialFinalAmount != null ? String(initialFinalAmount) : "");
    setPayKind(normalizePrintPaymentRequestType(initialPaymentRequestType) === "deposit" ? "deposit" : "full");
    const useCash =
      Boolean(String(cashAppPaymentUrl || "").trim()) || Boolean(String(existingPaymentLink || "").trim());
    setMethod(useCash ? "cashapp" : "manual");
    setErr(null);
    setLocalLink(null);
  }, [open, initialQuotedAmount, initialDepositAmount, initialFinalAmount, initialPaymentRequestType, cashAppPaymentUrl, existingPaymentLink]);

  const quotedN = parseMoneyInput(quotedStr);
  const depositN = parseMoneyInput(depositStr);
  const finalN = parseMoneyInput(finalStr);
  const priceN = initialPriceCharged;

  const requestAmountUsd = useMemo(
    () =>
      resolveCheckoutAmountUsd({
        for: payKind === "deposit" ? "deposit" : "full",
        deposit_amount: depositN,
        final_amount: finalN,
        price_charged: priceN,
        quoted_amount: quotedN,
      }).usd,
    [payKind, depositN, finalN, priceN, quotedN],
  );

  const previewMessage = useMemo(() => {
    if (method === "manual") return manualPaymentStubMessage(custName);
    const cashLine =
      String(cashAppDisplayLine || "").trim() ||
      String(cashAppPaymentUrl || "").trim() ||
      String(existingPaymentLink || "").trim() ||
      "(configure Cash App)";
    return buildPrintCashAppCustomerMessage({
      kind: payKind,
      customerName: custName,
      cashAppLine: cashLine,
      amountUsd: requestAmountUsd,
    });
  }, [method, payKind, custName, cashAppDisplayLine, cashAppPaymentUrl, existingPaymentLink, requestAmountUsd]);

  const amountLine = useMemo(() => formatUsdAmount(requestAmountUsd), [requestAmountUsd]);

  if (!open) return null;

  function depositAmountToPersist(): number | null {
    if (payKind === "deposit") {
      return resolveEffectiveDepositAmountUsd({
        deposit_amount: depositN,
        quoted_amount: quotedN,
      });
    }
    return depositN;
  }

  async function ensureQuotedAndAmounts(): Promise<boolean> {
    const depPersist = depositAmountToPersist();
    const mergedTags = mergePrintKeywordTags(printTags ?? null, String(keywordHaystack || ""));
    if (paymentOnly) {
      const r = await patchLeadApi(leadId, {
        quoted_amount: quotedN,
        deposit_amount: depPersist,
        final_amount: finalN,
        payment_request_type: payKind,
        print_tags: mergedTags,
      });
      if (!r.ok) {
        setErr(r.error);
        return false;
      }
    } else {
      const r = await patchLeadApi(leadId, {
        print_pipeline_status: "quoted",
        status: mapPrintPipelineToLeadStatus("quoted"),
        quoted_amount: quotedN,
        deposit_amount: depPersist,
        final_amount: finalN,
        payment_request_type: payKind,
        print_tags: mergedTags,
      });
      if (!r.ok) {
        setErr(r.error);
        return false;
      }
    }
    void postLeadActivity(leadId, "quoted_amount_set", "Quoted amounts saved from payment request flow", {
      quoted: quotedN,
      deposit: depositAmountToPersist(),
      final: finalN,
      payment_only: paymentOnly,
      payment_request_type: payKind,
    });
    return true;
  }

  function resolvePaymentStatusForPatch(): "deposit_requested" | "unpaid" {
    if (payKind === "deposit") return "deposit_requested";
    return "unpaid";
  }

  async function applyPaymentFieldsAfterLink(link: string | null): Promise<boolean> {
    const payStatus = resolvePaymentStatusForPatch();
    const methodLabel: "cashapp" | "manual" = method === "cashapp" ? "cashapp" : "manual";
    const r = await patchLeadApi(leadId, {
      payment_method: methodLabel,
      payment_link: link && String(link).trim() ? String(link).trim() : null,
      payment_status: payStatus,
      payment_request_type: payKind,
    });
    if (!r.ok) {
      setErr(r.error);
      return false;
    }
    return true;
  }

  function resolveCashAppPaymentUrlForLead(): string | null {
    const env = String(cashAppPaymentUrl || "").trim();
    if (env) return env;
    const existing = String(existingPaymentLink || "").trim();
    return existing || null;
  }

  async function handleMarkQuotedOnly() {
    setBusy(true);
    setErr(null);
    if (paymentOnly) {
      const ok = await ensureQuotedAndAmounts();
      setBusy(false);
      if (ok) {
        onCommitted?.();
        onClose();
      }
      return;
    }
    const r = await patchLeadApi(leadId, {
      print_pipeline_status: "quoted",
      status: mapPrintPipelineToLeadStatus("quoted"),
      quoted_amount: quotedN,
      deposit_amount: depositAmountToPersist(),
      final_amount: finalN,
      payment_request_type: payKind,
    });
    setBusy(false);
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    void postLeadActivity(leadId, "quoted_amount_set", "Job marked Quoted (no payment message)", {
      quoted: quotedN,
      deposit: depositAmountToPersist(),
      final: finalN,
      payment_request_type: payKind,
    });
    onCommitted?.();
    onClose();
  }

  async function runPaymentPrep(): Promise<{ url: string | null; message: string } | null> {
    const ok = await ensureQuotedAndAmounts();
    if (!ok) return null;

    let url: string | null = null;
    if (method === "cashapp") {
      url = resolveCashAppPaymentUrlForLead();
      if (!url) {
        setErr("Cash App is not configured (NEXT_PUBLIC_CASHAPP_PAYMENT_URL or save a payment link on the lead).");
        return null;
      }
    }

    const okPay = await applyPaymentFieldsAfterLink(url);
    if (!okPay) return null;

    const message =
      method === "manual"
        ? manualPaymentStubMessage(custName)
        : buildPrintCashAppCustomerMessage({
            kind: payKind,
            customerName: custName,
            cashAppLine:
              String(cashAppDisplayLine || "").trim() ||
              String(cashAppPaymentUrl || "").trim() ||
              String(url || "").trim() ||
              "(configure Cash App)",
            amountUsd: requestAmountUsd,
          });

    if (url) {
      void postLeadActivity(leadId, "payment_link_saved", "Cash App payment link saved on lead from quoted flow", {
        pay_kind: payKind,
      });
    }

    setLocalLink(url);
    return { url, message };
  }

  async function handleCopyMessage() {
    setBusy(true);
    setErr(null);
    try {
      const result = await runPaymentPrep();
      if (!result) {
        setBusy(false);
        return;
      }
      await navigator.clipboard.writeText(result.message);
      void postLeadActivity(leadId, "payment_request_copied", "Cash App payment request copied", {
        pay_kind: payKind,
        method,
      });
      onCommitted?.();
      onClose();
    } catch {
      setErr("Could not copy to clipboard.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCopyLink() {
    setBusy(true);
    setErr(null);
    try {
      const result = await runPaymentPrep();
      if (!result || !result.url) {
        setErr(method === "manual" ? "No Cash App link for manual method." : "No link to copy yet.");
        setBusy(false);
        return;
      }
      await navigator.clipboard.writeText(result.url);
      void postLeadActivity(leadId, "payment_request_copied", "Cash App link copied", {
        pay_kind: payKind,
        method,
        link_only: true,
      });
      onCommitted?.();
      onClose();
    } catch {
      setErr("Could not copy link.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSendEmail() {
    setBusy(true);
    setErr(null);
    const em = String(email || "").trim();
    if (!em) {
      setErr("Lead has no email address.");
      setBusy(false);
      return;
    }
    try {
      const result = await runPaymentPrep();
      if (!result) {
        setBusy(false);
        return;
      }
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}/print-quoted-payment-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: result.message }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErr(String(data.error || "Could not send email."));
        setBusy(false);
        return;
      }
      onCommitted?.();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Send failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quoted-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-violet-500/35 bg-zinc-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-white/[0.08] px-4 py-3 sm:px-5">
          <h2 id="quoted-title" className="text-base font-semibold text-violet-100">
            {paymentOnly ? "Payment request" : "Quoted — review payment request"}
          </h2>
          <p className="text-xs mt-1 text-zinc-500">
            {paymentOnly
              ? "Quote is already marked; set payment options and copy or send when you're ready."
              : "Nothing sends until you choose Send email. You can also mark quoted with no message."}
          </p>
        </div>

        <div className="px-4 py-3 sm:px-5 space-y-3 text-sm text-zinc-200">
          <div className="rounded-lg border border-white/[0.08] bg-black/25 px-3 py-2">
            <span className="text-[10px] uppercase tracking-wide text-zinc-500">Customer</span>
            <p className="font-medium text-zinc-100">{custName}</p>
            {email ? <p className="text-xs text-zinc-400 mt-0.5">{email}</p> : (
              <p className="text-xs text-amber-200/90 mt-0.5">No email — Send email will stay disabled.</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <label className="block">
              <span className="text-[10px] font-semibold uppercase text-zinc-500">Quoted $</span>
              <input
                className="mt-0.5 w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-sm"
                inputMode="decimal"
                value={quotedStr}
                onChange={(e) => setQuotedStr(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase text-zinc-500">Deposit $</span>
              <input
                className="mt-0.5 w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-sm"
                inputMode="decimal"
                value={depositStr}
                onChange={(e) => setDepositStr(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase text-zinc-500">Final $</span>
              <input
                className="mt-0.5 w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-sm"
                inputMode="decimal"
                value={finalStr}
                onChange={(e) => setFinalStr(e.target.value)}
              />
            </label>
          </div>
          <p className="text-[11px] text-zinc-500">
            Amount for this request: <span className="text-zinc-300 font-medium">{amountLine}</span> (
            {payKind === "deposit" ? "deposit" : "full"})
            {payKind === "deposit" && (depositN == null || depositN <= 0) && quotedN != null && quotedN > 0 ? (
              <span className="block mt-0.5 text-zinc-500">Deposit field empty — using 50% of quoted for this request.</span>
            ) : null}
          </p>

          <div>
            <span className="text-[10px] font-semibold uppercase text-zinc-500 block mb-1">Request</span>
            <div className="flex flex-wrap gap-2">
              {(["full", "deposit"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  disabled={busy}
                  onClick={() => setPayKind(k)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
                    payKind === k
                      ? "border-violet-400 bg-violet-500/20 text-violet-100"
                      : "border-white/10 text-zinc-400 hover:bg-white/5"
                  }`}
                >
                  {k === "full" ? "Full payment" : "Deposit"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-zinc-500 block mb-1">Payment method</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy || !canUseCashApp}
                onClick={() => setMethod("cashapp")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
                  method === "cashapp"
                    ? "border-emerald-400 bg-emerald-500/15 text-emerald-100"
                    : "border-white/10 text-zinc-400 hover:bg-white/5"
                } ${!canUseCashApp ? "opacity-40" : ""}`}
              >
                Cash App
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setMethod("manual")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
                  method === "manual"
                    ? "border-zinc-400 bg-zinc-600/25 text-zinc-100"
                    : "border-white/10 text-zinc-400 hover:bg-white/5"
                }`}
              >
                Manual / no link
              </button>
            </div>
            {!canUseCashApp ? (
              <p className="text-[11px] text-amber-200/85 mt-1">
                Set <code className="text-[10px]">NEXT_PUBLIC_CASHAPP_PAYMENT_URL</code> (or a payment link on the lead) to
                enable Cash App.
              </p>
            ) : null}
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-zinc-500 block mb-1">Message preview</span>
            <pre
              className="rounded-lg border border-white/[0.08] bg-black/40 p-3 text-xs whitespace-pre-wrap text-zinc-300 max-h-48 overflow-y-auto font-sans"
            >
              {previewMessage}
            </pre>
          </div>

          {err ? (
            <p className="text-xs text-red-400" role="alert">
              {err}
            </p>
          ) : null}

          <div className="flex flex-col-reverse sm:flex-row sm:flex-wrap gap-2 pt-1">
            <button
              type="button"
              disabled={busy}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
              onClick={onClose}
            >
              Cancel
            </button>
            {!paymentOnly ? (
              <button
                type="button"
                disabled={busy}
                className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm text-violet-100"
                onClick={() => void handleMarkQuotedOnly()}
              >
                Mark quoted only
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy || method === "manual"}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-200 disabled:opacity-40"
              onClick={() => void handleCopyLink()}
            >
              Copy Cash App link
            </button>
            <button
              type="button"
              disabled={busy}
              className="rounded-lg border border-sky-500/35 bg-sky-500/10 px-4 py-2 text-sm text-sky-100"
              onClick={() => void handleCopyMessage()}
            >
              Copy Cash App message
            </button>
            <button
              type="button"
              disabled={busy || !String(email || "").trim()}
              className="rounded-lg border border-emerald-500/40 bg-emerald-600/25 px-4 py-2 text-sm font-medium text-emerald-50"
              onClick={() => void handleSendEmail()}
            >
              Send email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
