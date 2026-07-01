import type { Metadata } from "next";
import { blogPostTitle, metaDescription } from "@/lib/seo/snippet-meta";

type BlogPageMetaInput = {
  title: string;
  description: string;
  canonical: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
};

/** Shared SERP-safe metadata for blog posts (title + description within snippet limits). */
export function buildBlogPageMetadata(input: BlogPageMetaInput): Metadata {
  return {
    title: blogPostTitle(input.title),
    description: metaDescription(input.description),
    alternates: { canonical: input.canonical },
    openGraph: {
      title: input.openGraphTitle || input.title,
      description: metaDescription(input.openGraphDescription || input.description),
      url: input.canonical,
    },
  };
}
