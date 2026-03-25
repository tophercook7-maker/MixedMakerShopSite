import { Ruler, Hammer, ListOrdered, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";

const POINTS: { title: string; copy: string; icon: LucideIcon }[] = [
  {
    title: "Fit for what broke",
    copy: "Modeled around your real dimensions and wear — not a random download that “almost” works.",
    icon: Ruler,
  },
  {
    title: "Built for real use",
    copy: "PLA tuned for benches, walls, and daily grabs — not shelf candy.",
    icon: Hammer,
  },
  {
    title: "Straight process",
    copy: "Photos, sizes, a plain quote. You always know what’s next.",
    icon: ListOrdered,
  },
  {
    title: "You get the maker",
    copy: "Same person in Hot Springs who prints it. Pickup or delivery — your call.",
    icon: Store,
  },
];

export function PrintingWhy() {
  return (
    <PrintingSection className="overflow-hidden border-b border-white/[0.05] bg-gradient-to-b from-black/35 via-black/22 to-black/30">
      <div className="pointer-events-none absolute right-0 top-0 h-[28rem] w-[28rem] translate-x-1/3 rounded-full bg-emerald-600/[0.06] blur-[140px]" />
      <div className={cn(printingContentClass, "relative")}>
        <PrintingSectionHeader
          title="Why people use us"
          subtitle="Retail parts are built for everyone. Yours need to fit your situation — we start there."
          className="mb-10 md:mb-12"
        />
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 xl:gap-5">
          {POINTS.map(({ title, copy, icon: Icon }, index) => (
            <RevealOnScroll key={title} delayMs={index * 65}>
              <div
                className={cn(
                  "printing-premium-card group flex h-full flex-col rounded-2xl border border-white/[0.11]",
                  "bg-black/45 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-md supports-[backdrop-filter]:bg-black/40 md:p-7",
                )}
              >
                <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.06] text-orange-300/95 backdrop-blur-sm transition duration-200 group-hover:border-orange-500/25 group-hover:bg-white/[0.09]">
                  <Icon className="h-5 w-5" strokeWidth={1.65} aria-hidden />
                </span>
                <h3 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-white md:text-[1.08rem]">{title}</h3>
                <p className="mt-2.5 text-[0.8125rem] leading-[1.68] text-white/58">{copy}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </PrintingSection>
  );
}
