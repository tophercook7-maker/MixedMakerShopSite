import Image from "next/image";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";
import { PRINTING_CASE_IMAGES, PRINTING_PROCESS_IMAGES } from "@/components/printing/printing-assets";
import { cn } from "@/lib/utils";
import { PrintingScrollToQuoteCta } from "@/components/printing/PrintingScrollToQuoteCta";

const CASES = [
  {
    title: "Broken part → fixed",
    sentence: "Instead of replacing the whole unit, we recreate the part and get it working again.",
    src: PRINTING_CASE_IMAGES.repair,
    alt: "Cracked plastic part beside a solid 3D-printed PLA replacement on a workbench",
  },
  {
    title: "Messy setup → organized",
    sentence: "Custom holders and organizers that actually fit your bench or wall.",
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
    title: "One-off problem → solved",
    sentence: "Weird angle, obsolete gear, or no SKU — we model and print the fix.",
    src: PRINTING_PROCESS_IMAGES.printing,
    alt: "FDM printer building a functional part in a real shop environment",
  },
] as const;

const PRINT_FOCUS = [
  "Replacement parts",
  "Tool holders",
  "Wall mounts",
  "Organizers",
  "One-off fixes",
] as const;

export function PrintingRealProblems() {
  return (
    <PrintingSection className="border-b border-white/[0.05] bg-[#050608]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent),radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(249,115,22,0.06),transparent)]"
        aria-hidden
      />
      <div className={cn(printingContentClass, "relative")}>
        <RevealOnScroll>
          <div className="relative mx-auto max-w-[80rem]">
            <PrintingSectionHeader
              title="Real problems. Real fixes."
              className="mb-8 md:mb-10 [&_h2]:text-balance [&_h2]:[text-shadow:0_2px_40px_rgba(0,0,0,0.45)]"
            />

            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[0.9375rem] font-medium leading-relaxed text-white/[0.72] md:text-base">
                People don&apos;t come here for decoration.
              </p>
              <p className="mt-5 text-[0.9375rem] leading-[1.85] text-white/48 md:text-base">
                Something broke, doesn&apos;t fit, or doesn&apos;t exist — and it has to work again.
              </p>
              <p className="mt-5 text-[1rem] font-semibold leading-relaxed text-emerald-200/88 md:text-[1.0625rem]">
                That&apos;s what we fix.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:mt-14 xl:grid-cols-4 xl:gap-5">
              {CASES.map(({ title, sentence, src, alt }, index) => (
                <RevealOnScroll key={title} delayMs={index * 65}>
                  <article
                    className={cn(
                      "printing-premium-card group flex h-full flex-col overflow-hidden rounded-2xl",
                      "border border-white/[0.11] bg-black/40 backdrop-blur-md supports-[backdrop-filter]:bg-black/35",
                      "shadow-[0_18px_50px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.04)]",
                    )}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/11]">
                      <Image
                        src={src}
                        alt={alt}
                        fill
                        className="object-cover transition duration-500 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/15" />
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 motion-reduce:group-hover:opacity-0">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(249,115,22,0.1),transparent_55%)]" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-16 sm:px-5 sm:pb-5">
                        <h3 className="text-left text-[0.9375rem] font-semibold leading-snug tracking-[-0.02em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.85)] md:text-base">
                          {title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col border-t border-white/[0.08] px-4 py-4 sm:px-5 sm:py-[1.125rem]">
                      <p className="text-[0.8125rem] leading-[1.65] text-white/55 md:text-[0.8375rem] motion-safe:transition-colors motion-safe:duration-200 group-hover:text-white/68">
                        {sentence}
                      </p>
                    </div>
                  </article>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll delayMs={120}>
              <div className="mt-12 border-t border-white/[0.07] pt-10 md:mt-14 md:pt-12">
                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40">
                  What we print most
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                  {PRINT_FOCUS.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-white/[0.1] bg-black/50 px-3.5 py-2 text-[0.8125rem] font-medium tracking-[-0.02em] text-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-sm"
                    >
                      {label}
                    </span>
                  ))}
                </div>

                <div className="mt-10 flex flex-col items-center gap-3 md:mt-12">
                  <PrintingScrollToQuoteCta className="w-full max-w-md sm:w-auto">
                    Have something like this? Submit a request
                  </PrintingScrollToQuoteCta>
                  <p className="max-w-md text-center text-[0.75rem] leading-relaxed text-white/38">
                    Local builds in Hot Springs · Most requests reviewed within 24 hours
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </RevealOnScroll>
      </div>
    </PrintingSection>
  );
}
