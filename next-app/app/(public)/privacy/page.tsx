import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/public/LegalPageLayout";
import { PRIVACY_INTRO, PRIVACY_LAST_UPDATED, PRIVACY_SECTIONS } from "@/lib/legal/privacy-sections";
import { SITE_URL } from "@/lib/site";

const canonical = `${SITE_URL}/privacy`;

export const metadata: Metadata = {
  title: "Privacy Policy | MixedMakerShop",
  description:
    "Learn how MixedMakerShop collects, uses, and protects information for website previews, Captain Maker, 3D printing orders, and creative services.",
  alternates: { canonical },
  openGraph: {
    title: "Privacy Policy | MixedMakerShop",
    description:
      "Learn how MixedMakerShop collects, uses, and protects information for website previews, Captain Maker, 3D printing orders, and creative services.",
    url: canonical,
  },
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      lastUpdated={PRIVACY_LAST_UPDATED}
      intro={PRIVACY_INTRO}
      sections={PRIVACY_SECTIONS}
      relatedLink={{ href: "/terms", label: "Terms of Service" }}
      pdfHref="/legal/privacy-policy---mixed-maker-shop.pdf"
    />
  );
}
