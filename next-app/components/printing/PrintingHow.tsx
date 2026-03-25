import Image from "next/image";
import { Camera, Cuboid, CircleCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";
import { PRINTING_PROCESS_IMAGES } from "@/components/printing/printing-assets";
import { cn } from "@/lib/utils";

const STEPS: {
  n: string;
  title: string;
  copy: string;
  icon: LucideIcon;
  visual: "photo" | "panel";
  image?: string;
  alt?: string;
  panelClass?: string;
}[] = [
  {
    n: "1",
    title: "Tell us what you need",
    copy: "Photo, broken piece, sketch, or a voice memo — whatever explains the problem fastest.",
    icon: Camera,
    visual: "photo",
    image: PRINTING_PROCESS_IMAGES.intake,
    alt: "Phone photo of a broken plastic part on a workbench with measuring tools",
  },
  {
    n: "2",
    title: "We design and print",
    copy: "Custom PLA geometry, tuned for strength where it matters — then printed here in the shop.",
    icon: Cuboid,
    visual: "panel",
    panelClass:
      "from-orange-950/80 via-neutral-950 to-emerald-950/50 bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2740%27 height=%2740%27%3E%3Cpath d=%27M0 40h40M40 0v40%27 fill=%27none%27 stroke=%27%23ffffff%27 stroke-opacity=%270.04%27/%3E%3C/svg%3E')]",
  },
  {
    n: "3",
    title: "Install and use it",
    copy: "Pick up or arrange delivery — bolt it on, clip it in, get back to work.",
    icon: CircleCheck,
    visual: "panel",
    panelClass: "from-emerald-950/70 via-neutral-950 to-black bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(16,185,129,0.15),transparent)]",
  },
];

export function PrintingHow() {
  return (
    <PrintingSection className="bg-gradient-to-b from-black/44 via-black/20 to-black/32">
      <div className={printingContentClass}>
        <PrintingSectionHeader
          title="How it works"
          subtitle="From the mess on your bench to the part in your hand — three steps."
        />
        <RevealOnScroll>
          <div className="relative rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-black/52 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_28px_88px_rgba(0,0,0,0.42)] backdrop-blur-[3px] sm:p-7 md:p-9 lg:p-11">
            <div
              className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(249,115,22,0.08),transparent)]"
              aria-hidden
            />
            <div className="relative grid gap-8 lg:grid-cols-3 lg:gap-6 xl:gap-8">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <RevealOnScroll key={step.n} delayMs={index * 85}>
                    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-black/42 shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition duration-300 hover:border-orange-500/25 hover:shadow-[0_26px_64px_rgba(0,0,0,0.45)]">
                      <div
                        className={cn(
                          "relative aspect-[16/11] w-full shrink-0 overflow-hidden sm:aspect-[5/3] lg:aspect-[4/3]",
                          step.visual === "panel" &&
                            cn(
                              "bg-gradient-to-br",
                              step.panelClass,
                            ),
                        )}
                      >
                        {step.visual === "photo" && step.image ? (
                          <>
                            <Image
                              src={step.image}
                              alt={step.alt ?? ""}
                              fill
                              className="object-cover transition duration-500 group-hover:scale-[1.04]"
                              sizes="(max-width: 1024px) 100vw, 34vw"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/88 via-black/25 to-transparent" />
                          </>
                        ) : (
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-white/[0.04]" />
                        )}
                        <div className="absolute left-4 top-4 flex items-center gap-2">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-amber-300 via-orange-500 to-orange-600 text-base font-bold tabular-nums text-neutral-950 shadow-lg ring-2 ring-black/40">
                            {step.n}
                          </span>
                        </div>
                        {step.visual === "panel" ? (
                          <div className="absolute inset-0 flex items-center justify-center pb-6 opacity-[0.9] transition duration-300 group-hover:opacity-100 group-hover:scale-[1.02]">
                            <div className="rounded-2xl border border-white/[0.12] bg-black/35 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-sm ring-1 ring-orange-500/10">
                              <Icon className="h-12 w-12 text-orange-300/90" strokeWidth={1.35} aria-hidden />
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className="relative flex flex-1 flex-col p-6 sm:p-7">
                        <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05] text-orange-300/95">
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
