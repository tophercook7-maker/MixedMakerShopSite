import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers, Printer, Sparkles } from "lucide-react";
import { publicShellClass } from "@/lib/public-brand";
import { mmsUmbrellaHeroImageSrc } from "@/lib/mms-umbrella-ui";
import {
  mmsBtnPrimary,
  mmsBtnSecondary,
  mmsEyebrow,
  mmsGlassPanelDense,
  mmsH1,
  mmsH2,
  mmsPageBg,
  mmsSectionBorder,
  mmsSectionY,
  mmsTextLink,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Real Websites Built by Topher | Examples | MixedMakerShop",
  description:
    "Explore real web design samples, 3D printing paths, landing pages, and tools — MixedMakerShop work by Topher in one place.",
};

const SHOW_PUBLIC_3D_PRINTING_EXAMPLES = true;

const shell = publicShellClass;

const portfolioTiles: {
  href: string;
  src: string;
  alt: string;
  title: string;
  tag: string;
  /** 12-column grid span on `lg` (row 1: 7+5, row 2: 6+6) */
  lgColClass: string;
  aspectClass: string;
}[] = [
  {
    href: "/website-samples",
    src: "/images/showcase/freshcut-property-care.jpg",
    alt: "Fresh Cut Property Care — live service website preview",
    title: "Fresh Cut Property Care",
    tag: "Web · live client",
    lgColClass: "lg:col-span-7",
    aspectClass: "aspect-[5/4] sm:aspect-[16/10] lg:min-h-[300px]",
  },
  {
    href: "/website-samples",
    src: "/images/showcase/deep-well-audio.jpg",
    alt: "Deep Well Audio — music brand site preview",
    title: "Deep Well Audio",
    tag: "Web · live client",
    lgColClass: "lg:col-span-5",
    aspectClass: "aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto lg:min-h-[300px]",
  },
  {
    href: "/builds",
    src: mmsUmbrellaHeroImageSrc,
    alt: "MixedMakerShop umbrella workspace — brand scene",
    title: "Digital builds",
    tag: "Products · systems",
    lgColClass: "lg:col-span-6",
    aspectClass: "aspect-[4/5] sm:aspect-[16/11] lg:min-h-[260px]",
  },
  {
    href: "/3d-printing",
    src: "/images/mixedmaker-workspace-hero.png",
    alt: "MixedMakerShop workshop",
    title: "3D printing lab",
    tag: "Physical builds",
    lgColClass: "lg:col-span-6",
    aspectClass: "aspect-[4/5] sm:aspect-[16/11] lg:min-h-[260px]",
  },
];

export default function ExamplesHubPage() {
  return (
    <div className={cn(mmsPageBg, "min-h-[60vh] bg-gradient-to-b from-[#ddd8cf] via-[#ece7dd] to-[#e0dbd2]")}>
      {/* Showcase hero — editorial portfolio opener */}
      <section
        className={cn(
          "relative overflow-hidden border-b border-[#1e241f]/12",
          "bg-gradient-to-br from-[#1b2420] via-[#2f3e34] to-[#151a17]",
          mmsSectionBorder,
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 55% at 12% 8%, rgba(184, 92, 30, 0.45), transparent 50%), radial-gradient(ellipse 50% 42% at 92% 78%, rgba(236, 231, 221, 0.1), transparent 52%), linear-gradient(110deg, rgba(63, 90, 71, 0.35) 0%, transparent 48%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute -left-40 top-10 h-[24rem] w-[24rem] rounded-full bg-[#b85c1e]/22 blur-[110px]" aria-hidden />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-[18rem] w-[18rem] rounded-full bg-[#6f8a73]/12 blur-[90px]" aria-hidden />

        <div className={cn(shell, "relative z-[1] py-20 md:py-28 lg:py-[6.5rem] xl:py-[7.5rem]")}>
          <div className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/12 pb-8 md:mb-12 md:pb-10">
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e8c4a8]">
              Portfolio index
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-[#e8c4a8]/55 sm:block" aria-hidden />
            <span className="text-xs font-medium text-[#c8bfb4]">MixedMakerShop · web-first umbrella</span>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-16 xl:gap-20">
            <div className="min-w-0 text-[#f4f1ea]">
              <p className={cn(mmsEyebrow, "!text-[#e8c4a8]")}>Selected work · by Topher</p>
              <h1
                className={cn(
                  mmsH1,
                  "mt-5 !text-[#faf8f4] !tracking-[-0.04em] md:mt-6 md:!text-[3rem] xl:!text-[3.35rem] xl:!leading-[1.03]",
                )}
              >
                A portfolio you can{" "}
                <span className="bg-gradient-to-r from-[#f4e8d9] via-[#e8c4a8] to-[#c9e0cc] bg-clip-text text-transparent">
                  actually open.
                </span>
              </h1>
              <p className="mt-8 max-w-[40rem] text-base font-medium leading-relaxed text-[#e5ddd3] md:text-lg md:leading-relaxed">
                Live client sites, workshop credibility, product builds, and print workflow — curated as one honest index.
                No vague “coming soon” tiles: every lane below routes to real pages.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/website-samples"
                  className={cn(mmsBtnPrimary, "justify-center px-8 shadow-[0_12px_40px_-8px_rgba(184,92,30,0.45)] no-underline hover:no-underline")}
                >
                  Browse website samples
                </Link>
                <Link href="/builds" className={cn(mmsBtnSecondary, "justify-center border-white/25 bg-white/[0.08] px-8 text-[#faf8f4] no-underline hover:border-white/35 hover:bg-white/[0.12] hover:no-underline")}>
                  Digital builds
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-6 text-sm text-[#b8a99a]">
                <span className="flex items-center gap-2 font-semibold text-[#e8dfd4]">
                  <Sparkles className="h-4 w-4 text-[#e8c4a8]" aria-hidden />
                  Lead service: web design
                </span>
                <span className="hidden sm:inline text-[#6f8a73]/80" aria-hidden>
                  ·
                </span>
                <span>3D printing + builds fill the umbrella</span>
              </div>
            </div>

            <div className="relative min-w-0 lg:pl-2">
              <div
                className={cn(
                  "absolute -right-1 -top-3 z-[2] rounded-full border border-[#b85c1e]/35 bg-[#1e241f]/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#e8c4a8] shadow-lg backdrop-blur-md",
                  "max-sm:relative max-sm:right-auto max-sm:top-auto max-sm:mb-3 max-sm:inline-block",
                )}
              >
                Live + in progress
              </div>
              <div
                className={cn(
                  "grid gap-3 sm:grid-cols-2 lg:gap-4",
                  "rounded-[1.65rem] border border-white/18 bg-[rgba(8,11,9,0.5)] p-3 shadow-[0_36px_96px_-32px_rgba(0,0,0,0.75)] backdrop-blur-xl",
                  "ring-1 ring-[#b85c1e]/30",
                )}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/12 sm:col-span-2 sm:aspect-[16/9]">
                  <Image
                    src="/images/mixedmaker-workspace-hero.png"
                    alt="MixedMakerShop workspace — desk, tools, and creative setup"
                    fill
                    priority
                    className="object-cover object-[50%_42%]"
                    sizes="(max-width: 1024px) 100vw, 560px"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1e241f]/75 via-[#1e241f]/15 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#b85c1e]/12 to-transparent opacity-70" aria-hidden />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f4f1ea]">
                    <span className="flex items-center gap-2 drop-shadow-md">
                      <Sparkles className="h-3.5 w-3.5 text-[#e8c4a8]" aria-hidden />
                      Workshop
                    </span>
                    <span className="hidden text-[#e8dfd4]/90 sm:inline">Real builds · real gear</span>
                  </div>
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/12 shadow-inner">
                  <Image
                    src={mmsUmbrellaHeroImageSrc}
                    alt="Umbrella workspace brand photograph"
                    fill
                    className="object-cover object-[48%_40%]"
                    sizes="(max-width: 1024px) 50vw, 260px"
                  />
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/12 shadow-inner">
                  <Image
                    src="/images/showcase/freshcut-property-care.jpg"
                    alt="Fresh Cut Property Care live site preview"
                    fill
                    className="object-cover object-[50%_15%]"
                    sizes="(max-width: 1024px) 50vw, 260px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio lanes — weighted grid */}
      <section
        className={cn(
          "border-b border-[#3f5a47]/12",
          "bg-[linear-gradient(180deg,#cfd8d0_0%,#e3ded6_38%,#ebe6de_100%)]",
          mmsSectionBorder,
        )}
      >
        <div className={cn(shell, "py-16 md:py-20 lg:py-28")}>
          <div className="flex flex-col justify-between gap-8 border-b border-[#3f5a47]/10 pb-10 md:flex-row md:items-end md:pb-12">
            <div className="max-w-2xl">
              <p className={cn(mmsEyebrow, "!text-[#8a4b2a]")}>Lane 01 — Visual entries</p>
              <h2 className={cn(mmsH2, "mt-4 !text-[1.85rem] md:!text-[2.35rem] md:!leading-snug")}>
                Jump straight into the work that matches your need
              </h2>
              <p className="mt-5 max-w-xl text-base font-semibold leading-relaxed text-[#2d3a33]">
                Each card is a door: client sites, digital products, or the print lab. Same maker, different depth.
              </p>
            </div>
            <Link
              href="/website-samples"
              className={cn(
                mmsTextLink,
                "inline-flex shrink-0 items-center gap-2 self-start text-[15px] font-bold md:self-auto md:text-base",
              )}
            >
              Full sample library
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
            {portfolioTiles.map((tile) => (
              <Link
                key={tile.title}
                href={tile.href}
                className={cn(
                  mmsGlassPanelDense,
                  "group relative overflow-hidden p-0 no-underline transition duration-300",
                  "border-[#3f5a47]/20 shadow-[0_20px_50px_-28px_rgba(30,36,31,0.35)]",
                  "hover:-translate-y-1 hover:border-[#b85c1e]/35 hover:shadow-[0_32px_70px_-30px_rgba(30,36,31,0.42)]",
                  tile.lgColClass,
                )}
              >
                <div className={cn("relative w-full overflow-hidden bg-[#cfd8d0]", tile.aspectClass)}>
                  <Image
                    src={tile.src}
                    alt={tile.alt}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1e241f]/88 via-[#1e241f]/25 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e8c4a8]">{tile.tag}</p>
                    <p className="mt-2 text-xl font-bold leading-tight text-[#faf8f4] sm:text-2xl">{tile.title}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#f4f1ea]">
                      Open lane
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        className={cn(
          "border-b border-[#3f5a47]/10",
          "bg-[linear-gradient(180deg,rgba(47,62,52,0.09)_0%,#e6e2da_36%,#dbe5db_100%)]",
          mmsSectionBorder,
        )}
      >
        <div className={cn(shell, mmsSectionY)}>
          <div className="max-w-3xl">
            <p className={cn(mmsEyebrow, "!text-[#8a4b2a]")}>Lane 02 — By category</p>
            <h2 className={cn(mmsH2, "mt-4 !text-xl md:!text-[2rem]")}>Choose how you want to explore</h2>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-relaxed text-[#2d3a33] md:text-[17px]">
              Web design leads the story. Printing and builds show the rest of how Topher solves problems end-to-end.
            </p>
          </div>
          <div
            className={cn(
              "mt-12 grid grid-cols-1 gap-8",
              SHOW_PUBLIC_3D_PRINTING_EXAMPLES ? "md:grid-cols-2 md:gap-10" : "md:max-w-xl",
            )}
          >
            <Link
              href="/web-design#browse-by-type"
              className={cn(
                mmsGlassPanelDense,
                "group relative flex flex-col overflow-hidden border-[#3f5a47]/24 p-9 transition sm:p-10",
                "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#b85c1e]/40 before:to-transparent",
                "hover:-translate-y-0.5 hover:border-[#b85c1e]/32 hover:shadow-[0_32px_70px_-32px_rgba(30,36,31,0.28)]",
              )}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3f5a47]/2 text-[#1e241f] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ring-1 ring-[#3f5a47]/12">
                <Layers className="h-7 w-7" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-8 text-xl font-bold text-[#1e241f] md:text-2xl">Web design &amp; landing pages</h3>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[#2d3a33] md:text-[15px]">
                Local service sites, conversion-focused pages, mockups, and lightweight tools — the core lane for most
                businesses.
              </p>
              <span className={cn(mmsTextLink, "mt-10 text-[15px] font-bold group-hover:underline")}>
                View web examples →
              </span>
            </Link>

            {SHOW_PUBLIC_3D_PRINTING_EXAMPLES ? (
              <Link
                href="/3d-printing#examples-3d"
                className={cn(
                  mmsGlassPanelDense,
                  "group relative flex flex-col overflow-hidden border-[#3f5a47]/24 p-9 transition sm:p-10",
                  "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#b85c1e]/40 before:to-transparent",
                  "hover:-translate-y-0.5 hover:border-[#b85c1e]/32 hover:shadow-[0_32px_70px_-32px_rgba(30,36,31,0.28)]",
                )}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2f3e34]/14 text-[#1e241f] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] ring-1 ring-[#3f5a47]/14">
                  <Printer className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="mt-8 text-xl font-bold text-[#1e241f] md:text-2xl">3D printing &amp; parts</h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-[#2d3a33] md:text-[15px]">
                  Replacements, functional prints, prototypes — honest feasibility and a real farm workflow behind the work.
                </p>
                <span className={cn(mmsTextLink, "mt-10 text-[15px] font-bold group-hover:underline")}>
                  View 3D examples →
                </span>
              </Link>
            ) : null}
          </div>

          <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/website-samples" className={cn(mmsBtnSecondary, "justify-center px-7 no-underline hover:no-underline")}>
              All website samples
            </Link>
            <Link href="/free-mockup" className={cn(mmsBtnPrimary, "justify-center px-7 no-underline hover:no-underline")}>
              Get a free mockup
            </Link>
            {SHOW_PUBLIC_3D_PRINTING_EXAMPLES ? (
              <Link href="/upload-print" className={cn(mmsBtnSecondary, "justify-center px-7 no-underline hover:no-underline")}>
                Upload a print file
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
