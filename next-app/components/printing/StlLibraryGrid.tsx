import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { STL_LIBRARY_SITES, stlSiteInitials } from "@/lib/stl-sites";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass, printingSectionSurfaceClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";
import { cn } from "@/lib/utils";

const STL_HIGHLIGHTS = STL_LIBRARY_SITES.slice(0, 4);

function tagLine(tags: string[]): string {
  return tags.join(" · ");
}

export function StlLibraryGrid() {
  return (
    <PrintingSection
      id="stl-library-resources"
      className="scroll-mt-24 border-b border-white/[0.06] bg-[radial-gradient(ellipse_80%_50%_at_100%_0%,rgba(16,185,129,0.055),transparent)]"
    >
      <div className={printingContentClass}>
        <RevealOnScroll>
          <div className={printingSectionSurfaceClass}>
            <div className="relative z-[2] p-7 md:p-9 lg:p-10 xl:p-11">
              <PrintingSectionHeader
                align="left"
                title="STL libraries"
                subtitle="Need inspiration first? Browse a few of the major STL libraries before having us print, tweak, or customize something for you."
                className="mb-6 max-w-2xl md:mb-8"
              />
              <p className="mb-8 max-w-2xl text-[0.78rem] leading-relaxed text-white/44 md:mb-9">
                Licensing stays with you if you didn&apos;t model it and plan to sell or redistribute.
              </p>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                {STL_HIGHLIGHTS.map((site, index) => (
                  <RevealOnScroll key={site.url} delayMs={index * 50}>
                    <article
                      className={cn(
                        "printing-premium-card group flex h-full flex-col rounded-2xl border border-white/[0.1]",
                        "bg-black/35 px-4 py-4 shadow-[0_14px_40px_rgba(0,0,0,0.28)] backdrop-blur-[2px] sm:px-5 sm:py-[1.125rem]",
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-950/95 text-[9px] font-bold tabular-nums tracking-tight text-orange-300/95 ring-1 ring-white/14"
                          aria-hidden
                        >
                          {stlSiteInitials(site.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-[0.85rem] font-semibold tracking-[-0.02em] text-white">{site.name}</h3>
                          <p className="mt-0.5 truncate text-[10px] leading-snug text-white/36">{tagLine(site.tags)}</p>
                        </div>
                      </div>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.05] py-2.5 text-[0.8125rem] font-semibold text-white/92 transition duration-200 hover:border-orange-500/42 hover:bg-orange-500/[0.12] hover:text-orange-50"
                      >
                        Open
                        <ExternalLink className="h-3.5 w-3.5 opacity-70" strokeWidth={2} aria-hidden />
                      </a>
                    </article>
                  </RevealOnScroll>
                ))}
              </div>

              <p className="mt-6 text-[0.72rem] leading-relaxed text-white/36 md:mt-7">
                More:{" "}
                {STL_LIBRARY_SITES.slice(4).map((s, i) => (
                  <span key={s.url}>
                    {i > 0 ? " · " : null}
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/50 underline-offset-2 hover:text-orange-200/95 hover:underline"
                    >
                      {s.name}
                    </a>
                  </span>
                ))}
                .
              </p>

              <div className="mt-8 border-t border-white/[0.07] pt-8 text-[0.875rem] text-white/52">
                Have a file already?{" "}
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
