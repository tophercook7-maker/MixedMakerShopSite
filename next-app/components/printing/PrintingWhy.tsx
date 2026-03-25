import { Ruler, Hammer, ListOrdered, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass, printingSectionSurfaceClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";

const POINTS: { title: string; copy: string; icon: LucideIcon }[] = [
  {
    title: "Measured to your problem",
    copy: "We work from what’s broken, missing, or awkward — not a one-size file from the internet.",
    icon: Ruler,
  },
  {
    title: "Meant to be used",
    copy: "PLA tuned for real abuse: shops, projects, daily grabs — not trophy pieces.",
    icon: Hammer,
  },
  {
    title: "Straight answers",
    copy: "Photos, sizes, a clear quote. No mystery tiers or offshore handoff.",
    icon: ListOrdered,
  },
  {
    title: "Hot Springs, one maker",
    copy: "You’re talking to who prints it. Local pickup or delivery, your call.",
    icon: Store,
  },
];

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
                subtitle="Stores aren’t wrong — they’re generic. When generic fails, you need a part that matches reality."
              />
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 xl:gap-6">
                {POINTS.map(({ title, copy, icon: Icon }, index) => (
                  <RevealOnScroll key={title} delayMs={index * 70}>
                    <div className="group flex h-full flex-col rounded-2xl border border-white/[0.11] bg-gradient-to-b from-white/[0.06] to-black/44 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_22px_60px_rgba(0,0,0,0.32)] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-500/28 md:p-7">
                      <div className="mb-5 inline-flex w-fit rounded-xl bg-emerald-500/[0.14] p-3 text-emerald-200/95 ring-1 ring-emerald-400/22 transition group-hover:bg-emerald-500/[0.18]">
                        <Icon className="h-5 w-5" strokeWidth={1.65} aria-hidden />
                      </div>
                      <h3 className="text-base font-semibold tracking-[-0.02em] text-white md:text-[1.05rem]">{title}</h3>
                      <p className="mt-2.5 text-[0.8125rem] leading-[1.65] text-white/52">{copy}</p>
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
