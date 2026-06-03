import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/public/LegalPageLayout";
import { TERMS_INTRO, TERMS_LAST_UPDATED, TERMS_SECTIONS } from "@/lib/legal/terms-sections";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/terms`;

export const metadata: Metadata = {
  title: "Terms of Service | MixedMakerShop",
  description:
    "Review the terms for using MixedMakerShop services, including web design, Captain Maker, GiGi's Print Shop, AI tools, deposits, refunds, and project ownership.",
  alternates: { canonical },
  openGraph: {
    title: "Terms of Service | MixedMakerShop",
    description:
      "Review the terms for using MixedMakerShop services, including web design, Captain Maker, GiGi's Print Shop, AI tools, deposits, refunds, and project ownership.",
    url: canonical,
  },
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Terms of Service"
      lastUpdated={TERMS_LAST_UPDATED}
      intro={TERMS_INTRO}
      sections={TERMS_SECTIONS}
      relatedLink={{ href: "/privacy", label: "Privacy Policy" }}
      pdfHref="/legal/terms-of-service---mixed-maker-shop.pdf"
    />
  );
}
