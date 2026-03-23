import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { STL_LIBRARY_SITES, stlSiteInitials } from "@/lib/stl-sites";
import { PrintingSection, PrintingSectionHeader } from "@/components/printing/printing-section";

function tagLine(tags: string[]): string {
  return tags.join(" · ");
}

export function StlLibraryGrid() {
  return (
    <PrintingSection id="stl-library-resources" className="scroll-mt-24 bg-[radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(16,185,129,0.05),transparent)]">
      <div className="mx-auto max-w-[72rem] px-5 sm:px-8">
        <PrintingSectionHeader
          align="left"
          eyebrow="Resources"
          title="STL library resources"
          subtitle="Browsing for ideas is fine — when you need a part tweaked, scaled, or printed, that is what we are here for."
          className="mb-5 md:mb-6"
        />
        <p className="mb-12 max-w-3xl text-[0.8125rem] leading-relaxed text-white/45 md:mb-14">
          Always verify licensing before printing or selling a design you did not create.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
          {STL_LIBRARY_SITES.map((site) => (
            <article
              key={site.url}
              className="group flex flex-col rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-5 shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition duration-300 hover:border-white/[0.14] hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:p-6"
            >
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-950/80 text-[11px] font-bold tabular-nums tracking-tight text-orange-300/95 ring-1 ring-white/10"
                    aria-hidden
                  >
                    {stlSiteInitials(site.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-[0.9375rem] font-semibold tracking-[-0.02em] text-white">{site.name}</h3>
                    <p className="mt-0.5 text-[11px] leading-snug text-white/40">{tagLine(site.tags)}</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 flex-1 text-[0.8125rem] leading-[1.62] text-white/55">{site.description}</p>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.03] py-3 text-[0.8125rem] font-semibold text-white/90 transition duration-200 hover:border-orange-500/40 hover:bg-orange-500/[0.12] hover:text-orange-100"
              >
                Open library
                <ExternalLink className="h-3.5 w-3.5 opacity-70" strokeWidth={2} aria-hidden />
              </a>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-6 py-5 md:px-8 md:py-6">
          <p className="text-center text-[0.9375rem] leading-relaxed text-white/70">
            Found a model but need it printed, adjusted, or customized?{" "}
            <Link
              href="/custom-3d-printing"
              className="font-semibold text-orange-400 underline-offset-[3px] hover:text-orange-300 hover:underline"
            >
              Submit a request
            </Link>{" "}
            — we will take a look.
          </p>
        </div>
      </div>
    </PrintingSection>
  );
}
