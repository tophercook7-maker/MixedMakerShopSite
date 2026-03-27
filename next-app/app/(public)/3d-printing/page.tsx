import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { PrintingHero } from "@/components/printing/PrintingHero";
import { PrintingIntakePaths } from "@/components/printing/PrintingIntakePaths";
import { PrintingExamplesBuckets } from "@/components/printing/PrintingExamplesBuckets";
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
  title: "3D Printing & Problem Solving | MixedMakerShop",
  description:
    "Custom 3D printing in Hot Springs — files, broken parts, prototypes, and practical solves. Upload a model or describe what you need.",
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
      <PrintingIntakePaths />
      <PrintingExamplesBuckets />
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
