import Image from "next/image";
import { Camera, Cuboid, CircleCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";
import { PRINTING_VISUALS } from "@/components/printing/printing-assets";

const STEPS: {
  n: string;
  title: string;
  copy: string;
  icon: LucideIcon;
  image: string;
}[] = [
  {
    n: "1",
    title: "Tell us what you need",
    copy: "Send a photo, broken part, rough sketch, measurements, or just explain the problem.",
    icon: Camera,
    image: PRINTING_VISUALS.replacementPart,
  },
  {
    n: "2",
    title: "We design and print it",
    copy: "We build a custom PLA solution around what you actually need.",
    icon: Cuboid,
    image: PRINTING_VISUALS.customFix,
  },
  {
    n: "3",
    title: "Put it to work",
    copy: "You get a practical part made for real use.",
    icon: CircleCheck,
    image: PRINTING_VISUALS.toolHolder,
  },
];

export function PrintingHow() {
  return (
    <PrintingSection className="bg-gradient-to-b from-black/44 via-black/20 to-black/32">
      <div className={printingContentClass}>
        <PrintingSectionHeader title="How it works" />
        <RevealOnScroll>
          <div className="relative rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-black/52 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_28px_88px_rgba(0,0,0,0.42)] backdrop-blur-[3px] sm:p-8 md:p-10 lg:p-12">
            <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(249,115,22,0.08),transparent)]" aria-hidden />
            <div className="relative grid gap-8 lg:grid-cols-3 lg:gap-8">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <RevealOnScroll key={step.n} delayMs={index * 85}>
                    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-black/42 shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition duration-300 hover:border-orange-500/25 hover:shadow-[0_26px_64px_rgba(0,0,0,0.45)]">
                      <div className="relative h-36 w-full shrink-0 overflow-hidden sm:h-40">
                        <Image
                          src={step.image}
                          alt=""
                          fill
                          className="object-cover transition duration-500 group-hover:scale-[1.04]"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                        <div className="absolute left-4 top-4 flex items-center gap-2">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-amber-300 via-orange-500 to-orange-600 text-base font-bold tabular-nums text-neutral-950 shadow-lg">
                            {step.n}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-6 sm:p-7">
                        <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-orange-300/95">
                          <Icon className="h-5 w-5" strokeWidth={1.65} aria-hidden />
                        </span>
                        <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">{step.title}</h3>
                        <p className="mt-2.5 text-[0.8125rem] leading-[1.68] text-white/52">{step.copy}</p>
                      </div>
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
