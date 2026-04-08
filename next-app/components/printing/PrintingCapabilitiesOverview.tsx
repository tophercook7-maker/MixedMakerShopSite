import Link from "next/link";
import { cn } from "@/lib/utils";
import { printingContentClass, printingSectionSurfaceClass } from "@/components/printing/printing-layout";
import { printingSecondaryCtaClass } from "@/components/printing/printing-section";

const MAKES = [
  "Replacement parts",
  "Custom mounts",
  "Clips and holders",
  "Prototypes",
  "Organizers",
  "Practical one-off solutions",
  "Custom problem-solving",
] as const;

/**
 * Simple overview below the existing 3D hero — additive only; keeps full page funnel intact.
 */
export function PrintingCapabilitiesOverview() {
  return (
    <section className="border-b border-white/[0.06] py-12 md:py-16" aria-labelledby="printing-capabilities-heading">
      <div className={printingContentClass}>
        <div className={cn(printingSectionSurfaceClass, "p-6 sm:p-8 md:p-10")}>
          <h2 id="printing-capabilities-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            What I can help with
          </h2>
          <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-white/[0.88] md:text-lg">
            The printers are only half the story —{" "}
            <span className="text-white/[0.94]">design sense, slicer tuning, and honest timelines</span> are what turn a
            mesh into something you can actually use. Tell me what you&apos;re fixing, building, or testing.
          </p>
          <h3 className="mt-10 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200/85">Common requests</h3>
          <ul className="mt-4 grid gap-2.5 text-[0.95rem] leading-relaxed text-white/[0.82] sm:grid-cols-2 sm:gap-x-8">
            {MAKES.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-emerald-300/90" aria-hidden>
                  ·
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-2xl border border-white/[0.08] bg-black/20 px-5 py-6 md:px-6">
            <h3 className="text-base font-semibold text-white">Have an idea?</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/[0.78]">
              Tell me what you&apos;re trying to build or fix — I&apos;ll get back to you with next steps.
            </p>
            <Link
              href="/contact"
              className={cn(
                printingSecondaryCtaClass,
                "mt-5 inline-flex min-h-[3rem] items-center justify-center px-8 text-[0.96875rem] font-semibold",
              )}
            >
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
