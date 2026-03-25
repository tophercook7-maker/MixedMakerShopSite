import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { printingPrimaryCtaClass, printingSecondaryCtaClass } from "@/components/printing/printing-section";
import { printingQuoteHref } from "@/components/printing/printing-quote-anchor";
import { printingContentClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";

export function PrintingHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06] pb-0 pt-[3.5rem] md:pt-[4.75rem] lg:pt-[5.5rem]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2748%27 height=%2748%27%3E%3Cpath d=%27M0 48h48M48 0v48%27 fill=%27none%27 stroke=%27%23ffffff%27 stroke-opacity=%270.06%27/%3E%3C/svg%3E')]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-amber-500/[0.1] blur-[130px]" />
      <div className="pointer-events-none absolute -right-24 top-1/4 h-[22rem] w-[22rem] rounded-full bg-emerald-500/[0.08] blur-[110px]" />

      <div className={printingContentClass}>
        <div className="grid gap-12 pb-[4rem] sm:gap-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,36rem)] lg:items-center lg:gap-20 lg:pb-[4.5rem] xl:grid-cols-[minmax(0,1.1fr)_minmax(0,40rem)] xl:gap-24">
          <div className="min-w-0 lg:pr-2">
            <RevealOnScroll>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-orange-400/95 md:text-xs md:tracking-[0.3em]">
                Custom 3D printing • PLA only • Hot Springs, Arkansas
              </p>
            </RevealOnScroll>
            <RevealOnScroll delayMs={55}>
              <h1 className="mt-7 max-w-[20ch] text-[2.45rem] font-bold leading-[1.03] tracking-[-0.038em] text-white sm:max-w-none sm:text-[2.85rem] sm:leading-[1.02] lg:mt-8 lg:text-[clamp(3.1rem,4.35vw,4.15rem)] lg:leading-[1.02] [text-shadow:0_4px_64px_rgba(0,0,0,0.55)]">
                Stop buying what doesn&apos;t exist.
              </h1>
            </RevealOnScroll>
            <RevealOnScroll delayMs={110}>
              <p className="mt-8 max-w-2xl text-[1.0625rem] font-medium leading-[1.48] text-white/[0.88] md:mt-9 md:text-lg md:leading-[1.52]">
                Practical custom 3D printing — parts, mounts, organizers, replacement pieces, and one-off fixes when
                nothing off-the-shelf fits.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delayMs={165}>
              <p className="mt-7 max-w-2xl border-l-[3px] border-emerald-400/50 pl-5 text-[0.95rem] font-semibold leading-relaxed text-emerald-200/[0.92] md:mt-8 md:text-[1rem]">
                If you can describe the problem, we can build the solution.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delayMs={220}>
              <div className="mt-12 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:items-center md:mt-[3.25rem]">
                <Link
                  href={printingQuoteHref()}
                  className={cn(
                    printingPrimaryCtaClass,
                    "min-h-[3.35rem] w-full px-10 text-[0.96875rem] font-semibold tracking-wide sm:w-auto",
                  )}
                >
                  Submit a request
                </Link>
                <a
                  href="#stl-library-resources"
                  className={cn(
                    printingSecondaryCtaClass,
                    "min-h-[3.35rem] w-full px-10 text-[0.96875rem] sm:w-auto",
                  )}
                >
                  Browse STL resources
                </a>
              </div>
            </RevealOnScroll>
          </div>

          <RevealOnScroll delayMs={120}>
            <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
              <div
                className="absolute -inset-[2px] rounded-[1.45rem] bg-gradient-to-br from-orange-500/32 via-white/[0.08] to-emerald-500/26 opacity-95 blur-[1.5px]"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-[1.32rem] border border-white/[0.14] bg-neutral-950 shadow-[0_36px_100px_rgba(0,0,0,0.65)] backdrop-blur-md ring-1 ring-white/[0.05]">
                <div className="relative aspect-[4/3] w-full sm:aspect-[16/11] lg:aspect-[5/4]">
                  <Image
                    src="/images/mixedmaker-workspace-hero.png"
                    alt="MixedMaker workspace and 3D printing setup"
                    fill
                    className="object-cover object-center"
                    priority
                    sizes="(max-width: 1024px) 100vw, 580px"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/88 via-black/42 to-black/28" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black via-black/92 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-black/65 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_50%,transparent_35%,rgba(0,0,0,0.35)_100%)]" />
                  <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[92%]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-orange-300/95">MixedMakerShop</p>
                    <p className="mt-2 text-sm font-semibold leading-snug text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.85)]">
                      Custom PLA fabrication • Hot Springs, Arkansas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
