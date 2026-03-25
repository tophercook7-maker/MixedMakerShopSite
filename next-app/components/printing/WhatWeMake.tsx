import Image from "next/image";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass, printingSectionSurfaceClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";

const ITEMS = [
  {
    title: "Custom Tool Holders",
    copy: "Slots, racks, and layouts built around your tools, bench space, and how you move through a job.",
    src: "/images/products/uno-box.png",
    alt: "Organizer-style 3D print example",
  },
  {
    title: "Replacement Parts",
    copy: "Recreate what broke — so you fix the assembly instead of junking the whole thing.",
    src: "/images/products/skeleton-fish.png",
    alt: "Detailed 3D-printed part example",
  },
  {
    title: "Wall Mounts",
    copy: "Brackets and mounts cut to your gear, your studs, and the clearance you actually have.",
    src: "/images/products/goat.png",
    alt: "Structural 3D print example",
  },
  {
    title: "One-Off Problem Solvers",
    copy: "Weird angles, obsolete hardware, or parts that are not sold anymore — modeled and printed in PLA.",
    src: "/images/products/3d-fish-keychain.png",
    alt: "Small custom 3D-print example",
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
                    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-black/52 shadow-[0_24px_64px_rgba(0,0,0,0.34)] transition duration-300 before:pointer-events-none before:absolute before:inset-x-5 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent hover:border-orange-500/32 hover:shadow-[0_36px_80px_rgba(0,0,0,0.42)]">
                      <div className="relative aspect-[5/4] w-full overflow-hidden border-b border-white/[0.08]">
                        <Image
                          src={src}
                          alt={alt}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-[1.04]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-300/95">PLA</span>
                          <span className="h-1 w-10 rounded-full bg-emerald-400/75" aria-hidden />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col bg-black/25 p-6 pt-5 backdrop-blur-[2px] md:p-7 md:pt-6">
                        <h3 className="text-base font-semibold leading-snug tracking-[-0.02em] text-white">{title}</h3>
                        <p className="mt-2.5 flex-1 text-[0.8125rem] leading-[1.68] text-white/52">{copy}</p>
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
