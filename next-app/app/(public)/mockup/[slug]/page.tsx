import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CrmMockupPreviewClient } from "@/components/public/crm-mockup-preview-client";
import type { PublicCrmMockupRow } from "@/lib/crm-mockup";

type RpcRow = {
  id: string;
  template_key: string;
  business_name: string;
  city: string | null;
  category: string | null;
  phone: string | null;
  email: string | null;
  facebook_url: string | null;
  headline: string;
  subheadline: string;
  cta_text: string;
  mockup_slug: string;
  raw_payload: Record<string, unknown> | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = String(slug || "").trim();
  const title = s ? "Website mockup" : "Mockup";
  return {
    title: `${title} | MixedMakerShop`,
    description: "A quick example of what your business website could look like.",
    robots: { index: false, follow: false },
  };
}

export default async function CrmMockupPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = String(slug || "").trim();
  if (!s) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_crm_mockup_by_slug", { p_slug: s });

  if (error) {
    console.error("[mockup] rpc", error.message);
    notFound();
  }

  const rows = data as RpcRow[] | null;
  if (!rows?.length) notFound();

  const r = rows[0];
  const row: PublicCrmMockupRow = {
    id: String(r.id || ""),
    template_key: String(r.template_key || "generic-local"),
    business_name: String(r.business_name || ""),
    city: r.city != null ? String(r.city) : null,
    category: r.category != null ? String(r.category) : null,
    phone: r.phone != null ? String(r.phone) : null,
    email: r.email != null ? String(r.email) : null,
    facebook_url: r.facebook_url != null ? String(r.facebook_url) : null,
    headline: String(r.headline || ""),
    subheadline: String(r.subheadline || ""),
    cta_text: String(r.cta_text || "Call Now"),
    mockup_slug: String(r.mockup_slug || s),
    raw_payload:
      r.raw_payload && typeof r.raw_payload === "object" && !Array.isArray(r.raw_payload)
        ? (r.raw_payload as Record<string, unknown>)
        : null,
  };

  return <CrmMockupPreviewClient row={row} />;
}
