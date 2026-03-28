import type { Metadata } from "next";
import { Suspense } from "react";
import { isActiveMember } from "@/lib/auth/isActiveMember";
import { getWorldWatchItemsSorted } from "@/lib/worldWatch/mock-data";
import { toWorldWatchTeaserItem } from "@/lib/worldWatch/teaser";
import { WorldWatchHero } from "@/components/world-watch/world-watch-hero";
import { WorldWatchPageBody } from "@/components/world-watch/world-watch-page-body";
import { WorldWatchPageFallback } from "@/components/world-watch/world-watch-page-fallback";
import { WorldWatchSourceNote } from "@/components/world-watch/world-watch-source-note";

export const metadata: Metadata = {
  title: "World Watch | Deep Well Audio",
  description:
    "Calm, biblical reflection on global events, spiritual insight, and carefully curated world developments.",
  openGraph: {
    title: "World Watch | Deep Well Audio",
    description:
      "Calm, biblical reflection on global events and thoughtfully curated developments—without the noise of breaking news.",
  },
};

export default async function WorldWatchPage() {
  const isMember = await isActiveMember();
  const raw = getWorldWatchItemsSorted();
  const items = isMember ? raw : raw.map(toWorldWatchTeaserItem);
  const showYearlyPlan = Boolean(String(process.env.STRIPE_PRICE_ID_YEARLY || "").trim());

  return (
    <div className="min-h-screen bg-[#060a10]">
      <WorldWatchHero />
      <Suspense fallback={<WorldWatchPageFallback />}>
        <WorldWatchPageBody items={items} isMember={isMember} showYearlyPlan={showYearlyPlan} />
      </Suspense>
      <WorldWatchSourceNote />
    </div>
  );
}
