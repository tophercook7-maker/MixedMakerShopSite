import { Check } from "lucide-react";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass, printingSectionSurfaceClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";

const ITEMS = ["Replacement parts", "Tool holders", "Wall mounts", "One-off fixes"] as const;

export function WhatWeMake() {
  return (
    <PrintingSection className="bg-[radial-gradient(ellipse_85%_55%_at_50%_0%,rgba(249,115,22,0.07),transparent)]">
      <div className={printingContentClass}>
        <RevealOnScroll>
          <div className={printingSectionSurfaceClass}>
            <div className="relative z-[2] p-8 md:p-10 lg:p-12 xl:p-14">
              <PrintingSectionHeader
                title="What we make"
                subtitle="Short list. Real utility — the kind of parts you reach for every week."
              />

              <div className="mx-auto grid max-w-xl gap-3 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-4">
                {ITEMS.map((item, index) => (
                  <RevealOnScroll key={item} delayMs={index * 60}>
                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.09] bg-black/35 px-4 py-3.5 backdrop-blur-[2px] sm:px-5 sm:py-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/[0.18] text-emerald-200 ring-1 ring-emerald-400/22">
                        <Check className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                      </span>
                      <span className="text-[0.9375rem] font-semibold tracking-[-0.02em] text-white/92">{item}</span>
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
