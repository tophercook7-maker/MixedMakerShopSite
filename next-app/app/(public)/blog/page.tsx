import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { BlogFiltersPanel } from "@/components/public/BlogFiltersPanel";
import { BlogPostCard } from "@/components/public/BlogPostCard";
import { getFilteredBlogPosts, parseBlogListQuery } from "@/lib/blog/blog-search-params";
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

type BlogPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function BlogPage({ searchParams }: BlogPageProps) {
  const query = parseBlogListQuery(searchParams);
  const posts = getFilteredBlogPosts(query);

  return (
    <div className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY, "overflow-visible")}>
            <div className="w-full max-w-4xl">
              <p className={mmsSectionEyebrowOnGlass}>MixedMakerShop Blog</p>
              <h1 className="mt-5 break-words text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                Helpful Website Tips for Small Businesses
              </h1>
              <p className={cn("mt-6 max-w-3xl text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                Simple, practical advice for business owners who want a better website, stronger online presence, and
                more leads without getting buried in tech talk.
              </p>

              <BlogFiltersPanel query={query} resultCount={posts.length} />

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/free-mockup"
                  className={cn(mmsBtnPrimary, "inline-flex items-center gap-2 px-6 py-3 no-underline hover:no-underline")}
                >
                  Get a free website mockup
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
                <Link
                  href="/"
                  className={cn(mmsBtnSecondaryOnGlass, "inline-flex px-6 py-3 no-underline hover:no-underline")}
                >
                  Explore services
                </Link>
              </div>
            </div>

            {posts.length > 0 ? (
              <div className="mt-10 grid w-full gap-5 md:grid-cols-2">
                {posts.map((post) => (
                  <BlogPostCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <p className={cn("mt-10 text-center text-base", mmsOnGlassSecondary)}>
                No articles match.{" "}
                <Link href="/blog" className="font-semibold text-[#f0c49a] underline-offset-2 hover:underline">
                  Show all articles
                </Link>
              </p>
            )}

            <div className="public-glass-box public-glass-box--pad mx-auto mt-16 w-full max-w-3xl text-center md:mt-20">
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
    </div>
  );
}
