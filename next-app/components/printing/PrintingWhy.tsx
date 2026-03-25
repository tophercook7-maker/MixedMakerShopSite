import { Ruler, Hammer, ListOrdered, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass, printingSectionSurfaceClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";

const POINTS = [
  {
    title: "Custom Fit",
    copy: "Designed to your dimensions and constraints — not 'close enough' from a generic part bin.",
    icon: Ruler,
  },
  {
    title: "Built for Real Use",
    copy: "These parts are meant to be mounted, handled, and used — not collect dust on a shelf.",
    icon: Hammer,
  },
  {
    title: "Straightforward Process",
    copy: "Clear communication, honest scope, and you always know what happens next.",
    icon: ListOrdered,
  },
  {
    title: "Local Shop",
    copy: "Hot Springs, Arkansas — you talk to the person who designs and prints your job.",
    icon: Store,
  },
] as const;

export function PrintingWhy() {
  return (
    <PrintingSection className="overflow-hidden bg-black/28">
      <div className="pointer-events-none absolute right-0 top-0 h-[28rem] w-[28rem] translate-x-1/3 rounded-full bg-emerald-600/[0.06] blur-[140px]" />
      <div className={cn(printingContentClass, "relative")}>
        <RevealOnScroll>
          <div className={printingSectionSurfaceClass}>
            <div className="relative z-[2] p-8 md:p-10 lg:p-12 xl:p-14">
              <PrintingSectionHeader
                title="Why people use us"
                subtitle="Useful PLA work, straight talk, and a local shop you can actually reach."
              />
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 xl:gap-7">
                {POINTS.map(({ title, copy, icon: Icon }, index) => (
                  <RevealOnScroll key={title} delayMs={index * 75}>
                    <div className="flex h-full flex-col rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.05] to-black/38 p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_56px_rgba(0,0,0,0.28)] transition duration-300 hover:border-emerald-500/28 hover:shadow-[0_28px_64px_rgba(0,0,0,0.34)] md:p-8">
                      <div className="mb-5 inline-flex w-fit rounded-xl bg-emerald-500/[0.13] p-3 text-emerald-300/95 ring-1 ring-emerald-400/20">
                        <Icon className="h-5 w-5" strokeWidth={1.65} aria-hidden />
                      </div>
                      <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">{title}</h3>
                      <p className="mt-3 text-[0.8125rem] leading-[1.65] text-white/52">{copy}</p>
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
