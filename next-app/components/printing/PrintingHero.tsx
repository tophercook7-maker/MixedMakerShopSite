import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { publicEyebrowPrintClass } from "@/lib/public-brand";
import { printingPrimaryCtaClass, printingSecondaryCtaClass } from "@/components/printing/printing-section";
import { printingQuoteHref } from "@/components/printing/printing-quote-anchor";
import { printingContentClass } from "@/components/printing/printing-layout";
import { PRINTING_HERO_WORKSTATION_IMAGE } from "@/components/printing/printing-assets";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";

/** Dark “fabrication” hero — body sections on /3d-printing match this lab aesthetic while the public layout stays light. */
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
              <p className={cn(publicEyebrowPrintClass, "md:tracking-[0.3em]")}>3D Printing by Topher</p>
            </RevealOnScroll>
            <RevealOnScroll delayMs={55}>
              <h1 className="mt-7 max-w-[20ch] text-[2.35rem] font-semibold leading-[1.04] tracking-[-0.035em] text-white sm:max-w-none sm:text-[2.75rem] sm:leading-[1.03] lg:mt-8 lg:text-[clamp(2.85rem,4.2vw,3.85rem)] lg:leading-[1.04] [text-shadow:0_4px_64px_rgba(0,0,0,0.55)]">
                Custom prints, replacement parts, and practical solutions.
              </h1>
            </RevealOnScroll>
            <RevealOnScroll delayMs={110}>
              <p className="mt-8 max-w-2xl text-[1.0625rem] font-medium leading-[1.55] text-white/[0.88] md:mt-9 md:text-lg md:leading-[1.58]">
                If something is broken, missing, hard to find, or needs to be created, Topher can help design and print a
                real solution.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delayMs={165}>
              <p className="mt-7 max-w-2xl border-l-[3px] border-emerald-400/50 pl-5 text-[0.95rem] font-semibold leading-relaxed text-emerald-200/[0.92] md:mt-8 md:text-[1rem]">
                Backed by a real Bambu Lab workflow in Hot Springs —{" "}
                <span className="text-emerald-100/95">1× A1 with AMS Lite</span> and{" "}
                <span className="text-emerald-100/95">2× P1S with AMS Pro</span>, with intake tuned for practical parts (not
                gimmicks).
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
                  Start a Print Project
                </Link>
                <Link
                  href="/contact"
                  className={cn(
                    printingSecondaryCtaClass,
                    "min-h-[3.35rem] w-full px-10 text-[0.96875rem] sm:w-auto",
                  )}
                >
                  Contact Topher
                </Link>
              </div>
              <p className="mt-4 text-sm text-white/[0.72]">
                Already have an STL?{" "}
                <Link href="/upload-print" className="font-semibold text-emerald-200/95 underline-offset-4 hover:underline">
                  Upload a file →
                </Link>
                {" · "}
                <a href="#examples-3d" className="font-semibold text-emerald-200/95 underline-offset-4 hover:underline">
                  View examples →
                </a>
              </p>
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
                    src={PRINTING_HERO_WORKSTATION_IMAGE}
                    alt="MixedMakerShop workstation with three monitors; behind them, one Bambu Lab A1 with AMS Lite and two Bambu Lab P1S printers with AMS Pro multi-material systems"
                    fill
                    className="object-cover object-center"
                    priority
                    sizes="(max-width: 1024px) 100vw, 580px"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/88 via-black/42 to-black/28" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black via-black/92 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-black/65 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_50%,transparent_35%,rgba(0,0,0,0.35)_100%)]" />
                  <svg
                    className="pointer-events-none absolute left-3 top-3 h-11 w-11 text-white/[0.22] sm:left-4 sm:top-4 sm:h-14 sm:w-14"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path d="M6 18V6h12M42 6H30v12M42 30v12H30M6 42h12V30" stroke="currentColor" strokeWidth="1.2" />
                    <path
                      d="M14 34h20M14 38h12"
                      stroke="currentColor"
                      strokeWidth="0.9"
                      strokeDasharray="2 3"
                      opacity="0.65"
                    />
                  </svg>
                  <svg
                    className="pointer-events-none absolute bottom-14 right-3 h-16 w-16 text-amber-300/[0.18] sm:bottom-16 sm:right-5 sm:h-[4.5rem] sm:w-[4.5rem]"
                    viewBox="0 0 64 64"
                    fill="none"
                    aria-hidden
                  >
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 5" />
                    <path d="M32 10v6M32 48v6M10 32h6M48 32h6" stroke="currentColor" strokeWidth="0.7" opacity="0.8" />
                  </svg>
                  <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-[92%]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-orange-300/95">The actual bench</p>
                    <p className="mt-2 text-sm font-semibold leading-snug text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.85)]">
                      A1 + AMS Lite · 2× P1S + AMS Pro · Triple-display workflow
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
