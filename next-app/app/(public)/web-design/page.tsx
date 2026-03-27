import type { Metadata } from "next";
import { WebDesignSalesPage } from "@/components/public/WebDesignSalesPage";

export const metadata: Metadata = {
  title: "Topher's Web Design | MixedMakerShop",
  description:
    "Websites, landing pages, and lightweight tools for local businesses — show up clearly online and turn visitors into customers.",
  openGraph: {
    title: "Get more customers online — without the tech headache",
    url: "https://mixedmakershop.com/web-design",
  },
};

export default function WebDesignPage() {
  return <WebDesignSalesPage />;
}
