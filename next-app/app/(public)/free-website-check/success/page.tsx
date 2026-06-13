import type { Metadata } from "next";
import Link from "next/link";
import { LEAD_CONFIRMATION_MESSAGE } from "@/lib/lead-confirmation-message";

// Post-submission confirmation page — keep out of the index and override the canonical
// it would otherwise inherit from the free-website-check layout.
export const metadata: Metadata = {
  title: "Request received | MixedMakerShop",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://mixedmakershop.com/free-website-check/success" },
};

export default function FreeWebsiteCheckSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-md text-center">
      <h1 className="text-2xl font-bold">Request received</h1>
      <p className="mt-2 text-muted-foreground">{LEAD_CONFIRMATION_MESSAGE}</p>
      <Link href="/" className="mt-6 inline-block text-sm text-primary hover:underline">Back to home</Link>
    </div>
  );
}
