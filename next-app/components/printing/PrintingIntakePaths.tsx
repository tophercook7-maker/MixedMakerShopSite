import Link from "next/link";
import { cn } from "@/lib/utils";
import { printingContentClass } from "@/components/printing/printing-layout";
import { printingPrimaryCtaClass, printingSecondaryCtaClass } from "@/components/printing/printing-section";
import { printingQuoteHref } from "@/components/printing/printing-quote-anchor";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";
import { FileCode2, HelpCircle } from "lucide-react";

const pathCard =
  "relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.1] bg-white/[0.03] p-6 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-sm before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:to-transparent";

export function PrintingIntakePaths() {
  return (
    <section className="border-b border-white/[0.06] bg-[#070a09] py-16 md:py-20">
      <div className={cn(printingContentClass, "relative")}>
        <RevealOnScroll>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Two ways to get started
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-white/55">
            Already have a file, or still figuring it out — either is fine. Pick the lane that matches how you work.
          </p>
        </RevealOnScroll>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <RevealOnScroll>
            <div className={cn(pathCard, "before:via-orange-500/45")}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-300/85">Path A</p>
              <span className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/[0.09] text-orange-200">
                <FileCode2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-white">I already have a file</h3>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-white/55">
                STL or 3MF for printing, or a clear photo with rough dimensions — upload from the dedicated page or attach
                in the quote form.
              </p>
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href="/upload-print"
                  className={cn(
                    printingPrimaryCtaClass,
                    "inline-flex min-h-[3rem] flex-1 items-center justify-center px-6 text-[0.9375rem] font-semibold",
                  )}
                >
                  Send Me Your Print File
                </Link>
                <Link
                  href={printingQuoteHref()}
                  className={cn(
                    printingSecondaryCtaClass,
                    "inline-flex min-h-[3rem] flex-1 items-center justify-center px-6 text-[0.9375rem] font-semibold",
                  )}
                >
                  Attach in quote form
                </Link>
              </div>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delayMs={70}>
            <div className={cn(pathCard, "before:via-emerald-400/40")}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300/85">Path B</p>
              <span className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-200">
                <HelpCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-white">I need help figuring it out</h3>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-white/55">
                Broken part, awkward fit, or an idea on paper — describe the job and we&apos;ll plan the print, the
                fix, or a simple prototype path.
              </p>
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href={printingQuoteHref()}
                  className={cn(
                    printingPrimaryCtaClass,
                    "inline-flex min-h-[3rem] flex-1 items-center justify-center px-6 text-[0.9375rem] font-semibold",
                  )}
                >
                  Tell Me What You Need
                </Link>
                <Link
                  href="/contact"
                  className={cn(
                    printingSecondaryCtaClass,
                    "inline-flex min-h-[3rem] flex-1 items-center justify-center px-6 text-[0.9375rem] font-semibold",
                  )}
                >
                  Contact
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
