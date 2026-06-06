import type { Metadata } from "next";
import { AboutTopherPage } from "@/components/public/AboutTopherPage";

export const metadata: Metadata = {
  title: "About Topher | MixedMakerShop",
  description:
    "Topher has provided local tech help since 2000 — formerly Cook's Computer Service, now MixedMakerShop with in-home computer repair, web design, AI help, and custom 3D printing in Hot Springs, Arkansas.",
  openGraph: {
    title: "About Topher | MixedMakerShop",
    url: "https://mixedmakershop.com/about",
  },
};

export default function AboutRoutePage() {
  return <AboutTopherPage />;
}
