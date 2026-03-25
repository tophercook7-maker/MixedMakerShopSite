import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { STL_LIBRARY_SITES, stlSiteInitials } from "@/lib/stl-sites";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass, printingSectionSurfaceClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";

/** Curated picks — full list lives in `@/lib/stl-sites`. */
const STL_HIGHLIGHTS = STL_LIBRARY_SITES.slice(0, 4);

function tagLine(tags: string[]): string {
  return tags.join(" · ");
}

export function StlLibraryGrid() {
  return (
    <PrintingSection
      id="stl-library-resources"
      className="scroll-mt-24 border-b border-white/[0.06] bg-[radial-gradient(ellipse_80%_50%_at_100%_0%,rgba(16,185,129,0.055),transparent)] py-[4.25rem] md:py-[5.5rem] lg:py-[6.25rem]"
    >
      <div className={printingContentClass}>
        <RevealOnScroll>
          <div className={printingSectionSurfaceClass}>
            <div className="relative z-[2] p-7 md:p-9 lg:p-10">
              <PrintingSectionHeader
                align="left"
                title="Need a reference file?"
                subtitle="Skim a library for ideas. We print your file, remix it, or model from your photos — whichever fits."
                className="mb-5 max-w-2xl md:mb-6"
              />
              <p className="mb-7 max-w-2xl text-[0.75rem] leading-relaxed text-white/42 md:mb-8">
                Licensing is on you if you didn&apos;t create the model and plan to sell or redistribute it.
              </p>

              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
                {STL_HIGHLIGHTS.map((site, index) => (
                  <RevealOnScroll key={site.url} delayMs={index * 45}>
                    <article className="group flex h-full flex-col rounded-xl border border-white/[0.1] bg-gradient-to-b from-white/[0.05] to-black/44 px-4 py-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.22)] transition duration-300 hover:border-white/[0.16] sm:px-4 sm:py-4">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-950/95 text-[9px] font-bold tabular-nums tracking-tight text-orange-300/95 ring-1 ring-white/14"
                          aria-hidden
                        >
                          {stlSiteInitials(site.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-[0.8125rem] font-semibold tracking-[-0.02em] text-white">{site.name}</h3>
                          <p className="mt-0.5 truncate text-[9px] leading-snug text-white/35">{tagLine(site.tags)}</p>
                        </div>
                      </div>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] py-2 text-[0.75rem] font-semibold text-white/90 transition duration-200 hover:border-orange-500/45 hover:bg-orange-500/[0.12] hover:text-orange-50"
                      >
                        Open
                        <ExternalLink className="h-3 w-3 opacity-70" strokeWidth={2} aria-hidden />
                      </a>
                    </article>
                  </RevealOnScroll>
                ))}
              </div>

              <p className="mt-5 text-[0.7rem] leading-relaxed text-white/38 md:mt-6">
                Also try:{" "}
                {STL_LIBRARY_SITES.slice(4).map((s, i) => (
                  <span key={s.url}>
                    {i > 0 ? " · " : null}
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/55 underline-offset-2 hover:text-orange-200/95 hover:underline"
                    >
                      {s.name}
                    </a>
                  </span>
                ))}
                .
              </p>

              <div className="mt-7 border-t border-white/[0.07] pt-7 text-center text-[0.875rem] text-white/55 md:mt-8 md:pt-8">
                Already have an STL?{" "}
                <Link
                  href="/custom-3d-printing"
                  className="font-semibold text-orange-300 underline-offset-[3px] hover:text-orange-200 hover:underline"
                >
                  Submit a request
                </Link>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PrintingSection>
  );
}
