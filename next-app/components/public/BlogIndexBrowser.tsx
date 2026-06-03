"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Clock, Search, Sparkles } from "lucide-react";
import {
  BLOG_CATEGORIES,
  BLOG_POSTS,
  filterBlogPosts,
  isBlogPostPublished,
  sortBlogPosts,
  type BlogIndexPost,
  type BlogSortKey,
} from "@/lib/blog/registry";
import {
  mmsH2OnGlass,
  mmsOnGlassMuted,
  mmsOnGlassSecondary,
} from "@/lib/mms-umbrella-ui";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: BlogSortKey; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "Title A–Z" },
  { value: "quick-read", label: "Quickest read" },
];

const chipBase = cn(
  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
  "border-white/15 bg-white/5 text-[#d8ebe3] hover:border-white/25 hover:bg-white/10",
);

const chipActive = "border-[#eab08a]/40 bg-[#b85c1e]/25 text-[#f5d4b8]";

function BlogCard({ post }: { post: BlogIndexPost }) {
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
          <span className="rounded-full border border-white/20 bg-white/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/55">
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
    "flex h-full flex-col public-glass-box--soft public-glass-box--pad border border-white/[0.08] transition-[border-color,box-shadow,opacity] duration-200",
    published && "hover:border-white/20 hover:shadow-lg hover:shadow-black/20",
    !published && "opacity-[0.92]",
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

export function BlogIndexBrowser() {
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<BlogSortKey>("recommended");
  const [query, setQuery] = useState("");
  const [publishedOnly, setPublishedOnly] = useState(false);

  const filtered = useMemo(() => {
    const narrowed = filterBlogPosts(BLOG_POSTS, { category, query, publishedOnly });
    return sortBlogPosts(narrowed, sort);
  }, [category, query, publishedOnly, sort]);

  const hasActiveFilters = Boolean(category || query.trim() || publishedOnly || sort !== "recommended");

  return (
    <div className="mt-14 md:mt-16">
      <h2 className={cn(mmsH2OnGlass, "text-2xl md:text-3xl")}>Browse articles</h2>
      <p className={cn("mt-3 max-w-2xl text-sm leading-relaxed md:text-base", mmsOnGlassSecondary)}>
        Filter by topic, sort how you like, or search by keyword to find the read that fits your situation.
      </p>

      <div
        className="public-glass-box public-glass-box--pad mt-8 space-y-5"
        role="search"
        aria-label="Filter and sort blog articles"
      >
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles and topics…"
            className={cn(
              "w-full rounded-xl border border-white/12 bg-black/25 py-2.5 pl-10 pr-4 text-sm text-white",
              "placeholder:text-white/40 focus:border-[#eab08a]/45 focus:outline-none focus:ring-1 focus:ring-[#eab08a]/30",
            )}
            aria-label="Search blog articles"
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c5ddd2]/80">Topic</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
              <button type="button" className={cn(chipBase, !category && chipActive)} onClick={() => setCategory("")}>
                All topics
              </button>
              {BLOG_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={cn(chipBase, category === cat && chipActive)}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 sm:shrink-0">
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c5ddd2]/80">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as BlogSortKey)}
                className={cn(
                  "min-w-[10.5rem] rounded-xl border border-white/12 bg-black/25 px-3 py-2 text-sm text-white",
                  "focus:border-[#eab08a]/45 focus:outline-none focus:ring-1 focus:ring-[#eab08a]/30",
                )}
                aria-label="Sort articles"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#1e241f]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#c5ddd2]/80">
                Availability
              </span>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by availability">
                <button
                  type="button"
                  className={cn(chipBase, !publishedOnly && chipActive)}
                  onClick={() => setPublishedOnly(false)}
                >
                  All
                </button>
                <button
                  type="button"
                  className={cn(chipBase, publishedOnly && chipActive)}
                  onClick={() => setPublishedOnly(true)}
                >
                  Ready to read
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <p className="text-sm text-[#c5ddd2]/90" aria-live="polite">
            {filtered.length === 0
              ? "No articles match — try another topic or clear your search."
              : `${filtered.length} article${filtered.length === 1 ? "" : "s"}`}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              className="text-xs font-semibold text-[#f0c49a] underline-offset-2 hover:underline"
              onClick={() => {
                setCategory("");
                setQuery("");
                setPublishedOnly(false);
                setSort("recommended");
              }}
            >
              Reset filters
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className={cn("mt-10 text-center text-sm md:text-base", mmsOnGlassSecondary)}>
          Nothing here yet with those filters.{" "}
          <button
            type="button"
            className="font-semibold text-[#f0c49a] underline-offset-2 hover:underline"
            onClick={() => {
              setCategory("");
              setQuery("");
              setPublishedOnly(false);
              setSort("recommended");
            }}
          >
            Show all articles
          </button>
        </p>
      )}
    </div>
  );
}
