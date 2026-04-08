import Link from "next/link";
import { cn } from "@/lib/utils";
import { printingContentClass } from "@/components/printing/printing-layout";
import { printingSecondaryCtaClass } from "@/components/printing/printing-section";
import { printingQuoteHref } from "@/components/printing/printing-quote-anchor";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";

const buckets = [
  {
    title: "Replacement pieces",
    copy: "Missing or broken parts recreated so equipment, fixtures, or housings work again.",
  },
  {
    title: "Functional tools",
    copy: "Small tools, jigs, and helpers that make a job faster or safer — not just decoration.",
  },
  {
    title: "Brackets and mounts",
    copy: "Custom geometry for clean mounting when off-the-shelf hardware won’t fit.",
  },
  {
    title: "Prototypes",
    copy: "Test fit, feel, and assembly before you commit to a bigger production approach.",
  },
  {
    title: "Custom organization solutions",
    copy: "Trays, holders, and shop helpers tailored to your space and workflow.",
  },
];

const bucketCard =
  "relative h-full overflow-hidden rounded-2xl border border-white/14 bg-gradient-to-b from-white/[0.09] to-black/35 p-6 md:p-7 shadow-[0_18px_48px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-orange-400/35 before:to-transparent";

export function PrintingExamplesBuckets() {
  return (
    <section
      id="examples-3d"
      className="scroll-mt-28 border-y border-white/[0.07] bg-[#070a09] py-20 md:py-28 md:scroll-mt-32"
    >
      <div className={cn(printingContentClass, "relative")}>
        <RevealOnScroll>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-400/85">Examples</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-[1.08]">
            Examples of what this can include
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/55">
            Real parts, real constraints — browsing examples and STLs is for inspiration. Every job still gets a clear
            scope and honest feasibility check.
          </p>
        </RevealOnScroll>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 lg:gap-7">
          {buckets.map((b) => (
            <RevealOnScroll key={b.title}>
              <div className={bucketCard}>
                <h3 className="text-base font-semibold text-white md:text-[1.02rem]">{b.title}</h3>
                <p className="mt-3 text-[0.8125rem] leading-relaxed text-white/58 md:text-[0.875rem]">{b.copy}</p>
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
