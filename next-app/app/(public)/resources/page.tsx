import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { publicShellClass } from "@/lib/public-brand";
import { RESOURCE_ENTRIES, categoryLabel } from "@/lib/resources/registry";
import { SITE_URL } from "@/lib/site";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsH2OnGlass,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsTextLinkOnGlass,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const canonical = `${SITE_URL}/resources`;

export const metadata: Metadata = {
  title: "Resource library | MixedMakerShop",
  description:
    "Checklists and prep sheets for websites, local presence, 3D print requests, AI workflows, and project planning — request what you need from Mixed Maker Shop.",
  alternates: { canonical },
  openGraph: {
    title: "Resource library | MixedMakerShop",
    description:
      "Practical downloads and prep sheets for small businesses and makers — delivered after request.",
    url: canonical,
  },
};

const shell = publicShellClass;

export default function ResourcesIndexPage() {
  return (
    <main className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>Resource library</p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Practical sheets for websites, prints, and operations
              </h1>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                Each resource is built from real client and shop workflows — focused checklists you can actually use, not
                generic fluff. Request what fits; Topher sends it after your note lands (PDF links unlock here as files are
                published).
              </p>
              <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                Prefer the in-page forms? Jump to{" "}
                <Link href="/websites-tools#templates-kits" className={cn(mmsTextLinkOnGlass, "font-semibold")}>
                  Websites &amp; Tools → Starter resources
                </Link>{" "}
                and submit from there — same queue, same delivery flow.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/websites-tools#templates-kits"
                  className={cn(mmsBtnPrimary, "inline-flex items-center gap-2 px-6 py-3 no-underline hover:no-underline")}
                >
                  Request a resource
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
                <Link
                  href="/websites-tools"
                  className={cn(mmsBtnSecondaryOnGlass, "inline-flex px-6 py-3 no-underline hover:no-underline")}
                >
                  Back to Websites &amp; Tools
                </Link>
              </div>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {RESOURCE_ENTRIES.map((r) => (
                <article
                  key={r.slug}
                  className="public-glass-box--soft public-glass-box--pad flex h-full flex-col border border-white/[0.08]"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c5ddd2]/90">
                    {categoryLabel(r.category)}
                  </p>
                  <h3 className="mt-3 text-lg font-bold tracking-tight text-white">{r.title}</h3>
                  <p className={cn("mt-3 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>
                    {r.shortDescription}
                  </p>
                  <p className={cn("mt-4 text-xs leading-relaxed text-white/55")}>
                    <span className="font-semibold text-white/75">Best for:</span> {r.whoItHelps}
                  </p>
                  <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-5">
                    <Link
                      href={`/resources/${r.slug}`}
                      className={cn(mmsTextLinkOnGlass, "inline-flex items-center gap-2 text-sm font-semibold")}
                    >
                      View details
                      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                    </Link>
                    <Link href="/websites-tools#templates-kits" className={cn(mmsTextLinkOnGlass, "text-sm font-medium opacity-90")}>
                      Request this resource →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
