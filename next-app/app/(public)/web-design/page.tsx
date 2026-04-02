import type { Metadata } from "next";
import { WebDesignSalesPage } from "@/components/public/WebDesignSalesPage";

export const metadata: Metadata = {
  title: "Topher's Web Design | MixedMakerShop",
  description:
    "Web design for small businesses: sites that look better, load faster, and turn visitors into leads. Start with a free website preview.",
  openGraph: {
    title: "Web design that brings you customers | MixedMakerShop",
    url: "https://mixedmakershop.com/web-design",
  },
};

export default function WebDesignPage() {
  return <WebDesignSalesPage />;
}
