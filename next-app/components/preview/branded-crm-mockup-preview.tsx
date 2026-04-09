import { notFound } from "next/navigation";
import { CrmMockupPreviewClient } from "@/components/public/crm-mockup-preview-client";
import { MockupPresentationCtaStrip, MockupPresentationHeader } from "@/components/preview/mockup-presentation-chrome";
import { fetchPublicCrmMockupBySlug } from "@/lib/public-crm-mockup-fetch";

export async function BrandedCrmMockupPreviewPage({ slug }: { slug: string }) {
  const s = String(slug || "").trim();
  if (!s) notFound();

  const row = await fetchPublicCrmMockupBySlug(s);
  if (!row) notFound();

  return (
    <div className="mockup-pres-root" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <MockupPresentationHeader businessName={row.business_name} />
      <div style={{ flex: 1 }}>
        <CrmMockupPreviewClient row={row} />
      </div>
      <MockupPresentationCtaStrip />
    </div>
  );
}
