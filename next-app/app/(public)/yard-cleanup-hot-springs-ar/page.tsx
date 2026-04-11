import type { Metadata } from "next";
import { LocalServicePageContent } from "@/components/public/LocalServicePageContent";
import { LOCAL_SERVICE_PAGES, localServicePageTitle } from "@/lib/local-service-pages";

const SLUG = "yard-cleanup-hot-springs-ar";
const config = LOCAL_SERVICE_PAGES[SLUG]!;
const canonical = `https://mixedmakershop.com/${SLUG}`;

export const metadata: Metadata = {
  title: localServicePageTitle(config),
  description: config.metaDescription,
  alternates: { canonical },
  openGraph: {
    title: localServicePageTitle(config),
    description: config.metaDescription,
    url: canonical,
  },
};

export default function YardCleanupHotSpringsPage() {
  return <LocalServicePageContent config={config} />;
}
