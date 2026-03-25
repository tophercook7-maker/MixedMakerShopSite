import Image from "next/image";
import Link from "next/link";
import { RefreshCw, BrickWall, Layers3, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { printingPrimaryCtaClass, printingSecondaryCtaClass } from "@/components/printing/printing-section";
import { printingContentClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";

/** Dark grid texture — local inline SVG, no network fetch */
const CARD_TEXTURE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cpath d='M32 0v64M0 32h64' fill='none' stroke='%23ffffff' stroke-opacity='0.05'/%3E%3Cpath d='M0 0h64v64H0z' fill='none' stroke='%2300ffb2' stroke-opacity='0.04'/%3E%3C/svg%3E\")";

const VISUAL_CARDS: {
  title: string;
  line: string;
  src: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Replacement Part",
    line: "Broken? We recreate it or improve it.",
    src: "/images/products/chess-piece.png",
    icon: RefreshCw,
  },
  {
    title: "Wall Mount",
    line: "Mount anything, exactly where you need it.",
    src: "/images/products/shark.png",
    icon: BrickWall,
  },
  {
    title: "Tool Holder",
    line: "Keep your setup organized and efficient.",
    src: "/images/products/articulating-monkey.png",
    icon: Layers3,
  },
  {
    title: "Custom Fix",
    line: "One-off solutions for real problems.",
    src: "/images/products/copper-dragon.png",
    icon: Wrench,
  },
];

function FabricationCardGrid() {
  return (
    <div className="border-t border-white/[0.06] pb-[4rem] pt-12 md:pb-[5rem] md:pt-14 lg:pb-[5.5rem] lg:pt-16">
      <RevealOnScroll>
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">
          Built for these jobs
        </p>
      </RevealOnScroll>
      <div className="mt-9 grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 xl:gap-7">
        {VISUAL_CARDS.map(({ title, line, src, icon: Icon }, index) => (
          <RevealOnScroll key={title} delayMs={index * 90}>
            <article
              className={cn(
                "group relative flex min-h-[15rem] flex-col overflow-hidden rounded-[1.125rem] border border-white/[0.1]",
                "bg-gradient-to-b from-neutral-900/95 via-neutral-950 to-black",
                "shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.07)]",
                "transition duration-300 ease-out will-change-transform",
                "hover:-translate-y-1 hover:border-amber-400/25 hover:shadow-[0_28px_64px_rgba(0,0,0,0.55),0_0_0_1px_rgba(251,191,36,0.08)]",
              )}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.45]"
                style={{ backgroundImage: CARD_TEXTURE, backgroundSize: "64px 64px" }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.35]"
                style={{
                  backgroundImage:
                    "radial-gradient(ellipse 120% 80% at 20% 0%, rgba(251, 191, 36, 0.07), transparent 50%), radial-gradient(ellipse 90% 70% at 100% 100%, rgba(0, 255, 178, 0.06), transparent 45%)",
                }}
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/88 to-neutral-950/40" aria-hidden />

              <div className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 overflow-hidden rounded-full opacity-[0.22] ring-1 ring-white/[0.08] transition duration-500 group-hover:opacity-[0.32] sm:h-32 sm:w-32">
                <Image src={src} alt="" fill className="object-cover scale-110 blur-[0.5px]" sizes="128px" />
              </div>

              <span
                className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-emerald-400/35 transition duration-300 group-hover:border-emerald-300/50"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-amber-400/30 transition duration-300 group-hover:border-amber-300/45"
                aria-hidden
              />

              <div className="relative flex flex-1 flex-col p-6 pt-7 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "flex h-[3.35rem] w-[3.35rem] shrink-0 items-center justify-center rounded-xl",
                      "border border-amber-400/20 bg-black/55 ring-1 ring-white/[0.06]",
                      "text-amber-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.35)]",
                      "transition duration-300 group-hover:border-amber-300/35 group-hover:text-amber-100",
                    )}
                  >
                    <Icon className="h-[1.35rem] w-[1.35rem]" strokeWidth={1.5} aria-hidden />
                  </div>
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/70 shadow-[0_0_12px_rgba(0,255,178,0.35)]"
                    aria-hidden
                  />
                </div>

                <div className="mt-auto pt-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300/95">{title}</h3>
                  <p className="mt-2.5 text-[0.9375rem] font-medium leading-snug tracking-[-0.01em] text-white/[0.92]">
                    {line}
                  </p>
                </div>
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
    <section className="relative overflow-hidden border-b border-white/[0.06] pb-0 pt-[3.25rem] md:pt-[4.5rem] lg:pt-[5rem]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Cpath d='M0 48h48M48 0v48' fill='none' stroke='%23ffffff' stroke-opacity='0.06'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="pointer-events-none absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-amber-500/[0.11] blur-[130px]" />
      <div className="pointer-events-none absolute -right-24 top-1/4 h-[22rem] w-[22rem] rounded-full bg-emerald-500/[0.09] blur-[110px]" />

      <div className={cn("relative", printingContentClass)}>
        <div className="grid gap-14 pb-[3.75rem] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,34rem)] lg:items-center lg:gap-20 lg:pb-[4.75rem] xl:grid-cols-[minmax(0,1.15fr)_minmax(0,38rem)] xl:gap-24">
          <RevealOnScroll>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-400/95 md:text-xs md:tracking-[0.26em]">
                Custom 3D Printing • PLA Only • Hot Springs, Arkansas
              </p>

              <h1 className="mt-5 max-w-[20ch] text-[2.35rem] font-bold leading-[1.05] tracking-[-0.035em] text-white sm:max-w-none sm:text-5xl sm:leading-[1.04] lg:text-[clamp(3rem,4.2vw,3.95rem)] [text-shadow:0_2px_48px_rgba(0,0,0,0.35)]">
                Stop buying what doesn&apos;t exist.
              </h1>

              <p className="mt-6 max-w-2xl text-[1.0625rem] font-medium leading-snug text-white/[0.84] md:mt-7 md:text-lg md:leading-snug">
                We design and print useful custom parts, mounts, organizers, replacement pieces, and one-off fixes you
                can&apos;t find in stores.
              </p>
              <p className="mt-5 max-w-2xl border-l-2 border-emerald-400/50 pl-5 text-[0.9375rem] font-medium leading-relaxed text-emerald-300/[0.92] md:mt-6">
                If you can describe the problem, we can build the solution.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:mt-11">
                <Link href="/custom-3d-printing" className={cn(printingPrimaryCtaClass, "w-full px-9 sm:w-auto")}>
                  Submit a Request
                </Link>
                <a href="#stl-library-resources" className={cn(printingSecondaryCtaClass, "w-full px-9 sm:w-auto")}>
                  Browse STL Resources
                </a>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delayMs={100}>
            <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
              <div className="absolute -inset-1 rounded-[1.35rem] bg-gradient-to-br from-orange-500/25 via-white/[0.06] to-emerald-500/18 opacity-90 blur-[1px]" aria-hidden />
              <div className="relative overflow-hidden rounded-[1.25rem] border border-white/[0.12] bg-neutral-950/75 shadow-[0_28px_80px_rgba(0,0,0,0.55)] backdrop-blur-md">
                <div className="relative aspect-[4/3] w-full sm:aspect-[16/11] lg:aspect-[5/4]">
                  <Image
                    src="/images/mixedmaker-workspace-hero.png"
                    alt="MixedMaker workspace and 3D printing setup"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 560px"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/65 via-black/25 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-auto">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-300/95">MixedMakerShop</p>
                    <p className="mt-1 text-sm font-semibold text-white/95">Custom PLA • Hot Springs, Arkansas</p>
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
