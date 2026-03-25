import Image from "next/image";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";
import { PRINTING_CASE_IMAGES, PRINTING_PROCESS_IMAGES } from "@/components/printing/printing-assets";
import { cn } from "@/lib/utils";

const CASES = [
  {
    title: "Broken part → fixed",
    sentence: "Instead of replacing the whole unit, we recreate the part and get it working again.",
    src: PRINTING_CASE_IMAGES.repair,
    alt: "Cracked plastic part beside a solid 3D-printed PLA replacement on a workbench",
  },
  {
    title: "Messy setup → organized",
    sentence: "Custom holders that actually fit your setup.",
    src: PRINTING_CASE_IMAGES.organize,
    alt: "Workbench tools and a custom printed organizer holding tools in real workspace context",
  },
  {
    title: "No mount → clean install",
    sentence: "Mount anything exactly where you need it.",
    src: PRINTING_CASE_IMAGES.mount,
    alt: "Wall-mounted 3D-printed bracket holding gear in a real installation context",
  },
  {
    title: "Custom problem → solved",
    sentence: "One-off solutions for real problems.",
    src: PRINTING_PROCESS_IMAGES.printing,
    alt: "FDM printer building a functional part in a real shop environment",
  },
] as const;

export function PrintingRealProblems() {
  return (
    <PrintingSection className="border-b border-white/[0.05] bg-[#050608] pb-[5rem] pt-[4.25rem] md:pb-[6.5rem] md:pt-[5.25rem] lg:pb-[7rem] lg:pt-[5.75rem]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent),radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(249,115,22,0.06),transparent)]"
        aria-hidden
      />
      <div className={cn(printingContentClass, "relative")}>
        <RevealOnScroll>
          <div className="relative mx-auto max-w-[80rem]">
            <PrintingSectionHeader
              title="Real problems. Real fixes."
              className="mb-10 md:mb-12 [&_h2]:text-balance [&_h2]:[text-shadow:0_2px_40px_rgba(0,0,0,0.45)]"
            />

            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[0.9375rem] font-medium leading-relaxed text-white/[0.72] md:text-base">
                People don&apos;t come here for decoration.
              </p>
              <p className="mt-6 text-[0.9375rem] leading-[1.85] text-white/50 md:text-base">
                They come here because something broke…
                <br />
                doesn&apos;t fit…
                <br />
                or doesn&apos;t exist.
              </p>
              <p className="mt-6 text-[1rem] font-semibold leading-relaxed text-emerald-200/88 md:text-[1.0625rem]">
                And they need it fixed.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:mt-16 xl:grid-cols-4 xl:gap-5">
              {CASES.map(({ title, sentence, src, alt }, index) => (
                <RevealOnScroll key={title} delayMs={index * 70}>
                  <article
                    className={cn(
                      "group flex h-full flex-col overflow-hidden rounded-[1.25rem]",
                      "border border-white/[0.09] bg-gradient-to-b from-white/[0.04] to-black/75",
                      "shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_56px_rgba(0,0,0,0.55),0_0_48px_-12px_rgba(249,115,22,0.12)]",
                      "transition duration-300 ease-out",
                      "hover:-translate-y-1 hover:border-orange-500/25",
                      "hover:shadow-[0_0_0_1px_rgba(249,115,22,0.15),0_32px_72px_rgba(0,0,0,0.6),0_0_64px_-8px_rgba(249,115,22,0.22)]",
                    )}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/11]">
                      <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-cover transition duration-500 ease-out group-hover:scale-[1.045]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/15" />
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(249,115,22,0.12),transparent_55%)]" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-16 sm:px-5 sm:pb-5">
                        <h3 className="text-left text-[0.9375rem] font-semibold leading-snug tracking-[-0.02em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.85)] md:text-base">
                          {title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col border-t border-white/[0.07] px-4 py-4 sm:px-5 sm:py-[1.125rem]">
                      <p className="text-[0.8125rem] leading-[1.65] text-white/48 md:text-[0.8375rem]">{sentence}</p>
                    </div>
                  </article>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PrintingSection>
  );
}
