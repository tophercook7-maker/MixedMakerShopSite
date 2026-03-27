import Image from "next/image";
import { cn } from "@/lib/utils";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { printingContentClass } from "@/components/printing/printing-layout";
import { PRINTING_CASE_IMAGES, PRINTING_PROCESS_IMAGES } from "@/components/printing/printing-assets";
import { publicCardGlassPrintClass, publicEyebrowPrintClass, publicH2PrintClass } from "@/lib/public-brand";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";
import { ArrowRight } from "lucide-react";

const PROOF = [
  {
    href: "/3d-printing#replacement-parts",
    src: PRINTING_CASE_IMAGES.repair,
    alt: "Cracked plastic part beside a solid 3D-printed replacement on a workbench",
    problem: "Discontinued or broken part",
    outcome: "Recreate the piece so equipment works again—without replacing the whole unit.",
  },
  {
    href: "/3d-printing#functional-prints",
    src: PRINTING_CASE_IMAGES.organize,
    alt: "Custom printed organizer with tools in a real workspace",
    problem: "Chaotic truck, bench, or cabinet",
    outcome: "Holders and organizers sized for your tools and space—not a one-size tray.",
  },
  {
    href: "/3d-printing#custom-solutions",
    src: PRINTING_CASE_IMAGES.mount,
    alt: "3D-printed bracket mounted in use",
    problem: "No bracket or clip that fits",
    outcome: "Custom mount or clip designed for your angle, surface, or hardware.",
  },
  {
    href: "/3d-printing#prototypes",
    src: PRINTING_PROCESS_IMAGES.printing,
    alt: "FDM printer building a functional part",
    problem: "One-off fix or prototype",
    outcome: "Test fit and function before you invest in tooling or a bigger run.",
  },
] as const;

export function PrintingProofStrip() {
  return (
    <section
      aria-labelledby="printing-proof-heading"
      className="border-b border-white/[0.06] bg-[#050908] py-14 md:py-[4.25rem]"
    >
      <div className={printingContentClass}>
        <RevealOnScroll>
          <div className="mx-auto max-w-3xl text-center lg:max-w-4xl">
            <p className={publicEyebrowPrintClass}>Proof</p>
            <h2 id="printing-proof-heading" className={cn("mt-4", publicH2PrintClass)}>
              Real prints, practical outcomes
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-white/55 md:text-base">
              Problem-first work: broken parts, organization, mounts, and prototypes—using photos from actual builds.
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {PROOF.map((item, index) => (
            <RevealOnScroll key={item.href} delayMs={index * 60}>
              <TrackedPublicLink
                href={item.href}
                eventName="public_3d_sample_click"
                eventProps={{ location: "print_proof_strip", label: item.problem }}
                className={cn(
                  publicCardGlassPrintClass,
                  "group flex h-full flex-col overflow-hidden p-0 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-orange-400/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050908]",
                )}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.04]"
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-4 md:p-5">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-orange-300/85">
                    {item.problem}
                  </p>
                  <p className="mt-2 text-[0.9375rem] font-medium leading-snug text-white md:text-base">{item.outcome}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-white/70 transition group-hover:text-orange-200">
                    See this story
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </TrackedPublicLink>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
