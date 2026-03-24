import { Ruler, Hammer, MapPin } from "lucide-react";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";

const POINTS = [
  {
    title: "Custom fit",
    copy: "Built for your specific problem instead of a close-enough guess.",
    icon: Ruler,
  },
  {
    title: "Real-world use",
    copy: "Useful parts made for everyday jobs, repairs, and organization.",
    icon: Hammer,
  },
  {
    title: "Arkansas made",
    copy: "Direct communication and fast, honest replies — no ticket queue.",
    icon: MapPin,
  },
] as const;

export function PrintingWhy() {
  return (
    <PrintingSection className="overflow-hidden bg-black/25">
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 translate-x-1/4 rounded-full bg-emerald-600/[0.08] blur-[110px]" />
      <div className="relative mx-auto w-full max-w-[1400px] px-6 md:px-10 lg:px-16">
        <PrintingSectionHeader
          eyebrow="Why us"
          title="Why people use us"
          subtitle="Local shop, straight answers. We focus on parts that earn their place in your workflow."
        />
        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          {POINTS.map(({ title, copy, icon: Icon }) => (
            <div
              key={title}
              className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.025] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 hover:border-emerald-500/22 hover:bg-white/[0.035] md:p-8"
            >
              <div className="mb-5 inline-flex w-fit rounded-xl bg-emerald-500/[0.1] p-3 text-emerald-400/90 ring-1 ring-emerald-500/15">
                <Icon className="h-5 w-5" strokeWidth={1.65} aria-hidden />
              </div>
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">{title}</h3>
              <p className="mt-3 text-[0.8125rem] leading-[1.62] text-white/52">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </PrintingSection>
  );
}
