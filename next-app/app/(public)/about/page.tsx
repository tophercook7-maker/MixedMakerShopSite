import type { Metadata } from "next";
import { AboutTopherPage } from "@/components/public/AboutTopherPage";

export const metadata: Metadata = {
  title: "About Topher | MixedMakerShop",
  description:
    "Topher builds useful websites, custom 3D prints, and practical digital tools — directly, from Hot Springs, Arkansas.",
  openGraph: {
    title: "About Topher | MixedMakerShop",
    url: "https://mixedmakershop.com/about",
  },
};

export default function AboutRoutePage() {
  return <AboutTopherPage />;
}
