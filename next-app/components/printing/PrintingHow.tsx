import { Camera, Cuboid, CircleCheck } from "lucide-react";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";

const STEPS = [
  {
    n: "1",
    title: "Tell us what you need",
    copy: "Photos, sketches, a broken piece, or a clear description — send whatever you have.",
    icon: Camera,
  },
  {
    n: "2",
    title: "We design and print it",
    copy: "We model in PLA and print for your exact fit, clearance, and how you will use the part.",
    icon: Cuboid,
  },
  {
    n: "3",
    title: "Put it to work",
    copy: "Install it and run it — this is shop-floor work, not a display piece.",
    icon: CircleCheck,
  },
] as const;

export function PrintingHow() {
  return (
    <PrintingSection className="bg-gradient-to-b from-black/42 via-black/18 to-black/28">
      <div className={printingContentClass}>
        <PrintingSectionHeader
          title="Simple process"
          subtitle="Three steps from what you describe to a part you can use."
        />
        <RevealOnScroll>
          <div className="relative rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-b from-white/[0.05] to-black/48 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_28px_80px_rgba(0,0,0,0.38)] backdrop-blur-[3px] sm:p-8 md:p-11 lg:p-14">
            <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(249,115,22,0.07),transparent)]" aria-hidden />
            <div
              className="pointer-events-none absolute left-[12%] right-[12%] top-[3.75rem] hidden h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent lg:block"
              aria-hidden
            />
            <div className="relative grid gap-12 lg:grid-cols-3 lg:gap-12">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <RevealOnScroll key={step.n} delayMs={index * 85}>
                    <div className="relative flex h-full flex-col rounded-2xl border border-white/[0.07] bg-black/28 p-6 ring-1 ring-white/[0.05] sm:p-7 lg:items-center lg:border-0 lg:bg-transparent lg:p-0 lg:ring-0 lg:text-center">
                      <div className="relative z-[1] flex shrink-0 flex-row items-center gap-4 lg:flex-col lg:gap-3">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-300 via-orange-500 to-orange-600 text-xl font-bold tabular-nums tracking-tight text-neutral-950 shadow-[0_8px_32px_rgba(249,115,22,0.45),inset_0_1px_0_rgba(255,255,255,0.35)]">
                          {step.n}
                        </span>
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.12] bg-black/40 text-orange-300/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                          <Icon className="h-5 w-5" strokeWidth={1.65} aria-hidden />
                        </span>
                      </div>
                      <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-white lg:mt-7 lg:max-w-[18rem]">{step.title}</h3>
                      <p className="mt-2.5 max-w-md text-[0.8125rem] leading-[1.65] text-white/52 lg:mx-auto lg:max-w-[21rem]">
                        {step.copy}
                      </p>
                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PrintingSection>
  );
}
