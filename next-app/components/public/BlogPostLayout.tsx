import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FixedHeroMedia } from "@/components/public/FixedHeroMedia";
import { JsonLd } from "@/components/public/JsonLd";
import { BLOG_POSTS } from "@/lib/blog/registry";
import { publicShellClass } from "@/lib/public-brand";
import { SITE_URL } from "@/lib/site";
import {
  mmsBtnPrimary,
  mmsOnGlassMuted,
  mmsOnGlassSecondary,
  mmsSectionEyebrowOnGlass,
  mmsSectionY,
  mmsTextLinkOnGlass,
  mmsUmbrellaSectionBackdropImmersive,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

export const blogArticleProse = cn(
  "blog-article-prose",
  "[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-white md:[&_h2]:text-[1.65rem]",
  "[&_h2:first-of-type]:mt-8",
  "[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:tracking-tight [&_h3]:text-white",
  "[&_p]:mb-6 [&_p]:text-base [&_p]:leading-[1.75] [&_p]:text-white/85 md:[&_p]:text-[17px]",
  "[&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:pl-6 [&_ol]:text-base [&_ol]:leading-[1.7] [&_ol]:text-white/85",
  "[&_ul]:mb-6 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:pl-6 [&_ul]:text-base [&_ul]:leading-[1.7] [&_ul]:text-white/85",
  "[&_li]:pl-1",
  "[&_strong]:font-semibold [&_strong]:text-white",
  "[&_em]:text-white/90",
  "[&_a]:font-semibold [&_a]:text-[#f0c49a] [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:hover:text-white [&_a]:hover:underline",
  "[&_hr]:my-12 [&_hr]:border-white/15",
  "[&_figure]:my-8 [&_figure]:overflow-hidden [&_figure]:rounded-2xl [&_figure]:border [&_figure]:border-white/10",
  "[&_figcaption]:sr-only",
);

type BlogPostLayoutProps = {
  /** Registry slug — used to emit per-article schema (headline, date, description, url). */
  slug: string;
  category: string;
  readTime: string;
  title: string;
  subtitle?: string;
  heroImage?: { src: string; alt: string };
  children: React.ReactNode;
};

export function BlogPostLayout({
  slug,
  category,
  readTime,
  title,
  subtitle,
  heroImage,
  children,
}: BlogPostLayoutProps) {
  const shell = publicShellClass;

  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const absoluteUrl = `${SITE_URL}${post?.href ?? `/blog/${slug}`}`;
  const articleImage = heroImage
    ? heroImage.src.startsWith("http")
      ? heroImage.src
      : `${SITE_URL}${heroImage.src}`
    : `${SITE_URL}/m3-brand.png`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl },
    headline: title,
    description: post?.excerpt ?? subtitle ?? title,
    image: articleImage,
    ...(post?.publishedAt
      ? { datePublished: post.publishedAt, dateModified: post.publishedAt }
      : {}),
    author: { "@type": "Person", name: "Topher Cook", url: `${SITE_URL}/about` },
    publisher: {
      "@type": "Organization",
      name: "MixedMakerShop",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/m3-brand.png` },
    },
    articleSection: category,
    url: absoluteUrl,
  };

  return (
    <main className="home-umbrella-canvas relative w-full antialiased text-[#e4efe9]">
      <JsonLd data={articleSchema} />
      <FixedHeroMedia />
      <div className="relative z-[5] w-full">
        <section className={mmsUmbrellaSectionBackdropImmersive}>
          <div className={cn(shell, mmsSectionY, "pb-24 md:pb-32")}>
            <nav aria-label="Breadcrumb">
              <Link
                href="/blog"
                className={cn(mmsTextLinkOnGlass, "inline-flex items-center gap-2 text-sm font-semibold")}
              >
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                MixedMakerShop Blog
              </Link>
            </nav>

            <header className="public-glass-box public-glass-box--pad mx-auto mt-8 max-w-3xl">
              <p className={mmsSectionEyebrowOnGlass}>{category}</p>
              <p className={cn("mt-4 text-sm", mmsOnGlassMuted)}>{readTime}</p>
              <h1 className="mt-5 text-[1.75rem] font-bold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-[2.35rem] md:leading-[1.12]">
                {title}
              </h1>
              {subtitle ? (
                <p className={cn("mt-5 text-base leading-relaxed md:text-lg", mmsOnGlassSecondary)}>{subtitle}</p>
              ) : null}
            </header>

            {heroImage ? (
              <figure className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-white/10 shadow-lg shadow-black/25">
                <Image
                  src={heroImage.src}
                  alt={heroImage.alt}
                  width={1200}
                  height={675}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </figure>
            ) : null}

            <article className={cn("public-glass-box public-glass-box--pad mx-auto mt-10 max-w-3xl", blogArticleProse)}>
              {children}
            </article>

            <aside className="public-glass-box public-glass-box--pad mx-auto mt-12 max-w-3xl text-center">
              <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">Ready for a mobile-friendly preview?</h2>
              <p className={cn("mx-auto mt-4 max-w-lg text-base leading-relaxed", mmsOnGlassSecondary)}>
                Share your current site and get a free homepage mockup built with clear CTAs, readable type, and a path to
                contact.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  href="/free-mockup"
                  className={cn(mmsBtnPrimary, "inline-flex items-center gap-2 px-6 py-3 no-underline hover:no-underline")}
                >
                  Get a free website mockup
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
                <Link
                  href="/website-roast"
                  className={cn(mmsTextLinkOnGlass, "inline-flex items-center self-center px-2 py-3 text-sm")}
                >
                  Free Website Roast
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

export function BlogArticleImage({ src, alt }: { src: string; alt: string }) {
  return (
    <figure>
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={675}
        className="h-auto w-full object-cover"
        sizes="(max-width: 768px) 100vw, 768px"
      />
      <figcaption>{alt}</figcaption>
    </figure>
  );
}

export function BlogInlineCta({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-10 rounded-2xl border border-[#eab08a]/25 bg-[#b85c1e]/15 px-6 py-7 md:px-8">
      <div className="text-base leading-[1.75] text-white/90 md:text-[17px]">{children}</div>
    </div>
  );
}
