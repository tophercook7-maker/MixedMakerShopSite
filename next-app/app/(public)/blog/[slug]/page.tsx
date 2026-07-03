import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostLayout } from "@/components/public/BlogPostLayout";
import { MD_POSTS } from "@/lib/blog/md-posts.generated";
import { loadMarkdownPost } from "@/lib/blog/markdown";
import { blogPostTitle } from "@/lib/seo/snippet-meta";
import { SITE_URL } from "@/lib/site";

/**
 * Renders markdown posts published by BlogForge (content/blog/<slug>.md).
 * Hand-written TSX posts have their own static folders, which take precedence
 * over this dynamic route.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return MD_POSTS.map((post) => ({ slug: post.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = MD_POSTS.find((p) => p.slug === slug);
  if (!post) return {};
  const canonical = `${SITE_URL}/blog/${slug}`;
  return {
    title: blogPostTitle(post.title),
    description: post.excerpt,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonical,
    },
  };
}

export default async function MarkdownBlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = MD_POSTS.find((p) => p.slug === slug);
  const markdown = post ? loadMarkdownPost(slug) : null;
  if (!post || !markdown) notFound();

  return (
    <BlogPostLayout
      slug={post.slug}
      category={post.category}
      readTime={post.readTime}
      title={post.title}
      subtitle={markdown.frontmatter.subtitle || markdown.frontmatter.description || post.excerpt}
    >
      <div dangerouslySetInnerHTML={{ __html: markdown.html }} />
    </BlogPostLayout>
  );
}
