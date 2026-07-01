import type { Metadata } from "next";
import { UmbrellaHomePage } from "@/components/public/UmbrellaHomePage";
import { metaDescription } from "@/lib/seo/snippet-meta";
import { SITE_URL } from "@/lib/site";

const canonical = SITE_URL;

export const metadata: Metadata = {
  title: "Web Design Hot Springs AR | Small Business Websites",
  description: metaDescription(
    "Hot Springs web design for local businesses — mobile sites from $400, full setups $900. Free homepage preview. Founder-led, fast turnaround, built for calls and leads."
  ),
  keywords: [
    "Mixed Maker Shop",
    "umbrella studio",
    "Topher's Web Design",
    "3D printing",
    "maker builds",
    "AI automation",
    "digital products",
    "Mixed Maker Labs",
    "Hot Springs Arkansas",
    "small business websites",
  ],
  alternates: { canonical },
  openGraph: {
    title: "Web Design Hot Springs AR | Mixed Maker Shop",
    description: metaDescription(
      "Affordable small business websites in Hot Springs, AR. Free preview before you buy · starter sites $400 · built for calls and trust."
    ),
    url: canonical,
    images: ["/og-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Design Hot Springs AR | Mixed Maker Shop",
    description: metaDescription(
      "Small business web design in Hot Springs — free preview, sites from $400, built for leads."
    ),
    images: ["/og-image"],
  },
};

export default function HomePage() {
  return <UmbrellaHomePage />;
}
