import Image from "next/image";
import { cn } from "@/lib/utils";
import { printingPrimaryCtaClass, printingSecondaryCtaClass, PrintingSection } from "@/components/printing/printing-section";
import { printingContentClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";
import { printingQuoteHref } from "@/components/printing/printing-quote-anchor";
import {
  buildPrintQuoteSmsHref,
  PRINTING_QUOTE_PHONE_DISPLAY,
  PRINTING_QUOTE_PHONE_TEL,
} from "@/components/printing/printing-sms";

export function PrintingCtaBand() {
  return (
    <PrintingSection divider={false} className="border-b-0 pb-[5.5rem] pt-2 md:pb-[8.5rem] md:pt-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-orange-950/[0.08] to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_80%,rgba(249,115,22,0.09),transparent)]" />
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[24rem] w-[24rem] -translate-y-1/2 rounded-full bg-orange-500/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 top-0 h-[20rem] w-[20rem] rounded-full bg-emerald-500/[0.07] blur-[110px]" />
      <div className={cn("relative", printingContentClass)}>
        <RevealOnScroll>
          <div className="relative overflow-hidden rounded-[1.85rem] border-2 border-orange-500/30 bg-gradient-to-br from-white/[0.12] via-black/60 to-black/95 p-9 shadow-[0_52px_130px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl sm:p-11 md:p-14 lg:p-16">
            <div
              className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-orange-500/18 blur-3xl"
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_0%_100%,rgba(16,185,129,0.1),transparent)]" aria-hidden />
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" aria-hidden />

            <div className="relative flex flex-col gap-11 lg:flex-row lg:items-center lg:justify-between lg:gap-14">
              <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-start sm:gap-9 sm:text-left">
                <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 sm:h-[5rem] sm:w-[5rem]">
                  <Image
                    src="/images/m3-logo.png"
                    alt="MixedMakerShop"
                    fill
                    className="object-contain drop-shadow-[0_0_32px_rgba(249,115,22,0.4)]"
                    sizes="80px"
                  />
                </div>
                <div className="max-w-xl lg:max-w-2xl">
                  <h2 className="text-[1.85rem] font-semibold leading-[1.1] tracking-[-0.03em] text-white sm:text-[2.15rem] md:text-[2.6rem] md:leading-[1.08] [text-shadow:0_4px_48px_rgba(0,0,0,0.5)]">
                    Got a problem? Let&apos;s build the solution.
                  </h2>
                  <p className="mt-5 max-w-lg text-base leading-relaxed text-white/65 md:mt-6 md:text-[1.0625rem]">
                    Send a photo, broken part, STL, sketch, or rough idea — I&apos;ll tell you what&apos;s realistic and
                    what I&apos;d do next.
                  </p>
                </div>
              </div>
              <div className="flex w-full flex-shrink-0 flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:justify-center lg:w-auto lg:min-w-[19.5rem] lg:flex-col">
                <a
                  href={printingQuoteHref()}
                  className={cn(
                    printingPrimaryCtaClass,
                    "min-h-[3.45rem] w-full px-11 text-center text-[1.05rem] font-semibold shadow-[0_8px_40px_rgba(249,115,22,0.48)] sm:min-w-[14rem]",
                  )}
                >
                  Submit a Request
                </a>
                <a
                  href={buildPrintQuoteSmsHref(null)}
                  className={cn(
                    printingSecondaryCtaClass,
                    "min-h-[3.45rem] w-full border-white/28 bg-white/[0.08] px-11 text-center text-[1.02rem] font-semibold sm:min-w-[14rem]",
                  )}
                >
                  Text Your Request
                </a>
                <a
                  href={PRINTING_QUOTE_PHONE_TEL}
                  className={cn(
                    printingSecondaryCtaClass,
                    "min-h-[3.45rem] w-full border-white/28 bg-white/[0.08] px-11 text-center text-[1.02rem] font-medium sm:min-w-[14rem]",
                  )}
                >
                  Call {PRINTING_QUOTE_PHONE_DISPLAY}
                </a>
              </div>
            </div>
            <p className="relative mt-8 max-w-2xl text-center text-[0.8125rem] leading-relaxed text-white/48 lg:mx-auto">
              <span className="text-white/55">Local builds. Real parts. No guesswork.</span>
              <span className="mx-2 text-white/25" aria-hidden>
                ·
              </span>
              <span>Send a photo — I&apos;ll tell you what I&apos;d do.</span>
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </PrintingSection>
  );
}
