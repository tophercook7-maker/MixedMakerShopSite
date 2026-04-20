import { permanentRedirect } from "next/navigation";
import { publicFreeMockupFunnelHref } from "@/lib/public-brand";

/**
 * Legacy share URLs redirect to the branded `/preview/{slug}` route.
 */
export default async function LegacyMockupRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = String(slug || "").trim();
  if (!s) permanentRedirect(publicFreeMockupFunnelHref);
  permanentRedirect(`/preview/${encodeURIComponent(s)}`);
}
