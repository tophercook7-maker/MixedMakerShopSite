"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { WorldWatchItemDisplay, WorldWatchFilterKey } from "@/lib/worldWatch/types";
import { filterWorldWatchItems } from "@/lib/worldWatch/mock-data";
import { WorldWatchFilters } from "./world-watch-filters";
import { WorldWatchFeaturedCard } from "./world-watch-featured-card";
import { WorldWatchCard } from "./world-watch-card";
import { WorldWatchEmptyState } from "./world-watch-empty-state";
import { WorldWatchSidebar } from "./world-watch-sidebar";
import { MemberInvitationBanner } from "@/components/world-watch/member-invitation-banner";

function parseFilter(v: string | null): WorldWatchFilterKey {
  if (
    v === "biblical_insight" ||
    v === "global_awareness" ||
    v === "prophecy_watch" ||
    v === "all"
  ) {
    return v;
  }
  return "all";
}

export function WorldWatchPageBody({
  items,
  isMember = false,
  showYearlyPlan = false,
}: {
  items: WorldWatchItemDisplay[];
  isMember?: boolean;
  showYearlyPlan?: boolean;
}) {
  const searchParams = useSearchParams();
  const filter = useMemo(() => parseFilter(searchParams.get("cat")), [searchParams]);

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      ),
    [items]
  );

  const filtered = useMemo(() => filterWorldWatchItems(sorted, filter), [sorted, filter]);

  const { featured, rest } = useMemo(() => {
    if (filtered.length === 0) return { featured: undefined as undefined, rest: [] as WorldWatchItemDisplay[] };
    const feat = filtered.find((i) => i.is_featured) ?? filtered[0];
    const r = filtered.filter((i) => i.id !== feat.id);
    return { featured: feat, rest: r };
  }, [filtered]);

  return (
    <div className="bg-[#060a10] text-slate-200">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 md:px-8">
        <WorldWatchFilters />

        {!isMember ? <MemberInvitationBanner showYearly={showYearlyPlan} className="mb-10" /> : null}

        {filtered.length === 0 ? (
          <WorldWatchEmptyState />
        ) : (
          <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[1fr_280px] lg:gap-14">
            <div className="min-w-0 space-y-12 lg:col-start-1 lg:row-start-1">
              <section aria-labelledby="world-watch-featured-heading">
                <h2 id="world-watch-featured-heading" className="sr-only">
                  Featured reflection
                </h2>
                {featured ? (
                  <WorldWatchFeaturedCard item={featured} teaserVisual={!isMember} />
                ) : null}
              </section>

              {rest.length > 0 ? (
                <section aria-labelledby="world-watch-latest-heading">
                  <h2
                    id="world-watch-latest-heading"
                    className="mb-6 text-lg font-semibold tracking-tight text-slate-200"
                  >
                    Latest reflections
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((item) => (
                      <WorldWatchCard key={item.id} item={item} teaserVisual={!isMember} />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
            <div className="lg:col-start-2 lg:row-start-1">
              <WorldWatchSidebar isMember={isMember} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
