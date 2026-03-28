import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import {
  WORLD_WATCH_MOCK_ITEMS,
  getWorldWatchHomePreviewData,
} from "@/lib/worldWatch/mock-data";
import { toWorldWatchTeaserItem } from "@/lib/worldWatch/teaser";
import { WorldWatchCategoryBadge } from "./world-watch-category-badge";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function WorldWatchHomePreview({ isMember = false }: { isMember?: boolean }) {
  const { featured, recent } = getWorldWatchHomePreviewData(WORLD_WATCH_MOCK_ITEMS);
  const featuredShow = featured ? (isMember ? featured : toWorldWatchTeaserItem(featured)) : undefined;
  const recentShow = isMember ? recent : recent.map(toWorldWatchTeaserItem);

  if (!featured && recent.length === 0) {
    return (
      <section
        className="mx-auto mt-12 max-w-6xl rounded-[28px] border border-white/10 bg-slate-950/40 px-5 py-10 backdrop-blur-sm md:px-8"
        aria-labelledby="world-watch-home-heading"
      >
        <div className="text-center">
          <h2 id="world-watch-home-heading" className="text-lg font-semibold text-slate-200">
            World Watch
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Calm, biblical reflection on major global developments. New reflections will appear here soon.
          </p>
          <Link
            href="/world-watch"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-teal-200/90 underline-offset-4 hover:underline"
          >
            Open World Watch <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className="mx-auto mt-12 max-w-6xl rounded-[28px] border border-white/10 bg-gradient-to-b from-slate-950/80 to-[#060a10]/90 p-5 shadow-[0_12px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-8"
      aria-labelledby="world-watch-home-heading"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-200/55">
            Deep Well Audio
          </p>
          <h2 id="world-watch-home-heading" className="text-2xl font-semibold tracking-tight text-slate-100">
            World Watch
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
            Calm, biblical reflection on major global developments.
          </p>
          {!isMember ? (
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-500">
              Included with membership: a weekly email briefing, delivered quietly on Sunday mornings (US Central).
            </p>
          ) : (
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-500">
              Your membership includes the weekly Deep Well Weekly briefing.
            </p>
          )}
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {!isMember ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
              <Lock className="h-3 w-3 opacity-70" aria-hidden />
              Member content
            </span>
          ) : null}
          <Link
            href="/world-watch"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-teal-400/25 hover:bg-teal-400/10 hover:text-teal-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/35"
          >
            View all <ArrowRight className="h-4 w-4 opacity-80" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {featuredShow ? (
          <Link
            href="/world-watch"
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-white/12 bg-slate-900/50 p-5 transition",
              "hover:border-teal-400/20 hover:bg-slate-900/70 lg:col-span-2"
            )}
          >
            <div className="mb-2">
              <WorldWatchCategoryBadge category={featuredShow.category} />
            </div>
            <h3 className="text-lg font-semibold leading-snug text-slate-100 group-hover:text-white md:text-xl">
              {featuredShow.title}
            </h3>
            <p
              className={cn(
                "mt-2 text-sm text-slate-400",
                isMember ? "line-clamp-2" : "line-clamp-2"
              )}
            >
              {featuredShow.summary}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{featuredShow.source_name}</span>
              <span aria-hidden>·</span>
              <time dateTime={featuredShow.published_at}>{formatDate(featuredShow.published_at)}</time>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-200/90">
              Read in World Watch <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ) : null}

        <div className="flex flex-col gap-3">
          {recentShow.map((item) => (
            <Link
              key={item.id}
              href="/world-watch"
              className="group rounded-2xl border border-white/10 bg-slate-950/60 p-4 transition hover:border-white/16 hover:bg-slate-950/80"
            >
              <div className="mb-1.5">
                <WorldWatchCategoryBadge category={item.category} className="text-[10px]" />
              </div>
              <p className="line-clamp-2 text-sm font-medium leading-snug text-slate-200 group-hover:text-white">
                {item.title}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                <time dateTime={item.published_at}>{formatDate(item.published_at)}</time>
                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-80"
                  aria-hidden
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
