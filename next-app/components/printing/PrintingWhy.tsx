import Image from "next/image";
import { Ruler, Hammer, ListOrdered, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass, printingSectionSurfaceClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";
import { PRINTING_VISUALS } from "@/components/printing/printing-assets";

const POINTS: {
  title: string;
  copy: string;
  icon: LucideIcon;
  stripSrc: string;
  stripAlt: string;
}[] = [
  {
    title: "Custom Fit",
    copy: "Built for your exact situation instead of a close-enough guess.",
    icon: Ruler,
    stripSrc: PRINTING_VISUALS.replacementPart,
    stripAlt: "",
  },
  {
    title: "Built for Real Use",
    copy: "Useful parts made for everyday jobs, repairs, and organization.",
    icon: Hammer,
    stripSrc: PRINTING_VISUALS.toolHolder,
    stripAlt: "",
  },
  {
    title: "Straightforward Process",
    copy: "No runaround, no guessing — just clear communication and real results.",
    icon: ListOrdered,
    stripSrc: PRINTING_VISUALS.wallMount,
    stripAlt: "",
  },
  {
    title: "Local Shop",
    copy: "You're talking directly to the person building it.",
    icon: Store,
    stripSrc: PRINTING_VISUALS.customFix,
    stripAlt: "",
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
              <PrintingSectionHeader title="Why people use us" />
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 xl:gap-7">
                {POINTS.map(({ title, copy, icon: Icon, stripSrc, stripAlt }, index) => (
                  <RevealOnScroll key={title} delayMs={index * 75}>
                    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.11] bg-gradient-to-b from-white/[0.06] to-black/44 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_22px_60px_rgba(0,0,0,0.32)] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_30px_72px_rgba(0,0,0,0.38)]">
                      <div className="relative h-28 w-full shrink-0 overflow-hidden">
                        <Image
                          src={stripSrc}
                          alt={stripAlt}
                          fill
                          className="object-cover opacity-85 transition duration-500 group-hover:scale-[1.05] group-hover:opacity-100"
                          sizes="(max-width: 1280px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.65)_0%,transparent_100%)]" />
                      </div>
                      <div className="flex flex-1 flex-col p-7 md:p-8">
                        <div className="mb-4 inline-flex w-fit rounded-xl bg-emerald-500/[0.14] p-3 text-emerald-200/95 ring-1 ring-emerald-400/22">
                          <Icon className="h-5 w-5" strokeWidth={1.65} aria-hidden />
                        </div>
                        <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">{title}</h3>
                        <p className="mt-3 text-[0.8125rem] leading-[1.68] text-white/54">{copy}</p>
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
