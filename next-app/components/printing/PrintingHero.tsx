import Image from "next/image";
import Link from "next/link";
import { RefreshCw, BrickWall, Layers3, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { printingPrimaryCtaClass, printingSecondaryCtaClass } from "@/components/printing/printing-section";
import { printingContentClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";
import { PRINTING_VISUALS } from "@/components/printing/printing-assets";

const VISUAL_CARDS: {
  title: string;
  line: string;
  src: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Replacement Part",
    line: "Broken? We recreate it or improve it.",
    src: PRINTING_VISUALS.replacementPart,
    icon: RefreshCw,
  },
  {
    title: "Wall Mount",
    line: "Mount anything, exactly where you need it.",
    src: PRINTING_VISUALS.wallMount,
    icon: BrickWall,
  },
  {
    title: "Tool Holder",
    line: "Keep your setup organized and efficient.",
    src: PRINTING_VISUALS.toolHolder,
    icon: Layers3,
  },
  {
    title: "Custom Fix",
    line: "One-off solutions for real problems.",
    src: PRINTING_VISUALS.customFix,
    icon: Wrench,
  },
];

function FabricationCardGrid() {
  return (
    <div className="border-t border-white/[0.06] pb-[4rem] pt-12 md:pb-[5rem] md:pt-14 lg:pb-[5.5rem] lg:pt-16">
      <RevealOnScroll>
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">
          Real prints for real jobs
        </p>
      </RevealOnScroll>
      <div className="mt-9 grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 xl:gap-7">
        {VISUAL_CARDS.map(({ title, line, src, icon: Icon }, index) => (
          <RevealOnScroll key={title} delayMs={index * 90}>
            <article
              className={cn(
                "group flex min-h-[17.5rem] flex-col overflow-hidden rounded-[1.2rem] border border-white/[0.11]",
                "bg-neutral-950/90 shadow-[0_24px_64px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]",
                "transition duration-300 ease-out",
                "hover:-translate-y-1 hover:border-orange-400/28 hover:shadow-[0_32px_80px_rgba(0,0,0,0.6)]",
              )}
            >
              <div className="relative h-[9.5rem] w-full shrink-0 overflow-hidden sm:h-[10.25rem]">
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                  sizes="(max-width: 640px) 100vw, 25vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/15" />
                <span
                  className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-emerald-400/40"
                  aria-hidden
                />
              </div>
              <div className="relative flex flex-1 flex-col border-t border-white/[0.07] bg-gradient-to-b from-black/80 to-black p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl",
                      "border border-amber-400/22 bg-black/60 text-amber-200/95 ring-1 ring-white/[0.06]",
                      "shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] transition duration-300 group-hover:border-amber-300/38",
                    )}
                  >
                    <Icon className="h-[1.25rem] w-[1.25rem]" strokeWidth={1.55} aria-hidden />
                  </div>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/75 shadow-[0_0_14px_rgba(0,255,178,0.35)]" aria-hidden />
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300/95">{title}</h3>
                <p className="mt-2 text-[0.9rem] font-medium leading-snug tracking-[-0.015em] text-white/[0.9]">{line}</p>
              </div>
            </article>
          </RevealOnScroll>
        ))}
      </div>
    </div>
  );
}

export function PrintingHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06] pb-0 pt-[3.25rem] md:pt-[4.5rem] lg:pt-[5.25rem]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Cpath d='M0 48h48M48 0v48' fill='none' stroke='%23ffffff' stroke-opacity='0.06'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="pointer-events-none absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-amber-500/[0.1] blur-[130px]" />
      <div className="pointer-events-none absolute -right-24 top-1/4 h-[22rem] w-[22rem] rounded-full bg-emerald-500/[0.08] blur-[110px]" />

      <div className={cn("relative", printingContentClass)}>
        <div className="grid gap-14 pb-[3.75rem] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,36rem)] lg:items-center lg:gap-20 lg:pb-[4.75rem] xl:grid-cols-[minmax(0,1.1fr)_minmax(0,40rem)] xl:gap-24">
          <RevealOnScroll>
            <div className="min-w-0 lg:pr-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-400/95 md:text-xs md:tracking-[0.28em]">
                Custom 3D printing • PLA only • Hot Springs, Arkansas
              </p>

              <h1 className="mt-6 max-w-[18ch] text-[2.4rem] font-bold leading-[1.04] tracking-[-0.038em] text-white sm:max-w-none sm:text-[2.75rem] sm:leading-[1.03] lg:text-[clamp(3.05rem,4.35vw,4.05rem)] lg:leading-[1.02] [text-shadow:0_3px_56px_rgba(0,0,0,0.45)]">
                Stop buying what doesn&apos;t exist.
              </h1>

              <p className="mt-7 max-w-2xl text-[1.0625rem] font-medium leading-[1.45] text-white/[0.86] md:mt-8 md:text-lg md:leading-[1.5]">
                We design and print useful custom parts, mounts, organizers, replacement pieces, and one-off fixes you
                can&apos;t find in stores.
              </p>
              <p className="mt-6 max-w-2xl border-l-[3px] border-emerald-400/55 pl-5 text-[0.9375rem] font-semibold leading-relaxed text-emerald-200/[0.93] md:mt-7">
                If you can describe the problem, we can build the solution.
              </p>

              <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:mt-12">
                <Link href="/custom-3d-printing" className={cn(printingPrimaryCtaClass, "w-full px-9 sm:w-auto")}>
                  Submit a request
                </Link>
                <a href="#stl-library-resources" className={cn(printingSecondaryCtaClass, "w-full px-9 sm:w-auto")}>
                  Browse STL resources
                </a>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delayMs={100}>
            <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
              <div className="absolute -inset-[2px] rounded-[1.4rem] bg-gradient-to-br from-orange-500/28 via-white/[0.07] to-emerald-500/22 opacity-95 blur-[1px]" aria-hidden />
              <div className="relative overflow-hidden rounded-[1.28rem] border border-white/[0.13] bg-neutral-950 shadow-[0_32px_90px_rgba(0,0,0,0.6)] backdrop-blur-md">
                <div className="relative aspect-[4/3] w-full sm:aspect-[16/11] lg:aspect-[5/4]">
                  <Image
                    src="/images/mixedmaker-workspace-hero.png"
                    alt="MixedMaker workspace and 3D printing setup"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 580px"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/78 via-black/35 to-black/20" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black via-black/88 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/55 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-[90%]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-orange-300/95">MixedMakerShop</p>
                    <p className="mt-1.5 text-sm font-semibold leading-snug text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.8)]">
                      Custom PLA fabrication • Hot Springs, Arkansas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>

        <FabricationCardGrid />
      </div>
    </section>
  );
}
