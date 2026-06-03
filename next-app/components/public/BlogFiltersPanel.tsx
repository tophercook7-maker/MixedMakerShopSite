import Link from "next/link";
import { Filter } from "lucide-react";
import { BLOG_CATEGORIES, type BlogSortKey } from "@/lib/blog/registry";
import type { BlogListQuery } from "@/lib/blog/blog-search-params";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: BlogSortKey; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "Title A–Z" },
  { value: "quick-read", label: "Quickest read" },
];

const fieldLabel = "text-[11px] font-bold uppercase tracking-[0.14em] text-[#f0c49a]";

const inputClass = cn(
  "w-full rounded-xl border-2 border-[#eab08a]/45 bg-[#0a0c0a] px-3 py-2.5 text-sm font-medium text-white",
  "placeholder:text-white/50 focus:border-[#f0c49a] focus:outline-none focus:ring-2 focus:ring-[#f0c49a]/35",
);

export function BlogFiltersPanel({
  query,
  resultCount,
}: {
  query: BlogListQuery;
  resultCount: number;
}) {
  const hasFilters =
    Boolean(query.q.trim()) || Boolean(query.category) || query.publishedOnly || query.sort !== "recommended";

  return (
    <div
      id="browse-articles"
      className="scroll-mt-24 mt-6 w-full rounded-2xl border-2 border-[#eab08a]/50 bg-[#0c0f0d] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.55)] md:p-6"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-[#f0c49a]" aria-hidden />
        <h2 className="text-lg font-bold text-white md:text-xl">Find an article</h2>
      </div>

      <form action="/blog" method="get" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-2 sm:col-span-2 lg:col-span-4">
          <span className={fieldLabel}>Search</span>
          <input
            type="search"
            name="q"
            defaultValue={query.q}
            placeholder="Search titles and topics…"
            className={inputClass}
            aria-label="Search blog articles"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={fieldLabel}>Topic</span>
          <select name="category" defaultValue={query.category} className={inputClass} aria-label="Filter by topic">
            <option value="">All topics</option>
            {BLOG_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className={fieldLabel}>Sort</span>
          <select name="sort" defaultValue={query.sort} className={inputClass} aria-label="Sort articles">
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className={fieldLabel}>Show</span>
          <select
            name="ready"
            defaultValue={query.publishedOnly ? "1" : ""}
            className={inputClass}
            aria-label="Filter by availability"
          >
            <option value="">All articles</option>
            <option value="1">Ready to read only</option>
          </select>
        </label>

        <div className="flex flex-wrap items-end gap-3 sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#b85c1e] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#c96a28]"
          >
            Apply filters
          </button>
          {hasFilters ? (
            <Link
              href="/blog"
              className="inline-flex min-h-[44px] items-center text-sm font-semibold text-[#f0c49a] underline-offset-2 hover:underline"
            >
              Clear all
            </Link>
          ) : null}
        </div>
      </form>

      <p className="mt-4 border-t border-[#eab08a]/25 pt-4 text-sm font-medium text-[#e8f3ed]">
        {resultCount === 0
          ? "No articles match — try different filters."
          : `${resultCount} article${resultCount === 1 ? "" : "s"} shown`}
      </p>
    </div>
  );
}
