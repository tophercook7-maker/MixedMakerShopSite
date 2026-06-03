import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { BlogIndexBrowser } from "@/components/public/BlogIndexBrowser";
import { publicShellClass } from "@/lib/public-brand";
import { SITE_URL } from "@/lib/site";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsH3OnGlassLg,
  mmsOnGlassMuted,
  mmsOnGlassPrimary,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsTextLinkOnGlass,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const canonical = `${SITE_URL}/blog`;

export const metadata: Metadata = {
  title: "MixedMakerShop Blog",
  description:
    "Helpful website tips for small businesses — practical advice on design, local SEO, lead generation, and marketing without tech overwhelm.",
  alternates: { canonical },
  openGraph: {
    title: "MixedMakerShop Blog",
    description:
      "Simple, practical advice for business owners who want a better website, stronger online presence, and more leads.",
    url: canonical,
  },
};

const shell = publicShellClass;

export default function BlogPage() {
  return (
    <main className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>MixedMakerShop Blog</p>
              <h1 className="mt-5 break-words text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                Helpful Website Tips for Small Businesses
              </h1>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                Simple, practical advice for business owners who want a better website, stronger online presence, and
                more leads without getting buried in tech talk.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#browse-articles"
                  className={cn(mmsBtnPrimary, "inline-flex items-center gap-2 px-6 py-3 no-underline hover:no-underline")}
                >
                  Browse &amp; filter articles
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
                <Link
                  href="/free-mockup"
                  className={cn(mmsBtnSecondaryOnGlass, "inline-flex items-center gap-2 px-6 py-3 no-underline hover:no-underline")}
                >
                  Free website mockup
                </Link>
                <Link
                  href="/"
                  className={cn(mmsBtnSecondaryOnGlass, "inline-flex px-6 py-3 no-underline hover:no-underline")}
                >
                  Explore services
                </Link>
              </div>
              <p className={cn("mt-4 text-sm", mmsOnGlassMuted)}>
                Search by topic, sort by date, or show only articles ready to read — controls are just below.
              </p>
            </div>

            <BlogIndexBrowser />

            <div className="public-glass-box public-glass-box--pad mx-auto mt-16 max-w-3xl text-center md:mt-20">
              <h2 className={cn(mmsH3OnGlassLg, "text-2xl md:text-3xl")}>Want your website to work harder?</h2>
              <p className={cn("mx-auto mt-5 max-w-xl text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>
                MixedMakerShop can help you turn a rough idea, outdated site, or simple business page into something
                clean, useful, and ready to share.
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  href="/free-mockup"
                  className={cn(mmsBtnPrimary, "inline-flex items-center gap-2 px-6 py-3 no-underline hover:no-underline")}
                >
                  Start with a free mockup
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
              </div>
              <p className={cn("mt-6 text-sm", mmsOnGlassMuted)}>
                Questions?{" "}
                <Link href="/contact" className={cn(mmsTextLinkOnGlass, "font-semibold")}>
                  Contact MixedMakerShop
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
