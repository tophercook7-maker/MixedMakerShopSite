import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "See Your Website Preview | MixedMakerShop",
  description:
    "Enter your business info and get an instant sample website preview. Redirects to our free preview builder.",
  robots: { index: true, follow: true },
};

export default function SeeYourWebsiteRedirectPage() {
  redirect("/free-mockup");
}
