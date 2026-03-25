import Image from "next/image";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass, printingSectionSurfaceClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";
import { PRINTING_VISUALS } from "@/components/printing/printing-assets";

const ITEMS = [
  {
    title: "Custom tool holders",
    copy: "Built around your tools, your space, and how you actually use them.",
    src: PRINTING_VISUALS.toolHolder,
    alt: "Custom 3D-printed tool holder on a workbench",
  },
  {
    title: "Replacement parts",
    copy: "Fix broken or hard-to-find pieces without replacing the whole thing.",
    src: PRINTING_VISUALS.replacementPart,
    alt: "Broken part next to 3D-printed PLA replacement",
  },
  {
    title: "Wall mounts",
    copy: "Clean, strong mounts designed for your exact setup.",
    src: PRINTING_VISUALS.wallMount,
    alt: "PLA wall mount bracket in a workshop",
  },
  {
    title: "One-off problem solvers",
    copy: "If it doesn't exist, we design it and make it work.",
    src: PRINTING_VISUALS.customFix,
    alt: "Custom PLA adapter solving a practical fit problem",
  },
] as const;

export function WhatWeMake() {
  return (
    <PrintingSection className="bg-[radial-gradient(ellipse_85%_55%_at_50%_0%,rgba(249,115,22,0.07),transparent)]">
      <div className={printingContentClass}>
        <RevealOnScroll>
          <div className={printingSectionSurfaceClass}>
            <div className="relative z-[2] p-8 md:p-10 lg:p-12 xl:p-14">
              <PrintingSectionHeader
                title="What we make"
                subtitle="Practical PLA work for real jobs — not shelf clutter."
              />
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 xl:gap-7">
                {ITEMS.map(({ title, copy, src, alt }, index) => (
                  <RevealOnScroll key={title} delayMs={index * 75}>
                    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.11] bg-gradient-to-b from-white/[0.07] to-black/55 shadow-[0_26px_72px_rgba(0,0,0,0.38)] transition duration-300 before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:z-[1] before:h-px before:bg-gradient-to-r before:from-transparent before:via-orange-500/35 before:to-transparent hover:-translate-y-0.5 hover:border-orange-500/35 hover:shadow-[0_36px_88px_rgba(0,0,0,0.48)]">
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                          src={src}
                          alt={alt}
                          fill
                          className="object-cover transition duration-500 ease-out group-hover:scale-[1.05]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/88 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-300/95">PLA</span>
                          <span className="h-1 w-10 rounded-full bg-emerald-400/80" aria-hidden />
                        </div>
                      </div>
                      <div className="relative z-[2] flex flex-1 flex-col bg-black/35 p-6 pt-5 backdrop-blur-[4px] md:p-7 md:pt-6">
                        <h3 className="text-[1.05rem] font-semibold leading-snug tracking-[-0.025em] text-white md:text-lg">{title}</h3>
                        <p className="mt-2.5 flex-1 text-[0.8125rem] leading-[1.68] text-white/55">{copy}</p>
                      </div>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PrintingSection>
  );
}
