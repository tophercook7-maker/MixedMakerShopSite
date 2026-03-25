"use client";

import { cn } from "@/lib/utils";
import { printingPrimaryCtaClass, printingSecondaryCtaClass } from "@/components/printing/printing-section";
import { printingQuoteHref } from "@/components/printing/printing-quote-anchor";
import { buildPrintQuoteSmsHref, PRINTING_QUOTE_PHONE_TEL } from "@/components/printing/printing-sms";

/**
 * Mobile-only fixed bottom bar — keeps submit + call one thumb away.
 * Hidden md+ where the page layout has more room.
 */
export function PrintingStickyMobileCta() {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[100] md:hidden",
        "border-t border-white/[0.1] bg-[#070908]/92 backdrop-blur-md",
        "shadow-[0_-12px_40px_rgba(0,0,0,0.45)]",
      )}
      role="navigation"
      aria-label="Quick actions"
    >
      <div className="mx-auto flex max-w-lg flex-col gap-2 px-3 pt-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom,0px))]">
        <div className="flex gap-2.5">
          <a
            href={printingQuoteHref()}
            className={cn(
              printingPrimaryCtaClass,
              "min-h-[2.75rem] flex-1 rounded-xl px-2.5 text-[0.8125rem] font-semibold shadow-[0_4px_24px_rgba(249,115,22,0.35)]",
            )}
          >
            Send request
          </a>
          <a
            href={buildPrintQuoteSmsHref(null)}
            className={cn(
              printingSecondaryCtaClass,
              "min-h-[2.75rem] flex-1 rounded-xl border-white/[0.18] bg-white/[0.07] px-2.5 text-center text-[0.75rem] font-semibold leading-tight sm:text-[0.8125rem]",
            )}
          >
            Text Your Request
          </a>
        </div>
        <a
          href={PRINTING_QUOTE_PHONE_TEL}
          className={cn(
            printingSecondaryCtaClass,
            "min-h-[2.5rem] w-full rounded-xl border-white/[0.18] bg-white/[0.05] px-3 text-center text-[0.8125rem] font-semibold",
          )}
        >
          Call Now
        </a>
      </div>
    </div>
  );
}

/** Extra page bottom padding so content isn’t hidden behind the two-row sticky bar. */
export const PRINTING_STICKY_MOBILE_BOTTOM_PAD_CLASS = "pb-[6.75rem] md:pb-0";
