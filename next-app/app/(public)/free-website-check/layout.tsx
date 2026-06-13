import type { Metadata } from "next";

const canonical = "https://mixedmakershop.com/free-website-check";

// Index metadata only. The /free-website-check/success child sets its own noindex
// metadata so it does not inherit this canonical.
export const metadata: Metadata = {
  title: "Free Website Check | MixedMakerShop",
  description:
    "Get a free, human review of your website from Topher — trust, clarity, mobile experience, and the path to contact. No generic auto-audit, no obligation.",
  alternates: { canonical },
  openGraph: {
    title: "Free Website Check | MixedMakerShop",
    description: "A practical, human review of your site from Topher — not a generic auto-audit.",
    url: canonical,
  },
};

export default function FreeWebsiteCheckLayout({ children }: { children: React.ReactNode }) {
  return children;
}
