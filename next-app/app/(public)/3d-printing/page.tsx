import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { PrintingHero } from "@/components/printing/PrintingHero";
import { PrintingRealProblems } from "@/components/printing/PrintingRealProblems";
import { PrintingWhy } from "@/components/printing/PrintingWhy";
import { PrintingHow } from "@/components/printing/PrintingHow";
import { StlLibraryGrid } from "@/components/printing/StlLibraryGrid";
import { PrintingFaq } from "@/components/printing/PrintingFaq";
import { PrintingCtaBand } from "@/components/printing/PrintingCtaBand";
import { PrintingQuoteForm } from "@/components/printing/PrintingQuoteForm";
import {
  PrintingStickyMobileCta,
  PRINTING_STICKY_MOBILE_BOTTOM_PAD_CLASS,
} from "@/components/printing/PrintingStickyMobileCta";

export const metadata: Metadata = {
  title: "Custom 3D Printing | MixedMakerShop",
  description:
    "PLA 3D printing in Hot Springs — replacement parts, holders, mounts, organizers, and one-off fixes when something breaks or doesn't exist. Submit a request or browse STL libraries for ideas.",
};

export default function ThreeDPrintingPage() {
  return (
    <article
      className={cn(
        "printing-page relative min-h-screen overflow-x-hidden scroll-smooth",
        PRINTING_STICKY_MOBILE_BOTTOM_PAD_CLASS,
      )}
    >
      <PrintingHero />
      <PrintingRealProblems />
      <PrintingWhy />
      <PrintingHow />
      <StlLibraryGrid />
      <PrintingFaq />
      <PrintingCtaBand />
      <PrintingQuoteForm />
      <PrintingStickyMobileCta />
    </article>
  );
}
