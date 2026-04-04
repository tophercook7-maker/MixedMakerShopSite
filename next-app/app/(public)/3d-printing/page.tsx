import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { PrintingHero } from "@/components/printing/PrintingHero";
import { PrintingFleetSection } from "@/components/printing/PrintingFleetSection";
import { PrintingCapabilitiesOverview } from "@/components/printing/PrintingCapabilitiesOverview";
import { PrintingProofStrip } from "@/components/printing/PrintingProofStrip";
import { PrintingRequestNextSteps } from "@/components/printing/PrintingRequestNextSteps";
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
  title: "Custom 3D Printing | Bambu Lab A1 & P1S Farm | MixedMakerShop",
  description:
    "Professional PLA 3D printing in Hot Springs, Arkansas — Bambu Lab A1 + AMS Lite and dual P1S + AMS Pro, triple-monitor workflow. Upload a file or describe your part.",
  keywords: [
    "3D printing Hot Springs",
    "Bambu Lab printing",
    "custom PLA prints",
    "replacement parts 3D printed",
    "prototype printing Arkansas",
  ],
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
      <PrintingFleetSection />
      <PrintingCapabilitiesOverview />
      <PrintingProofStrip />
      <PrintingRequestNextSteps />
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
