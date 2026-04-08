import Image from "next/image";
import { Camera, Cuboid, CircleCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";
import { cn } from "@/lib/utils";
import { PrintingScrollToQuoteCta } from "@/components/printing/PrintingScrollToQuoteCta";
import { PRINTING_PROCESS_IMAGES } from "@/components/printing/printing-assets";

const PROCESS_IMAGE = PRINTING_PROCESS_IMAGES.printing;

const STEPS: {
  n: string;
  title: string;
  copy: string;
  icon: LucideIcon;
}[] = [
  {
    n: "1",
    title: "Tell me the problem or the part you need",
    copy: "Photo, broken piece, sketch, STL, or a voice memo — whatever explains it fastest.",
    icon: Camera,
  },
  {
    n: "2",
    title: "I help figure out the best print solution",
    copy: "Material choices, orientation, and a realistic timeline — tuned for the part’s job, not just a pretty render.",
    icon: Cuboid,
  },
  {
    n: "3",
    title: "I design, print, and refine if needed",
    copy: "First print, fit check, small adjustments when it matters — then handoff or delivery.",
    icon: CircleCheck,
  },
];

export function PrintingHow() {
  return (
    <PrintingSection className="bg-gradient-to-b from-black/44 via-black/20 to-black/32">
      <div className={printingContentClass}>
        <PrintingSectionHeader
          title="How 3D printing projects work"
          subtitle="Straightforward intake, honest planning, and a print path that matches the real-world fix."
        />
        <RevealOnScroll>
          <div
            className={cn(
              "relative overflow-hidden rounded-[1.5rem] border border-white/[0.1]",
              "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_28px_88px_rgba(0,0,0,0.42)]",
            )}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.5rem]">
              <div className="printing-how-bg-drift absolute -inset-[12%]">
                <Image
                  src={PROCESS_IMAGE}
                  alt="3D printing process in the shop — from intake to finished part"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1280px) 100vw, min(120rem, 100vw)"
                  priority={false}
                />
              </div>
            </div>
            {/* Dim image ~50% — readable text; tune 40–60% range */}
            <div className="pointer-events-none absolute inset-0 bg-black/50" aria-hidden />
            <div
              className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(249,115,22,0.07),transparent)]"
              aria-hidden
            />
            <div className="relative z-[2] p-5 sm:p-7 md:p-9 lg:p-11">
              <div className="grid gap-8 lg:grid-cols-3 lg:gap-6 xl:gap-8">
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <RevealOnScroll key={step.n} delayMs={index * 85}>
                      <div
                        className={cn(
                          "printing-how-card group flex h-full flex-col rounded-2xl border border-white/[0.12]",
                          "bg-black/45 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-md",
                          "supports-[backdrop-filter]:bg-black/40",
                        )}
                      >
                        <div className="flex flex-1 flex-col p-6 sm:p-7">
                          <div className="mb-4 flex items-center gap-2">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-amber-300 via-orange-500 to-orange-600 text-base font-bold tabular-nums text-neutral-950 shadow-lg ring-2 ring-black/40">
                              {step.n}
                            </span>
                          </div>
                          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.08] text-orange-300/95 backdrop-blur-sm">
                            <Icon className="h-5 w-5" strokeWidth={1.65} aria-hidden />
                          </span>
                          <h3 className="text-lg font-semibold tracking-[-0.02em] text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.65)]">
                            {step.title}
                          </h3>
                          <p className="mt-2.5 text-[0.8125rem] leading-[1.68] text-white/70 [text-shadow:0_1px_12px_rgba(0,0,0,0.55)]">
                            {step.copy}
                          </p>
                        </div>
                      </div>
                    </RevealOnScroll>
                  );
                })}
              </div>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delayMs={80}>
          <div className="mt-10 flex flex-col items-center gap-3 md:mt-12">
            <PrintingScrollToQuoteCta variant="outline" className="w-full max-w-md border-white/[0.16] sm:w-auto">
              Send a photo and get a quote
            </PrintingScrollToQuoteCta>
          </div>
        </RevealOnScroll>
      </div>
    </PrintingSection>
  );
}
