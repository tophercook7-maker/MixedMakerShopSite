import { permanentRedirect } from "next/navigation";

/**
 * Legacy share URLs redirect to the branded `/preview/{slug}` route.
 */
export default async function LegacyMockupRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = String(slug || "").trim();
  if (!s) permanentRedirect("/free-mockup");
  permanentRedirect(`/preview/${encodeURIComponent(s)}`);
}
