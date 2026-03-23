import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { printingPrimaryCtaClass, printingSecondaryCtaClass } from "@/components/printing/printing-section";

const CHIPS = ["Custom parts", "Replacement fixes", "Wall mounts", "Tool holders"] as const;

export function PrintingHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.07] pb-[4.5rem] pt-[3.25rem] md:pb-[6rem] md:pt-[4.5rem] lg:pb-[7rem] lg:pt-[5.5rem]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 40h40M40 0v40' fill='none' stroke='%23ffffff' stroke-opacity='0.05'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-orange-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 top-0 h-[22rem] w-[22rem] rounded-full bg-emerald-500/[0.14] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-56 w-72 rounded-full bg-orange-400/10 blur-[90px]" />

      <div className="relative mx-auto flex max-w-[72rem] flex-col gap-14 px-5 sm:px-8 lg:flex-row lg:items-center lg:gap-20">
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-orange-400/95">
              Custom 3D printing
            </span>
            <span className="hidden h-px w-8 bg-white/20 sm:block" aria-hidden />
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/40">PLA only</span>
            <span className="hidden h-px w-8 bg-white/20 sm:block" aria-hidden />
            <span className="text-[11px] font-medium tracking-wide text-emerald-400/80">Hot Springs, Arkansas</span>
          </div>

          <h1 className="max-w-[14ch] text-[2.125rem] font-bold leading-[1.08] tracking-[-0.035em] text-white sm:text-5xl sm:leading-[1.05] lg:max-w-none lg:text-[clamp(2.75rem,4.2vw,3.65rem)]">
            Stop buying what doesn&apos;t exist.
          </h1>

          <p className="mt-6 max-w-lg text-[1.0625rem] font-medium leading-[1.55] text-white/[0.78] md:text-lg md:leading-snug">
            We build useful custom parts, mounts, organizers, and one-off fixes you can&apos;t find in stores.
          </p>
          <p className="mt-4 max-w-md text-[0.875rem] leading-relaxed text-white/50">
            If you can describe the problem, we can design and print a solution.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/custom-3d-printing" className={cn(printingPrimaryCtaClass, "w-full sm:w-auto")}>
              Submit a request
            </Link>
            <a
              href="#stl-library-resources"
              className={cn(printingSecondaryCtaClass, "w-full sm:w-auto")}
            >
              Explore STL libraries
            </a>
          </div>
        </div>

        <div className="relative flex flex-1 justify-center lg:max-w-md lg:justify-end">
          <div className="relative w-full max-w-[20rem]">
            <div className="absolute -inset-px rounded-[1.75rem] bg-gradient-to-br from-orange-500/35 via-white/[0.06] to-emerald-500/25 opacity-90 blur-[1px]" />
            <div className="relative rounded-[1.75rem] border border-white/[0.12] bg-gradient-to-br from-white/[0.09] via-white/[0.03] to-transparent p-10 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-12">
              <div className="relative mx-auto aspect-square w-44 sm:w-52">
                <Image
                  src="/images/m3-logo.png"
                  alt="MixedMakerShop M³ logo"
                  fill
                  className="object-contain drop-shadow-[0_0_32px_rgba(249,115,22,0.22)]"
                  sizes="(max-width: 640px) 176px, 208px"
                  priority
                />
              </div>
              <p className="mt-6 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40">
                MixedMakerShop
              </p>
              <p className="mt-1 text-center text-xs text-white/35">Custom fabrication</p>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {CHIPS.map((label) => (
                <span
                  key={label}
                  className="rounded-lg border border-white/[0.1] bg-black/35 px-3 py-1.5 text-[11px] font-medium tracking-wide text-white/[0.78]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
