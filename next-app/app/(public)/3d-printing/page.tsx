import type { Metadata } from "next";
import { PrintingHero } from "@/components/printing/PrintingHero";
import { WhatWeMake } from "@/components/printing/WhatWeMake";
import { PrintingWhy } from "@/components/printing/PrintingWhy";
import { PrintingHow } from "@/components/printing/PrintingHow";
import { StlLibraryGrid } from "@/components/printing/StlLibraryGrid";
import { PrintingCtaBand } from "@/components/printing/PrintingCtaBand";
import { PrintingFaq } from "@/components/printing/PrintingFaq";

export const metadata: Metadata = {
  title: "Custom 3D Printing | MixedMakerShop",
  description:
    "Custom PLA 3D printing in Hot Springs, Arkansas — parts, mounts, organizers, replacements, and one-off fixes. Submit a request or browse STL libraries for ideas.",
};

export default function ThreeDPrintingPage() {
  return (
    <article className="printing-page relative min-h-screen overflow-x-hidden">
      <PrintingHero />
      <WhatWeMake />
      <PrintingWhy />
      <PrintingHow />
      <StlLibraryGrid />
      <PrintingCtaBand />
      <PrintingFaq />
    </article>
  );
}
