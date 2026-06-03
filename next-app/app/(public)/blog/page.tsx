import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { publicShellClass } from "@/lib/public-brand";
import { FEATURED_BLOG_POST, MORE_BLOG_POSTS, type BlogIndexPost } from "@/lib/blog/registry";
import { SITE_URL } from "@/lib/site";
import {
  mmsBtnPrimary,
  mmsBtnSecondaryOnGlass,
  mmsH2OnGlass,
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

function BlogCard({ post, featured = false }: { post: BlogIndexPost; featured?: boolean }) {
  const inner = (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c5ddd2]/90">{post.category}</p>
        <p className={cn("inline-flex items-center gap-1.5 text-xs", mmsOnGlassMuted)}>
          <Clock className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          {post.readTime}
        </p>
      </div>
      <h2
        className={cn(
          "mt-3 font-bold tracking-tight text-white",
          featured ? "text-2xl md:text-3xl" : "text-lg",
        )}
      >
        {post.title}
      </h2>
      <p
        className={cn(
          "mt-4 flex-1 leading-relaxed",
          featured ? "text-base md:text-lg" : "text-sm md:text-[15px]",
          mmsOnGlassSecondary,
        )}
      >
        {post.excerpt}
      </p>
      {post.href ? (
        <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#f0c49a]">
          Read article
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </p>
      ) : null}
    </>
  );

  const className = cn(
    "flex h-full flex-col border border-white/[0.08] transition-[border-color,box-shadow] duration-200",
    featured
      ? "public-glass-box public-glass-box--pad lg:flex-row lg:items-stretch lg:gap-10"
      : "public-glass-box--soft public-glass-box--pad",
    post.href && "hover:border-white/20 hover:shadow-lg hover:shadow-black/20",
  );

  if (post.href) {
    return (
      <Link href={post.href} className={cn(className, "no-underline hover:no-underline")}>
        <div className={cn("flex flex-1 flex-col", featured && "lg:justify-center")}>{inner}</div>
      </Link>
    );
  }

  return (
    <article className={className}>
      <div className={cn("flex flex-1 flex-col", featured && "lg:justify-center")}>{inner}</div>
    </article>
  );
}

export default function BlogPage() {
  return (
    <main className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY)}>
            <div className="public-glass-box public-glass-box--pad max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>MixedMakerShop Blog</p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Helpful Website Tips for Small Businesses
              </h1>
              <p className={cn("mt-6 text-base leading-relaxed md:text-lg", mmsOnGlassPrimary)}>
                Simple, practical advice for business owners who want a better website, stronger online presence, and
                more leads without getting buried in tech talk.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
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

            <div className="mt-14 md:mt-16">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <h2 className={cn(mmsH2OnGlass, "text-2xl md:text-3xl")}>Latest article</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#eab08a]/35 bg-[#b85c1e]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#f0c49a]">
                  <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
                  Featured
                </span>
              </div>
              <BlogCard post={FEATURED_BLOG_POST} featured />
            </div>

            <div className="mt-14 md:mt-16">
              <h2 className={cn(mmsH2OnGlass, "text-2xl md:text-3xl")}>More articles</h2>
              <p className={cn("mt-3 max-w-2xl text-sm leading-relaxed md:text-base", mmsOnGlassSecondary)}>
                Short reads on websites, local visibility, and turning traffic into real inquiries.
              </p>
              <div className="mt-10 grid gap-5 md:grid-cols-2">
                {MORE_BLOG_POSTS.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            </div>

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
