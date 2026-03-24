import type { Metadata } from "next";
import { GrowthOfferClient } from "@/components/public/GrowthOfferClient";

export const metadata: Metadata = {
  title: "Complete Website + SEO Offer | MixedMakerShop",
  description:
    "Get a high-converting website plus ongoing SEO, Google Business optimization, and content support to help your business grow.",
  openGraph: {
    title: "Complete Website + SEO Offer | MixedMakerShop",
    description:
      "Website + SEO + Google Business + ongoing support — one simple system to help your business grow online.",
    url: "https://mixedmakershop.com/offer",
  },
};

export default function OfferPage() {
  return <GrowthOfferClient />;
}
