import Link from "next/link";
import { cn } from "@/lib/utils";
import { printingContentClass } from "@/components/printing/printing-layout";
import { printingSecondaryCtaClass } from "@/components/printing/printing-section";
import { printingQuoteHref } from "@/components/printing/printing-quote-anchor";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";

const buckets = [
  {
    title: "Functional parts",
    copy: "Brackets, clips, adapters, and fixes that need to work in the real world.",
  },
  {
    title: "Custom solutions",
    copy: "One-off solves when nothing off-the-shelf fits your space or machine.",
  },
  {
    title: "Prototypes",
    copy: "Test a shape, fit, or idea before you invest in tooling or a big run.",
  },
  {
    title: "Hobby / special prints",
    copy: "Personal projects, gifts, cosplay helpers, and creative mechanical prints.",
  },
];

const bucketCard =
  "relative h-full overflow-hidden rounded-[1.15rem] border border-white/[0.1] bg-black/40 p-5 md:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-orange-400/30 before:to-transparent";

export function PrintingExamplesBuckets() {
  return (
    <section id="examples-3d" className="scroll-mt-24 border-b border-white/[0.06] bg-[#060908] py-16 md:py-20">
      <div className={cn(printingContentClass, "relative")}>
        <RevealOnScroll>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-400/85">Examples</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-[1.08]">
            How people use this shop
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/55">
            Real parts, real constraints — browsing examples and STLs is for inspiration. Every job still gets a clear
            scope and honest feasibility check.
          </p>
        </RevealOnScroll>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {buckets.map((b) => (
            <RevealOnScroll key={b.title}>
              <div className={bucketCard}>
                <h3 className="text-[0.98rem] font-semibold text-white">{b.title}</h3>
                <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-white/50">{b.copy}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
        <RevealOnScroll delayMs={80}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#stl-library-resources"
              className={cn(
                printingSecondaryCtaClass,
                "inline-flex min-h-[2.85rem] items-center justify-center px-6 text-[0.9rem] font-semibold",
              )}
            >
              View 3D Examples &amp; STL ideas
            </Link>
            <Link
              href={printingQuoteHref()}
              className={cn(
                printingSecondaryCtaClass,
                "inline-flex min-h-[2.85rem] items-center justify-center px-6 text-[0.9rem] font-semibold",
              )}
            >
              Start a request
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
