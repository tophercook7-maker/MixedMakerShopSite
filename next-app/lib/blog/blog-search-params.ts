import {
  BLOG_CATEGORIES,
  BLOG_POSTS,
  filterBlogPosts,
  sortBlogPosts,
  type BlogIndexPost,
  type BlogSortKey,
} from "@/lib/blog/registry";

const SORT_KEYS: BlogSortKey[] = ["recommended", "newest", "oldest", "title", "quick-read"];

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function parseSort(raw: string): BlogSortKey {
  return SORT_KEYS.includes(raw as BlogSortKey) ? (raw as BlogSortKey) : "recommended";
}

export type BlogListQuery = {
  q: string;
  category: string;
  sort: BlogSortKey;
  publishedOnly: boolean;
};

export function parseBlogListQuery(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): BlogListQuery {
  const category = firstParam(searchParams?.category);
  const safeCategory = BLOG_CATEGORIES.includes(category) ? category : "";

  return {
    q: firstParam(searchParams?.q),
    category: safeCategory,
    sort: parseSort(firstParam(searchParams?.sort)),
    publishedOnly: firstParam(searchParams?.ready) === "1",
  };
}

export function getFilteredBlogPosts(query: BlogListQuery): BlogIndexPost[] {
  const narrowed = filterBlogPosts(BLOG_POSTS, {
    category: query.category,
    query: query.q,
    publishedOnly: query.publishedOnly,
  });
  return sortBlogPosts(narrowed, query.sort);
}

export function blogListHref(query: Partial<BlogListQuery>): string {
  const params = new URLSearchParams();
  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.category) params.set("category", query.category);
  if (query.sort && query.sort !== "recommended") params.set("sort", query.sort);
  if (query.publishedOnly) params.set("ready", "1");
  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}
