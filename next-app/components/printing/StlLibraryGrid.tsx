import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { STL_LIBRARY_SITES, stlSiteInitials } from "@/lib/stl-sites";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";
import { printingContentClass, printingSectionSurfaceClass } from "@/components/printing/printing-layout";
import { RevealOnScroll } from "@/components/printing/RevealOnScroll";

function tagLine(tags: string[]): string {
  return tags.join(" · ");
}

export function StlLibraryGrid() {
  return (
    <PrintingSection id="stl-library-resources" className="scroll-mt-24 bg-[radial-gradient(ellipse_80%_50%_at_100%_0%,rgba(16,185,129,0.055),transparent)]">
      <div className={printingContentClass}>
        <RevealOnScroll>
          <div className={printingSectionSurfaceClass}>
            <div className="relative z-[2] p-8 md:p-10 lg:p-11 xl:p-12">
              <PrintingSectionHeader
                align="left"
                title="Need ideas first?"
                subtitle="Need inspiration first? These libraries are useful when you want to browse ideas before having us print, tweak, or customize something."
                className="max-w-4xl"
              />
              <p className="mb-10 max-w-3xl text-[0.8125rem] leading-relaxed text-white/45 md:mb-12">
                Always verify licensing on any file you didn&apos;t model yourself — especially for resale.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
                {STL_LIBRARY_SITES.map((site, index) => (
                  <RevealOnScroll key={site.url} delayMs={index * 70}>
                    <article className="group flex h-full flex-col rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-black/48 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.28)] transition duration-300 hover:border-white/[0.17] hover:shadow-[0_24px_60px_rgba(0,0,0,0.36)] sm:p-6">
                      <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-950/95 text-[11px] font-bold tabular-nums tracking-tight text-orange-300/95 ring-1 ring-white/14"
                            aria-hidden
                          >
                            {stlSiteInitials(site.name)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-[0.9375rem] font-semibold tracking-[-0.02em] text-white">{site.name}</h3>
                            <p className="mt-0.5 text-[11px] leading-snug text-white/38">{tagLine(site.tags)}</p>
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 flex-1 text-[0.8125rem] leading-[1.62] text-white/53">{site.description}</p>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.14] bg-white/[0.04] py-3 text-[0.8125rem] font-semibold text-white/92 transition duration-200 hover:border-orange-500/45 hover:bg-orange-500/[0.14] hover:text-orange-50"
                      >
                        Open library
                        <ExternalLink className="h-3.5 w-3.5 opacity-70" strokeWidth={2} aria-hidden />
                      </a>
                    </article>
                  </RevealOnScroll>
                ))}
              </div>

              <div className="mt-12 rounded-2xl border border-orange-500/22 bg-orange-500/[0.07] px-6 py-5 md:mt-14 md:px-8 md:py-6">
                <p className="text-center text-[0.9375rem] leading-relaxed text-white/72">
                  Have a file or a rough idea?{" "}
                  <Link
                    href="/custom-3d-printing"
                    className="font-semibold text-orange-300 underline-offset-[3px] hover:text-orange-200 hover:underline"
                  >
                    Submit a request
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </PrintingSection>
  );
}
