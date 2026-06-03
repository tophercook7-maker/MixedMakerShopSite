import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { isBlogPostPublished, type BlogIndexPost } from "@/lib/blog/registry";
import { mmsOnGlassMuted, mmsOnGlassSecondary } from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

export function BlogPostCard({ post }: { post: BlogIndexPost }) {
  const published = isBlogPostPublished(post);

  const inner = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c5ddd2]/90">{post.category}</p>
        {post.featured ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#eab08a]/35 bg-[#b85c1e]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#f0c49a]">
            <Sparkles className="h-2.5 w-2.5 shrink-0" aria-hidden />
            Featured
          </span>
        ) : null}
        {!published ? (
          <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/70">
            Coming soon
          </span>
        ) : null}
        <p className={cn("ml-auto inline-flex items-center gap-1.5 text-xs", mmsOnGlassMuted)}>
          <Clock className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          {post.readTime}
        </p>
      </div>
      <h3 className="mt-3 text-lg font-bold tracking-tight text-white">{post.title}</h3>
      <p className={cn("mt-4 flex-1 text-sm leading-relaxed md:text-[15px]", mmsOnGlassSecondary)}>{post.excerpt}</p>
      {published ? (
        <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#f0c49a]">
          Read article
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </p>
      ) : (
        <p className={cn("mt-6 text-sm italic", mmsOnGlassMuted)}>Article in progress — check back soon.</p>
      )}
    </>
  );

  const className = cn(
    "flex h-full flex-col public-glass-box--soft public-glass-box--pad border border-white/[0.12]",
    published && "transition-[border-color,box-shadow] duration-200 hover:border-white/25 hover:shadow-lg hover:shadow-black/20",
    !published && "opacity-95",
  );

  if (published && post.href) {
    return (
      <Link href={post.href} className={cn(className, "no-underline hover:no-underline")}>
        {inner}
      </Link>
    );
  }

  return <article className={className}>{inner}</article>;
}
