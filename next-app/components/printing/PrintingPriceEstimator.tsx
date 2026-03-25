"use client";

import * as React from "react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { printingSecondaryCtaClass } from "@/components/printing/printing-section";
import {
  type ComplexityKey,
  type PriceEstimateSnapshot,
  type RequestTypeKey,
  type SizeKey,
  clampQuantity,
  computePriceEstimate,
  humanSummary,
} from "@/components/printing/printing-price-estimate";

const selectClass =
  "w-full cursor-pointer rounded-xl border border-white/[0.12] bg-black/45 px-4 py-3 text-[0.9375rem] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition duration-200 focus:border-orange-500/45 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.12)] [&>option]:bg-neutral-900";

const labelClass = "mb-2 block text-[0.8125rem] font-semibold tracking-[-0.02em] text-white/78";

export type PricingEstimateChangePayload = {
  engaged: boolean;
  snapshot: PriceEstimateSnapshot;
  summaryLine: string;
};

type Props = {
  /** Scroll target for “continue to form” — element id */
  formFieldsId: string;
  descriptionTextAreaRef: React.RefObject<HTMLTextAreaElement | null>;
  /** First field to focus after “Use this estimate” (e.g. name). */
  quoteNameFieldRef: React.RefObject<HTMLInputElement | null>;
  onEstimateChange?: (payload: PricingEstimateChangePayload) => void;
};

export function PrintingPriceEstimator({
  formFieldsId,
  descriptionTextAreaRef,
  quoteNameFieldRef,
  onEstimateChange,
}: Props) {
  const userEngagedRef = React.useRef(false);
  const [requestType, setRequestType] = React.useState<RequestTypeKey>("not_sure");
  const [size, setSize] = React.useState<SizeKey>("small");
  const [complexity, setComplexity] = React.useState<ComplexityKey>("simple");
  const [quantity, setQuantity] = React.useState(1);
  const [designHelp, setDesignHelp] = React.useState(false);

  const { low, high } = useMemo(
    () =>
      computePriceEstimate({
        requestType,
        size,
        complexity,
        quantity,
        designHelp,
      }),
    [requestType, size, complexity, quantity, designHelp],
  );

  const summaryLine = useMemo(
    () =>
      humanSummary({
        requestType,
        size,
        complexity,
        quantity,
        designHelp,
        low,
        high,
      }),
    [requestType, size, complexity, quantity, designHelp, low, high],
  );

  const buildSnapshot = React.useCallback((): PriceEstimateSnapshot => {
    const q = clampQuantity(quantity);
    const { low: lowN, high: highN } = computePriceEstimate({
      requestType,
      size,
      complexity,
      quantity: q,
      designHelp,
    });
    return {
      requestType,
      size,
      complexity,
      quantity: q,
      designHelp,
      low: lowN,
      high: highN,
    };
  }, [requestType, size, complexity, quantity, designHelp]);

  const pushToParent = React.useCallback(
    (engaged: boolean) => {
      const snapshot = buildSnapshot();
      const summaryLine = humanSummary(snapshot);
      onEstimateChange?.({ engaged, snapshot, summaryLine });
    },
    [buildSnapshot, onEstimateChange],
  );

  React.useEffect(() => {
    pushToParent(userEngagedRef.current);
  }, [pushToParent]);

  const markEngaged = () => {
    userEngagedRef.current = true;
  };

  const onQtyChange = (raw: string) => {
    markEngaged();
    const n = Number.parseInt(raw, 10);
    setQuantity(Number.isFinite(n) ? clampQuantity(n) : 1);
  };

  const scrollToForm = () => {
    document.getElementById(formFieldsId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const useEstimateAndSubmit = () => {
    userEngagedRef.current = true;
    pushToParent(true);
    const ta = descriptionTextAreaRef.current;
    const note = `Rough calculator estimate: about $${low}–$${high} (before final quote).`;
    if (ta) {
      const cur = ta.value.trim();
      if (!cur) {
        ta.value = note;
      } else if (!cur.includes("$")) {
        ta.value = `${note}\n\n${cur}`;
      }
    }
    scrollToForm();
    queueMicrotask(() => quoteNameFieldRef.current?.focus());
  };

  return (
    <div className="mb-10 border-b border-white/[0.08] pb-10 md:mb-12 md:pb-12">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-400/85">Ballpark only</p>
      <h2 className="mt-2 text-[1.35rem] font-bold leading-tight tracking-[-0.032em] text-white sm:text-[1.5rem] [text-shadow:0_2px_24px_rgba(0,0,0,0.4)]">
        Quick price estimate
      </h2>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-white/50">
        Get a rough idea before you send your request.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="est-request-type">
            Request type
          </label>
          <select
            id="est-request-type"
            className={selectClass}
            value={requestType}
            onChange={(e) => {
              markEngaged();
              setRequestType(e.target.value as RequestTypeKey);
            }}
          >
            <option value="small_replacement">Small replacement part</option>
            <option value="mount_holder">Mount / holder</option>
            <option value="organizer">Organizer</option>
            <option value="one_off">One-off custom fix</option>
            <option value="not_sure">I&apos;m not sure</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="est-size">
            Size
          </label>
          <select
            id="est-size"
            className={selectClass}
            value={size}
            onChange={(e) => {
              markEngaged();
              setSize(e.target.value as SizeKey);
            }}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="est-complexity">
            Complexity
          </label>
          <select
            id="est-complexity"
            className={selectClass}
            value={complexity}
            onChange={(e) => {
              markEngaged();
              setComplexity(e.target.value as ComplexityKey);
            }}
          >
            <option value="simple">Simple</option>
            <option value="moderate">Moderate</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="est-qty">
            Quantity
          </label>
          <input
            id="est-qty"
            type="number"
            min={1}
            max={500}
            value={quantity}
            onChange={(e) => onQtyChange(e.target.value)}
            className={cn(
              selectClass,
              "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            )}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="est-design">
            Need design help?
          </label>
          <select
            id="est-design"
            className={selectClass}
            value={designHelp ? "yes" : "no"}
            onChange={(e) => {
              markEngaged();
              setDesignHelp(e.target.value === "yes");
            }}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      </div>

      <div className="mt-7 rounded-xl border border-white/[0.1] bg-black/40 px-5 py-4 backdrop-blur-[2px]">
        <p className="text-[1rem] font-semibold leading-snug tracking-[-0.02em] text-white/88 sm:text-[1.0625rem]">
          Estimated starting range:{" "}
          <span className="whitespace-nowrap text-orange-200/95">
            ${low}–${high}
          </span>
        </p>
        <p className="mt-3 text-[0.78rem] leading-relaxed text-white/42">
          This is only a rough starting estimate. Final pricing depends on the part, print time, and design work needed.
        </p>
      </div>

      <button
        type="button"
        onClick={useEstimateAndSubmit}
        className={cn(
          printingSecondaryCtaClass,
          "mt-4 w-full border-white/[0.14] bg-white/[0.06] py-3 text-[0.875rem] font-semibold md:max-w-sm",
        )}
      >
        Use this estimate and submit request
      </button>
    </div>
  );
}
